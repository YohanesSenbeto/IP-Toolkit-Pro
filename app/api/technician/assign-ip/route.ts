import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const assignIpSchema = z.object({
  customerName: z.string().min(2),
  customerId: z.string().min(1),
  serviceType: z.string(),
  poolId: z.string(),
  ipAddress: z.string().ip(),
  routerModel: z.string().optional(),
  technicianId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = assignIpSchema.parse(body);

    // Check if IP is already assigned
    const existingIp = await prisma.customerWanIp.findFirst({
      where: { ipAddress: validatedData.ipAddress }
    });

    if (existingIp) {
      return NextResponse.json({ error: "IP address already assigned" }, { status: 400 });
    }

    // Get the pool to verify it belongs to the technician
    const pool = await prisma.wanIpPool.findFirst({
      where: { 
        id: validatedData.poolId,
        technicianId: session.user.id 
      }
    });

    if (!pool) {
      return NextResponse.json({ error: "Pool not found or unauthorized" }, { status: 404 });
    }

    // Check if pool has available IPs
    if (pool.availableIps <= 0) {
      return NextResponse.json({ error: "No available IPs in this pool" }, { status: 400 });
    }

    // Create customer WAN IP assignment
    const customerWanIp = await prisma.customerWanIp.create({
      data: {
        customerName: validatedData.customerName,
        customerId: validatedData.customerId,
        serviceType: validatedData.serviceType,
        ipAddress: validatedData.ipAddress,
        routerModel: validatedData.routerModel || null,
        technicianId: validatedData.technicianId,
        poolId: validatedData.poolId,
        assignedAt: new Date()
      }
    });

    // Update pool counts
    await prisma.wanIpPool.update({
      where: { id: validatedData.poolId },
      data: {
        availableIps: pool.availableIps - 1,
        assignedIps: pool.assignedIps + 1
      }
    });

    return NextResponse.json({ customerWanIp }, { status: 201 });
  } catch (error) {
    console.error("Error assigning IP:", error);
    return NextResponse.json({ error: "Failed to assign IP" }, { status: 500 });
  }
}