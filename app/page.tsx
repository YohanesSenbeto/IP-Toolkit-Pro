"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Home() {
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;

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
        </div>
    );
}
