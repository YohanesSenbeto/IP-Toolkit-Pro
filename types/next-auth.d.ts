<<<<<<< HEAD
import NextAuth from "next-auth";
=======
<<<<<<< HEAD
import NextAuth from "next-auth";
=======
// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd

declare module "next-auth" {
  interface Session {
    user: {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
      id: string;
      name?: string | null;
      email?: string | null;
      role: "CLIENT" | "PROVIDER" | "ADMIN";
    };
<<<<<<< HEAD
=======
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
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "CLIENT" | "PROVIDER" | "ADMIN";
  }

  interface JWT {
<<<<<<< HEAD
    id: string;
    role: "CLIENT" | "PROVIDER" | "ADMIN";
=======
    id: string
    role: string
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
  }
}
