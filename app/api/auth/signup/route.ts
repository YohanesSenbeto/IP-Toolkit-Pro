// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import Prisma from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new Prisma.PrismaClient();

// ✅ Zod validation schema (align with Prisma Role)
const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be at most 50 characters" })
    .trim()
    .nonempty({ message: "Name is required" }),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine(
      (val) =>
        /[A-Z]/.test(val) &&
        /[a-z]/.test(val) &&
        /\d/.test(val) &&
        /[^A-Za-z0-9]/.test(val),
      {
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      }
    ),
  role: z.enum(["USER", "ADMIN"]).default("USER").optional(),
});

// ✅ Type for parsed input
type SignupInput = z.infer<typeof signupSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
