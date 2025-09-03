import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPoolSchema = z.object({
  poolName: z.string().min(1, "Pool name is required"),
  startIp: z.string().ip("Invalid IP address"),
  endIp: z.string().ip("Invalid IP address"),
  cidr: z.number().min(1).max(32),
  regionId: z.string().uuid("Invalid region ID"),
  interfaceId: z.string().uuid("Invalid interface ID"),
  description: z.string().optional(),
});

// GET: Fetch technician's IP pools
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pools = await prisma.wanIpPool.findMany({
      where: { technicianId: session.user.id },
      include: {
        region: true,
        interface: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pools });
  } catch (error) {
    console.error("Error fetching technician pools:", error);
    return NextResponse.json(
      { error: "Failed to fetch IP pools" },
      { status: 500 }
    );
  }
}

// POST: Create new IP pool
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPoolSchema.parse(body);

    // Validate IP range
    const startIpNum = ipToNumber(validatedData.startIp);
    const endIpNum = ipToNumber(validatedData.endIp);
    
    if (startIpNum >= endIpNum) {
      return NextResponse.json(
        { error: "Start IP must be less than end IP" },
        { status: 400 }
      );
    }

    // Calculate total IPs
    const totalIps = endIpNum - startIpNum + 1;

    // Create the pool
    const pool = await prisma.wanIpPool.create({
      data: {
        ...validatedData,
        totalIps,
        availableIps: totalIps,
        usedIps: 0,
        technicianId: session.user.id,
      },
      include: {
        region: true,
        interface: true,
      },
    });

    return NextResponse.json({ pool }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error("Error creating IP pool:", error);
    return NextResponse.json(
      { error: "Failed to create IP pool" },
      { status: 500 }
    );
  }
}

// Helper function to convert IP to number
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}