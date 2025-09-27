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
    const id = searchParams.get("id");
    const [calculation, setCalculation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchCalculation = async () => {
            try {
                const response = await fetch(`/api/calculations?id=${id}`);
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
    }, [id]);

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
                    <CardTitle>Network Information</CardTitle>
                    <CardDescription>
                        Detailed IP calculation and assignment info
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">
                            IP Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">
                            Usable Range
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">
                            Region & Interface Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">
                            Assignment Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">
                            Router Recommendations
                        </h3>
                        <div className="text-sm">
                            {result.routerRecommendation ||
                                calculation.routerRecommendation ||
                                "No recommendation available"}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">
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
                                        Watch Tutorial →
                                    </a>
                                ))
                            ) : (
                                <span>No tutorial videos available</span>
                            )}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">
                            Knowledge Base Articles
                        </h3>
                        <div className="text-sm">
                            {(
                                result.knowledgeBaseArticles ||
                                calculation.knowledgeBaseArticles ||
                                []
                            ).length > 0 ? (
                                (
                                    result.knowledgeBaseArticles ||
                                    calculation.knowledgeBaseArticles
                                ).map((art: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={art.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {art.title}
                                    </a>
                                ))
                            ) : (
                                <span>
                                    No knowledge base articles available
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
