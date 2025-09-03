"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Calculator, User, History } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [calculations, setCalculations] = useState<any[]>([]);
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [savedCalculations, setSavedCalculations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const response = await fetch('/api/calculations');
        if (response.ok) {
          const data = await response.json();
          setCalculations(data.calculations || []);
          setTotalCalculations(data.calculations?.length || 0);
          setSavedCalculations(data.calculations?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching calculations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchCalculations();
    }
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user?.name || session.user?.email}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calculations</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? '...' : totalCalculations}</div>
            <p className="text-xs text-blue-600">IP calculations performed</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Calculations</CardTitle>
            <History className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : savedCalculations}</div>
            <p className="text-xs text-green-600">Calculations saved</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Today</div>
            <p className="text-xs text-purple-600">Recently joined</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            <User className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {session.user?.role === "ADMIN" ? "Admin" : "User"}
            </div>
            <p className="text-xs text-orange-600">Role permissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Calculations</CardTitle>
            <CardDescription>
              Your most recent IP subnet calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No calculations yet</p>
                <Button className="mt-4" onClick={() => redirect("/tools/wan-ip-analyzer")}>
                  Start Analyzing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {calculations.slice(0, 5).map((calculation) => (
                  <div key={calculation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{calculation.title}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(calculation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">WAN IP:</span>
                        <span className="ml-1 font-mono text-xs">{calculation.wanIp}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CIDR:</span>
                        <span className="ml-1 font-mono text-xs">/{calculation.cidr}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Subnet:</span>
                        <span className="ml-1 font-mono text-xs">
                          {calculation.result?.subnetMask}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hosts:</span>
                        <span className="ml-1 font-mono text-xs">
                          {calculation.result?.usableHosts?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {calculations.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => redirect("/dashboard/history")}
                  >
                    View All Calculations
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => redirect("/tools/wan-ip-analyzer")}
            >
              <Calculator className="mr-2 h-4 w-4" />
              WAN IP Analyzer
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => redirect("/tools/ip-calculator")}
            >
              <Calculator className="mr-2 h-4 w-4" />
              IP Subnet Calculator
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => redirect("/dashboard/history")}
            >
              <History className="mr-2 h-4 w-4" />
              Calculation History
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => redirect("/knowledge-base")}
            >
              <History className="mr-2 h-4 w-4" />
              Knowledge Base
            </Button>
            
            {session.user?.role === "ADMIN" && (
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => redirect("/admin/dashboard")}
              >
                <User className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}