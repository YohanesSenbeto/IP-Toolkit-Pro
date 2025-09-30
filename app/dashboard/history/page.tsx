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
import { Calculator, Calendar, Search, Trash2 } from "lucide-react";

export default function HistoryPage() {
    const { data: session, status } = useSession();

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
        <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Calculation History
                </h1>
                <p className="text-gray-600 mt-2">
                    View and manage your saved IP subnet calculations
                </p>
            </div>

            <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search calculations..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <Button onClick={() => redirect("/tools/wan-ip-analyzer")}>
                    <Calculator className="mr-2 h-4 w-4" />
                    New Analysis
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Saved Calculations</CardTitle>
                    <CardDescription>
                        Your IP subnet calculation history will appear here
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-gray-500">
                        <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">
                            No calculations yet
                        </h3>
                        <p className="mb-6">
                            Start using the WAN IP analyzer to see your history
                            here
                        </p>
                        <Button
                            onClick={() => redirect("/tools/wan-ip-analyzer")}
                        >
                            Start Analyzing
                        </Button>
                    </div>

                    {/* Example calculation item (commented out for now) */}
                    {/* <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Office Network Setup</h4>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                  Oct 26, 2023
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">WAN IP:</span>
                <span className="ml-2 font-mono">192.168.1.0</span>
              </div>
              <div>
                <span className="text-gray-600">CIDR:</span>
                <span className="ml-2 font-mono">/24</span>
              </div>
              <div>
                <span className="text-gray-600">Subnet Mask:</span>
                <span className="ml-2 font-mono">255.255.255.0</span>
              </div>
              <div>
                <span className="text-gray-600">Usable Hosts:</span>
                <span className="ml-2 font-mono">254</span>
              </div>
            </div>
          </div> */}
                </CardContent>
            </Card>
        </div>
    );
}
