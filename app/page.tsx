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
        <div className="min-h-screen bg-background w-full">
            {/* Hero Section */}
            <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        IP Toolkit <span className="text-primary">Pro</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        The ultimate network configuration platform for Ethio
                        Telecom professionals and customers
                    </p>

                    {!session ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
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
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Link href="/tools/wan-ip-analyzer">
                                <Button size="lg">Start Analyzing</Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="outline" size="lg">
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Everything You Need for Network Configuration
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Powerful tools and comprehensive resources designed
                        specifically for Ethio Telecom's network environment
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <Link key={index} href={feature.link}>
                            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer">
                                <CardHeader>
                                    <div className="text-3xl mb-4">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xl">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground mt-2">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-primary font-medium flex items-center gap-2">
                                        Explore Feature
                                        <span className="text-lg">→</span>
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
