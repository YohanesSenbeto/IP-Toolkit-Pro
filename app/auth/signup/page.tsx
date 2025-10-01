"use client";

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
                setTimeout(() => {
                    router.push("/auth/signin");
                }, 2000);
            } else {
                const errorData = await res.json();
                setError(errorData.message || "Something went wrong");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
            <main className="flex-1 flex items-center justify-center w-full">
                <div className="w-full max-w-md space-y-4 p-1 sm:p-2 md:p-3 lg:p-4 mt-[-7vh]">
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="mt-1 text-center text-lg font-extrabold bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-400 bg-clip-text text-transparent drop-shadow">
                            Create your account
                        </h2>
                        <p className="mt-1 text-center text-xs text-gray-700 dark:text-gray-300 font-medium">
                            <span className="font-black bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-400 bg-clip-text text-transparent drop-shadow">
                                IP Toolkit App
                            </span>{" "}
                            and start managing your network configurations
                        </p>
                    </div>

                    <div className="w-full h-full bg-white/90 dark:bg-gray-800/90 shadow-2xl border-2 border-emerald-200 dark:border-emerald-700 transition-colors duration-200 p-2 sm:p-3 md:p-4 flex flex-col justify-center">
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
                            className="space-y-3"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Full Name
                                </label>
                                <input
                                    {...register("name")}
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mt-0.5 text-xs"
                                    placeholder="Enter your full name"
                                />
                                {errors.name && (
                                    <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email address
                                </label>
                                <input
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
                                <input
                                    {...register("password")}
                                    type="password"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mt-0.5 text-xs"
                                    placeholder="Create a password"
                                />
                                {errors.password && (
                                    <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mt-0.5 text-xs"
                                    placeholder="Confirm your password"
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    {...register("terms")}
                                    type="checkbox"
                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                                <label
                                    htmlFor="terms"
                                    className="ml-1 block text-xs text-gray-900 dark:text-gray-200"
                                >
                                    I agree to the{" "}
                                    <Link
                                        href="/terms"
                                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        href="/privacy"
                                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                                    {errors.terms.message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center text-xs py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>

                        <div className="mt-3 text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Already have an account?{" "}
                                <Link
                                    href="/auth/signin"
                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
