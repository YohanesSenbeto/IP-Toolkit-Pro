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

    // Get all CustomerWanIp assigned to this technician
    const customerIPs = await prisma.customerWanIp.findMany({
      where: { technicianId: session.user.id },
      select: {
        wanIp: true,
        isActive: true,
      },
    });

    const totalIPs = customerIPs.length;
    const assignedIPs = customerIPs.filter(ip => ip.isActive).length;
    const availableIPs = customerIPs.filter(ip => !ip.isActive).length;

    return NextResponse.json({
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
