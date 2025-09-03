"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import {
    Card,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
<<<<<<< HEAD
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
=======
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
=======
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd

export default function Home() {
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;

<<<<<<< HEAD
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
=======
<<<<<<< HEAD
    const solutions = [
        {
            title: "Solution 1",
            description: "Description for solution 1",
            link: "/solution1",
        },
        {
            title: "Solution 2",
            description: "Description for solution 2",
            link: "/solution2",
        },
        {
            title: "Solution 3",
            description: "Description for solution 3",
            link: "/solution3",
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            {!session ? (
                <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-3xl font-bold text-center">
                            Welcome to Addis Solution Hub
                        </h1>
                        <p className="text-gray-600 text-center">
                            Sign in to access our solutions
                        </p>
                    </div>
                    <Separator className="my-2" />
                    <Button
                        onClick={() => signIn()}
                        className="w-full bg-primary text-white hover:bg-primary/90 h-11"
                    >
                        Sign in
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-8 w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-6xl bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={session.user?.image} />
                                <AvatarFallback>
                                    {session.user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Welcome back, {session.user?.name}
                                </h1>
                                <Badge variant="outline" className="mt-1">
                                    {session.user?.role}
                                </Badge>
                            </div>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => signOut()}
                                        variant="destructive"
                                        className="mt-4 sm:mt-0"
                                    >
                                        Sign out
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Sign out of your account</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="w-full max-w-6xl">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <h2 className="text-3xl font-bold">
                                Our Solutions
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Input
                                    placeholder="Search solutions..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {solutions.map((solution, index) => (
                                <Card
                                    key={index}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader>
                                        <CardTitle>{solution.title}</CardTitle>
                                        <CardDescription>
                                            {solution.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                Solution
                                            </Badge>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            className="text-primary"
                                            asChild
                                        >
                                            <a href={solution.link}>
                                                Learn More
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
                    </div>
                </div>
            )}
=======
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6 p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Addis Solution Hub
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {/* Card for Auth Status */}
                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle>
                            {!session
                                ? "Not Signed In"
                                : `Hello, ${session.user?.name}`}
                        </CardTitle>
                        <CardDescription>
                            {!session
                                ? "Please sign in to access your dashboard and features."
                                : `Your role: ${session.user?.role || "User"}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {!session ? (
                            <Button onClick={() => signIn()} variant="default">
                                Sign In
                            </Button>
                        ) : (
                            <Button
                                onClick={() => signOut()}
                                variant="destructive"
                            >
                                Sign Out
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Sample Feature Card */}
                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle>Feature 1</CardTitle>
                        <CardDescription>
                            Explore one of the main features of your app here.
                            Update later for dynamic content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary">Explore</Button>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                    <CardHeader>
                        <CardTitle>Feature 2</CardTitle>
                        <CardDescription>
                            Another feature card. Replace content later with
                            real data or actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary">Explore</Button>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-6 w-full max-w-6xl" />

            <p className="text-sm text-gray-500">
                © 2025 Addis Solution Hub. All rights reserved.
            </p>
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
        </div>
    );
}
