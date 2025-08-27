import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // <-- correct import
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json(); // use `action` instead of `status`
  if (!action || !["ACCEPTED", "DECLINED"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Fetch proposal first
  const proposal = await prisma.proposal.findUnique({
    where: { id: params.id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Client can accept/reject **their proposals**
  if (
    session.user.role === "CLIENT" &&
    proposal.clientId !== session.user.id
  ) {
    return NextResponse.json(
      { error: "You cannot update this proposal" },
      { status: 403 }
    );
  }

  // Provider can update their own proposal (e.g., message/price)
  if (
    session.user.role === "PROVIDER" &&
    proposal.providerId !== session.user.id
  ) {
    return NextResponse.json(
      { error: "You cannot update this proposal" },
      { status: 403 }
    );
  }

  // ✅ Update proposal status
  const updated = await prisma.proposal.update({
    where: { id: params.id },
    data: { status: action },
  });

  return NextResponse.json(updated);
}
