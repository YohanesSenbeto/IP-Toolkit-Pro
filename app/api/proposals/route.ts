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

    // ✅ Get logged-in user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true }, // include provider profile
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Only providers can send proposals" }, { status: 403 });
    }

    if (!user.providerProfile) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // ✅ Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        providerId: user.providerProfile.id,
        clientId: user.id, // this ensures proposal is linked to user
        requestId,
        price,
        message,
      },
      include: {
        request: true,
        provider: { include: { user: true } }, // provider + provider’s user
        client: true,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Proposal create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
