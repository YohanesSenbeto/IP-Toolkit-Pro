import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
const prisma = new PrismaClient();

// PATCH: Update proposal status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();
    const { action } = body; // ACCEPTED or DECLINED

    if (!["ACCEPTED", "DECLINED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Only the client who owns the proposal can accept/decline
    const proposal = await prisma.proposal.findUnique({ where: { id } });
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

    if (session.user.role !== "CLIENT" || session.user.id !== proposal.clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.proposal.update({
      where: { id },
      data: { status: action },
    });

    return NextResponse.json({ message: "Proposal updated", proposal: updated });
  } catch (error) {
    console.error("❌ PATCH proposal error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
