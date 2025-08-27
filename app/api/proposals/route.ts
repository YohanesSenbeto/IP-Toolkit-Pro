import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, price, message } = await req.json();

    // Get logged-in provider user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "PROVIDER") return NextResponse.json({ error: "Only providers can send proposals" }, { status: 403 });
    if (!user.providerProfile) return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });

    // Check if provider already has a PENDING or ACCEPTED proposal for this request
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        requestId,
        providerId: user.providerProfile.id,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: "You already have an active proposal for this request" },
        { status: 400 }
      );
    }

    // Create new proposal
    const proposal = await prisma.proposal.create({
      data: {
        providerId: user.providerProfile.id,
        clientId: user.id, // provider's user id
        requestId,
        price,
        message,
        status: "PENDING",
      },
      include: {
        request: true,
        provider: { include: { user: true } },
        client: true,
      },
    });

    // Optional: Update request status to PENDING (ensures rejected requests return to open)
    await prisma.request.update({
      where: { id: requestId },
      data: { status: "PENDING" },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Proposal create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
