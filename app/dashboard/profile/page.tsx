"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Network, CalendarDays, ArrowRight, Calculator } from "lucide-react";

type Calculation = {
  id: string;
  title: string | null;
  wanIp: string;
  cidr: number;
  result: {
    subnetMask?: string;
    usableHosts?: number;
    networkAddress?: string;
    broadcastAddress?: string;
    defaultGateway?: string;
  } | null;
  createdAt: string;
};

export default function ProfileWanIpPage() {
  const { data: session, status } = useSession();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
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
        const response = await fetch("/api/calculations");
        if (response.ok) {
          const data = await response.json();
          setCalculations(data.calculations || []);
        }
      } catch (err) {
        // no-op for now
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalculations();
  }, []);

  const groupedByWanIp = useMemo(() => {
    const map = new Map<string, Calculation[]>();
    for (const calc of calculations) {
      const list = map.get(calc.wanIp) || [];
      list.push(calc);
      map.set(calc.wanIp, list);
    }
    // For each IP, sort by createdAt desc
    const entries = Array.from(map.entries()).map(([wanIp, items]) => {
      const sorted = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { wanIp, latest: sorted[0], count: items.length };
    });
    // Sort groups by most recent first
    return entries.sort((a, b) => new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime());
  }, [calculations]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My WAN IPs</h1>
        <p className="text-gray-600 mt-2">WAN IP information saved from your analyses</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">Loading your WAN IPs...</div>
      ) : groupedByWanIp.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No WAN IP data yet</CardTitle>
            <CardDescription>Analyze a WAN IP to see it here</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => redirect("/tools/wan-ip-analyzer")}>
              <Calculator className="mr-2 h-4 w-4" /> Start with WAN IP Analyzer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupedByWanIp.map(({ wanIp, latest, count }) => (
            <Card key={wanIp} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" /> {wanIp}
                    </CardTitle>
                    <CardDescription>
                      Last updated {new Date(latest.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-gray-500">{count} {count === 1 ? "entry" : "entries"}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">CIDR:</span>
                    <span className="ml-2 font-mono">/{latest.cidr}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Subnet Mask:</span>
                    <span className="ml-2 font-mono">{latest.result?.subnetMask ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Default Gateway:</span>
                    <span className="ml-2 font-mono">{latest.result?.defaultGateway ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Usable Hosts:</span>
                    <span className="ml-2 font-mono">{latest.result?.usableHosts?.toLocaleString?.() ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Network:</span>
                    <span className="ml-2 font-mono">{latest.result?.networkAddress ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Broadcast:</span>
                    <span className="ml-2 font-mono">{latest.result?.broadcastAddress ?? "-"}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => redirect(`/tools/wan-ip-analyzer?ip=${encodeURIComponent(wanIp)}`)}>
                    Open in Analyzer <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => redirect("/dashboard/history")}>View History</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


