// app/api/auth/signup/route.ts
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
<<<<<<< HEAD

const prisma = new PrismaClient();
=======

const prisma = new PrismaClient();
=======
import { NextResponse } from "next/server"
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd

// ✅ Zod validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
<<<<<<< HEAD
  role: z.enum(["USER", "ADMIN"]),
});
=======
  role: z.enum(["CLIENT", "PROVIDER"]),
<<<<<<< HEAD
});

// ✅ Type for parsed input
type SignupInput = z.infer<typeof signupSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate input
    const parsed = signupSchema.safeParse(body);
=======
})
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd

// ✅ Type for parsed input
type SignupInput = z.infer<typeof signupSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate input
<<<<<<< HEAD
    const parsed = signupSchema.safeParse(body);
=======
    const parsed = signupSchema.safeParse(body)
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors },
        { status: 400 }
<<<<<<< HEAD
      );
=======
<<<<<<< HEAD
      );
    }

    const { name, email, password, role }: SignupInput = parsed.data;

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
=======
      )
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
    }

    const { name, email, password, role }: SignupInput = parsed.data;

    // ✅ Check if user already exists
<<<<<<< HEAD
    const existingUser = await prisma.user.findUnique({ where: { email } });
=======
    const existingUser = await prisma.user.findUnique({ where: { email } })
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
<<<<<<< HEAD
      );
=======
<<<<<<< HEAD
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user (with providerProfile if role is PROVIDER)
=======
      )
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

<<<<<<< HEAD
    // ✅ Create user 
=======
    // ✅ Create user (with provider profile if role is PROVIDER)
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
<<<<<<< HEAD
        role: role,

      },
      include: {
        calculations: true,
        knowledgeBase: true,
      },
    });
=======
        role: role as Role,
        ...(role === "PROVIDER"
          ? {
<<<<<<< HEAD
              providerProfile: {
=======
              provider: {
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
                create: { skills: [], bio: "" },
              },
            }
          : {}),
      },
<<<<<<< HEAD
      include: {
        providerProfile: true, // ✅ must match your schema
        requests: true,
        proposals: true,
        reviews: true,
      },
    });
=======
      include: { provider: true },
    })
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
<<<<<<< HEAD
    );
=======
<<<<<<< HEAD
    );
  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
=======
    )
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
<<<<<<< HEAD
    );
=======
    )
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
  }
}
