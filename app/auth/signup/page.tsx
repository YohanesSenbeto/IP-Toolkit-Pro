"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CLIENT"); // CLIENT or PROVIDER

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });
            if (res.ok) {
                alert("Account created! Please sign in.");
                router.push("/auth/signin");
            } else {
                const data = await res.json();
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1>Create Account</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-80">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="px-3 py-2 border rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="px-3 py-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="px-3 py-2 border rounded"
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-3 py-2 border rounded"
                >
                    <option value="CLIENT">Client</option>
                    <option value="PROVIDER">Provider</option>
                </select>
                <button
                    type="submit"
                    className="px-3 py-2 bg-green-600 text-white rounded mt-2"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}
