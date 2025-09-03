import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPoolSchema = z.object({
  name: z.string().min(3),
  ipRange: z.string(),
  region: z.string(),
  interface: z.string(),
  description: z.string().optional(),
  technicianId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPoolSchema.parse(body);

    // Calculate total IPs from CIDR
    const cidr = parseInt(validatedData.ipRange.split('/')[1]);
    const totalIps = Math.pow(2, 32 - cidr) - 2; // -2 for network and broadcast

    const pool = await prisma.wanIpPool.create({
      data: {
        name: validatedData.name,
        ipRange: validatedData.ipRange,
        region: validatedData.region,
        interface: validatedData.interface,
        description: validatedData.description || "",
        totalIps,
        availableIps: totalIps,
        assignedIps: 0,
        technicianId: validatedData.technicianId
      }
    });

    return NextResponse.json({ pool }, { status: 201 });
  } catch (error) {
    console.error("Error creating IP pool:", error);
    return NextResponse.json({ error: "Failed to create pool" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pools = await prisma.wanIpPool.findMany({
      where: { technicianId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ pools });
  } catch (error) {
    console.error("Error fetching IP pools:", error);
    return NextResponse.json({ error: "Failed to fetch pools" }, { status: 500 });
  }
}