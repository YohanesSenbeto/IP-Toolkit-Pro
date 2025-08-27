import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
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
  }
}
