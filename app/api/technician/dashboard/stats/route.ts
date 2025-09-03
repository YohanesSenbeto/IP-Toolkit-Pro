import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all pools created by this technician
    const pools = await prisma.wanIpPool.findMany({
      where: { technicianId: session.user.id },
      select: {
        totalIps: true,
        usedIps: true,
        availableIps: true,
      },
    });

    // Calculate totals
    const totalPools = pools.length;
    const totalIPs = pools.reduce((sum, pool) => sum + pool.totalIps, 0);
    const assignedIPs = pools.reduce((sum, pool) => sum + pool.usedIps, 0);
    const availableIPs = pools.reduce((sum, pool) => sum + pool.availableIps, 0);

    return NextResponse.json({
      totalPools,
      totalIPs,
      assignedIPs,
      availableIPs,
    });
  } catch (error) {
    console.error("Error fetching technician stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}