import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from '@/lib/rate-limit';
import { sanitizePlain } from '@/lib/sanitize';
import { z } from "zod";

// Schema for creating a new IP assignment
const createIpSchema = z.object({
  customerName: z.string().min(2),
  customerId: z.string().min(1),
  ipAddress: z.string().ip(),
});

// GET: Fetch technician IP pools/stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all IPs assigned to this technician
    const customerIPs = await prisma.customerWanIp.findMany({
      where: { technicianId: session.user.id },
      include: {
        interface: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals per interface
  const pools = customerIPs.reduce((acc: any, ip: any) => {
      const interfaceId = ip.interfaceId || "unknown";
      if (!acc[interfaceId]) {
        acc[interfaceId] = {
          interface: ip.interface,
          totalIps: 0,
          usedIps: 0,
          availableIps: 0,
        };
      }
      acc[interfaceId].totalIps += 1;
      if (ip.isActive) {
        acc[interfaceId].usedIps += 1;
      } else {
        acc[interfaceId].availableIps += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ pools: Object.values(pools) });
  } catch (error) {
    console.error("Error fetching technician pools:", error);
    return NextResponse.json({ error: "Failed to fetch IP pools" }, { status: 500 });
  }
}

// POST: Assign new IP to customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rl = checkRateLimit(`technician:pools:create:${ip}`, true);
    if (rl.limited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const body = await request.json();
    const validatedData = createIpSchema.parse(body);
    validatedData.customerName = sanitizePlain(validatedData.customerName, { maxLength: 80 });
    validatedData.customerId = sanitizePlain(validatedData.customerId, { maxLength: 30 });

    // Check if IP is already assigned
    const existingIp = await prisma.customerWanIp.findFirst({
      where: { wanIp: validatedData.ipAddress },
    });

    if (existingIp) {
      return NextResponse.json({ error: "IP address already assigned" }, { status: 400 });
    }

    // Create the new IP assignment
    const customerWanIp = await prisma.customerWanIp.create({
      data: {
        customerName: validatedData.customerName,
        accountNumber: validatedData.customerId,
        wanIp: validatedData.ipAddress,
        technicianId: session.user.id,
        assignedAt: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({ customerWanIp }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error("Error assigning IP:", error);
    return NextResponse.json({ error: "Failed to assign IP" }, { status: 500 });
  }
}
