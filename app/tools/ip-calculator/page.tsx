"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Calculator,
    Save,
    Copy,
    AlertCircle,
    History,
    Search,
    Router,
} from "lucide-react";
import { calculateIP, isValidIPAddress, isValidCIDR } from "@/lib/utils";
import Link from "next/link";

export default function IPCalculatorPage() {
    const { data: session, status } = useSession();
    const [wanIp, setWanIp] = useState("");
    const [cidr, setCidr] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [wanIpSuggestions, setWanIpSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [routerModel, setRouterModel] = useState("");
    const [routerSuggestions, setRouterSuggestions] = useState([]);

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

    useEffect(() => {
        if (wanIp.trim().length > 0) {
            const fetchSuggestions = async () => {
                try {
                    const response = await fetch(
                        `/api/wan-ip/lookup?q=${encodeURIComponent(wanIp)}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setWanIpSuggestions(data);
                        setShowSuggestions(true);
                    } else {
                        setWanIpSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch (error) {
                    console.error("Error fetching WAN IP suggestions:", error);
                    setWanIpSuggestions([]);
                    setShowSuggestions(false);
                }
            };
            fetchSuggestions();
        } else {
            setWanIpSuggestions([]);
            setShowSuggestions(false);
        }
    }, [wanIp]);

    const handleWanIpSelect = (ip: string) => {
        setWanIp(ip);
        setShowSuggestions(false);
    };

    const handleCalculate = () => {
        setError("");
        setIsLoading(true);

        try {
            if (!wanIp.trim() || !cidr.trim()) {
                throw new Error(
                    "Please enter both IP address and CIDR notation"
                );
            }

            if (!isValidIPAddress(wanIp)) {
                throw new Error("Invalid IP address format");
            }

            const cidrNum = parseInt(cidr);
            if (!isValidCIDR(cidrNum)) {
                throw new Error("CIDR must be between 0 and 32");
            }

            const calculation = calculateIP(wanIp, cidrNum);
            setResult(calculation);
        } catch (err: any) {
            setError(err.message);
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;

        try {
            const response = await fetch("/api/calculations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: `Calculation for ${wanIp}/${cidr}`,
                    wanIp,
                    cidr,
                    result,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Calculation saved successfully.");
            } else {
                alert("Failed to save calculation.");
            }
        } catch (error) {
            console.error("Error saving calculation:", error);
            alert("Error saving calculation.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">IP Calculator</h1>

            <div className="mb-4 relative">
                <Label htmlFor="wanIp">WAN IP Address</Label>
                <Input
                    id="wanIp"
                    type="text"
                    value={wanIp}
                    onChange={(e) => setWanIp(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                    }
                    autoComplete="off"
                />
                {showSuggestions && wanIpSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-md w-full max-h-48 overflow-auto">
                        {wanIpSuggestions.map((item: any) => (
                            <li
                                key={item.id}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() =>
                                    handleWanIpSelect(item.ipAddress)
                                }
                            >
                                {item.ipAddress} - {item.description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mb-4">
                <Label htmlFor="cidr">CIDR</Label>
                <Input
                    id="cidr"
                    type="text"
                    value={cidr}
                    onChange={(e) => setCidr(e.target.value)}
                />
            </div>

            <Button onClick={handleCalculate} disabled={isLoading}>
                Calculate
            </Button>

            {error && (
                <div className="mt-4 text-red-600 flex items-center gap-2">
                    <AlertCircle /> {error}
                </div>
            )}

            {result && (
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Calculation Result</CardTitle>
                            <CardDescription>
                                Details of the IP calculation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Subnet Mask: {result.subnetMask}</p>
                            <p>
                                Usable Hosts:{" "}
                                {result.usableHosts.toLocaleString()}
                            </p>
                            {/* Add more result details as needed */}
                        </CardContent>
                    </Card>
                    <Button className="mt-4" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Calculation
                    </Button>
                </div>
            )}
        </div>
    );
}
