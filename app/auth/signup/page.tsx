"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userRegistrationSchema } from "@/lib/validations";

type FormData = z.infer<typeof userRegistrationSchema>;

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(userRegistrationSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const { name, email, password, role } = data;
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            if (res.ok) {
                setSuccess(
                    "Account created successfully! Redirecting to sign in..."
                );
                setTimeout(() => router.push("/auth/signin"), 2000);
            } else {
                const errorData = await res.json();
                setError(errorData.message || "Something went wrong");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-background text-foreground transition-colors duration-300">
            <main className="flex-1 flex items-center justify-center w-full">
                <div className="w-full max-w-md space-y-4 p-4 mt-[-7vh]">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="mt-1 text-center text-lg font-extrabold">
                            Create your account
                        </h2>
                        <p className="mt-1 text-center text-xs font-medium">
                            <span className="font-black">IP Toolkit App</span>{" "}
                            and start managing your network configurations
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="w-full bg-[rgb(var(--card-rgb))] shadow-2xl border border-[rgb(var(--border-rgb))] p-4 flex flex-col text-[rgb(var(--foreground-rgb))] rounded-xl transition-colors duration-300">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    {success}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-3"
                        >
                            {[
                                "name",
                                "email",
                                "password",
                                "confirmPassword",
                            ].map((field, idx) => (
                                <div key={idx}>
                                    <label className="block text-sm font-medium mb-1 capitalize">
                                        {field.replace(/([A-Z])/g, " $1")}
                                    </label>
                                    <input
                                        {...register(field as keyof FormData)}
                                        type={
                                            field.includes("password")
                                                ? "password"
                                                : "text"
                                        }
                                        placeholder={
                                            field === "name"
                                                ? "Your full name"
                                                : field === "email"
                                                ? "you@example.com"
                                                : `Enter ${field}`
                                        }
                                        className="block w-full rounded-md bg-[rgb(var(--card-rgb))] text-[rgb(var(--foreground-rgb))] px-3 py-1.5 placeholder:text-gray-500 border border-[rgb(var(--border-rgb))] focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-[rgb(var(--foreground-rgb))]"
                                    />
                                    {errors[field as keyof FormData] && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                            {
                                                errors[field as keyof FormData]
                                                    ?.message as string
                                            }
                                        </p>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center">
                                <input
                                    {...register("terms")}
                                    type="checkbox"
                                    className="h-3 w-3 border border-[rgb(var(--border-rgb))] rounded bg-[rgb(var(--card-rgb))] text-[rgb(var(--foreground-rgb))]"
                                />
                                <label className="ml-1 text-xs">
                                    I agree to the{" "}
                                    <Link
                                        href="/terms"
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        href="/privacy"
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {errors.terms.message}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 text-xs flex justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 bg-background text-foreground border-current mr-2"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        <div className="mt-3 text-center text-xs">
                            Already have an account?{" "}
                            <Link
                                href="/auth/signin"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
