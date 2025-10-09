"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

// You may need to define or fetch 'latest', 'wanIp', etc. This is a placeholder.
export default function ProfilePage() {
    // Placeholder state/data for demonstration
    const [latestList, setLatestList] = useState<any[]>([]); // Replace 'any' with your actual type
    const wanIp = "0.0.0.0"; // Replace with actual logic

    // Example useEffect to fetch data (replace with your logic)
    useEffect(() => {
        // Fetch or set latestList here
    }, []);

    return (
        <div>
            {latestList.length > 0 && (
                <div>
                    {latestList.map((latest, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                {/* Add header content here if needed */}
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">
                                            CIDR:
                                        </span>
                                        <span className="ml-2 font-mono">
                                            /{latest.cidr}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Subnet Mask:
                                        </span>
                                        <span className="ml-2 font-mono">
                                            {latest.result?.subnetMask ?? "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Default Gateway:
                                        </span>
                                        <span className="ml-2 font-mono">
                                            {latest.result?.defaultGateway ??
                                                "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Usable Hosts:
                                        </span>
                                        <span className="ml-2 font-mono">
                                            {latest.result?.usableHosts?.toLocaleString?.() ??
                                                "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Network:
                                        </span>
                                        <span className="ml-2 font-mono">
                                            {latest.result?.networkAddress ??
                                                "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">
                                            Broadcast:
                                        </span>
                                        <span className="ml-2 font-mono">
                                            {latest.result?.broadcastAddress ??
                                                "-"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            redirect(
                                                `/tools/wan-ip-analyzer?ip=${encodeURIComponent(
                                                    wanIp
                                                )}`
                                            )
                                        }
                                    >
                                        Open in Analyzer{" "}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            redirect("/dashboard/history")
                                        }
                                    >
                                        View History
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
