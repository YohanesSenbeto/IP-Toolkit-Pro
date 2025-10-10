"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/lib/theme-provider";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
    const { resolvedTheme } = useTheme();
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
    const [error, setError] = useState<{
        type?: string;
        message: string;
    } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerButtonRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const options = [
        { value: "wanIp", label: "WAN IP" },
        { value: "accountNumber", label: "Account Number" },
        { value: "accessNumber", label: "Access Number" },
    ];

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

    useEffect(() => {
        if (!isDropdownOpen) return;
        const listButtons = optionRefs.current.filter(Boolean);
        if (listButtons[activeIndex]) {
            listButtons[activeIndex]?.focus();
        }
    }, [isDropdownOpen, activeIndex]);

    const handleSearchTypeChange = (
        value: "wanIp" | "accountNumber" | "accessNumber",
        focusTrigger: boolean = true
    ) => {
        setSearchType(value);
        setError(null);
        setAnalysis(null);
        setCustomerLookup(null);
        setIpAddress("");
        setAssignmentForm({ accountNumber: "", accessNumber: "" });
        setIsDropdownOpen(false);
        if (focusTrigger && triggerButtonRef.current) {
            triggerButtonRef.current.focus();
        }
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

    const handleClear = () => {
        setIpAddress("");
        setAssignmentForm({ accountNumber: "", accessNumber: "" });
        setAnalysis(null);
        setCustomerLookup(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAnalysis(null);
        setCustomerLookup(null);

        // Validate WAN IP format if searching by WAN IP
        if (searchType === "wanIp") {
            const ip = ipAddress.trim();
            // Simple IPv4 regex
            const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (!ip) {
                setError({ message: "Please enter a WAN IP address." });
                return;
            }
            if (!ipv4Regex.test(ip)) {
                setError({
                    message:
                        "Please enter a valid IPv4 address (e.g. 10.239.139.51).",
                });
                return;
            }
        }

        if (searchType === "accessNumber") {
            const accessNumber = assignmentForm.accessNumber.trim();
            if (!accessNumber) {
                setError({ message: "Please enter an access number." });
                return;
            }
            if (accessNumber.length !== 11) {
                setError({
                    message: "Access number must be exactly 11 digits.",
                });
                return;
            }
        }

        //here also add for account number
        if (searchType === "accountNumber") {
            const accountNumber = assignmentForm.accountNumber.trim();
            if (!accountNumber) {
                setError({ message: "Please enter an account number." });
                return;
            }
            if (accountNumber.length !== 9) {
                setError({
                    message: "Account number must be exactly 9 digits.",
                });
                return;
            }
        }

        setLoading(true);
        let payload: any = {
            wanIp: "",
            accountNumber: "",
            accessNumber: "",
            customerName: "",
            location: "",
        };

        if (searchType === "wanIp") {
            payload.wanIp = ipAddress;
            payload.accountNumber = "000000000";
            payload.accessNumber = "00000000000";
        } else if (searchType === "accountNumber") {
            payload.accountNumber = assignmentForm.accountNumber;
            payload.wanIp = "0.0.0.0";
            payload.accessNumber = "00000000000";
        } else if (searchType === "accessNumber") {
            payload.accessNumber = assignmentForm.accessNumber;
            payload.accountNumber = "000000000";
            payload.wanIp = "0.0.0.0";
        }

        try {
            let response, data;
            if (searchType === "wanIp" && ipAddress.trim()) {
                response = await fetch(
                    `/api/wan-ip/analyze?ip=${encodeURIComponent(ipAddress)}`,
                    {
                        method: "GET",
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data. Please try again.");
                }
                data = await response.json();
                setAnalysis(data);
                // Open detail page in new tab immediately after analysis
                window.open(
                    `/dashboard/history/detail?wanIp=${encodeURIComponent(
                        ipAddress
                    )}`,
                    "_blank"
                );
            } else {
                // For admin assignment or other search types, keep POST
                response = await fetch("/api/wan-ip/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch data. Please try again.");
                }
                data = await response.json();
                if (data.customerLookup) {
                    setCustomerLookup(data.customerLookup);
                } else {
                    setError({
                        type: "data",
                        message: "No data found for the provided input.",
                    });
                }
            }
        } catch (err: any) {
            setError({
                type: err.type || "unknown",
                message:
                    err.message || "An error occurred while fetching data.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading")
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-lg font-semibold text-foreground">
                Loading authentication...
            </div>
        );

    if (!session)
        return (
            <div
                className={`min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4 text-center ${
                    resolvedTheme === "dark"
                        ? "bg-black text-white"
                        : "bg-background text-foreground"
                }`}
            >
                <h1
                    className={`text-lg sm:text-xl font-bold ${
                        resolvedTheme === "dark"
                            ? "text-white"
                            : "text-foreground"
                    }`}
                >
                    WAN IP Analyzer
                </h1>
                <p
                    className={`max-w-md ${
                        resolvedTheme === "dark"
                            ? "text-gray-300"
                            : "text-muted-foreground"
                    }`}
                >
                    You must be signed in to use this tool. Please sign in or
                    create an account to continue.
                </p>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    <Button
                        type="button"
                        className="rounded-l-md bg-primary text-primary-foreground hover:bg-primary/80"
                        variant="default"
                        onClick={() => signIn()}
                    >
                        Sign In
                    </Button>
                    <Link href="/auth/signup" passHref>
                        <Button
                            type="button"
                            className="-ml-px rounded-r-md bg-primary text-primary-foreground hover:bg-primary/80"
                            variant="default"
                        >
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen w-full bg-background text-foreground ">
            <div className="max-w-2xl mx-auto p-10 px-4 bg-background text-foreground">
                <Card className="p-6 my-8 shadow-lg border-border bg-background text-foreground">
                    <h1 className="text-center text-lg font-bold mb-6 text-foreground">
                        WAN IP Analyzer
                    </h1>

                    {/* ✅ Updated Form */}
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                            {/* Dropdown */}
                            <div
                                className="relative w-full sm:w-auto"
                                ref={dropdownRef}
                            >
                                <button
                                    ref={triggerButtonRef}
                                    type="button"
                                    aria-haspopup="listbox"
                                    aria-expanded={isDropdownOpen}
                                    className="border border-border rounded-md px-4 py-2 bg-card text-foreground font-medium w-full sm:w-auto text-sm"
                                    onClick={() =>
                                        setIsDropdownOpen((open) => !open)
                                    }
                                >
                                    {
                                        options.find(
                                            (opt) => opt.value === searchType
                                        )?.label
                                    }
                                    <span className="ml-2">▼</span>
                                </button>

                                {isDropdownOpen && (
                                    <div
                                        role="listbox"
                                        tabIndex={-1}
                                        className="absolute left-0 top-full mt-1 w-full sm:w-48 bg-card border border-border rounded-md shadow-lg z-20 text-sm"
                                    >
                                        {options.map((opt, idx) => (
                                            <button
                                                key={opt.value}
                                                ref={(el) => {
                                                    optionRefs.current[idx] =
                                                        el;
                                                }}
                                                type="button"
                                                className={`block w-full text-left px-4 py-2 hover:bg-muted-foreground/10 ${
                                                    searchType === opt.value
                                                        ? "bg-muted-foreground/20 font-bold"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    handleSearchTypeChange(
                                                        opt.value as
                                                            | "wanIp"
                                                            | "accountNumber"
                                                            | "accessNumber"
                                                    );
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Input Field */}
                            <input
                                type="text"
                                value={
                                    searchType === "wanIp"
                                        ? ipAddress
                                        : searchType === "accountNumber"
                                        ? assignmentForm.accountNumber
                                        : assignmentForm.accessNumber
                                }
                                onChange={handleInputChange}
                                placeholder={
                                    searchType === "wanIp"
                                        ? "Enter WAN IP"
                                        : searchType === "accountNumber"
                                        ? "Enter Account Number"
                                        : "Enter Access Number"
                                }
                                className="border border-border rounded-md px-4 py-2 bg-card text-foreground w-full sm:flex-1"
                            />

                            {/* Analyze Button */}
                            <Button
                                type="submit"
                                variant="default"
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                {loading ? "Analyzing..." : "Analyze"}
                            </Button>

                            {/* Clear Button */}
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClear}
                                className="w-full sm:w-auto"
                            >
                                Clear
                            </Button>
                        </div>

                        {error && (
                            <p className="text-destructive text-sm text-center mt-2">
                                {error.message}
                            </p>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default WanIpAnalyzerPage;
