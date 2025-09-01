<<<<<<< HEAD
import NextAuth from "next-auth";
=======
// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b

declare module "next-auth" {
  interface Session {
    user: {
<<<<<<< HEAD
      id: string;
      name?: string | null;
      email?: string | null;
      role: "CLIENT" | "PROVIDER" | "ADMIN";
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "CLIENT" | "PROVIDER" | "ADMIN";
  }

  interface JWT {
    id: string;
    role: "CLIENT" | "PROVIDER" | "ADMIN";
=======
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
  }
}
