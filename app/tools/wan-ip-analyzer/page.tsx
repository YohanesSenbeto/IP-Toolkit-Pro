"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import Link from "next/link";

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
    // Inline detail view state
    const [detailEntry, setDetailEntry] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    // Inline detail expand/collapse
    const [detailExpanded, setDetailExpanded] = useState(true);

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
        setDetailEntry(null);
        setDetailError(null);
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

    const handleViewDetails = async () => {
        if (!latestHistoryId) return;
        setDetailLoading(true);
        setDetailError(null);
        const hadExisting = Boolean(detailEntry);
        try {
            const res = await fetch(
                `/api/wan-ip/history/detail?id=${encodeURIComponent(
                    latestHistoryId
                )}`
            );
            if (!res.ok) throw new Error("Failed to load detail");
            const data = await res.json();
            setDetailEntry(data.entry || data);
            if (!hadExisting) setDetailExpanded(true);
        } catch (e: any) {
            setDetailError(e.message || "Error loading detail");
            setDetailEntry(null);
        } finally {
            setDetailLoading(false);
        }
    };

    if (status === "loading")
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-lg font-semibold text-gray-900 dark:text-white">
                Loading authentication...
            </div>
        );

    if (!session)
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-900 dark:text-white">
                <h1 className="text-center text-lg font-bold mb-6 text-gray-900 dark:text-white">
                    WAN IP Analyzer
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                    You must be signed in to use this tool.
                </p>

                <Button
                    type="button"
                    className="rounded-l-md"
                    variant="default"
                    onClick={() => signIn()}
                >
                    Sign In
                </Button>
                <Link href="/auth/signup">
                    <Button
                        type="button"
                        className="-ml-px rounded-r-md"
                        variant="default"
                    >
                        Sign Up
                    </Button>
                </Link>
            </div>
        );

    return (
        <div className="max-w-2xl mx-auto p-10 my-20 px-4">
            {/* Analyzer Form */}
            <Card className="p-6 shadow-lg card border-border">
                <h1 className="text-center text-lg font-bold mb-6 text-gray-900 dark:text-white">
                    WAN IP Analyzer
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Unified control group */}
                    <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-col sm:flex-row gap-2 sm:gap-0">
                            {/* Dropdown trigger */}
                            <div
                                className="sm:relative sm:z-10 w-full sm:w-auto"
                                ref={dropdownRef}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsDropdownOpen(!isDropdownOpen)
                                    }
                                    className="sm:rounded-l-md sm:rounded-r-none rounded-md sm:border-r-0 border border-border bg-card text-foreground px-3 py-2 min-w-[150px] flex items-center justify-between text-sm focus-visible:outline-none focus:ring-2 focus:ring-ring transition-colors dark:bg-neutral-900 dark:hover:bg-neutral-800 hover:bg-accent/40"
                                >
                                    <span className="truncate text-left">
                                        {(() => {
                                            const option = options.find(
                                                (o) => o.value === searchType
                                            );
                                            return option
                                                ? option.label
                                                : "WAN IP";
                                        })()}
                                    </span>
                                    <svg
                                        className={`ml-2 w-4 h-4 shrink-0 transition-transform ${
                                            isDropdownOpen ? "rotate-180" : ""
                                        }`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="mt-1 sm:absolute sm:top-full sm:left-0 sm:right-0 z-50 rounded-md border border-border bg-card dark:bg-neutral-900 shadow-lg overflow-hidden w-full">
                                        {options.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    handleSearchTypeChange(
                                                        option.value as any
                                                    )
                                                }
                                                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                                    searchType === option.value
                                                        ? "bg-primary text-secondary dark:bg-blue-600 dark:text-white"
                                                        : "hover:bg-accent/40 text-foreground dark:hover:bg-neutral-800"
                                                }`}
                                            >
                                                <span>{option.label}</span>
                                                {searchType ===
                                                    option.value && (
                                                    <span className="ml-2 text-[10px] uppercase tracking-wide opacity-80">
                                                        Selected
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Input */}
                            <Input
                                placeholder={(() => {
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
                                })()}
                                value={(() => {
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
                                })()}
                                onChange={handleInputChange}
                                className="sm:rounded-none sm:border-l-0 sm:border-r-0 bg-card dark:bg-neutral-900 placeholder-muted-foreground text-black dark:text-white flex-1"
                            />
                            {/* Action buttons */}
                            <div className="flex items-stretch mt-2 sm:mt-0 gap-2 sm:gap-0 sm:ml-0">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="sm:rounded-none font-medium px-5 py-2 text-sm"
                                >
                                    {loading ? "Analyzing..." : "Analyze"}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleClear}
                                    className="sm:rounded-r-md sm:rounded-l-none font-medium px-5 py-2 text-sm"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                        {/* Removed separate Clear row; now grouped with Analyze */}
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
                    showCloseIcon={true}
                    onClose={() => setDrawerOpen(false)}
                    className="max-w-2xl mx-auto p-2 md:p-4 bg-background flex flex-col h-full text-[12px] md:text-[13px]"
                >
                    {analysis && (
                        <div className="space-y-4 flex-1 pb-8">
                            {/* Interface Info */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="p-2.5 md:p-3 shadow-sm md:shadow-md card border-border relative">
                                    <h2 className="font-semibold mb-2 text-gray-900 dark:text-white leading-tight text-[13px] md:text-sm">
                                        Important Info for Modem Configuration
                                    </h2>
                                    <div className="overflow-x-auto -mx-1 md:mx-0">
                                        <table className="w-full text-xs md:text-sm border responsive-table table-strong-lines">
                                            <thead className="bg-muted/60 hidden sm:table-header-group">
                                                <tr>
                                                    <th className="text-left font-semibold px-3 py-2 border w-40">
                                                        Field
                                                    </th>
                                                    <th className="text-left font-semibold px-3 py-2 border">
                                                        Value
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-muted/50">
                                                    <td
                                                        colSpan={2}
                                                        className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                                    >
                                                        Essentials
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold px-3 py-2 border w-40">
                                                        WAN IP
                                                    </td>
                                                    <td className="font-mono px-3 py-2 border break-all">
                                                        {analysis.ipAddress ||
                                                            "—"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold px-3 py-2 border">
                                                        Subnet Mask
                                                    </td>
                                                    <td className="font-mono px-3 py-2 border break-all">
                                                        {analysis.networkInfo
                                                            ?.subnetMask ||
                                                            analysis.interface
                                                                ?.subnetMask ||
                                                            "—"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold px-3 py-2 border">
                                                        Default Gateway
                                                    </td>
                                                    <td className="font-mono px-3 py-2 border break-all">
                                                        {analysis.interface
                                                            ?.defaultGateway ||
                                                            "—"}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>

                                {/* Network Info */}
                                {analysis.networkInfo && (
                                    <Card className="p-2.5 md:p-3 shadow-sm md:shadow-md card border-border">
                                        <h2 className="font-semibold mb-2 text-gray-900 dark:text-white leading-tight text-[13px] md:text-sm">
                                            Network Info
                                        </h2>
                                        <div className="overflow-x-auto -mx-1 md:mx-0">
                                            <table className="w-full text-xs md:text-sm border responsive-table table-strong-lines">
                                                <thead className="bg-muted/60 hidden sm:table-header-group">
                                                    <tr>
                                                        <th className="text-left font-semibold px-3 py-2 border w-40">
                                                            Field
                                                        </th>
                                                        <th className="text-left font-semibold px-3 py-2 border">
                                                            Value
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-muted/50">
                                                        <td
                                                            colSpan={2}
                                                            className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                                        >
                                                            Range & Capacity
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border w-40">
                                                            CIDR
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border">
                                                            {analysis
                                                                .networkInfo
                                                                .cidr
                                                                ? `/${analysis.networkInfo.cidr}`
                                                                : "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Network Address
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {analysis
                                                                .networkInfo
                                                                .networkAddress ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Broadcast Address
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {analysis
                                                                .networkInfo
                                                                .broadcastAddress ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            First Usable IP
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {analysis
                                                                .networkInfo
                                                                .firstUsableIp ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Last Usable IP
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {analysis
                                                                .networkInfo
                                                                .lastUsableIp ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Total Hosts
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {analysis.networkInfo.totalHosts?.toLocaleString?.() ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Usable Hosts
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {analysis.networkInfo.usableHosts?.toLocaleString?.() ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            {/* Detail Button + Inline Detail */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-end flex-wrap">
                                    {latestHistoryId ? (
                                        <>
                                            <div className="inline-flex items-stretch rounded border border-border/70 overflow-hidden shadow-sm dark:border-border/60">
                                                <Button
                                                    type="button"
                                                    onClick={handleViewDetails}
                                                    disabled={detailLoading}
                                                    className="relative rounded-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-none transition-colors font-medium px-4 py-1.5 h-8 text-[11px]"
                                                >
                                                    {detailLoading
                                                        ? "Loading..."
                                                        : detailEntry
                                                        ? "Refresh Detail"
                                                        : "Show Detail"}
                                                </Button>
                                                {detailEntry && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setDetailExpanded(
                                                                (p) => !p
                                                            )
                                                        }
                                                        aria-expanded={
                                                            detailExpanded
                                                        }
                                                        className="relative rounded-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-none transition-colors font-medium px-4 py-1.5 h-8 text-[11px]"
                                                    >
                                                        {detailExpanded
                                                            ? "Collapse"
                                                            : "Expand"}
                                                    </Button>
                                                )}
                                            </div>
                                            {/* Removed "Open Full Page" per user request */}
                                        </>
                                    ) : (
                                        <Button
                                            disabled
                                            className="bg-muted text-muted-foreground px-6 py-2 rounded-md cursor-not-allowed"
                                        >
                                            Detail
                                        </Button>
                                    )}
                                </div>
                                {detailError && (
                                    <p className="text-destructive text-sm text-right">
                                        {detailError}
                                    </p>
                                )}
                            </div>

                            {detailEntry && (
                                <Card className="p-2 md:p-2.5 shadow-sm md:shadow-md card border-border">
                                    <div className="flex items-center justify-between mb-1">
                                        <h2 className="font-semibold text-gray-900 dark:text-white m-0 leading-tight text-[12px] md:text-[13px]">
                                            Detailed Record
                                        </h2>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setDetailExpanded((p) => !p)
                                            }
                                            aria-expanded={detailExpanded}
                                            className="h-6 px-2 text-[11px] rounded border-border dark:border-border/70 dark:text-gray-200 dark:hover:text-white"
                                        >
                                            {detailExpanded
                                                ? "Collapse"
                                                : "Expand"}
                                        </Button>
                                    </div>
                                    {detailExpanded && (
                                        <div className="overflow-x-auto -mx-1 md:mx-0">
                                            <table className="w-full text-xs md:text-sm border responsive-table-lg table-strong-lines">
                                                <thead className="bg-muted/60 hidden sm:table-header-group">
                                                    <tr>
                                                        <th className="text-left font-semibold px-3 py-2 border w-40">
                                                            Field
                                                        </th>
                                                        <th className="text-left font-semibold px-3 py-2 border">
                                                            Value
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-muted/50">
                                                        <td
                                                            colSpan={2}
                                                            className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                                        >
                                                            Core
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            WAN IP
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.wanIp ||
                                                                detailEntry.ipAddress ||
                                                                analysis?.ipAddress ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Subnet Mask
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.subnetMask ||
                                                                detailEntry
                                                                    .networkInfo
                                                                    ?.subnetMask ||
                                                                analysis
                                                                    ?.networkInfo
                                                                    ?.subnetMask ||
                                                                analysis
                                                                    ?.interface
                                                                    ?.subnetMask ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Default Gateway
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.defaultGateway ||
                                                                detailEntry.gateway ||
                                                                analysis
                                                                    ?.interface
                                                                    ?.defaultGateway ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            CIDR
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.cidr
                                                                ? `/${detailEntry.cidr}`
                                                                : detailEntry
                                                                      .networkInfo
                                                                      ?.cidr
                                                                ? `/${detailEntry.networkInfo.cidr}`
                                                                : analysis
                                                                      ?.networkInfo
                                                                      ?.cidr
                                                                ? `/${analysis.networkInfo.cidr}`
                                                                : "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Analyzed At
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.createdAt
                                                                ? new Date(
                                                                      detailEntry.createdAt
                                                                  ).toLocaleString()
                                                                : "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Router
                                                            Recommendation
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.routerRecommendation ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-muted/50">
                                                        <td
                                                            colSpan={2}
                                                            className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                                        >
                                                            Network Range
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Network Address
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.networkAddress ||
                                                                detailEntry
                                                                    .network_info
                                                                    ?.networkAddress ||
                                                                detailEntry
                                                                    .networkInfo
                                                                    ?.networkAddress ||
                                                                analysis
                                                                    ?.networkInfo
                                                                    ?.networkAddress ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Broadcast Address
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.broadcastAddress ||
                                                                detailEntry
                                                                    .networkInfo
                                                                    ?.broadcastAddress ||
                                                                analysis
                                                                    ?.networkInfo
                                                                    ?.broadcastAddress ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            First IP
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.firstIp ||
                                                                detailEntry.firstUsableIp ||
                                                                detailEntry
                                                                    .networkInfo
                                                                    ?.firstUsableIp ||
                                                                analysis
                                                                    ?.networkInfo
                                                                    ?.firstUsableIp ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Last IP
                                                        </td>
                                                        <td className="font-mono px-3 py-2 border break-all">
                                                            {detailEntry.lastIp ||
                                                                detailEntry.lastUsableIp ||
                                                                detailEntry
                                                                    .networkInfo
                                                                    ?.lastUsableIp ||
                                                                analysis
                                                                    ?.networkInfo
                                                                    ?.lastUsableIp ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Total Hosts
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {(
                                                                detailEntry.totalHosts ??
                                                                detailEntry
                                                                    .networkInfo
                                                                    ?.totalHosts ??
                                                                analysis
                                                                    ?.networkInfo
                                                                    ?.totalHosts
                                                            )?.toLocaleString?.() ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Usable Hosts
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {(
                                                                detailEntry.usableHosts ??
                                                                detailEntry
                                                                    .networkInfo
                                                                    ?.usableHosts ??
                                                                analysis
                                                                    ?.networkInfo
                                                                    ?.usableHosts
                                                            )?.toLocaleString?.() ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-muted/50">
                                                        <td
                                                            colSpan={2}
                                                            className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                                        >
                                                            Region & Interface
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Region
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.regionName ||
                                                                detailEntry.region ||
                                                                detailEntry.region_name ||
                                                                analysis?.region
                                                                    ?.name ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Interface
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.interfaceName ||
                                                                detailEntry.interface ||
                                                                detailEntry.interfaceType ||
                                                                analysis
                                                                    ?.interface
                                                                    ?.name ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-muted/50">
                                                        <td
                                                            colSpan={2}
                                                            className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                                        >
                                                            Assignment
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Status
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.assignmentStatus ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Customer
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.customerName ||
                                                                detailEntry.customer ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Account #
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.accountNumber ||
                                                                detailEntry.account ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold px-3 py-2 border">
                                                            Location
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {detailEntry.location ||
                                                                "—"}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Customer Lookup */}
                    {customerLookup && (
                        <Card className="p-4 shadow-lg card border-border mt-4">
                            <h2 className="font-bold mb-2 text-gray-900 dark:text-white">
                                Customer Info
                            </h2>
                            <div className="overflow-x-auto -mx-1 md:mx-0">
                                <table className="w-full text-xs md:text-sm border responsive-table table-strong-lines">
                                    <thead className="bg-muted/60 hidden sm:table-header-group">
                                        <tr>
                                            <th className="text-left font-semibold px-3 py-2 border w-40">
                                                Field
                                            </th>
                                            <th className="text-left font-semibold px-3 py-2 border">
                                                Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-muted/50">
                                            <td
                                                colSpan={2}
                                                className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                            >
                                                Customer
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold px-3 py-2 border">
                                                Customer ID
                                            </td>
                                            <td className="px-3 py-2 border break-all">
                                                {customerLookup.customerId ||
                                                    "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold px-3 py-2 border">
                                                Name
                                            </td>
                                            <td className="px-3 py-2 border break-all">
                                                {customerLookup.name || "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold px-3 py-2 border">
                                                Phone
                                            </td>
                                            <td className="px-3 py-2 border break-all">
                                                {customerLookup.phone || "—"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {customerLookup.customerId && (
                                <div className="mt-3 flex justify-end">
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
