import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// --- Create a new Request (POST) ---
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await req.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const request = await prisma.request.create({
      data: {
        title,
        description,
        clientId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Request created", request }, { status: 201 });
  } catch (error) {
    console.error("❌ Create request error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// --- Get Requests (GET) ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let requests: any[] = [];

    if (session.user.role === "CLIENT") {
      // Client sees all their requests + proposals
      requests = await prisma.request.findMany({
        where: { clientId: session.user.id },
        include: {
          client: true,
          proposals: { include: { provider: { include: { user: true } } }, orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session.user.role === "PROVIDER") {
      // Get provider profile
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!providerProfile) return NextResponse.json({ requests: [] });

      // Fetch requests where provider never proposed OR previous proposal was rejected
      requests = await prisma.request.findMany({
        where: {
          status: "PENDING",
          OR: [
            { proposals: { none: { providerId: providerProfile.id } } }, // never proposed
            { proposals: { some: { providerId: providerProfile.id, status: "REJECTED" } } }, // proposal rejected
          ],
        },
        include: {
          client: true,
          proposals: { where: { providerId: providerProfile.id } }, // only this provider's proposals
        },
        orderBy: { createdAt: "desc" },
      });

      // Add flags for provider dashboard
      requests = requests.map((req) => ({
        ...req,
        hasProposed: req.proposals.length > 0 && req.proposals[0].status !== "REJECTED",
        proposalsCount: req.proposals.length,
        durationDays: Math.floor(
          (new Date().getTime() - new Date(req.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("❌ Get requests error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// --- Update Request Status (PATCH) ---
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { requestId, status } = await req.json();
    if (!requestId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    if (session.user.role !== "CLIENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request || request.clientId !== session.user.id) {
      return NextResponse.json({ error: "You cannot update this request" }, { status: 403 });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status },
    });

    return NextResponse.json({ message: "Request status updated", request: updatedRequest }, { status: 200 });
  } catch (error) {
    console.error("❌ Update request status error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
