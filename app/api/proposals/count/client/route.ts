// app/api/proposals/count/client/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
// Update the import path to the correct location of authOptions
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count all proposals for this client's requests
  const count = await prisma.proposal.count({
    where: { clientId: session.user.id },
  });

  return NextResponse.json({ count });
}
