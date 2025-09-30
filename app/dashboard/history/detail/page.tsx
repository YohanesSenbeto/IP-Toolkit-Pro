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
    const [entry, setEntry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [poolInfo, setPoolInfo] = useState<any>(null);
    const [poolLoading, setPoolLoading] = useState(false);

    // Fetch entry from backend by id param in URL
    useEffect(() => {
        const id = searchParams.get("id");
        if (!id) {
            setLoading(false);
            setEntry(null);
            return;
        }
        setLoading(true);
        fetch(`/api/wan-ip/history/detail?id=${encodeURIComponent(id)}`)
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setEntry(data.entry);
                } else {
                    setEntry(null);
                }
            })
            .catch(() => setEntry(null))
            .finally(() => setLoading(false));
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
        if (entry && entry.wanIp) {
            fetchPoolInfo(entry.wanIp);
        }
    }, [entry]);

    if (loading) {
        return <div className="p-8 text-center text-lg">Loading...</div>;
    }
    if (!entry) {
        return (
            <div className="p-8 text-center text-lg text-red-600">
                Entry not found.
            </div>
        );
    }

    // Helper for displaying empty fields as em-dash
    const display = (val: any) => {
        if (val === undefined || val === null || val === "" || val === "N/A")
            return <span className="text-gray-400">—</span>;
        return val;
    };

    // Prefer poolInfo/interface data for network fields if available
    const getField = (primary: any, secondary: any) => {
        if (
            primary !== undefined &&
            primary !== null &&
            primary !== "" &&
            primary !== "N/A"
        )
            return primary;
        if (
            secondary !== undefined &&
            secondary !== null &&
            secondary !== "" &&
            secondary !== "N/A"
        )
            return secondary;
        return undefined;
    };

    // Format date/time
    const dateTime = entry.createdAt ? (
        new Date(entry.createdAt).toLocaleString()
    ) : (
        <span className="text-gray-400">—</span>
    );

    return (
        <div>
            <div className="w-full max-w-screen-lg mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-10">
                {/* Date/Time */}
                <div className="mb-4 text-right text-sm text-gray-500 content-left">
                    <span className="font-semibold">Analyzed At:</span>{" "}
                    {dateTime}
                </div>

                {/* Router Recommendations */}
                <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">
                        Router Recommendations
                    </h3>
                    <div className="text-sm">
                        {display(entry.routerRecommendation) || (
                            <span className="text-gray-400">
                                No recommendation available
                            </span>
                        )}
                    </div>
                </div>

                {/* WAN IP, Subnet Mask, Default Gateway Table */}
                <div className="mb-4">
                    <h3 className="font-bold text-lg mb-2 text-green-700">
                        Important for Modem/Router Configuration
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-[350px] border text-base">
                            <tbody className="text-sm ">
                                <tr>
                                    <td className="font-bold border px-2 py-2">
                                        WAN IP Address
                                    </td>
                                    <td className="font-mono border px-2 py-2 text-green-700 font-bold">
                                        {display(
                                            entry.wanIp ||
                                                poolInfo?.interface?.ipPoolStart
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold border px-2 py-2">
                                        Subnet Mask
                                    </td>
                                    <td className="font-mono border px-2 py-2 text-green-700 font-bold">
                                        {display(
                                            poolInfo?.interface?.subnetMask ||
                                                entry.subnetMask
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold border px-2 py-2">
                                        Default Gateway
                                    </td>
                                    <td className="font-mono border px-2 py-2 text-green-700 font-bold">
                                        {display(
                                            poolInfo?.interface?.defaultGateway
                                                ? poolInfo.interface
                                                      .defaultGateway
                                                : poolInfo?.pool?.defaultGateway
                                                ? poolInfo.pool.defaultGateway
                                                : undefined
                                        )}
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
                                        {getField(
                                            entry.cidr,
                                            poolInfo?.interface?.cidr
                                        ) ? (
                                            `/${getField(
                                                entry.cidr,
                                                poolInfo?.interface?.cidr
                                            )}`
                                        ) : (
                                            <span className="text-gray-400">
                                                —
                                            </span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Network Address
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface
                                                    ?.networkAddress,
                                                entry.networkAddress
                                            )
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Broadcast Address
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface
                                                    ?.broadcastAddress,
                                                entry.broadcastAddress
                                            )
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        First IP
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface
                                                    ?.ipPoolStart,
                                                entry.firstIp
                                            )
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Last IP
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface?.ipPoolEnd,
                                                entry.lastIp
                                            )
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Total Hosts
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface?.totalHosts?.toLocaleString?.() ||
                                                    poolInfo?.interface
                                                        ?.totalHosts,
                                                entry.totalHosts?.toLocaleString?.() ||
                                                    entry.totalHosts
                                            )
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Usable Hosts
                                    </td>
                                    <td className="font-mono border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface?.usableHosts?.toLocaleString?.() ||
                                                    poolInfo?.interface
                                                        ?.usableHosts,
                                                entry.usableHosts?.toLocaleString?.() ||
                                                    entry.usableHosts
                                            )
                                        )}
                                    </td>
                                </tr>
                                {/* Region & Interface Info (minus Default Gateway) */}
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Region Name
                                    </td>
                                    <td className="border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface?.regionName,
                                                entry.regionName ||
                                                    entry.region ||
                                                    entry.region_name
                                            )
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Interface
                                    </td>
                                    <td className="border px-2 py-1">
                                        {display(
                                            getField(
                                                poolInfo?.interface?.name,
                                                entry.interfaceName ||
                                                    entry.interface ||
                                                    entry.interface_name ||
                                                    entry.interfaceType
                                            )
                                        )}
                                    </td>
                                </tr>
                                {/* Assignment Status */}
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Assignment Status
                                    </td>
                                    <td className="border px-2 py-1">
                                        {display(entry.assignmentStatus)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Customer
                                    </td>
                                    <td className="border px-2 py-1">
                                        {display(entry.customerName)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Account
                                    </td>
                                    <td className="border px-2 py-1">
                                        {display(entry.accountNumber)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold border px-2 py-1">
                                        Location
                                    </td>
                                    <td className="border px-2 py-1">
                                        {display(entry.location)}
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
        <Suspense
            fallback={<div className="p-8 text-center text-lg">Loading...</div>}
        >
            <CalculationDetailContent />
        </Suspense>
    );
}
