"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowLeft } from "lucide-react";

export default function CalculationDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const wanIp = searchParams.get("wanIp");
    const [calculation, setCalculation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!wanIp) return;
        const fetchCalculation = async () => {
            try {
                const response = await fetch(`/api/calculations?wanIp=${wanIp}`);
                if (response.ok) {
                    const data = await response.json();
                    setCalculation(data.calculation);
                }
            } catch (error) {
                setCalculation(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCalculation();
    }, [wanIp]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    if (!calculation) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Calculation Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            Sorry, we couldn't find the calculation you
                            requested.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const result = calculation.result || {};

    return (
        <div className="w-full max-w-screen-md mx-auto px-1 sm:px-4 py-4 md:py-8 text-xs sm:text-sm">
            <Button
                variant="outline"
                onClick={() => router.back()}
                className="mb-4 w-full sm:w-auto"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm sm:text-base">
                        Network Information
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Detailed IP calculation and assignment info
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 text-xs sm:text-sm">
                    {/* Important for Modem/Router Configuration */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-xs sm:text-base mb-2 text-green-900">
                            Important for Modem/Router Configuration
                        </h3>
                        <div className="flex flex-col gap-0.5 w-full max-w-full">
                            <div className="flex flex-col xs:flex-row items-stretch xs:items-center border rounded-t-md overflow-hidden text-xs sm:text-sm">
                                <div className="bg-green-100 font-semibold w-full xs:w-1/2 border-b xs:border-b-0 xs:border-r border-green-200 px-2 py-1 whitespace-pre-line break-words">
                                    WAN IP Address
                                </div>
                                <div
                                    className="px-2 py-1 w-full xs:w-1/2 font-mono bg-white break-all whitespace-pre-line overflow-hidden"
                                    style={{ wordBreak: "break-all" }}
                                >
                                    {calculation.wanIp}
                                </div>
                            </div>
                            <div className="flex flex-col xs:flex-row items-stretch xs:items-center border-l border-r border-green-200 overflow-hidden text-xs sm:text-sm">
                                <div className="bg-green-50 font-semibold w-full xs:w-1/2 border-b xs:border-b-0 xs:border-r border-green-200 px-2 py-1 whitespace-pre-line break-words">
                                    Subnet Mask
                                </div>
                                <div
                                    className="px-2 py-1 w-full xs:w-1/2 font-mono bg-white break-all whitespace-pre-line overflow-hidden"
                                    style={{ wordBreak: "break-all" }}
                                >
                                    {result.subnetMask ||
                                        calculation.subnetMask ||
                                        "N/A"}
                                </div>
                            </div>
                            <div className="flex flex-col xs:flex-row items-stretch xs:items-center border rounded-b-md overflow-hidden text-xs sm:text-sm">
                                <div className="bg-green-50 font-semibold w-full xs:w-1/2 border-b xs:border-b-0 xs:border-r border-green-200 px-2 py-1 whitespace-pre-line break-words">
                                    Default Gateway
                                </div>
                                <div
                                    className="px-2 py-1 w-full xs:w-1/2 font-mono bg-white break-all whitespace-pre-line overflow-hidden"
                                    style={{ wordBreak: "break-all" }}
                                >
                                    {result.defaultGateway ||
                                        calculation.defaultGateway ||
                                        "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* IP Details */}
                    <div className="mb-4 min-w-[320px]">
                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                            IP Details
                        </h3>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                                <span className="font-semibold">
                                    IP Address:
                                </span>{" "}
                                <span className="font-mono">
                                    {calculation.wanIp}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">CIDR:</span>{" "}
                                <span className="font-mono">
                                    /{calculation.cidr}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Subnet Mask:
                                </span>{" "}
                                <span className="font-mono">
                                    {result.subnetMask ||
                                        calculation.subnetMask ||
                                        "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Network Address:
                                </span>{" "}
                                <span className="font-mono">
                                    {result.networkAddress || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Broadcast Address:
                                </span>{" "}
                                <span className="font-mono">
                                    {result.broadcastAddress || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Usable Range */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                            Usable Range
                        </h3>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                                <span className="font-semibold">First IP:</span>{" "}
                                <span className="font-mono">
                                    {result.firstIp || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Last IP:</span>{" "}
                                <span className="font-mono">
                                    {result.lastIp || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Total Hosts:
                                </span>{" "}
                                <span className="font-mono">
                                    {result.totalHosts?.toLocaleString() ||
                                        "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Usable Hosts:
                                </span>{" "}
                                <span className="font-mono">
                                    {result.usableHosts?.toLocaleString() ||
                                        "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Region & Interface Information */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                            Region & Interface Information
                        </h3>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                                <span className="font-semibold">
                                    Region Name:
                                </span>{" "}
                                <span>
                                    {result.regionName ||
                                        calculation.regionName ||
                                        "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Interface:
                                </span>{" "}
                                <span>
                                    {result.interfaceName ||
                                        calculation.interfaceName ||
                                        "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Default Gateway:
                                </span>{" "}
                                <span className="font-mono">
                                    {result.defaultGateway ||
                                        calculation.defaultGateway ||
                                        "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Assignment Status */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                            Assignment Status
                        </h3>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                                <span className="font-semibold">Status:</span>{" "}
                                <span>
                                    {result.assignmentStatus ||
                                        calculation.assignmentStatus ||
                                        "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Customer:</span>{" "}
                                <span>
                                    {result.customerName ||
                                        calculation.customerName ||
                                        "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Account:</span>{" "}
                                <span>
                                    {result.accountNumber ||
                                        calculation.accountNumber ||
                                        "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Location:</span>{" "}
                                <span>
                                    {result.location ||
                                        calculation.location ||
                                        "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Router Recommendations */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                            Router Recommendations
                        </h3>
                        <div className="text-sm">
                            {result.routerRecommendation ||
                                calculation.routerRecommendation ||
                                "No recommendation available"}
                        </div>
                    </div>
                    {/* Tutorial Videos */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                            Tutorial Videos
                        </h3>
                        <div className="flex flex-col gap-2">
                            {(
                                result.tutorialVideos ||
                                calculation.tutorialVideos ||
                                []
                            ).length > 0 ? (
                                (
                                    result.tutorialVideos ||
                                    calculation.tutorialVideos
                                ).map((vid: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={vid.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {vid.title
                                            ? vid.title
                                            : "Watch Tutorial →"}
                                    </a>
                                ))
                            ) : (
                                <span>No tutorial videos available</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
