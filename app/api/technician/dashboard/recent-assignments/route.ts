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

    // Get recent IP assignments managed by this technician
    const recentAssignments = await prisma.customerWanIp.findMany({
      where: {
        technicianId: session.user.id,
      },
      select: {
        id: true,
        customerName: true,
        wanIp: true,
        assignedAt: true,
      },
      orderBy: { assignedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(recentAssignments);
  } catch (error) {
    console.error("Error fetching recent assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent assignments" },
      { status: 500 }
    );
  }
}