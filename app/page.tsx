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
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-950 dark:to-emerald-900 px-2 sm:px-4 md:px-8">
                <div className="max-w-md w-full flex flex-col items-center gap-6 py-16">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-center drop-shadow mb-2">
                        <span
                            className="block text-emerald-900 dark:text-emerald-200 font-extrabold"
                            style={{ letterSpacing: "-0.01em" }}
                        >
                            Welcome to
                        </span>
                        <span
                            className="block font-extrabold tracking-tight whitespace-nowrap text-3xl md:text-4xl lg:text-5xl font-serif bg-gradient-to-r from-[#8dc63f] via-[#0097db] to-[#ffe000] bg-clip-text text-transparent drop-shadow"
                            style={{
                                lineHeight: 1.1,
                                fontFamily:
                                    "Georgia, Times, Times New Roman, serif",
                            }}
                        >
                            IP TOOLKit{" "}
                            <span className="font-black font-serif">App</span>
                        </span>
                    </h1>
                    <p className="text-center text-lg mb-4 font-semibold font-serif drop-shadow">
                        <span className="bg-gradient-to-r from-[#8dc63f] to-[#ffe000] bg-clip-text text-transparent">
                            Sign in to access{" "}
                        </span>
                        <span className="text-[#0097db] font-bold">
                            all features
                        </span>
                        <span className="bg-gradient-to-r from-[#8dc63f] to-[#ffe000] bg-clip-text text-transparent">
                            , or create an account if you{" "}
                        </span>
                        <span className="text-[#0097db] font-bold">
                            haven't registered yet.
                        </span>
                    </p>
                    <div className="flex flex-col gap-4 w-full">
                        <Button
                            onClick={() => signIn()}
                            size="lg"
                            className="w-full bg-gradient-to-r from-[#8dc63f] via-[#0097db] to-[#ffe000] bg-clip-text text-transparent border border-emerald-200 font-bold dark:from-emerald-300 dark:via-sky-400 dark:to-cyan-300 dark:border-emerald-400"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8dc63f] via-[#0097db] to-[#ffe000] dark:from-emerald-300 dark:via-sky-400 dark:to-cyan-300">
                                Sign In
                            </span>
                        </Button>
                        <Link href="/auth/signup" className="w-full">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full border-emerald-200 text-emerald-700 font-bold dark:border-emerald-400 dark:text-emerald-200"
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
        <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 via-white to-emerald-100 dark:from-gray-900 dark:via-gray-950 dark:to-emerald-900 px-2 sm:px-4 md:px-8 pt-12 sm:pt-16 md:pt-20 lg:pt-24 flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-0 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 w-full max-w-full">
                        <Link
                            href="/tools/wan-ip-analyzer"
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border border-teal-200 text-[#13a3b3] font-extrabold text-lg px-10 py-3 shadow-md hover:bg-teal-50 hover:border-teal-300 transition-colors"
                            >
                                <span className="text-[#13a3b3] font-extrabold">
                                    Start Analyzing
                                </span>
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border border-teal-200 text-[#13a3b3] font-extrabold text-lg px-10 py-3 shadow-md hover:bg-teal-50 hover:border-teal-300 transition-colors"
                            >
                                <span className="text-[#13a3b3] font-extrabold">
                                    View Dashboard
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
            {/* Features Grid */}
            <section className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-0 dark:pt-12">
                <div className="text-center mb-8 md:mb-10 px-2">
                    <h2
                        className="text-4xl md:text-5xl font-extrabold mb-2 leading-tight text-[#13a3b3] drop-shadow"
                        style={{
                            fontFamily:
                                "Georgia, Times, Times New Roman, serif",
                        }}
                    >
                        Everything You Need for Network Configuration
                    </h2>
                    <p className="text-2xl md:text-3xl max-w-3xl mx-auto leading-relaxed text-[#13a3b3] font-serif font-bold drop-shadow">
                        Powerful tools and comprehensive resources designed
                        specifically for Ethio Telecom's network environment
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                    {features.map((feature, index) => (
                        <Link key={index} href={feature.link}>
                            <Card className="h-full bg-gradient-to-br from-cyan-100 via-white to-emerald-100 border-2 border-emerald-200 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer rounded-xl px-2 py-2 flex flex-col justify-between min-h-[140px] max-w-xs mx-auto hover:bg-gradient-to-tl hover:from-emerald-100 hover:to-cyan-100 dark:from-gray-800 dark:via-gray-900 dark:to-emerald-950 dark:border-emerald-700 dark:hover:from-emerald-950 dark:hover:to-gray-800">
                                <CardHeader className="flex flex-col items-center text-center p-0 mb-0">
                                    <div className="text-lg mb-1 drop-shadow-lg animate-bounce-slow">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xs sm:text-sm font-bold text-emerald-800 mb-0.5 drop-shadow dark:text-emerald-200">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-sky-700/90 mt-0.5 text-[10px] sm:text-xs leading-tight font-medium dark:text-sky-200/90">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-end p-0 mt-0">
                                    <div className="text-white bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold flex items-center gap-1 text-[10px] px-2 py-1 rounded-full shadow-md hover:from-cyan-500 hover:to-emerald-500 transition-colors dark:from-emerald-400 dark:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-emerald-400">
                                        Explore Feature
                                        <span className="text-xs">→</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
