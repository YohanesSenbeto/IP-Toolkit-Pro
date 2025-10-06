"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    const { data: session, status } = useSession();

    if (status === "loading")
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );

    // Guest view
    if (!session) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-background text-foreground">
                <div className="max-w-md w-full flex flex-col items-center gap-6 py-16">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
                        Welcome to
                        <span className="block font-bold text-2xl sm:text-3xl md:text-4xl mt-1">
                            IP TOOLKit App
                        </span>
                    </h1>
                    <p className="text-center text-base mb-4 text-gray-600 dark:text-gray-400">
                        Sign in to access all features, or create an account if
                        you haven't registered yet.
                    </p>
                    <div
                        className="inline-flex rounded-md shadow-sm"
                        role="group"
                    >
                        <Button
                            type="button"
                            className="rounded-l-md"
                            variant="default"
                            onClick={() => signIn()}
                        >
                            Sign In
                        </Button>
                        <Link href="/auth/signup" passHref>
                            <Button
                                type="button"
                                className="-ml-px rounded-r-md"
                                variant="default"
                            >
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground px-4 pt-16 flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full max-w-screen-xl mx-auto text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 w-full max-w-full">
                        <Link
                            href="/tools/wan-ip-analyzer"
                            className="w-full sm:w-auto"
                        >
                            <Button className="w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                                Start Analyzing
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                                View Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Description Section */}
            <section className="w-full max-w-4xl mx-auto text-center">
                <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
                        Everything You Need for Network Configuration
                    </h2>
                    <p className="text-xl font-semibold max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-300">
                        Powerful tools and comprehensive resources designed
                        specifically for Ethio Telecom's network environment
                    </p>
                </div>
            </section>
        </div>
    );
}
