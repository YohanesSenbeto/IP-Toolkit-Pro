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
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 text-foreground">
                        Welcome to
                        <span className="block font-bold text-2xl sm:text-3xl md:text-4xl mt-1 text-primary">
                            IP TOOLKit App
                        </span>
                    </h1>
                    <p className="text-center text-base mb-4 text-muted-foreground">
                        Sign in to access all features, or create an account if
                        you haven't registered yet.
                    </p>
                    <div
                        className="inline-flex rounded-md shadow-sm"
                        role="group"
                    >
                        <Button
                            type="button"
                            className="rounded-l-md bg-primary text-primary-foreground hover:bg-primary/80"
                            variant="default"
                            onClick={() => signIn()}
                        >
                            Sign In
                        </Button>
                        <Link href="/auth/signup" passHref>
                            <Button
                                type="button"
                                className="-ml-px rounded-r-md bg-primary text-primary-foreground hover:bg-primary/80"
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
        <div className="min-h-screen w-full bg-background text-foreground px-2 pt-12 sm:pt-14 flex flex-col items-center">
            <section className="w-full max-w-3xl mx-auto text-center flex flex-col items-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-full mb-16 sm:mb-20">
                    <Link href="/tools/wan-ip-analyzer" className="sm:w-auto">
                        <Button className="font-medium px-5 py-2 text-sm min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/80">
                            Start Analyzing
                        </Button>
                    </Link>
                    <Link href="/dashboard" className="sm:w-auto">
                        <Button className="font-medium px-5 py-2 text-sm min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/80">
                            View Dashboard
                        </Button>
                    </Link>
                </div>
                <div className="w-full flex flex-col items-center px-2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 leading-snug text-foreground">
                        Everything You Need for Network Configuration
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed text-muted-foreground">
                        Powerful tools and comprehensive resources designed
                        specifically for Ethio Telecom's network environment
                    </p>
                </div>
            </section>
        </div>
    );
}
