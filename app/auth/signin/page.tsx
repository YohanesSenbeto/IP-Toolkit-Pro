"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();

    // Auto redirect if user is already logged in
    useEffect(() => {
        if (status === "authenticated" && session?.user?.role) {
            if (session.user.role === "CLIENT")
                router.push("/dashboard/client");
            if (session.user.role === "PROVIDER")
                router.push("/dashboard/provider");
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await signIn("credentials", {
            email,
            password,
            redirect: true, // enable redirect
            // Remove callbackUrl, next-auth redirect will handle it
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-sm mx-auto mt-20"
        >
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
            >
                Sign In
            </button>
        </form>
    );
}
