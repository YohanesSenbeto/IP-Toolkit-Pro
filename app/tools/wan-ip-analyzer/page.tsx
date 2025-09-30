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
    const [page, setPage] = useState(0);
    const cards = [
        {
            title: "WAN IP Address",
            content: (
                <div className="flex flex-col items-center justify-center h-40">
                    <span className="text-2xl font-bold text-blue-700 font-mono">
                        {analysis.ipAddress}
                    </span>
                </div>
            ),
        },
        {
            title: "Subnet Mask & CIDR",
            content: (
                <div className="flex flex-col items-center justify-center h-40">
                    <span className="text-lg font-semibold text-green-700">
                        {analysis.networkInfo?.subnetMask}
                    </span>
                    <span className="text-sm text-gray-600 mt-2">
                        CIDR: /{analysis.networkInfo?.cidr}
                    </span>
                </div>
            ),
        },
        {
            title: "Network Details",
            content: (
                <div className="flex flex-col items-center justify-center h-40 space-y-1">
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
                </div>
            ),
        },
        analysis.interface
            ? {
                  title: "Regional Info",
                  content: (
                      <div className="flex flex-col items-center justify-center h-40 space-y-1">
                          <span>
                              <strong>Interface:</strong>{" "}
                              {analysis.interface.name}
                          </span>
                          <span>
                              <strong>Region:</strong> {analysis.region?.name}
                          </span>
                          <span>
                              <strong>Gateway:</strong>{" "}
                              {analysis.interface.defaultGateway}
                          </span>
                          <span>
                              <strong>Subnet:</strong>{" "}
                              {analysis.interface.subnetMask}
                          </span>
                      </div>
                  ),
              }
            : null,
        {
            title: "Actions",
            content: (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                    <Button
                        onClick={() => setShowRouterConfig(true)}
                        className="w-40 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Generate Router Config
                    </Button>
                    <Button
                        onClick={() => setShowTutorials(true)}
                        className="w-40 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        View Tutorials
                    </Button>
                </div>
            ),
        },
    ].filter(Boolean);

    const currentCard = cards[page] as
        | { title: string; content: React.ReactNode }
        | undefined;

    return (
        <Card className="mb-6 max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {currentCard ? currentCard.title : ""}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {currentCard ? currentCard.content : null}
                <div className="flex justify-between items-center mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="rounded-full px-4"
                    >
                        Prev
                    </Button>
                    <span className="text-xs text-gray-500">
                        {page + 1} / {cards.length}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setPage((p) => Math.min(cards.length - 1, p + 1))
                        }
                        disabled={page === cards.length - 1}
                        className="rounded-full px-4"
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, X, Globe, Play, Router } from "lucide-react";
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
    const { data: session } = useSession();
    const router = useRouter();
    const [ipAddress, setIpAddress] = useState("");
    const [analysis, setAnalysis] = useState<WanIpAnalysis | null>(null);
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
            await analyzeIp(ipAddress);
        } catch (err) {
            // error already handled
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

    return (
        <div className="w-full min-h-screen bg-background text-foreground">
            <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-1 md:mb-1">
                        <p className="text-muted-foreground px-1 py-2 text-medium">
                            Analyze WAN IP addresses for Ethio Telecom network
                            configuration
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 mb-1 justify-center">
                {/* Left Side - Search Form */}
                <div className="lg:col-span-2 mx-auto">
                    <Card className="p-2 md:p-4 bg-background text-foreground">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg md:text-xl">
                                Search Customer or Analyze WAN IP
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 md:space-y-3">
                                {/* Account Number */}
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
                                                accountNumber: e.target.value,
                                            }))
                                        }
                                        maxLength={9}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                {/* Access Number */}
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
                                                accessNumber: e.target.value,
                                            }))
                                        }
                                        maxLength={11}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                {/* WAN IP Address */}
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

                                {/* Action Buttons */}
                                <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading || !ipAddress}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {loading
                                            ? "Analyzing..."
                                            : "Analyze IP"}
                                    </Button>

                                    <Button
                                        onClick={() =>
                                            handleCustomerLookup({
                                                accountNumber:
                                                    assignmentForm.accountNumber ||
                                                    undefined,
                                                accessNumber:
                                                    assignmentForm.accessNumber ||
                                                    undefined,
                                            })
                                        }
                                        disabled={
                                            loading ||
                                            (!assignmentForm.accountNumber &&
                                                !assignmentForm.accessNumber)
                                        }
                                        variant="outline"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {loading
                                            ? "Searching..."
                                            : "Search Customer"}
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

                                {/* Help Text */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                    <div className="flex items-start gap-1">
                                        <div className="text-blue-600 mt-0.5">
                                            💡
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-800">
                                                How to use:
                                            </h4>
                                            <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                                <li>
                                                    <strong>
                                                        If you have WAN IP:
                                                    </strong>{" "}
                                                    Enter your WAN IP address
                                                    and click "Analyze IP"
                                                </li>
                                                <li>
                                                    <strong>
                                                        If you don't have WAN
                                                        IP:
                                                    </strong>{" "}
                                                    Enter your Account Number OR
                                                    Access Number from your
                                                    Customer Acceptance Sheet
                                                    and click "Search Customer"
                                                </li>
                                                <li>
                                                    <strong>
                                                        Both methods:
                                                    </strong>{" "}
                                                    Will provide your network
                                                    configuration and router
                                                    setup information
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
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
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700"
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
                            className="text-red-600"
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
                                    <span className="text-green-600">
                                        Customer Found ({customerLookup.source})
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-blue-500" />
                                    <span className="text-blue-600">
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
                                        <span className="text-green-600 font-semibold">
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
                                        <span className="text-blue-600 font-semibold">
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
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-green-100 text-green-800"
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
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
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
                                            <h4 className="font-semibold mb-2 text-green-600">
                                                PPPOE Configuration
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-green-50 p-3 rounded-lg">
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
                                            <h4 className="font-semibold mb-2 text-blue-600">
                                                Network Configuration
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-blue-50 p-3 rounded-lg">
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
                                            <h4 className="font-semibold mb-2 text-purple-600">
                                                Router Information
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-purple-50 p-3 rounded-lg">
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
                                            <h4 className="font-semibold mb-2 text-orange-600">
                                                Assigned Technician
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-orange-50 p-3 rounded-lg">
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
                                            <h4 className="font-semibold mb-2 text-green-600">
                                                Router Recommendations
                                            </h4>
                                            <div className="bg-green-50 p-3 rounded-lg">
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
                                                                                className="text-blue-600 hover:underline text-sm"
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

            {/* IP Analysis Results - Book/Bible Style Card Navigation on Mobile */}
            {analysis && (
                <BookStyleResults
                    analysis={analysis}
                    setShowRouterConfig={setShowRouterConfig}
                    setShowTutorials={setShowTutorials}
                />
            )}

            {/* Router Configuration Generator */}
            {showRouterConfig && analysis && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Router Configuration Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RouterConfigGenerator
                            wanIp={analysis.ipAddress}
                            subnetMask={analysis.networkInfo?.subnetMask}
                            defaultGateway={
                                analysis.interface?.defaultGateway ||
                                analysis.region?.defaultGateway
                            }
                            dnsServers={["8.8.8.8", "8.8.4.4"]}
                            onConfigGenerated={(config) => {
                                console.log("Router config generated:", config);
                                toast.success(
                                    "Router configuration generated successfully"
                                );
                            }}
                        />
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowRouterConfig(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tutorial Video Library */}
            {showTutorials && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Tutorial Video Library</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <Router className="h-16 w-16 text-blue-500 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Access Comprehensive Tutorial Library
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Our dedicated Modem Configuration Tutorials page
                                provides access to all video tutorials from the
                                Yoh-Tech Solutions YouTube channel, with
                                advanced filtering and categorization.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={() =>
                                        window.open(
                                            "/tools/modem-tutorials",
                                            "_blank"
                                        )
                                    }
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Open Tutorial Library
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowTutorials(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
