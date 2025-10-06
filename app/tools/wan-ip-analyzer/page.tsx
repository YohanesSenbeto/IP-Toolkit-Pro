"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";

type AnalysisResult = {
    ipAddress: string;
    networkInfo?: {
        subnetMask?: string;
        cidr?: string | number;
        networkAddress?: string;
        broadcastAddress?: string;
        firstUsableIp?: string;
        lastUsableIp?: string;
        totalHosts?: number;
        usableHosts?: number;
    };
    interface?: {
        defaultGateway?: string;
        name?: string;
        subnetMask?: string;
    };
    region?: { name?: string };
    historyId?: string;
};

type CustomerLookupResult = {
    customerId?: string;
    name?: string;
    phone?: string;
};

const WanIpAnalyzerPage = () => {
    const { data: session, status } = useSession();
    const [searchType, setSearchType] = useState<
        "wanIp" | "accountNumber" | "accessNumber"
    >("wanIp");
    const [ipAddress, setIpAddress] = useState("");
    const [assignmentForm, setAssignmentForm] = useState({
        accountNumber: "",
        accessNumber: "",
    });
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [customerLookup, setCustomerLookup] =
        useState<CustomerLookupResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [latestHistoryId, setLatestHistoryId] = useState<string | null>(null);

    // Custom dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const options = [
        { value: "wanIp", label: "WAN IP" },
        { value: "accountNumber", label: "Account Number" },
        { value: "accessNumber", label: "Access Number" },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchTypeChange = (
        value: "wanIp" | "accountNumber" | "accessNumber"
    ) => {
        setSearchType(value);
        setError(null);
        setAnalysis(null);
        setCustomerLookup(null);
        setDrawerOpen(false);
        // Clear all input fields when changing search type
        setIpAddress("");
        setAssignmentForm({ accountNumber: "", accessNumber: "" });
        setIsDropdownOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        if (searchType === "wanIp") {
            setIpAddress(value);
        } else if (searchType === "accountNumber") {
            setAssignmentForm((prev) => ({ ...prev, accountNumber: value }));
        } else if (searchType === "accessNumber") {
            setAssignmentForm((prev) => ({ ...prev, accessNumber: value }));
        }
    };

    const getInputPlaceholder = () => {
        switch (searchType) {
            case "wanIp":
                return "Enter WAN IP";
            case "accountNumber":
                return "Enter Account Number";
            case "accessNumber":
                return "Enter Access Number";
            default:
                return "Enter WAN IP";
        }
    };

    const getInputValue = () => {
        switch (searchType) {
            case "wanIp":
                return ipAddress;
            case "accountNumber":
                return assignmentForm.accountNumber;
            case "accessNumber":
                return assignmentForm.accessNumber;
            default:
                return ipAddress;
        }
    };

    const getCurrentOptionLabel = () => {
        const option = options.find((opt) => opt.value === searchType);
        return option ? option.label : "WAN IP";
    };

    const handleClear = () => {
        setIpAddress("");
        setAssignmentForm({ accountNumber: "", accessNumber: "" });
        setAnalysis(null);
        setCustomerLookup(null);
        setError(null);
        setDrawerOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAnalysis(null);
        setCustomerLookup(null);
        setLoading(true);

        // Validate based on current search type
        if (searchType === "wanIp" && !ipAddress.trim()) {
            setError("WAN IP address is required.");
            setLoading(false);
            return;
        }
        if (
            searchType === "accountNumber" &&
            !assignmentForm.accountNumber.trim()
        ) {
            setError("Account Number is required.");
            setLoading(false);
            return;
        }
        if (
            searchType === "accessNumber" &&
            !assignmentForm.accessNumber.trim()
        ) {
            setError("Access Number is required.");
            setLoading(false);
            return;
        }

        try {
            let response;
            if (searchType === "wanIp") {
                response = await fetch(
                    `/api/wan-ip/analyze?ip=${encodeURIComponent(ipAddress)}`
                );
            } else {
                response = await fetch("/api/wan-ip/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        wanIp: ipAddress,
                        ...assignmentForm,
                    }),
                });
            }

            if (!response?.ok)
                throw new Error("Failed to fetch data. Please try again.");
            const data = await response.json();

            if (data.ipAddress) {
                setAnalysis(data);
                setLatestHistoryId(data.historyId || null);
            } else if (data.customerLookup) {
                setCustomerLookup(data.customerLookup);
            } else {
                setError("No data found for the provided input.");
            }
            setDrawerOpen(true);
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading")
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-lg font-semibold">
                Loading authentication...
            </div>
        );

    if (!session)
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <h1 className="text-center text-lg font-bold mb-6">
                    WAN IP Analyzer
                </h1>
                <p>You must be signed in to use this tool.</p>
                <Button onClick={() => signIn(undefined, { callbackUrl: "/" })}>
                    Sign In / Sign Up
                </Button>
            </div>
        );

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            {/* Analyzer Form */}
            <Card className="p-6 shadow-lg card border-border">
                <h1 className="text-center text-lg font-bold mb-6">
                    WAN IP Analyzer
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Custom Dropdown */}
                        <div
                            className="relative flex-shrink-0"
                            ref={dropdownRef}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setIsDropdownOpen(!isDropdownOpen)
                                }
                                className="w-full md:w-auto min-w-[140px] border border-border rounded px-3 py-2 bg-card text-foreground flex items-center justify-between focus:ring-2 focus:ring-ring focus:border-ring"
                            >
                                <span>{getCurrentOptionLabel()}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${
                                        isDropdownOpen ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border rounded shadow-lg bg-card">
                                    {options.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                handleSearchTypeChange(
                                                    option.value as any
                                                )
                                            }
                                            className={`w-full text-left px-3 py-2 hover:bg-secondary/20 transition-colors ${
                                                searchType === option.value
                                                    ? "bg-primary text-secondary"
                                                    : "text-foreground"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Input
                            placeholder={getInputPlaceholder()}
                            value={getInputValue()}
                            onChange={handleInputChange}
                            className="bg-card placeholder-muted-foreground text-black dark:text-white"
                        />
                    </div>

                    <div className="flex gap-2 justify-center py-4 flex-wrap">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium px-6 py-2 rounded-md"
                        >
                            {loading ? "Analyzing..." : "Analyze"}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleClear}
                            variant="outline"
                            className="border-border text-foreground hover:bg-secondary/20 px-6 py-2 rounded-md"
                        >
                            Clear
                        </Button>
                    </div>

                    {error && (
                        <p className="text-destructive text-sm text-center">
                            {error}
                        </p>
                    )}
                </form>
            </Card>

            {/* Drawer for results */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent
                    side="right"
                    showCloseIcon
                    onClose={() => setDrawerOpen(false)}
                    className="max-w-2xl mx-auto p-4 bg-background"
                >
                    {analysis && (
                        <div className="space-y-4">
                            {/* Interface Info */}
                            <Card className="p-4 shadow-lg card border-border">
                                <h2 className="font-bold mb-2">
                                    Important Info for Modem Configuration
                                </h2>
                                <div className="space-y-1">
                                    <div>
                                        <span className="font-semibold">
                                            WAN IP:
                                        </span>{" "}
                                        {analysis.ipAddress}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Subnet Mask:
                                        </span>{" "}
                                        {analysis.networkInfo?.subnetMask ||
                                            analysis.interface?.subnetMask}
                                    </div>
                                    <div>
                                        <span className="font-semibold">
                                            Default Gateway:
                                        </span>{" "}
                                        {analysis.interface?.defaultGateway}
                                    </div>
                                </div>
                            </Card>

                            {/* Network Info */}
                            {analysis.networkInfo && (
                                <Card className="p-4 shadow-lg card border-border">
                                    <h2 className="font-bold mb-2">
                                        Network Info
                                    </h2>
                                    <div className="space-y-1">
                                        <div>
                                            <span className="font-semibold">
                                                CIDR:
                                            </span>{" "}
                                            {analysis.networkInfo.cidr}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Network Address:
                                            </span>{" "}
                                            {
                                                analysis.networkInfo
                                                    .networkAddress
                                            }
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Broadcast Address:
                                            </span>{" "}
                                            {
                                                analysis.networkInfo
                                                    .broadcastAddress
                                            }
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                First Usable IP:
                                            </span>{" "}
                                            {analysis.networkInfo.firstUsableIp}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Last Usable IP:
                                            </span>{" "}
                                            {analysis.networkInfo.lastUsableIp}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Total Hosts:
                                            </span>{" "}
                                            {analysis.networkInfo.totalHosts}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Usable Hosts:
                                            </span>{" "}
                                            {analysis.networkInfo.usableHosts}
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Detail Button */}
                            <div className="flex justify-end">
                                {latestHistoryId ? (
                                    <a
                                        href={`/dashboard/history/detail?id=${latestHistoryId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium px-6 py-2 rounded-md">
                                            Detail
                                        </Button>
                                    </a>
                                ) : (
                                    <Button
                                        disabled
                                        className="bg-muted text-muted-foreground px-6 py-2 rounded-md cursor-not-allowed"
                                    >
                                        Detail
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Customer Lookup */}
                    {customerLookup && (
                        <Card className="p-4 shadow-lg card border-border mt-4">
                            <h2 className="font-bold mb-2">Customer Info</h2>
                            <div className="space-y-1">
                                <div>
                                    <span className="font-semibold">
                                        Customer ID:
                                    </span>{" "}
                                    {customerLookup.customerId}
                                </div>
                                <div>
                                    <span className="font-semibold">Name:</span>{" "}
                                    {customerLookup.name}
                                </div>
                                <div>
                                    <span className="font-semibold">
                                        Phone:
                                    </span>{" "}
                                    {customerLookup.phone}
                                </div>
                            </div>
                            {customerLookup.customerId && (
                                <div className="mt-4 flex justify-end">
                                    <a
                                        href={`/dashboard/history/detail?id=${customerLookup.customerId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium px-6 py-2 rounded-md">
                                            Detail
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </Card>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default WanIpAnalyzerPage;
