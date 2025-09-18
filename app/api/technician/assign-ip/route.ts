import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const assignIpSchema = z.object({
  customerName: z.string().min(2),
  customerId: z.string().min(1),
  ipAddress: z.string().ip(),
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
      where: { wanIp: validatedData.ipAddress }
    });

    if (existingIp) {
      return NextResponse.json({ error: "IP address already assigned" }, { status: 400 });
    }

    // Create customer WAN IP assignment using relation
    const customerWanIp = await prisma.customerWanIp.create({
      data: {
        customerName: validatedData.customerName,
        accountNumber: validatedData.customerId,
        wanIp: validatedData.ipAddress,
        assignedAt: new Date(),
        technician: {
          connect: { id: validatedData.technicianId } // ✅ Use connect to link technician
        }
      }
    });

    return NextResponse.json({ customerWanIp }, { status: 201 });
  } catch (error) {
    console.error("Error assigning IP:", error);
    return NextResponse.json({ error: "Failed to assign IP" }, { status: 500 });
  }
}
