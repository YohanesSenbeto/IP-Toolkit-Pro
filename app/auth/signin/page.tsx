"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userLoginSchema } from "../../../lib/validations";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type FormData = z.infer<typeof userLoginSchema>;

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(userLoginSchema),
    });

    // Auto redirect if user is already logged in
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError("");
        await signIn("google", { callbackUrl: "/dashboard" });
    };

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
            {/* NavBar should be visible above the login form if not already handled globally */}
            <main className="flex-1 flex items-center justify-center w-full">
                <div className="w-full max-w-md space-y-4 p-1 sm:p-2 md:p-3 lg:p-4 mt-[-7vh]">
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="mt-1 text-center text-lg font-extrabold bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-400 bg-clip-text text-transparent drop-shadow">
                            Sign in to{" "}
                            <span className="font-black bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-400 bg-clip-text text-transparent drop-shadow">
                                IP Toolkit Pro
                            </span>
                        </h2>
                        <p className="mt-1 text-center text-xs text-gray-700 dark:text-gray-300 font-medium">
                            Access your network configuration tools
                        </p>
                    </div>

                    <Card className="w-full h-full bg-white/90 dark:bg-gray-800/90 shadow-2xl border-2 border-emerald-200 dark:border-emerald-700 transition-colors duration-200 p-2 sm:p-3 md:p-4 flex flex-col justify-center">
                        <CardContent className="pt-2">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-3"
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Email address
                                    </label>
                                    <Input
                                        {...register("email")}
                                        type="email"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mt-0.5 text-xs"
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && (
                                        <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Password
                                    </label>
                                    <Input
                                        {...register("password")}
                                        type="password"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mt-0.5 text-xs"
                                        placeholder="Enter your password"
                                    />
                                    {errors.password && (
                                        <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                        />
                                        <label
                                            htmlFor="remember-me"
                                            className="ml-1 block text-xs text-gray-900 dark:text-gray-300"
                                        >
                                            Remember me
                                        </label>
                                    </div>
                                    <div className="text-xs">
                                        <Link
                                            href="/auth/forgot-password"
                                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center text-xs py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 transition-colors duration-200"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </button>
                            </form>

                            <div className="mt-3">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <Button
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="w-full text-xs py-2"
                                    >
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            viewBox="0 0 24 24"
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
                            </div>

                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Don't have an account?{" "}
                                    <Link
                                        href="/auth/signup"
                                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
