import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Search for WAN IPs in the CustomerWanIp table
    const wanIps = await prisma.customerWanIp.findMany({
      where: {
        OR: [
          { wanIp: { contains: query, mode: "insensitive" } },
          { customerName: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      take: 10,
      orderBy: { wanIp: "asc" },
      include: {
        interface: {
          select: {
            name: true,
            ipPoolStart: true,
            ipPoolEnd: true,
          },
        },
        technician: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(wanIps);
  } catch (error) {
    console.error("WAN IP lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
