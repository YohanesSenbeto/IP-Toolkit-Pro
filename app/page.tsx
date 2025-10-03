"use client";

import { useSession, signIn } from "next-auth/react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;

    // Only show sign in/sign up for guests
    if (!session) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full flex flex-col items-center gap-6 py-16">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
                        Welcome to
                        <span className="block font-bold text-2xl sm:text-3xl md:text-4xl mt-1 text-gray-700">
                            IP TOOLKit App
                        </span>
                    </h1>
                    <p className="text-center text-base mb-4 text-gray-500">
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

    // Authenticated users see the full app
    const features = [
        {
            title: "WAN IP Analyzer",
            description:
                "Intelligent WAN IP analysis with automatic CIDR calculations, region detection, and router recommendations for Ethio Telecom technicians",
            link: "/tools/wan-ip-analyzer",
            icon: "🌐",
        },
        {
            title: "Modem Configuration Tutorials",
            description:
                "Comprehensive video tutorials for modem and router configuration from Yoh-Tech Solutions YouTube channel",
            link: "/tools/modem-tutorials",
            icon: "📺",
        },
        {
            title: "History & Save",
            description:
                "Save your calculations with custom titles and access them anytime from your dashboard",
            link: "/dashboard",
            icon: "💾",
        },
    ];

    return (
        <div className="min-h-screen w-full bg-gray-50 px-4 pt-8 flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full max-w-screen-xl mx-auto px-2 py-0 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 w-full max-w-full">
                        <Link
                            href="/tools/wan-ip-analyzer"
                            className="w-full sm:w-auto"
                        >
                            <Button className="bg-gray-800 text-white hover:bg-gray-700 border-none">
                                Start Analyzing
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button className="bg-gray-800 text-white hover:bg-gray-700 border-none">
                                View Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
            {/* Features Grid */}
            <section className="w-full max-w-screen-xl mx-auto px-2 py-0">
                <div className="text-center mb-8 md:mb-10 px-2">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight text-gray-800">
                        Everything You Need for Network Configuration
                    </h2>
                    <p className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed text-gray-500">
                        Powerful tools and comprehensive resources designed
                        specifically for Ethio Telecom's network environment
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                    {features.map((feature, index) => (
                        <Link key={index} href={feature.link}>
                            <Card className="h-full bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer rounded-2xl px-5 py-6 flex flex-col justify-between min-h-[180px] max-w-xs mx-auto transform hover:scale-[1.03]">
                                <CardHeader className="flex flex-col items-center text-center p-0 mb-0 gap-2">
                                    <div className="text-3xl mb-2 drop-shadow-sm text-gray-700">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-base font-bold text-gray-800 mb-1">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 mt-0.5 text-sm leading-tight font-normal">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-end p-0 mt-2">
                                    <Button
                                        size="sm"
                                        className="rounded-full px-4 py-1 font-semibold shadow hover:shadow-md bg-gray-800 text-white hover:bg-gray-700 border-none"
                                    >
                                        Explore Feature{" "}
                                        <span className="text-xs ml-1">→</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
