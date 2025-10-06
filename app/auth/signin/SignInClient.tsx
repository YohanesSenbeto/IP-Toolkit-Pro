"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userLoginSchema } from "../../../lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof userLoginSchema>;

export default function SignInClient() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get("callbackUrl") || "/";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(userLoginSchema),
    });

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            router.push(callbackUrl);
        }
    }, [status, session, router, callbackUrl]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) setError("Invalid email or password");
            else router.push(callbackUrl);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError("");
        await signIn("google", { callbackUrl });
    };

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background-rgb))] text-[rgb(var(--foreground-rgb))]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--foreground-rgb))]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--background-rgb))] text-[rgb(var(--foreground-rgb))] transition-colors duration-300">
            <main className="w-full max-w-md space-y-4 p-6">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <h2 className="mt-1 text-center text-lg font-extrabold">
                        Sign in to{" "}
                        <span className="font-black">IP Toolkit App</span>
                    </h2>
                    <p className="mt-1 text-center text-xs font-medium">
                        Access your network configuration tools
                    </p>
                </div>

                {/* Sign In Card */}
                <Card className="w-full bg-[rgb(var(--card-rgb))] border border-[rgb(var(--border-rgb))] rounded-2xl shadow-xl">
                    <CardContent className="pt-4">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-md">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium"
                                >
                                    Email Address
                                </label>
                                <Input
                                    {...register("email")}
                                    type="email"
                                    placeholder="you@example.com"
                                    className="mt-1 block w-full rounded-md border border-[rgb(var(--border-rgb))] bg-[rgb(var(--card-rgb))] text-[rgb(var(--foreground-rgb))] placeholder-gray-500 focus:border-[rgb(var(--foreground-rgb))] focus:ring-0"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium"
                                >
                                    Password
                                </label>
                                <Input
                                    {...register("password")}
                                    type="password"
                                    placeholder="Your password"
                                    className="mt-1 block w-full rounded-md border border-[rgb(var(--border-rgb))] bg-[rgb(var(--card-rgb))] text-[rgb(var(--foreground-rgb))] placeholder-gray-500 focus:border-[rgb(var(--foreground-rgb))] focus:ring-0"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me + Forgot Password */}
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="h-3 w-3 rounded border-[rgb(var(--border-rgb))] bg-[rgb(var(--card-rgb))]"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Sign In Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 bg-[rgb(var(--foreground-rgb))] text-[rgb(var(--background-rgb))] hover:opacity-90 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[rgb(var(--border-rgb))]" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-[rgb(var(--card-rgb))] text-[rgb(var(--muted-foreground-rgb))]">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <div className="mt-4">
                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full flex justify-center items-center gap-2 py-2 border border-[rgb(var(--border-rgb))] bg-[rgb(var(--card-rgb))] text-[rgb(var(--foreground-rgb))] hover:opacity-90 transition-all"
                            >
                                {/* Google Logo */}
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Sign in with Google
                            </Button>
                        </div>

                        {/* Signup Link */}
                        <p className="mt-6 text-center text-xs">
                            Don’t have an account?{" "}
                            <Link
                                href="/auth/signup"
                                className="font-medium hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
