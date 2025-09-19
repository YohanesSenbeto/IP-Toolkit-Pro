import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Check regular users first
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && user.password) {
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // Check technicians using employee ID format (ethio14777)
        const employeeId = credentials.email.toLowerCase().replace('ethio', '');
        // Fetch technician including password field
        const technician = await prisma.ethioTelecomTechnician.findFirst({
          where: { employeeId },
        });

        // Fetch the technician's password from the related user table
        let technicianPassword: string | null = null;
        if (technician) {
          // Try to find a user with the same email as the technician
          const technicianUser = await prisma.user.findUnique({
            where: { email: technician.email ?? undefined },
            select: { password: true }
          });
          technicianPassword = technicianUser?.password ?? null;
        }

        if (technician && technicianPassword) {
          const isValid = await bcrypt.compare(credentials.password, technicianPassword);
          if (isValid) {
            return {
              id: technician.id,
              name: technician.name,
              email: technician.email,
              role: 'ETHIO_TELECOM_TECHNICIAN',
            };
          }
        }

        return null;
      },
    }),
    CredentialsProvider({
      id: "technician-credentials",
      name: "Technician Login",
      credentials: {
        employeeId: { label: "Employee ID", type: "text", placeholder: "ethio14777" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.employeeId || !credentials?.password) return null;

        // Remove 'ethio' prefix if provided
        const cleanEmployeeId = credentials.employeeId.toLowerCase().replace('ethio', '');

        // Fetch technician including password field
        const technician = await prisma.ethioTelecomTechnician.findFirst({
          where: { employeeId: cleanEmployeeId },
        });

        // Fetch the technician's password from the related user table
        let technicianPassword: string | null = null;
        if (technician) {
          const technicianUser = await prisma.user.findUnique({
            where: { email: technician.email ?? undefined },
            select: { password: true }
          });
          technicianPassword = technicianUser?.password ?? null;
        }

        if (!technician || !technicianPassword) return null;

        const isValid = await bcrypt.compare(credentials.password, technicianPassword);
        if (!isValid) return null;

        return {
          id: technician.id,
          name: technician.name,
          email: technician.email || `ethio${technician.employeeId}@ethiotelecom.et`,
          role: 'ETHIO_TELECOM_TECHNICIAN',
        };
      },
    }),
  ],
  pages: { 
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN" | "ETHIO_TELECOM_TECHNICIAN";
      }
      return session;
    },
  },
};