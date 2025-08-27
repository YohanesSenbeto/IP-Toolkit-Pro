// app/api/auth/signup/route.ts
import { NextResponse } from "next/server"
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

// ✅ Zod validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CLIENT", "PROVIDER"]),
})

// ✅ Type for parsed input
type SignupInput = z.infer<typeof signupSchema>

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ✅ Validate input
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password, role }: SignupInput = parsed.data

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // ✅ Create user (with provider profile if role is PROVIDER)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        ...(role === "PROVIDER"
          ? {
              provider: {
                create: { skills: [], bio: "" },
              },
            }
          : {}),
      },
      include: { provider: true },
    })

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
