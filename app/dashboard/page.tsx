"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Calendar, 
    Calculator, 
    User, 
    History, 
    Globe, 
    Play, 
    TrendingUp,
    Clock,
    CheckCircle,
    ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [calculations, setCalculations] = useState<any[]>([]);
    const [totalCalculations, setTotalCalculations] = useState(0);
    const [savedCalculations, setSavedCalculations] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCalculations = async () => {
            try {
                const response = await fetch("/api/calculations");
                if (response.ok) {
                    const data = await response.json();
                    setCalculations(data.calculations || []);
                    setTotalCalculations(data.calculations?.length || 0);
                    setSavedCalculations(data.calculations?.length || 0);
                }
            } catch (error) {
                console.error("Error fetching calculations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchCalculations();
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Welcome back, {session.user?.name || session.user?.email}!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">
                            Total Calculations
                        </CardTitle>
                        <Calculator className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {isLoading ? "..." : totalCalculations}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            IP calculations performed
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">
                            Saved Calculations
                        </CardTitle>
                        <History className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {isLoading ? "..." : savedCalculations}
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                            Calculations saved
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">
                            Account Status
                        </CardTitle>
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            Active
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                            {session.user?.role === "ADMIN" ? "Admin Account" : "User Account"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">
                            Last Activity
                        </CardTitle>
                        <Clock className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            Today
                        </div>
                        <p className="text-xs text-orange-600 mt-1">
                            Recently active
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-green-600" />
                            Recent Calculations
                        </CardTitle>
                        <CardDescription>
                            Your most recent WAN IP, Subnet Mask, and Default Gateway calculations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {calculations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>No calculations yet</p>
                                <p className="text-xs mt-2">
                                    Start by analyzing your WAN IP, Subnet Mask,
                                    and Default Gateway to see results here.
                                </p>
                                <Link href="/tools/wan-ip-analyzer">
                                    <Button className="mt-4">
                                        Start Analyzing
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {calculations.slice(0, 5).map((calculation) => (
                                    <div
                                        key={calculation.id}
                                        className="border rounded-lg p-4 bg-blue-50/50"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-blue-900">
                                                Calculation for{" "}
                                                {calculation.wanIp}
                                                {calculation.cidr
                                                    ? `/${calculation.cidr}`
                                                    : ""}
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                                {new Date(
                                                    calculation.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                                            <div>
                                                <span className="font-semibold text-blue-700">
                                                    WAN IP:
                                                </span>
                                                <span className="ml-1 font-mono text-xs">
                                                    {calculation.wanIp}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-blue-700">
                                                    Subnet Mask:
                                                </span>
                                                <span className="ml-1 font-mono text-xs">
                                                    {calculation.result
                                                        ?.subnetMask ||
                                                        calculation.subnetMask ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-blue-700">
                                                    Default Gateway:
                                                </span>
                                                <span className="ml-1 font-mono text-xs">
                                                    {calculation.result
                                                        ?.defaultGateway ||
                                                        calculation.defaultGateway ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-blue-700">
                                                    CIDR:
                                                </span>
                                                <span className="ml-1 font-mono text-xs">
                                                    {calculation.cidr
                                                        ? `/${calculation.cidr}`
                                                        : "N/A"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-blue-700">
                                                    Hosts:
                                                </span>
                                                <span className="ml-1 font-mono text-xs">
                                                    {calculation.result?.usableHosts?.toLocaleString() ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    redirect(
                                                        `/dashboard/history/detail?id=${calculation.id}`
                                                    )
                                                }
                                            >
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {calculations.length > 5 && (
                                    <Link href="/dashboard/history">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            View All Calculations
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Access your most used tools and features
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/tools/wan-ip-analyzer">
                            <Button
                                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                                variant="default"
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                WAN IP Analyzer
                            </Button>
                        </Link>

                        <Link href="/tools/modem-tutorials">
                            <Button
                                className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                                variant="default"
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Modem Tutorials
                            </Button>
                        </Link>

                        <Link href="/dashboard/history">
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                            >
                                <History className="mr-2 h-4 w-4" />
                                Calculation History
                            </Button>
                        </Link>

                        {session.user?.role === "ADMIN" && (
                            <Link href="/admin">
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Admin Dashboard
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
