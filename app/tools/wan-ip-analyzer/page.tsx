"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { DialogTitle } from "@/components/ui/dialog";
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
    region?: {
        name?: string;
        defaultGateway?: string;
    };
    [key: string]: any;
};

type CustomerLookupResult = {
    customerId?: string;
    name?: string;
    phone?: string;
    [key: string]: any;
};

const WanIpAnalyzerPage = () => {
    // Store the latest history entry id for the Detail button
    // Track the latest WAN IP analyzer history ID for the logged-in user
    const [latestHistoryId, setLatestHistoryId] = useState<string | null>(null);
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

    // When searchType changes, clear other fields
    const handleSearchTypeChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = e.target.value as
            | "wanIp"
            | "accountNumber"
            | "accessNumber";
        setSearchType(value);
        setError(null);
        setAnalysis(null);
        setCustomerLookup(null);
        setDrawerOpen(false);
        if (value === "wanIp") {
            setIpAddress("");
        } else if (value === "accountNumber") {
            setAssignmentForm({ accountNumber: "", accessNumber: "" });
        } else if (value === "accessNumber") {
            setAssignmentForm({ accountNumber: "", accessNumber: "" });
        }
    };
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-lg font-semibold">
                Loading authentication...
            </div>
        );
    }
    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-2xl font-bold mb-4 text-yellow-500">
                    WAN IP Analyzer
                </div>
                <div className="mb-4 text-lg text-gray-700 dark:text-gray-200">
                    You must be signed in to use this tool.
                </div>
                <button
                    onClick={() => signIn(undefined, { callbackUrl: "/" })}
                    className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                >
                    Sign In / Sign Up
                </button>
            </div>
        );
    }

    /**
     * handleSubmit - Handles WAN IP Analyzer form submission.
     *
     * Backend GET /api/wan-ip/analyze?ip=... returns:
     *   {
     *     ipAddress: string,
     *     networkInfo: { ... },
     *     interface: { ... },
     *     region: { ... },
     *     recommendations: { ... },
     *     status: { ... },
     *     ...
     *   }
     *
     * Backend POST /api/wan-ip/analyze expects:
     *   { wanIp: string, accountNumber: string, ... }
     *   and returns assignment info or error.
     *
     * Frontend expects to use the response object directly for WAN IP analysis.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAnalysis(null);
        setCustomerLookup(null);
        setLoading(true);

        // Validation
        if (searchType === "wanIp") {
            // Simple IPv4 validation
            const ipRegex =
                /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
            if (!ipAddress.trim()) {
                setError("WAN IP address is required.");
                setLoading(false);
                return;
            }
            if (!ipRegex.test(ipAddress.trim())) {
                setError("Invalid WAN IP address format.");
                setLoading(false);
                return;
            }
        } else if (searchType === "accountNumber") {
            if (!assignmentForm.accountNumber.trim()) {
                setError("Account Number is required.");
                setLoading(false);
                return;
            }
        } else if (searchType === "accessNumber") {
            if (!assignmentForm.accessNumber.trim()) {
                setError("Access Number is required.");
                setLoading(false);
                return;
            }
        }

        try {
            let response;
            if (searchType === "wanIp") {
                // Use GET for WAN IP analysis
                response = await fetch(
                    `/api/wan-ip/analyze?ip=${encodeURIComponent(ipAddress)}`
                );
            } else if (searchType === "accountNumber") {
                // Use POST for assignment (must include wanIp and accountNumber)
                response = await fetch("/api/wan-ip/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        wanIp: ipAddress,
                        accountNumber: assignmentForm.accountNumber,
                    }),
                });
            } else if (searchType === "accessNumber") {
                // If you have a separate endpoint for accessNumber, update here. Otherwise, fallback to GET or POST as needed.
                response = await fetch(
                    `/api/wan-ip/analyze?ip=${encodeURIComponent(
                        assignmentForm.accessNumber
                    )}`
                );
            }

            if (!response || !response.ok) {
                throw new Error("Failed to fetch data. Please try again.");
            }
            const data = await response.json();

            // Use the response object directly for WAN IP analysis
            if (searchType === "wanIp" && data && data.ipAddress) {
                setAnalysis(data);
                // Always use the returned historyId for the Detail button
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

    // Clear form handler
    const handleClear = () => {
        setIpAddress("");
        setAssignmentForm({ accountNumber: "", accessNumber: "" });
        setAnalysis(null);
        setCustomerLookup(null);
        setError(null);
        setDrawerOpen(false);
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="mt-10 px-4 py-2">
                {/* Main card for WAN IP Analyzer form. Theme-aware: white bg/black text in light, black bg/yellow text in dark. */}
                <Card className="p-8 shadow-lg bg-white text-black border border-yellow-400 ">
                    {/*
                        WAN IP Analyzer Title:
                        - Light mode: white background, black text for maximum contrast.
                        - Dark mode: black background, yellow-400 text for maximum contrast.
                        - No border radius, full width, bold, and centered.
                    */}
                    <h1 className="text-md font-bold mb-6 w-full text-center px-0">
                        <span className="block w-full py-3 px-2 bg-white text-black dark:bg-black dark:text-yellow-400 font-bold shadow border-b-0 dark:border-b dark:border-yellow-400">
                            WAN IP Analyzer
                        </span>
                    </h1>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col md:flex-row gap-4">
                            <select
                                className="border border-gray-400 rounded px-2 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={searchType}
                                onChange={handleSearchTypeChange}
                            >
                                <option
                                    className="text-black dark:text-white"
                                    value="wanIp"
                                >
                                    WAN IP
                                </option>
                                <option
                                    className="text-black dark:text-white"
                                    value="accountNumber"
                                >
                                    Account Number
                                </option>
                                <option
                                    className="text-black dark:text-white"
                                    value="accessNumber"
                                >
                                    Access Number
                                </option>
                            </select>
                            {searchType === "wanIp" && (
                                <Input
                                    placeholder="Enter WAN IP address"
                                    value={ipAddress}
                                    onChange={(e) =>
                                        setIpAddress(e.target.value)
                                    }
                                    className="flex-1 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            )}
                            {searchType === "accountNumber" && (
                                <Input
                                    placeholder="Enter Account Number"
                                    value={assignmentForm.accountNumber}
                                    onChange={(e) =>
                                        setAssignmentForm({
                                            accountNumber: e.target.value,
                                            accessNumber: "",
                                        })
                                    }
                                    className="flex-1 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            )}
                            {searchType === "accessNumber" && (
                                <Input
                                    placeholder="Enter Access Number"
                                    value={assignmentForm.accessNumber}
                                    onChange={(e) =>
                                        setAssignmentForm({
                                            accountNumber: "",
                                            accessNumber: e.target.value,
                                        })
                                    }
                                    className="flex-1 border border-gray-400 bg-gray-200 dark:bg-gray-700 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            )}
                        </div>
                        <div className="flex gap-2 justify-center mb-4 py-6 w-full">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gray-700 hover:bg-gray-800 text-white"
                            >
                                {loading ? "Analyzing..." : "Analyze"}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleClear}
                                className="bg-gray-700 hover:bg-gray-800 text-white"
                            >
                                Clear
                            </Button>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                    </form>
                </Card>
            </div>
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent
                    className="bg-black border-none max-w-2xl mx-auto"
                    showCloseIcon={false}
                >
                    <DialogTitle asChild>
                        <div className="flex justify-between  mb-4">
                            <span className="text-lg font-bold ml-6 px-2 py-2 text-yellow-400">
                                Important Information for You
                            </span>
                            <button
                                type="button"
                                className="font-bold px-2 py-1 rounded text-xl"
                                aria-label="Close"
                                onClick={() => setDrawerOpen(false)}
                                style={{ color: "#facc15" }}
                            >
                                &#10005;
                            </button>
                        </div>
                    </DialogTitle>
                    <Card className="bg-zinc-900 border border-yellow-400 shadow-lg p-6 w-full">
                        {analysis && (
                            <div className="space-y-2 text-white">
                                {/* Top: WAN IP, Subnet Mask, Default Gateway */}
                                <div className="mb-4 flex flex-col gap-1">
                                    <div>
                                        <span className="font-semibold text-yellow-400">
                                            WAN IP:
                                        </span>{" "}
                                        {analysis.ipAddress}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-yellow-400">
                                            Subnet Mask:
                                        </span>{" "}
                                        {analysis.networkInfo?.subnetMask ||
                                            analysis.interface?.subnetMask}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-yellow-400">
                                            Default Gateway:
                                        </span>{" "}
                                        {analysis.interface?.defaultGateway}
                                    </div>
                                </div>
                                {/* Other details */}
                                {analysis.networkInfo && (
                                    <>
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                CIDR:
                                            </span>{" "}
                                            {analysis.networkInfo.cidr}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                Network Address:
                                            </span>{" "}
                                            {
                                                analysis.networkInfo
                                                    .networkAddress
                                            }
                                        </div>
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                Broadcast Address:
                                            </span>{" "}
                                            {
                                                analysis.networkInfo
                                                    .broadcastAddress
                                            }
                                        </div>
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                First Usable IP:
                                            </span>{" "}
                                            {analysis.networkInfo.firstUsableIp}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                Last Usable IP:
                                            </span>{" "}
                                            {analysis.networkInfo.lastUsableIp}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                Total Hosts:
                                            </span>{" "}
                                            {analysis.networkInfo.totalHosts}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                Usable Hosts:
                                            </span>{" "}
                                            {analysis.networkInfo.usableHosts}
                                        </div>
                                    </>
                                )}
                                {analysis.interface &&
                                    analysis.interface.name && (
                                        <div>
                                            <span className="font-semibold text-yellow-400">
                                                Interface Name:
                                            </span>{" "}
                                            {analysis.interface.name}
                                        </div>
                                    )}
                                {analysis.region && (
                                    <div>
                                        <span className="font-semibold text-yellow-400">
                                            Region:
                                        </span>{" "}
                                        {analysis.region.name}
                                    </div>
                                )}
                                {/* Always show Detail Button for WAN IP */}
                                <div className="mt-6 flex justify-end">
                                    {latestHistoryId ? (
                                        <a
                                            href={`/dashboard/history/detail?id=${encodeURIComponent(
                                                latestHistoryId
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl shadow transition-all duration-200">
                                                Detail
                                            </Button>
                                        </a>
                                    ) : (
                                        <Button
                                            className="bg-gray-400 text-white font-bold px-6 py-2 rounded-xl shadow transition-all duration-200 cursor-not-allowed"
                                            disabled
                                            title="No detail available yet"
                                        >
                                            Detail
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        {customerLookup && (
                            <div>
                                <div className="mb-2 text-white">
                                    <span className="font-semibold text-yellow-400">
                                        Customer ID:
                                    </span>{" "}
                                    {customerLookup.customerId}
                                </div>
                                <div className="mb-2 text-white">
                                    <span className="font-semibold text-yellow-400">
                                        Name:
                                    </span>{" "}
                                    {customerLookup.name}
                                </div>
                                <div className="mb-2 text-white">
                                    <span className="font-semibold text-yellow-400">
                                        Phone:
                                    </span>{" "}
                                    {customerLookup.phone}
                                </div>
                                {/* Detail Button for Customer Lookup */}
                                {customerLookup.customerId && (
                                    <div className="mt-6 flex justify-end">
                                        <a
                                            href={`/dashboard/history/detail?id=${encodeURIComponent(
                                                customerLookup.customerId
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl shadow transition-all duration-200">
                                                Detail
                                            </Button>
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default WanIpAnalyzerPage;
