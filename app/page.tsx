"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import {
    Card,
<<<<<<< HEAD
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
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

export default function Home() {
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;

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
