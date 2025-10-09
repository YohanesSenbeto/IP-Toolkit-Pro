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
    User,
    Globe,
    Play,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [wanIpHistory, setWanIpHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch("/api/wan-ip/history");
                if (response.ok) {
                    const data = await response.json();
                    setWanIpHistory(data.history || []);
                }
            } catch (error) {
                setWanIpHistory([]);
            } finally {
                setLoading(false);
            }
        };
        if (session) fetchHistory();
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
    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-4 md:py-10 bg-background text-foreground dark:text-white min-h-screen">
            <div className="mb-8 transition-colors duration-300">
  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: "rgb(var(--foreground-rgb))" }}>
    Dashboard
  </h1>
  <p
    className="mt-2 text-base sm:text-lg"
    style={{ color: "rgb(var(--muted-foreground-rgb))" }}
  >
    Welcome back, {session.user?.name || session.user?.email}!
  </p>
</div>



            {/* Recent WAN IP Analyzer History */}
           <Card
  className="mb-8 bg-card border border-border transition-colors duration-300"
  style={{ color: "rgb(var(--foreground-rgb))" }}
>
  <CardHeader>
    <CardTitle
      className="flex items-center gap-2 text-base md:text-lg font-semibold"
      style={{ color: "rgb(var(--foreground-rgb))" }}
    >
      <Globe
        className="h-5 w-5"
        style={{ color: "rgb(var(--primary-rgb))" }}
      />
      Recent WAN IP Analyzed
    </CardTitle>

    <CardDescription
      className="text-sm md:text-base mt-1"
      style={{ color: "rgb(var(--muted-foreground-rgb))" }}
    >
      Your most recent WAN IP analyzer searches
    </CardDescription>
  </CardHeader>
  <CardContent>
      {loading ? (
          <div className="text-center py-8 text-gray-500">
              Loading...
          </div>
      ) : wanIpHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No WAN IPs analyzed yet</p>
              <p className="text-xs mt-2">
                  Start by analyzing a WAN IP to see your history
                  here.
              </p>
              <Link href="/tools/wan-ip-analyzer">
                  <Button className="bg-primary mt-4">Analyze WAN IP</Button>
              </Link>
          </div>
      ) : (
          <div className="space-y-4">
              {wanIpHistory.slice(0, 5).map((entry) => (
                  <div
                      key={entry.id}
                      className="border rounded-lg p-3 sm:p-4 bg-blue-50/70 dark:bg-blue-950/30 flex flex-col gap-2"
                  >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
                          <h4 className="font-medium text-blue-900 dark:text-blue-200 text-base sm:text-lg break-all">
                              {entry.wanIp}
                              {entry.cidr ? `/${entry.cidr}` : ""}
                          </h4>
                          <span className="text-xs sm:text-sm text-black font-medium">
  {new Date(entry.createdAt).toLocaleString()}
</span>



                      </div>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
                          <div>
                              <span className="font-semibold text-blue-700 dark:text-blue-300">
                                  Subnet Mask:
                              </span>
                              <span className="ml-1 font-mono text-xs dark:text-white">
                                  {entry.subnetMask || "N/A"}
                              </span>
                          </div>
                          <div>
                              <span className="font-semibold text-blue-700 dark:text-blue-300">
                                  Default Gateway:
                              </span>
                              <span className="ml-1 font-mono text-xs dark:text-white">
                                  {entry.defaultGateway || "N/A"}
                              </span>
                          </div>
                          <div>
                              <span className="font-semibold text-blue-700 dark:text-blue-300">
                                  CIDR:
                              </span>
                              <span className="ml-1 font-mono text-xs dark:text-white">
                                  {entry.cidr
                                      ? `/${entry.cidr}`
                                      : "N/A"}
                              </span>
                          </div>
                          <div>
                              <span className="font-semibold text-blue-700 dark:text-blue-300">
                                  Hosts:
                              </span>
                              <span className="ml-1 font-mono text-xs dark:text-white">
                                  {entry.usableHosts?.toLocaleString() ||
                                      "N/A"}
                              </span>
                          </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                          <Link
                              href={`/dashboard/history/detail?wanIp=${entry.wanIp}`}
                          >
                              <Button
                                  size="sm"
                                  className="bg-primary w-full sm:w-auto"
                              >
                                  Details
                              </Button>
                          </Link>
                      </div>
                  </div>
              ))}
              {wanIpHistory.length > 5 && (
                  <Link href="/dashboard/history">
                      <Button
                          variant="outline"
                          className="bg-primary w-full mt-2"
                      >
                          View All History
                      </Button>
                  </Link>
              )}
          </div>
      )}
  </CardContent>
</Card>

            {/* Quick Actions */}
            <Card className="mt-8 bg-card text-card-foreground dark:text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg dark:text-white">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Quick Actions
                    </CardTitle>
                    <CardDescription className="dark:text-white">
                        Access your most used tools and features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link href="/tools/wan-ip-analyzer">
                        <Button
                            className="bg-primary w-full justify-start"
                            variant="default"
                        >
                            <Globe className="mr-2 h-4 w-4" />
                            WAN IP Analyzer
                        </Button>
                    </Link>
                    <Link href="/tools/modem-tutorials">
                        <Button
                            className="bg-primary w-full justify-start"
                            variant="default"
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Modem Tutorials
                        </Button>
                    </Link>
                    {session.user?.role === "ADMIN" && (
                        <Link href="/admin">
                            <Button
                                className="bg-primary w-full justify-start"
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
    );
}
