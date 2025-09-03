"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, Server, Activity } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
    totalPools: number;
    totalIPs: number;
    assignedIPs: number;
    availableIPs: number;
}

interface RecentAssignment {
    id: string;
    customerName: string;
    ipAddress: string;
    assignedAt: string;
}

export default function TechnicianDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalPools: 0,
        totalIPs: 0,
        assignedIPs: 0,
        availableIPs: 0,
    });
    const [recentAssignments, setRecentAssignments] = useState<
        RecentAssignment[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN") {
            router.push("/auth/technician-signin");
            return;
        }

        fetchDashboardData();
    }, [session, status, router]);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, assignmentsResponse] = await Promise.all([
                fetch("/api/technician/dashboard/stats"),
                fetch("/api/technician/dashboard/recent-assignments"),
            ]);

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            if (assignmentsResponse.ok) {
                const assignmentsData = await assignmentsResponse.json();
                setRecentAssignments(assignmentsData);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Loading technician dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Technician Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Welcome back,{" "}
                                {session.user.name || "Technician"}
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <Link href="/technician/pools/create">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Create IP Pool
                                </Button>
                            </Link>
                            <Link href="/technician/assign-ip">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Users className="w-4 h-4 mr-2" />
                                    Assign IP
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total IP Pools
                            </CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalPools}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total IPs
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalIPs}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Assigned IPs
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.assignedIPs}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Available IPs
                            </CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.availableIPs}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Assignments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent IP Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentAssignments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No recent IP assignments found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentAssignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {assignment.customerName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {assignment.ipAddress}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary">
                                                {assignment.ipAddress}
                                            </Badge>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(
                                                    assignment.assignedAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/technician/pools">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <Server className="h-8 w-8 text-blue-600 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            Manage IP Pools
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            View and manage your IP pools
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/technician/assign-ip">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <Users className="h-8 w-8 text-green-600 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            Assign IPs
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Assign IPs to customers
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/technician/pools/create">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <PlusCircle className="h-8 w-8 text-purple-600 mr-3" />
                                    <div>
                                        <h3 className="font-semibold">
                                            Create New Pool
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Set up new IP pools
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </main>
        </div>
    );
}
