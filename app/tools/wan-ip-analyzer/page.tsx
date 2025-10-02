"use client";

import React, { ReactNode, useState, useEffect } from "react";
// BookStyleResults component for paginated/swipeable cards
import { FC } from "react";
type BookStyleResultsProps = {
    analysis: WanIpAnalysis;
    setShowRouterConfig: (b: boolean) => void;
    setShowTutorials: (b: boolean) => void;
};

const BookStyleResults: FC<BookStyleResultsProps> = ({
    analysis,
    setShowRouterConfig,
    setShowTutorials,
}) => {
    // Responsive: always show WAN IP, Subnet Mask, Default Gateway at top with 'Important' label
    const defaultGateway =
        analysis.interface?.defaultGateway ||
        analysis.region?.defaultGateway ||
        "-";
    return (
        <Card className="mb-4 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto min-h-[160px] bg-black text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    WAN IP Analysis Results
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Important section - always horizontal */}
                <div className="w-full bg-black rounded-2xl p-4 lg:p-8 mb-6 border border-gray-800 shadow-lg">
                    <div className="mb-4 text-center">
                        <span className="inline-block px-4 py-1 rounded-full bg-yellow-600 text-sm font-bold uppercase tracking-wider text-white shadow-sm">
                            Important
                        </span>
                    </div>
                    <div className="flex flex-col justify-between items-stretch gap-4 sm:gap-6 md:gap-10 lg:gap-8 text-center w-full">
                        <div className="flex flex-col items-center flex-1">
                            <div className="text-sm text-gray-300 mb-1 font-semibold tracking-wide lg:text-base">
                                WAN IP Address
                            </div>
                            <div className="text-xl font-extrabold text-blue-200 font-mono break-all lg:text-2xl">
                                {analysis.ipAddress}
                            </div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="text-sm text-gray-300 mb-1 font-semibold tracking-wide lg:text-base">
                                Subnet Mask
                            </div>
                            <div className="text-xl font-extrabold text-green-200 font-mono lg:text-2xl">
                                {analysis.networkInfo?.subnetMask}
                            </div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <div className="text-sm text-gray-300 mb-1 font-semibold tracking-wide lg:text-base">
                                Default Gateway
                            </div>
                            <div className="text-xl font-extrabold text-purple-200 font-mono lg:text-2xl">
                                {defaultGateway}
                            </div>
                        </div>
                    </div>
                </div>
                {/* List all other information below */}
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-col gap-1">
                        <span>
                            <strong>Network:</strong>{" "}
                            {analysis.networkInfo?.networkAddress}
                        </span>
                        <span>
                            <strong>Broadcast:</strong>{" "}
                            {analysis.networkInfo?.broadcastAddress}
                        </span>
                        <span>
                            <strong>Usable:</strong>{" "}
                            {analysis.networkInfo?.firstUsableIp} -{" "}
                            {analysis.networkInfo?.lastUsableIp}
                        </span>
                        <span>
                            <strong>Total Hosts:</strong>{" "}
                            {analysis.networkInfo?.totalHosts?.toLocaleString()}
                        </span>
                        <span>
                            <strong>Usable Hosts:</strong>{" "}
                            {analysis.networkInfo?.usableHosts?.toLocaleString()}
                        </span>
                        <span>
                            <strong>CIDR:</strong> /{analysis.networkInfo?.cidr}
                        </span>
                    </div>
                    {analysis.interface && (
                        <div className="flex flex-col gap-1 mt-2">
                            <span>
                                <strong>Interface:</strong>{" "}
                                {analysis.interface.name}
                            </span>
                            <span>
                                <strong>Region:</strong> {analysis.region?.name}
                            </span>
                            <span>
                                <strong>Subnet:</strong>{" "}
                                {analysis.interface.subnetMask}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center gap-2 mt-4">
                    <Button asChild>
                        <a href="/dashboard" className="w-full text-center">
                            Go to Details Page
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import {
    AlertCircle,
    CheckCircle,
    X,
    Globe,
    Play,
    Router,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RouterConfigGenerator from "@/components/RouterConfigGenerator";
import TutorialVideoPlayer from "@/components/TutorialVideoPlayer";

interface WanIpAnalysis {
    ip: ReactNode;
    ipAddress: string;
    networkInfo: {
        cidr: number;
        subnetMask: string;
        networkAddress: string;
        broadcastAddress: string;
        firstUsableIp: string;
        lastUsableIp: string;
        totalHosts: number;
        usableHosts: number;
    };
    region: {
        defaultGateway: string | undefined;
        name: string;
        code?: string;
    };
    interface?: {
        region: ReactNode;
        name: string;
        ipPoolStart: string;
        ipPoolEnd: string;
        subnetMask: string;
        defaultGateway: string;
    };
    recommendations: {
        routerModel: string;
        tutorials: string[];
        knowledgeBase: any[];
    };
    status: {
        assigned: boolean;
        available?: boolean;
        accountNumber?: string;
        accessNumber?: string;
        customerName?: string;
        location?: string;
    };
}

export default function WanIpAnalyzerPage() {
    const [searchType, setSearchType] = useState<
        "wanIp" | "accountNumber" | "accessNumber"
    >("wanIp");
    const { data: session, status } = useSession();
    const router = useRouter();
    // All hooks must be called unconditionally and before any early return
    const [ipAddress, setIpAddress] = useState("");
    const [analysis, setAnalysis] = useState<WanIpAnalysis | null>(null);
    const [customerLookup, setCustomerLookup] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [showRouterConfig, setShowRouterConfig] = useState(false);
    const [showTutorials, setShowTutorials] = useState(false);
    const [showServiceTypeForm, setShowServiceTypeForm] = useState(true);
    const [serviceData, setServiceData] = useState<{
        serviceType: "BROADBAND_INTERNET" | "VPN_DATA_ONLY";
        customerType: "RESIDENTIAL" | "ENTERPRISE";
        wanIp?: string;
    } | null>(null);
    const [assignmentForm, setAssignmentForm] = useState({
        accountNumber: "",
        accessNumber: "",
        customerName: "",
        location: "",
        customerType: "RESIDENTIAL" as "RESIDENTIAL" | "ENTERPRISE",
        serviceType: "BROADBAND_INTERNET" as
            | "BROADBAND_INTERNET"
            | "VPN_DATA_ONLY",
    });
    const [showHelp, setShowHelp] = React.useState(false);

    // Protect route: redirect guests to sign in
    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            toast.info(
                "To access WAN IP Analyzer, you must sign in. If you don't have an account, please register first.",
                {
                    action: {
                        label: "Sign In",
                        onClick: () => router.push("/auth/signin"),
                    },
                    cancel: {
                        label: "Sign Up",
                        onClick: () => router.push("/auth/signup"),
                    },
                    duration: 8000,
                    dismissible: true,
                }
            );
            router.push("/auth/signin");
        }
    }, [session, status, router]);

    // Auto-scroll to network config card on mobile/tablet after analysis loads
    useEffect(() => {
        if (analysis && typeof window !== "undefined") {
            const isMobileOrTablet = window.innerWidth < 1024;
            if (isMobileOrTablet) {
                const card = document.getElementById("network-config-card");
                if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        }
    }, [analysis]);

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const analyzeIp = async (ip: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/wan-ip/analyze?ip=${encodeURIComponent(ip)}`,
                {
                    method: "GET",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // Show YouTube subscribe link for both trial and usage limit errors
                if (
                    (data.error ===
                        "Usage limit reached, verification required" ||
                        data.error === "Trial limit reached") &&
                    data.youtube
                ) {
                    setError(
                        `${data.error}. To unlock unlimited usage, please verify your account by subscribing to our YouTube channel: ` +
                            `<a href='${data.youtube}' target='_blank' rel='noopener noreferrer' class='text-blue-600 underline'>Subscribe to Yoh-Tech Solutions</a>`
                    );
                    return;
                }
                throw new Error(data.error || "Failed to analyze IP");
            }

            setAnalysis(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let ipToAnalyze = "";
            if (searchType === "wanIp") {
                ipToAnalyze = ipAddress;
            } else if (
                searchType === "accountNumber" &&
                assignmentForm.accountNumber
            ) {
                // Fetch WAN IP by account number
                const params = new URLSearchParams({
                    accountNumber: assignmentForm.accountNumber,
                });
                const response = await fetch(
                    `/api/crm/customer-lookup?${params}`
                );
                const result = await response.json();
                if (
                    !response.ok ||
                    !result.found ||
                    !result.networkConfig?.wanIp
                ) {
                    throw new Error(
                        result.error ||
                            "WAN IP not found for this account number"
                    );
                }
                ipToAnalyze = result.networkConfig.wanIp;
            } else if (
                searchType === "accessNumber" &&
                assignmentForm.accessNumber
            ) {
                // Fetch WAN IP by access number
                const params = new URLSearchParams({
                    accessNumber: assignmentForm.accessNumber,
                });
                const response = await fetch(
                    `/api/crm/customer-lookup?${params}`
                );
                const result = await response.json();
                if (
                    !response.ok ||
                    !result.found ||
                    !result.networkConfig?.wanIp
                ) {
                    throw new Error(
                        result.error ||
                            "WAN IP not found for this access number"
                    );
                }
                ipToAnalyze = result.networkConfig.wanIp;
            }
            if (!ipToAnalyze) {
                throw new Error("No WAN IP to analyze");
            }
            setIpAddress(ipToAnalyze); // update UI with found IP
            await analyzeIp(ipToAnalyze);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerLookup = async (data: {
        accountNumber?: string;
        accessNumber?: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (data.accountNumber)
                params.append("accountNumber", data.accountNumber);
            if (data.accessNumber)
                params.append("accessNumber", data.accessNumber);

            const response = await fetch(`/api/crm/customer-lookup?${params}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to lookup customer");
            }

            setCustomerLookup(result);
            setShowServiceTypeForm(false);

            // If customer has WAN IP, analyze it
            if (result.found && result.networkConfig?.wanIp) {
                setIpAddress(result.networkConfig.wanIp);
                await analyzeIp(result.networkConfig.wanIp);
            }

            toast.success("Customer lookup completed successfully");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to lookup customer"
            );
            toast.error("Customer lookup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleServiceTypeSelected = (data: {
        serviceType: "BROADBAND_INTERNET" | "VPN_DATA_ONLY";
        customerType: "RESIDENTIAL" | "ENTERPRISE";
        wanIp?: string;
    }) => {
        setServiceData(data);
        setShowServiceTypeForm(false);

        // If Broadband Internet, set the WAN IP and analyze
        if (data.serviceType === "BROADBAND_INTERNET" && data.wanIp) {
            setIpAddress(data.wanIp);
            analyzeIp(data.wanIp);
        }
    };

    const handleClear = () => {
        setIpAddress("");
        setAnalysis(null);
        setCustomerLookup(null);
        setError(null);
        setShowAssignmentForm(false);
        setShowRouterConfig(false);
        setShowTutorials(false);
        setShowServiceTypeForm(false);
        setServiceData(null);
        setAssignmentForm({
            accountNumber: "",
            accessNumber: "",
            customerName: "",
            location: "",
            customerType: "RESIDENTIAL",
            serviceType: "BROADBAND_INTERNET",
        });
    };

    const handleAssignIp = async () => {
        if (!analysis || !ipAddress) return;

        try {
            const response = await fetch("/api/wan-ip/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ip: ipAddress,
                    assign: true,
                    customerData: assignmentForm,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to assign IP");
            }

            toast.success("IP assigned successfully!", {
                description: `Assigned ${ipAddress} to ${
                    assignmentForm.customerName || "customer"
                }`,
            });
            setShowAssignmentForm(false);
            analyzeIp(ipAddress); // Refresh analysis
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to assign IP"
            );
        }
    };

    // HelpToggle component for usage instructions (top-level, not covering form)
    function HelpToggle({
        show,
        onClick,
    }: {
        show: boolean;
        onClick: () => void;
    }) {
        return (
            <div className="w-full flex items-center justify-end mb-2">
                <button
                    type="button"
                    aria-label="Show usage instructions"
                    onClick={onClick}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                    <Info className="h-4 w-4" />
                    <span className="font-semibold">Help</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-background text-foreground">
            <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-2 md:py-4">
                <div className="max-w-4xl mx-auto">
                    <HelpToggle
                        show={showHelp}
                        onClick={() => setShowHelp((v) => !v)}
                    />
                    <div className="relative w-full flex justify-end">
                        <div>
                            {showHelp && (
                                <div className="fixed md:absolute top-2 right-2 md:right-[-80px] left-2 md:left-auto w-[calc(100vw-1rem)] md:w-auto max-w-sm md:max-w-xs bg-blue-50 border border-blue-200 rounded-md shadow-lg p-4 md:p-2 text-blue-900 dark:bg-gray-900 dark:text-blue-100 dark:border-blue-800 text-xs z-[100]">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-blue-600 text-base">
                                                💡
                                            </span>
                                            <span className="font-bold text-sm">
                                                How to use:
                                            </span>
                                        </div>
                                        <button
                                            aria-label="Close help"
                                            className="ml-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-gray-800 focus:outline-none"
                                            onClick={() => setShowHelp(false)}
                                        >
                                            <X className="h-4 w-4 text-blue-600" />
                                        </button>
                                    </div>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>
                                            <span className="font-semibold">
                                                If you have WAN IP:
                                            </span>{" "}
                                            Enter your WAN IP address and click
                                            "Analyze IP"
                                        </li>
                                        <li>
                                            <span className="font-semibold">
                                                If you don't have WAN IP:
                                            </span>{" "}
                                            Enter your Account Number OR Access
                                            Number from your Customer Acceptance
                                            Sheet and click "Search Customer"
                                        </li>
                                        <li>
                                            <span className="font-semibold">
                                                Both methods:
                                            </span>{" "}
                                            Will provide your network
                                            configuration and router setup
                                            information
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-1 md:mb-1">
                        <p className="text-muted-foreground px-1 py-2 text-medium">
                            Analyze WAN IP addresses for Ethio Telecom network
                            configuration
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-4 mb-1 mt-4 md:mt-8 px-2 md:px-4 xl:px-0 w-full max-w-6xl mx-auto">
                {/* Left Side - Search Form */}
                <div className="w-full max-w-md mx-auto lg:mx-0 lg:w-[420px] flex-shrink-0">
                    <Card className="p-0.5 md:p-1 bg-background text-foreground w-full">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base md:text-lg">
                                Search Customer or Analyze WAN IP
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-1 md:space-y-2">
                                {/* Search Type Selector */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Search By:
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={searchType}
                                        onChange={(e) =>
                                            setSearchType(
                                                e.target.value as
                                                    | "wanIp"
                                                    | "accountNumber"
                                                    | "accessNumber"
                                            )
                                        }
                                    >
                                        <option value="wanIp">
                                            WAN IP Address
                                        </option>
                                        <option value="accountNumber">
                                            Account Number
                                        </option>
                                        <option value="accessNumber">
                                            Access Number
                                        </option>
                                    </select>
                                </div>

                                {/* Conditionally Rendered Input */}
                                {searchType === "wanIp" && (
                                    <div className="relative">
                                        <label className="block text-sm font-medium mb-2">
                                            WAN IP Address:
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., 10.239.139.51"
                                            value={ipAddress}
                                            onChange={(e) =>
                                                setIpAddress(e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        {ipAddress && (
                                            <button
                                                type="button"
                                                aria-label="Clear WAN IP"
                                                onClick={() => setIpAddress("")}
                                                className="absolute right-2 top-9 p-1 rounded hover:bg-gray-100"
                                            >
                                                <X className="h-4 w-4 text-gray-500" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                {searchType === "accountNumber" && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Account Number:
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="9 digits (e.g.701234567)"
                                            value={assignmentForm.accountNumber}
                                            onChange={(e) =>
                                                setAssignmentForm((prev) => ({
                                                    ...prev,
                                                    accountNumber:
                                                        e.target.value,
                                                }))
                                            }
                                            maxLength={9}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                    </div>
                                )}
                                {searchType === "accessNumber" && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Access Number:
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="11 digits (e.g., 13100123456)"
                                            value={assignmentForm.accessNumber}
                                            onChange={(e) =>
                                                setAssignmentForm((prev) => ({
                                                    ...prev,
                                                    accessNumber:
                                                        e.target.value,
                                                }))
                                            }
                                            maxLength={11}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={
                                            loading ||
                                            (searchType === "wanIp" &&
                                                !ipAddress) ||
                                            (searchType === "accountNumber" &&
                                                !assignmentForm.accountNumber) ||
                                            (searchType === "accessNumber" &&
                                                !assignmentForm.accessNumber)
                                        }
                                    >
                                        {loading ? "Analyzing..." : "Analyze"}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleClear}
                                        disabled={loading}
                                        variant="secondary"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side - Network Configuration Summary */}
                <div className="lg:col-span-1">
                    {analysis && (
                        <Card
                            className="bg-card text-card-foreground border-blue-200 sticky top-4"
                            id="network-config-card"
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
                                    <Globe className="h-4 w-4" />
                                    Network Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* WAN IP Address */}
                                    <div className="bg-card text-card-foreground rounded-lg p-3 shadow-sm border border-blue-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            <h3 className="font-semibold text-gray-800 text-xs">
                                                WAN IP Address
                                            </h3>
                                        </div>
                                        <p className="text-sm font-bold text-blue-600 font-mono">
                                            {analysis.ipAddress}
                                        </p>
                                    </div>

                                    {/* Subnet Mask */}
                                    <div className="bg-card text-card-foreground rounded-lg p-3 shadow-sm border border-green-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            <h3 className="font-semibold text-gray-800 text-xs">
                                                Subnet Mask
                                            </h3>
                                        </div>
                                        <p className="text-sm font-bold text-green-600 font-mono">
                                            {analysis.networkInfo?.subnetMask}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            CIDR: /{analysis.networkInfo?.cidr}
                                        </p>
                                    </div>

                                    {/* Default Gateway */}
                                    <div className="bg-card text-card-foreground rounded-lg p-3 shadow-sm border border-purple-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                            <h3 className="font-semibold text-gray-800 text-xs">
                                                Default Gateway
                                            </h3>
                                        </div>
                                        <p className="text-sm font-bold text-purple-600 font-mono">
                                            {analysis.interface?.defaultGateway}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            Interface:{" "}
                                            {analysis.interface?.name}
                                        </p>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="bg-card text-card-foreground rounded-lg p-2 shadow-sm border border-gray-100">
                                        <h3 className="font-semibold text-gray-800 text-xs mb-1">
                                            Network Details
                                        </h3>
                                        <div className="space-y-0.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Region:
                                                </span>
                                                <span className="font-semibold">
                                                    {analysis.region?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Total Hosts:
                                                </span>
                                                <span className="font-semibold">
                                                    {analysis.networkInfo?.totalHosts?.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Usable:
                                                </span>
                                                <span className="font-semibold">
                                                    {analysis.networkInfo?.usableHosts?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Tutorials Button */}
                                    <div className="pt-3 border-t border-blue-200">
                                        <Button
                                            onClick={() =>
                                                window.open(
                                                    "/tools/modem-tutorials",
                                                    "_blank"
                                                )
                                            }
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            View Tutorials
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span
                            className="text-red-500"
                            dangerouslySetInnerHTML={{ __html: error }}
                        />
                    </div>
                </div>
            )}

            {/* Customer Lookup Results */}
            {customerLookup && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {customerLookup.found ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-green-500">
                                        Customer Found ({customerLookup.source})
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-blue-500" />
                                    <span className="text-blue-500">
                                        Service Type:{" "}
                                        {customerLookup.serviceType ===
                                        "BROADBAND_INTERNET"
                                            ? "Broadband Internet"
                                            : customerLookup.serviceType ===
                                              "VPN_DATA_ONLY"
                                            ? "VPN/Data Only"
                                            : customerLookup.serviceType}
                                    </span>
                                </>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {customerLookup.found ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-green-500 font-semibold">
                                            Service Type:{" "}
                                            {customerLookup.customer
                                                ?.serviceType ===
                                            "BROADBAND_INTERNET"
                                                ? "Broadband Internet"
                                                : customerLookup.customer
                                                      ?.serviceType ===
                                                  "VPN_DATA_ONLY"
                                                ? "VPN/Data Only"
                                                : customerLookup.customer
                                                      ?.serviceType ||
                                                  customerLookup.serviceType}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-blue-500" />
                                        <span className="text-blue-500 font-semibold">
                                            Service Type:{" "}
                                            {customerLookup.serviceType ===
                                            "BROADBAND_INTERNET"
                                                ? "Broadband Internet"
                                                : customerLookup.serviceType ===
                                                  "VPN_DATA_ONLY"
                                                ? "VPN/Data Only"
                                                : customerLookup.serviceType}
                                        </span>
                                    </>
                                )}
                            </div>

                            {customerLookup.found && customerLookup.customer ? (
                                <div className="space-y-3">
                                    {/* Customer Basic Info */}
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <strong>Account Number:</strong>{" "}
                                            {
                                                customerLookup.customer
                                                    .accountNumber
                                            }
                                        </div>
                                        <div>
                                            <strong>Access Number:</strong>{" "}
                                            {customerLookup.customer
                                                .accessNumber || "N/A"}
                                        </div>
                                        <div>
                                            <strong>Customer Name:</strong>{" "}
                                            {
                                                customerLookup.customer
                                                    .customerName
                                            }
                                        </div>
                                        <div>
                                            <strong>Location:</strong>{" "}
                                            {customerLookup.customer.location}
                                        </div>
                                        <div>
                                            <strong>Customer Type:</strong>{" "}
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    customerLookup.customer
                                                        .customerType ===
                                                    "ENTERPRISE"
                                                        ? "bg-blue-100 text-blue-500"
                                                        : "bg-green-100 text-green-500"
                                                }`}
                                            >
                                                {
                                                    customerLookup.customer
                                                        .customerType
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <strong>Service Status:</strong>{" "}
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    customerLookup.customer
                                                        .serviceStatus ===
                                                    "ACTIVE"
                                                        ? "bg-green-100 text-green-500"
                                                        : "bg-red-100 text-red-500"
                                                }`}
                                            >
                                                {
                                                    customerLookup.customer
                                                        .serviceStatus
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* PPPOE Configuration */}
                                    {customerLookup.pppoeConfig && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-green-500">
                                                PPPOE Configuration
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-green-100 p-3 rounded-lg">
                                                <div>
                                                    <strong>Username:</strong>{" "}
                                                    {
                                                        customerLookup
                                                            .pppoeConfig
                                                            .username
                                                    }
                                                </div>
                                                <div>
                                                    <strong>Password:</strong>{" "}
                                                    {
                                                        customerLookup
                                                            .pppoeConfig
                                                            .password
                                                    }
                                                </div>
                                                <div>
                                                    <strong>
                                                        Service Name:
                                                    </strong>{" "}
                                                    {
                                                        customerLookup
                                                            .pppoeConfig
                                                            .serviceName
                                                    }
                                                </div>
                                                <div>
                                                    <strong>
                                                        DNS Servers:
                                                    </strong>{" "}
                                                    {customerLookup.pppoeConfig.dnsServers?.join(
                                                        ", "
                                                    ) || "8.8.8.8, 8.8.4.4"}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Network Configuration */}
                                    {customerLookup.networkConfig && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-blue-500">
                                                Network Configuration
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-blue-100 p-3 rounded-lg">
                                                <div>
                                                    <strong>WAN IP:</strong>{" "}
                                                    {customerLookup
                                                        .networkConfig.wanIp ||
                                                        "N/A"}
                                                </div>
                                                <div>
                                                    <strong>
                                                        Subnet Mask:
                                                    </strong>{" "}
                                                    {customerLookup
                                                        .networkConfig
                                                        .subnetMask || "N/A"}
                                                </div>
                                                <div>
                                                    <strong>
                                                        Default Gateway:
                                                    </strong>{" "}
                                                    {customerLookup
                                                        .networkConfig
                                                        .defaultGateway ||
                                                        "N/A"}
                                                </div>
                                                <div>
                                                    <strong>CIDR:</strong> /
                                                    {customerLookup
                                                        .networkConfig.cidr ||
                                                        "N/A"}
                                                </div>
                                                <div>
                                                    <strong>
                                                        DNS Servers:
                                                    </strong>{" "}
                                                    {customerLookup.networkConfig.dnsServers?.join(
                                                        ", "
                                                    ) || "8.8.8.8, 8.8.4.4"}
                                                </div>
                                                {customerLookup.networkConfig
                                                    .vlanId && (
                                                    <div>
                                                        <strong>
                                                            VLAN ID:
                                                        </strong>{" "}
                                                        {
                                                            customerLookup
                                                                .networkConfig
                                                                .vlanId
                                                        }
                                                    </div>
                                                )}
                                                {customerLookup.networkConfig
                                                    .networkElement && (
                                                    <div>
                                                        <strong>
                                                            Network Element:
                                                        </strong>{" "}
                                                        {
                                                            customerLookup
                                                                .networkConfig
                                                                .networkElement
                                                        }
                                                    </div>
                                                )}
                                                {customerLookup.networkConfig
                                                    .needsAssignment && (
                                                    <div className="md:col-span-2">
                                                        <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                                                            <strong>
                                                                Note:
                                                            </strong>{" "}
                                                            {
                                                                customerLookup
                                                                    .networkConfig
                                                                    .message
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Router Information */}
                                    {customerLookup.customer?.routerInfo && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-purple-500">
                                                Router Information
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-purple-100 p-3 rounded-lg">
                                                <div>
                                                    <strong>Model:</strong>{" "}
                                                    {customerLookup.customer
                                                        .routerInfo.model ||
                                                        "N/A"}
                                                </div>
                                                <div>
                                                    <strong>
                                                        Serial Number:
                                                    </strong>{" "}
                                                    {customerLookup.customer
                                                        .routerInfo
                                                        .serialNumber || "N/A"}
                                                </div>
                                                <div>
                                                    <strong>
                                                        MAC Address:
                                                    </strong>{" "}
                                                    {customerLookup.customer
                                                        .routerInfo
                                                        .macAddress || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Technician Information */}
                                    {customerLookup.customer?.technician && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-orange-500">
                                                Assigned Technician
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-orange-100 p-3 rounded-lg">
                                                <div>
                                                    <strong>Name:</strong>{" "}
                                                    {
                                                        customerLookup.customer
                                                            .technician.name
                                                    }
                                                </div>
                                                <div>
                                                    <strong>
                                                        Employee ID:
                                                    </strong>{" "}
                                                    {
                                                        customerLookup.customer
                                                            .technician
                                                            .employeeId
                                                    }
                                                </div>
                                                <div>
                                                    <strong>Contact:</strong>{" "}
                                                    {
                                                        customerLookup.customer
                                                            .technician.contact
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Router Recommendations */}
                                    {customerLookup.recommendations && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-green-500">
                                                Router Recommendations
                                            </h4>
                                            <div className="bg-green-100 p-3 rounded-lg">
                                                <div className="mb-2">
                                                    <strong>
                                                        Recommended Model:
                                                    </strong>{" "}
                                                    {
                                                        customerLookup
                                                            .recommendations
                                                            .routerModel
                                                    }
                                                </div>
                                                {customerLookup.recommendations
                                                    .tutorials &&
                                                    customerLookup
                                                        .recommendations
                                                        .tutorials.length >
                                                        0 && (
                                                        <div>
                                                            <strong>
                                                                Tutorials:
                                                            </strong>
                                                            <ul className="mt-1 space-y-1">
                                                                {customerLookup.recommendations.tutorials.map(
                                                                    (
                                                                        tutorial: any,
                                                                        index: number
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <a
                                                                                href={
                                                                                    tutorial.url
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-500 hover:underline text-sm"
                                                                            >
                                                                                {
                                                                                    tutorial.title
                                                                                }{" "}
                                                                                →
                                                                            </a>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    <p>
                                        No WAN IP assignment found. Customer
                                        likely has PPPOE service.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* WAN IP Analysis Results Drawer */}
            <Drawer
                open={!!analysis}
                onOpenChange={(open) => {
                    if (!open) setAnalysis(null);
                }}
            >
                <DrawerContent
                    side="right"
                    showCloseIcon={true}
                    onClose={() => setAnalysis(null)}
                >
                    <DrawerHeader>
                        <DrawerTitle>WAN IP Analysis Results</DrawerTitle>
                        <DrawerDescription>
                            Detailed analysis and actions for the provided WAN
                            IP.
                        </DrawerDescription>
                    </DrawerHeader>
                    {analysis && (
                        <div className="px-4 pb-6">
                            <BookStyleResults
                                analysis={analysis}
                                setShowRouterConfig={setShowRouterConfig}
                                setShowTutorials={setShowTutorials}
                            />
                        </div>
                    )}
                </DrawerContent>
            </Drawer>

            {/* Router Configuration Drawer */}
            <Drawer
                open={showRouterConfig}
                onOpenChange={(open) => {
                    if (!open) setShowRouterConfig(false);
                }}
            >
                <DrawerContent
                    side="right"
                    showCloseIcon={true}
                    onClose={() => setShowRouterConfig(false)}
                >
                    <DrawerHeader>
                        <DrawerTitle>
                            Router Configuration Generator
                        </DrawerTitle>
                        <DrawerDescription>
                            Generate configuration for your router based on WAN
                            IP analysis.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-6">
                        {analysis && (
                            <RouterConfigGenerator
                                wanIp={analysis.ipAddress}
                                subnetMask={analysis.networkInfo?.subnetMask}
                                defaultGateway={
                                    analysis.interface?.defaultGateway ||
                                    analysis.region?.defaultGateway
                                }
                                dnsServers={["8.8.8.8", "8.8.4.4"]}
                                onConfigGenerated={(config) => {
                                    console.log(
                                        "Router config generated:",
                                        config
                                    );
                                    toast.success(
                                        "Router configuration generated successfully"
                                    );
                                }}
                            />
                        )}
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Tutorial Video Library Drawer */}
            <Drawer
                open={showTutorials}
                onOpenChange={(open) => {
                    if (!open) setShowTutorials(false);
                }}
            >
                <DrawerContent
                    side="right"
                    showCloseIcon={true}
                    onClose={() => setShowTutorials(false)}
                >
                    <DrawerHeader>
                        <DrawerTitle>Tutorial Video Library</DrawerTitle>
                        <DrawerDescription>
                            Access comprehensive modem/router configuration
                            tutorials.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="text-center py-8 px-4">
                        <div className="mb-4">
                            <Router className="h-16 w-16 text-blue-500 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Access Comprehensive Tutorial Library
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Our dedicated Modem Configuration Tutorials page
                            provides access to all video tutorials from the
                            Yoh-Tech Solutions YouTube channel, with advanced
                            filtering and categorization.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() =>
                                    window.open(
                                        "/tools/modem-tutorials",
                                        "_blank"
                                    )
                                }
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Open Tutorial Library
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
