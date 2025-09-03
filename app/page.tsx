"use client";

import { useSession, signIn, signOut } from "next-auth/react";
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
            description: "Intelligent WAN IP analysis with automatic CIDR calculations, region detection, and router recommendations for Ethio Telecom technicians",
            link: "/tools/wan-ip-analyzer",
            icon: "🌐"
        },
        {
            title: "IP Calculator",
            description: "Advanced IP subnet calculator with CIDR support, network address, broadcast address, and usable host range calculations",
            link: "/tools/ip-calculator",
            icon: "🔢"
        },
        {
            title: "Knowledge Base",
            description: "Comprehensive tutorials and guides for Ethio Telecom equipment and network configurations",
            link: "/knowledge-base",
            icon: "📚"
        },
        {
            title: "History & Save",
            description: "Save your calculations with custom titles and access them anytime from your dashboard",
            link: "/dashboard",
            icon: "💾"
        },
        {
            title: "Router Configs",
            description: "Step-by-step configuration guides for popular router models including TP-Link, Huawei, and more",
            link: "/knowledge-base/routers",
            icon: "🔄"
        },
        {
            title: "Multi-Device Sync",
            description: "Access your saved calculations and history from any device with your account",
            link: "/dashboard",
            icon: "📱"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                        IP Toolkit <span className="text-blue-600">Pro</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        The ultimate network configuration platform for Ethio Telecom professionals and customers
                    </p>
                    
                    {!session ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Button
                                onClick={() => signIn()}
                                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-lg"
                                size="lg"
                            >
                                Get Started Free
                            </Button>
                            <Link href="/tools/wan-ip-analyzer">
                                <Button
                                    variant="outline"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                                    size="lg"
                                >
                                    Try WAN IP Analyzer
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Link href="/tools/wan-ip-analyzer">
                                <Button
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 text-lg"
                                    size="lg"
                                >
                                    Start Analyzing
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button
                                    variant="outline"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                                    size="lg"
                                >
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Everything You Need for Network Configuration
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Powerful tools and comprehensive resources designed specifically for Ethio Telecom's network environment
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Link key={index} href={feature.link}>
                            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer">
                                <CardHeader>
                                    <div className="text-3xl mb-4">{feature.icon}</div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    <CardDescription className="text-gray-600 mt-2">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-blue-600 font-medium flex items-center gap-2">
                                        Explore Feature
                                        <span className="text-lg">→</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Call to Action */}
            {!session && (
                <div className="bg-blue-600 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Simplify Your Network Work?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of Ethio Telecom professionals using IP Toolkit Pro daily
                        </p>
                        <Button
                            onClick={() => signIn()}
                            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                            size="lg"
                        >
                            Create Free Account
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
