import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
<<<<<<< HEAD
        email: { label: "Email", type: "text" },
=======
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

<<<<<<< HEAD
=======
        // Return minimal info; NextAuth will store this in JWT
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
<<<<<<< HEAD
      if (user) {
        token.id = user.id;
        token.role = user.role;
=======
      // Attach user info to JWT after sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
      }
      return token;
    },
    async session({ session, token }) {
<<<<<<< HEAD
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CLIENT" | "PROVIDER" | "ADMIN";
=======
      // Attach user info to session object
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
      }
      return session;
    },
  },
};

<<<<<<< HEAD
=======
// Export GET and POST for Next.js App Router
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
