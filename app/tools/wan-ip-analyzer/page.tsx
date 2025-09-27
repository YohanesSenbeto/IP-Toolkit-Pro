"use client";

import { ReactNode, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertCircle,
    CheckCircle,
    X,
    Globe,
    Play,
    Router,
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
    const { data: session } = useSession();
    const router = useRouter();
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
        serviceType: 'BROADBAND_INTERNET' | 'VPN_DATA_ONLY';
        customerType: 'RESIDENTIAL' | 'ENTERPRISE';
        wanIp?: string;
    } | null>(null);
    const [assignmentForm, setAssignmentForm] = useState({
        accountNumber: "",
        accessNumber: "",
        customerName: "",
        location: "",
        customerType: "RESIDENTIAL" as "RESIDENTIAL" | "ENTERPRISE",
        serviceType: "BROADBAND_INTERNET" as "BROADBAND_INTERNET" | "VPN_DATA_ONLY",
    });

    const analyzeIp = async (ip: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/wan-ip/analyze?ip=${encodeURIComponent(ip)}`, {
                method: "GET",
            });

            const data = await response.json();

            if (!response.ok) {
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
            if (data.accountNumber) params.append('accountNumber', data.accountNumber);
            if (data.accessNumber) params.append('accessNumber', data.accessNumber);
            
            const response = await fetch(`/api/crm/customer-lookup?${params}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to lookup customer');
            }
            
            setCustomerLookup(result);
            setShowServiceTypeForm(false);
            
            // If customer has WAN IP, analyze it
            if (result.found && result.networkConfig?.wanIp) {
                setIpAddress(result.networkConfig.wanIp);
                await analyzeIp(result.networkConfig.wanIp);
            }
            
            toast.success('Customer lookup completed successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to lookup customer');
            toast.error('Customer lookup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceTypeSelected = (data: {
        serviceType: 'BROADBAND_INTERNET' | 'VPN_DATA_ONLY';
        customerType: 'RESIDENTIAL' | 'ENTERPRISE';
        wanIp?: string;
    }) => {
        setServiceData(data);
        setShowServiceTypeForm(false);
        
        // If Broadband Internet, set the WAN IP and analyze
        if (data.serviceType === 'BROADBAND_INTERNET' && data.wanIp) {
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
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">WAN IP Analyzer</h1>
                <p className="text-muted-foreground">
                    Analyze WAN IP addresses for Ethio Telecom network
                    configuration
                </p>
            </div>


                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* Left Side - Search Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Search Customer or Analyze WAN IP</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Account Number */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Account Number
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="9 digits (e.g., 123456789)"
                                                value={assignmentForm.accountNumber}
                                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                                                maxLength={9}
                                                className="w-full sm:max-w-md"
                                            />
                                        </div>

                                        {/* Access Number */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Access Number
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="11 digits (e.g., 12345678901)"
                                                value={assignmentForm.accessNumber}
                                                onChange={(e) => setAssignmentForm(prev => ({ ...prev, accessNumber: e.target.value }))}
                                                maxLength={11}
                                                className="w-full sm:max-w-md"
                                            />
                                        </div>

                                        {/* WAN IP Address */}
                                        <div className="relative">
                                            <label className="block text-sm font-medium mb-2">
                                                WAN IP Address
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="e.g., 197.156.64.1"
                                                value={ipAddress}
                                                onChange={(e) => setIpAddress(e.target.value)}
                                                className="w-full sm:max-w-md"
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
                                                {loading ? "Analyzing..." : "Analyze IP"}
                                            </Button>

                                            <Button
                                                onClick={() => handleCustomerLookup({
                                                    accountNumber: assignmentForm.accountNumber || undefined,
                                                    accessNumber: assignmentForm.accessNumber || undefined
                                                })}
                                                disabled={loading || (!assignmentForm.accountNumber && !assignmentForm.accessNumber)}
                                                variant="outline"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {loading ? "Searching..." : "Search Customer"}
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
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-2">
                                                <div className="text-blue-600 mt-0.5">💡</div>
                                                <div>
                                                    <h4 className="font-semibold text-blue-800">How to use:</h4>
                                                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                                        <li><strong>If you have WAN IP:</strong> Enter your WAN IP address and click "Analyze IP"</li>
                                                        <li><strong>If you don't have WAN IP:</strong> Enter your Account Number OR Access Number from your Customer Acceptance Sheet and click "Search Customer"</li>
                                                        <li><strong>Both methods:</strong> Will provide your network configuration and router setup information</li>
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
                                <Card className="bg-gradient-to-b from-blue-50 to-indigo-50 border-blue-200 sticky top-4">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-blue-800 text-base">
                                            <Globe className="h-4 w-4" />
                                            Network Configuration
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {/* WAN IP Address */}
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                    <h3 className="font-semibold text-gray-800 text-xs">WAN IP Address</h3>
                                                </div>
                                                <p className="text-sm font-bold text-blue-600 font-mono">
                                                    {analysis.ipAddress}
                                                </p>
                                            </div>

                                            {/* Subnet Mask */}
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <h3 className="font-semibold text-gray-800 text-xs">Subnet Mask</h3>
                                                </div>
                                                <p className="text-sm font-bold text-green-600 font-mono">
                                                    {analysis.networkInfo?.subnetMask}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    CIDR: /{analysis.networkInfo?.cidr}
                                                </p>
                                            </div>

                                            {/* Default Gateway */}
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                                    <h3 className="font-semibold text-gray-800 text-xs">Default Gateway</h3>
                                                </div>
                                                <p className="text-sm font-bold text-purple-600 font-mono">
                                                    {analysis.interface?.defaultGateway}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    Interface: {analysis.interface?.name}
                                                </p>
                                            </div>

                                            {/* Additional Info */}
                                            <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                                                <h3 className="font-semibold text-gray-800 text-xs mb-1">Network Details</h3>
                                                <div className="space-y-0.5 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Region:</span>
                                                        <span className="font-semibold">{analysis.region?.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Total Hosts:</span>
                                                        <span className="font-semibold">{analysis.networkInfo?.totalHosts?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Usable:</span>
                                                        <span className="font-semibold">{analysis.networkInfo?.usableHosts?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* View Tutorials Button */}
                                            <div className="pt-3 border-t border-blue-200">
                                                <Button
                                                    onClick={() => window.open('/tools/modem-tutorials', '_blank')}
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
                        <span className="text-red-600">{error}</span>
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
                                        {customerLookup.serviceType === 'BROADBAND_INTERNET' ? 'Broadband Internet' :
                                         customerLookup.serviceType === 'VPN_DATA_ONLY' ? 'VPN/Data Only' :
                                         customerLookup.serviceType}
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
                                            {customerLookup.customer?.serviceType === 'BROADBAND_INTERNET' ? 'Broadband Internet' :
                                             customerLookup.customer?.serviceType === 'VPN_DATA_ONLY' ? 'VPN/Data Only' :
                                             customerLookup.customer?.serviceType || customerLookup.serviceType}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-blue-500" />
                                        <span className="text-blue-600 font-semibold">
                                            Service Type:{" "}
                                            {customerLookup.serviceType === 'BROADBAND_INTERNET' ? 'Broadband Internet' :
                                             customerLookup.serviceType === 'VPN_DATA_ONLY' ? 'VPN/Data Only' :
                                             customerLookup.serviceType}
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
                                            {customerLookup.customer.accountNumber}
                                    </div>
                                    <div>
                                        <strong>Access Number:</strong>{" "}
                                            {customerLookup.customer.accessNumber || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Customer Name:</strong>{" "}
                                            {customerLookup.customer.customerName}
                                    </div>
                                    <div>
                                        <strong>Location:</strong>{" "}
                                            {customerLookup.customer.location}
                                    </div>
                                    <div>
                                            <strong>Customer Type:</strong>{" "}
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                customerLookup.customer.customerType === 'ENTERPRISE' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {customerLookup.customer.customerType}
                                            </span>
                                    </div>
                                            <div>
                                            <strong>Service Status:</strong>{" "}
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                customerLookup.customer.serviceStatus === 'ACTIVE' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {customerLookup.customer.serviceStatus}
                                            </span>
                                            </div>
                                    </div>

                                    {/* PPPOE Configuration */}
                                    {customerLookup.pppoeConfig && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-green-600">PPPOE Configuration</h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-green-50 p-3 rounded-lg">
                                            <div>
                                                    <strong>Username:</strong>{" "}
                                                    {customerLookup.pppoeConfig.username}
                                            </div>
                                            <div>
                                                    <strong>Password:</strong>{" "}
                                                    {customerLookup.pppoeConfig.password}
                                            </div>
                                                <div>
                                                    <strong>Service Name:</strong>{" "}
                                                    {customerLookup.pppoeConfig.serviceName}
                                </div>
                                                <div>
                                                    <strong>DNS Servers:</strong>{" "}
                                                    {customerLookup.pppoeConfig.dnsServers?.join(', ') || '8.8.8.8, 8.8.4.4'}
                                        </div>
                                </div>
                        </div>
                                    )}

                                    {/* Network Configuration */}
                                    {customerLookup.networkConfig && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-blue-600">Network Configuration</h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-blue-50 p-3 rounded-lg">
                                <div>
                                                    <strong>WAN IP:</strong>{" "}
                                                    {customerLookup.networkConfig.wanIp || 'N/A'}
                                                </div>
                                        <div>
                                                    <strong>Subnet Mask:</strong>{" "}
                                                    {customerLookup.networkConfig.subnetMask || 'N/A'}
                                        </div>
                                        <div>
                                                    <strong>Default Gateway:</strong>{" "}
                                                    {customerLookup.networkConfig.defaultGateway || 'N/A'}
                                        </div>
                                        <div>
                                                    <strong>CIDR:</strong>{" "}
                                                    /{customerLookup.networkConfig.cidr || 'N/A'}
                                        </div>
                                        <div>
                                                    <strong>DNS Servers:</strong>{" "}
                                                    {customerLookup.networkConfig.dnsServers?.join(', ') || '8.8.8.8, 8.8.4.4'}
                                        </div>
                                                {customerLookup.networkConfig.vlanId && (
                                        <div>
                                                        <strong>VLAN ID:</strong>{" "}
                                                        {customerLookup.networkConfig.vlanId}
                                        </div>
                                                )}
                                                {customerLookup.networkConfig.networkElement && (
                                                    <div>
                                                        <strong>Network Element:</strong>{" "}
                                                        {customerLookup.networkConfig.networkElement}
                                    </div>
                                                )}
                                                {customerLookup.networkConfig.needsAssignment && (
                                                    <div className="md:col-span-2">
                                                        <div className="bg-yellow-100 border border-yellow-300 rounded p-2">
                                                            <strong>Note:</strong> {customerLookup.networkConfig.message}
                                </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Router Information */}
                                    {customerLookup.customer?.routerInfo && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-purple-600">Router Information</h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-purple-50 p-3 rounded-lg">
                                <div>
                                                    <strong>Model:</strong>{" "}
                                                    {customerLookup.customer.routerInfo.model || 'N/A'}
                                                </div>
                                        <div>
                                                    <strong>Serial Number:</strong>{" "}
                                                    {customerLookup.customer.routerInfo.serialNumber || 'N/A'}
                                        </div>
                                        <div>
                                                    <strong>MAC Address:</strong>{" "}
                                                    {customerLookup.customer.routerInfo.macAddress || 'N/A'}
                                        </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Technician Information */}
                                    {customerLookup.customer?.technician && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-orange-600">Assigned Technician</h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm bg-orange-50 p-3 rounded-lg">
                                        <div>
                                                    <strong>Name:</strong>{" "}
                                                    {customerLookup.customer.technician.name}
                                        </div>
                                        <div>
                                                    <strong>Employee ID:</strong>{" "}
                                                    {customerLookup.customer.technician.employeeId}
                                        </div>
                                                <div>
                                                    <strong>Contact:</strong>{" "}
                                                    {customerLookup.customer.technician.contact}
                                    </div>
                                </div>
                                        </div>
                                    )}

                                    {/* Router Recommendations */}
                                    {customerLookup.recommendations && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold mb-2 text-green-600">Router Recommendations</h4>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <div className="mb-2">
                                                    <strong>Recommended Model:</strong>{" "}
                                                    {customerLookup.recommendations.routerModel}
                                                </div>
                                                {customerLookup.recommendations.tutorials && customerLookup.recommendations.tutorials.length > 0 && (
                                                    <div>
                                                        <strong>Tutorials:</strong>
                                                        <ul className="mt-1 space-y-1">
                                                            {customerLookup.recommendations.tutorials.map((tutorial: any, index: number) => (
                                                                <li key={index}>
                                                                    <a 
                                                                        href={tutorial.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:underline text-sm"
                                                                    >
                                                                        {tutorial.title} →
                                                                    </a>
                                                                </li>
                                                            ))}
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


            {/* IP Analysis Results */}
            {analysis && (
                <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Analysis Results for {analysis.ip}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-6">
                            {/* Basic Network Information */}
                                <div>
                                <h3 className="text-lg font-semibold mb-3 text-blue-600">
                                    Network Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                        <strong>IP Address:</strong> {analysis.ipAddress}
                                        </div>
                                        <div>
                                        <strong>CIDR:</strong> /{analysis.networkInfo?.cidr}
                                        </div>
                                        <div>
                                        <strong>Subnet Mask:</strong>{" "}
                                        {analysis.networkInfo?.subnetMask}
                                        </div>
                                    <div>
                                        <strong>Network Address:</strong>{" "}
                                        {analysis.networkInfo?.networkAddress}
                                    </div>
                                    <div>
                                        <strong>Broadcast Address:</strong>{" "}
                                        {analysis.networkInfo?.broadcastAddress}
                                </div>
                                    <div>
                                        <strong>Total Hosts:</strong>{" "}
                                        {analysis.networkInfo?.totalHosts?.toLocaleString() || 'N/A'}
                            </div>
                                    <div>
                                        <strong>Usable Hosts:</strong>{" "}
                                        {analysis.networkInfo?.usableHosts?.toLocaleString() || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Usable IP Range:</strong>{" "}
                                        {analysis.networkInfo?.firstUsableIp} - {analysis.networkInfo?.lastUsableIp}
                                    </div>
                                </div>
                            </div>

                            {/* Regional Information */}
                            {analysis.interface && (
                                        <div>
                                    <h3 className="text-lg font-semibold mb-3 text-purple-600">
                                        Regional Information
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-purple-50 p-4 rounded-lg">
                                        <div>
                                            <strong>Interface:</strong>{" "}
                                            {analysis.interface.name}
                                        </div>
                                        <div>
                                            <strong>Region:</strong>{" "}
                                            {analysis.region?.name}
                                        </div>
                                        <div>
                                            <strong>Default Gateway:</strong>{" "}
                                            {analysis.interface.defaultGateway}
                                    </div>
                                        <div>
                                            <strong>Subnet Mask:</strong>{" "}
                                            {analysis.interface.subnetMask}
                                </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t">
                                        <Button
                                    onClick={() => setShowRouterConfig(true)}
                                    variant="outline"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                    Generate Router Config
                                        </Button>
                                        <Button
                                    onClick={() => setShowTutorials(true)}
                                            variant="outline"
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                    View Tutorials
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
                            defaultGateway={analysis.interface?.defaultGateway || analysis.region?.defaultGateway}
                            dnsServers={['8.8.8.8', '8.8.4.4']}
                            onConfigGenerated={(config) => {
                                console.log('Router config generated:', config);
                                toast.success('Router configuration generated successfully');
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
                                Our dedicated Modem Configuration Tutorials page provides access to all video tutorials 
                                from the Yoh-Tech Solutions YouTube channel, with advanced filtering and categorization.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={() => window.open('/tools/modem-tutorials', '_blank')}
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
