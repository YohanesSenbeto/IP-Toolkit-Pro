// app/api/proposals/count/provider/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
// Update the import path below to match the actual location of your authOptions export.
// For example, if your authOptions is in app/api/auth/[...nextauth]/route.ts, use:
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get provider profile
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!providerProfile) {
    return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
  }

  const count = await prisma.proposal.count({
    where: { providerId: providerProfile.id },
  });

  return NextResponse.json({ count });
}
