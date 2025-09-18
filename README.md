This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

---

# IP Toolkit Pro / NetConfig Hub – Security & UX Enhancement Plan

**Audience:** Ethio Telecom employees & customers  
**Core Features:** WAN IP Analyzer, IP Calculator, Knowledge Base

---

## ✅ Project Scope & Audience Understood

This project is an enterprise-grade toolkit for Ethio Telecom, focused on secure WAN IP management, calculation, and knowledge sharing. Security, data privacy, and a professional, modern UI are paramount.

---

## PHASE 1: SECURITY AUDIT & HARDENING

### 1. Top Security Vulnerabilities & Fixes

#### **1.1. Insecure Password Handling**
- **Risk:** If passwords are not hashed (e.g., using bcrypt) before storage or comparison, user credentials are at risk of compromise.
- **Fix:** Always hash passwords before saving and during authentication.

**Code Fix Example (`lib/auth.ts`):**

// Secure password hashing and verification using bcrypt in Next.js (TypeScript)

// lib/auth.ts

import bcrypt from 'bcrypt';

// Hash a password before storing in the database
export async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 12; // Stronger than default, but still performant
  return await bcrypt.hash(plainPassword, saltRounds);
}

// Compare a plain password with a hashed password during login
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/*
Usage Example:

// Registration
const hashed = await hashPassword(userInputPassword);
// Save 'hashed' to DB

// Login
const isValid = await verifyPassword(loginInputPassword, userRecord.hashedPassword);
if (!isValid) {
  throw new Error('Invalid credentials');
}
*/

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
