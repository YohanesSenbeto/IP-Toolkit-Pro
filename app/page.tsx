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
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-100 px-2 sm:px-4 md:px-8">
            {/* Hero Section */}
            <section className="w-full max-w-screen-xl mx-auto px-0 py-0 text-left">
                <div className="max-w-4xl mx-auto flex flex-col items-start">
                    <p className="text-xl md:text-2xl font-bold mb-8 max-w-3xl pt-8 bg-gradient-to-r from-teal-500 via-emerald-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg animate-gradient-x">
                        <span className="inline-block px-1 py-0.5 rounded-lg shadow-md bg-white/10 backdrop-blur-sm">
                            <span className="text-teal-700">The ultimate</span>{" "}
                            <span className="text-emerald-700">
                                network configuration
                            </span>{" "}
                            <span className="text-orange-600">platform</span>{" "}
                            <span className="text-teal-700">for</span>{" "}
                            <span className="text-emerald-700">
                                Ethio Telecom
                            </span>{" "}
                            <span className="text-orange-600">
                                professionals
                            </span>{" "}
                            <span className="text-teal-700">and</span>{" "}
                            <span className="text-emerald-700">customers</span>
                        </span>
                    </p>

                    {!session ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 w-full">
                            <Button onClick={() => signIn()} size="lg">
                                Get Started Free
                            </Button>
                            <Link href="/tools/wan-ip-analyzer">
                                <Button variant="outline" size="lg">
                                    Try WAN IP Analyzer
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 w-full">
                            <Link href="/tools/wan-ip-analyzer">
                                <Button size="lg">Start Analyzing</Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    size="lg"
                                >
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full max-w-screen-xl mx-auto px-0 py-0">
                <div className="text-center mb-10 md:mb-14 px-2">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-foreground mb-2 leading-tight">
                        Everything You Need for Network Configuration
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Powerful tools and comprehensive resources designed
                        specifically for Ethio Telecom's network environment
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                    {features.map((feature, index) => (
                        <Link key={index} href={feature.link}>
                            <Card className="h-full bg-gradient-to-br from-blue-100 via-white to-purple-100 border-4 border-blue-300 shadow-2xl hover:shadow-blue-400 hover:scale-105 transition-all duration-300 cursor-pointer rounded-2xl px-2 py-2 flex flex-col justify-between min-h-[220px] max-w-md mx-auto hover:bg-gradient-to-tl hover:from-purple-100 hover:to-blue-100">
                                <CardHeader className="flex flex-col items-center text-center p-0 mb-0">
                                    <div className="text-xl mb-1 drop-shadow-lg animate-bounce-slow">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-blue-800 mb-0.5 drop-shadow">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-purple-700/90 mt-0.5 text-[10px] sm:text-xs md:text-sm leading-tight font-medium">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-end p-0 mt-0">
                                    <div className="text-white bg-gradient-to-r from-blue-500 to-purple-500 font-bold flex items-center gap-1 text-[10px] md:text-xs px-2 py-1 rounded-full shadow-md hover:from-purple-500 hover:to-blue-500 transition-colors">
                                        Explore Feature
                                        <span className="text-xs">→</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            {!session && (
                <section className="w-full bg-primary py-10 md:py-16">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                            Ready to Simplify Your Network Work?
                        </h2>
                        <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                            Join thousands of Ethio Telecom professionals using
                            IP Toolkit Pro daily
                        </p>
                        <Button
                            onClick={() => signIn()}
                            size="lg"
                            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        >
                            Create Free Account
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
}
