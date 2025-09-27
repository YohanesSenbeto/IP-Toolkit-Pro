"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../../../../components/ui/dialog";
import { toast } from "sonner";

function CalculationDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [calculation, setCalculation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [poolInfo, setPoolInfo] = useState<any>(null);
    const [poolLoading, setPoolLoading] = useState(false);

    useEffect(() => {
        const tempKey = searchParams.get("tempKey");
        if (tempKey && typeof window !== "undefined") {
            const raw = sessionStorage.getItem(tempKey);
            if (raw) {
                try {
                    setCalculation(JSON.parse(raw));
                } catch {
                    setCalculation(null);
                }
            }
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        async function fetchPoolInfo(ip: string) {
            setPoolLoading(true);
            try {
                const res = await fetch(
                    `/api/wan-ip/pool-info?ip=${encodeURIComponent(ip)}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setPoolInfo(data);
                } else {
                    setPoolInfo(null);
                }
            } catch (e) {
                setPoolInfo(null);
            } finally {
                setPoolLoading(false);
            }
        }
        if (calculation && calculation.wanIp) {
            fetchPoolInfo(calculation.wanIp);
        }
    }, [calculation]);

    if (loading) {
        return <div className="p-8 text-center text-lg">Loading...</div>;
    }

    return (
        <div>
            <div className="container mx-auto px-4 py-8">
                {/* Save Calculation Dialog */}
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Save This Calculation?</DialogTitle>
                            <DialogDescription>
                                This data is important for your records. Would
                                you like to save this WAN IP analysis?
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

                {/* Router Recommendations */}
                <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">
                        Router Recommendations
                    </h3>
                    <div className="text-sm">
                        {calculation?.routerRecommendation ||
                            "No recommendation available"}
                    </div>
                </div>

                {/* WAN IP, Subnet Mask, Default Gateway Table */}
                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 text-green-700">
                        Important for Modem/Router Configuration
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-[350px] border text-base">
                            <tbody>
                                <tr>
                                    <td className="font-bold border px-2 py-2">
                                        WAN IP Address
                                    </td>
                                    <td className="font-mono border px-2 py-2 text-green-700 font-bold">
                                        {calculation?.wanIp ||
                                            poolInfo?.interface?.ipPoolStart ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold border px-2 py-2">
                                        Subnet Mask
                                    </td>
                                    <td className="font-mono border px-2 py-2 text-green-700 font-bold">
                                        {poolInfo?.interface?.subnetMask ||
                                            calculation?.subnetMask ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold border px-2 py-2">
                                        Default Gateway
                                    </td>
                                    <td className="font-mono border px-2 py-2 text-green-700 font-bold">
                                        {poolInfo?.interface?.defaultGateway
                                            ? poolInfo.interface.defaultGateway
                                            : poolInfo?.pool?.defaultGateway
                                            ? poolInfo.pool.defaultGateway
                                            : "N/A"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unified Advanced Details Table (rest) */}
                <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">
                        IP, Network, Region & Assignment Details
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                            <tbody>
                                {/* IP & Network Info (minus WAN IP, Subnet Mask, Default Gateway) */}
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        CIDR
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        /{calculation?.cidr || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Network Address
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {calculation?.networkAddress || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Broadcast Address
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {calculation?.broadcastAddress || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        First IP
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {poolInfo?.interface?.ipPoolStart ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Last IP
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {poolInfo?.interface?.ipPoolEnd ||
                                            calculation?.lastIp ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Total Hosts
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {calculation?.totalHosts?.toLocaleString() ||
                                            "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Usable Hosts
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {calculation?.usableHosts?.toLocaleString() ||
                                            "N/A"}
                                    </td>
                                </tr>
                                {/* Region & Interface Info (minus Default Gateway) */}
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Region Name
                                    </td>
                                    <td className="border px-2 py-1">
                                        {poolInfo?.interface?.regionName
                                            ? poolInfo.interface.regionName
                                            : calculation?.regionName ||
                                              calculation?.region ||
                                              calculation?.region_name ||
                                              "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Interface
                                    </td>
                                    <td className="border px-2 py-1">
                                        {poolInfo?.interface?.name
                                            ? poolInfo.interface.name
                                            : calculation?.interfaceName ||
                                              calculation?.interface ||
                                              calculation?.interface_name ||
                                              calculation?.interfaceType ||
                                              "N/A"}
                                    </td>
                                </tr>
                                {/* Assignment Status */}
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Assignment Status
                                    </td>
                                    <td className="border px-2 py-1">
                                        {calculation?.assignmentStatus || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Customer
                                    </td>
                                    <td className="border px-2 py-1">
                                        {calculation?.customerName || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Account
                                    </td>
                                    <td className="border px-2 py-1">
                                        {calculation?.accountNumber || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Location
                                    </td>
                                    <td className="border px-2 py-1">
                                        {calculation?.location || "N/A"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CalculationDetailPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-lg">Loading...</div>}>
            <CalculationDetailContent />
        </Suspense>
    );
}
