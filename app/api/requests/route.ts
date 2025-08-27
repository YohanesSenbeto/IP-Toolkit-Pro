// app/api/requests/route.ts
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

// --- Create a new Request (POST) ---
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const request = await prisma.request.create({
      data: {
        title,
        description,
        clientId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Request created", request }, { status: 201 })
  } catch (error) {
    console.error("❌ Create request error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// --- Get Requests (GET) ---
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let requests
    if (session.user.role === "CLIENT") {
      // Client sees their own requests with proposals and provider info
      requests = await prisma.request.findMany({
        where: { clientId: session.user.id },
        include: {
          proposals: {
            include: {
              provider: { include: { user: true } }, // provider info
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      // Provider sees all requests with proposals
      requests = await prisma.request.findMany({
        include: { proposals: { include: { provider: { include: { user: true } } } } },
        orderBy: { createdAt: "desc" },
      })
    }

    // Add priority duration (days)
    const requestsWithDuration = requests.map(req => {
      const completedDate = req.status === "COMPLETED" ? req.updatedAt : new Date()
      const durationMs = new Date(completedDate).getTime() - new Date(req.createdAt).getTime()
      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24))
      return { ...req, durationDays }
    })

    return NextResponse.json({ requests: requestsWithDuration })
  } catch (error) {
    console.error("❌ Get requests error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// --- Update Request Status (PATCH) ---
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { requestId, status } = body

    if (!requestId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Only provider can update request status
    if (session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status },
    })

    return NextResponse.json({ message: "Request status updated", request: updatedRequest }, { status: 200 })
  } catch (error) {
    console.error("❌ Update request status error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
