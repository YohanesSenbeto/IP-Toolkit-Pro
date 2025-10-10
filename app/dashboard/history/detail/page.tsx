"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Fetch entry from backend by id or wanIp param in URL
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    useEffect(() => {
        const wanIp = searchParams.get("wanIp");
        if (!wanIp) {
            setLoading(false);
            setEntry(null);
            setErrorMsg(null);
            return;
        }
        setLoading(true);
        fetch(`/api/wan-ip/history/detail?wanIp=${encodeURIComponent(wanIp)}`)
            .then(async (res) => {
                const data = await res.json();
                if (res.ok && data.entry) {
                    setEntry(data.entry);
                    setErrorMsg(null);
                } else {
                    setEntry(null);
                    setErrorMsg(data.error || "Entry not found.");
                }
            })
            .catch(() => {
                setEntry(null);
                setErrorMsg("Failed to fetch data. Please try again.");
            })
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
                {errorMsg ? errorMsg : "Entry not found."}
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
                {/* Navigation / Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto"
                    >
                        ← Back
                    </Button>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full sm:w-auto"
                        >
                            Dashboard
                        </Button>
                    </Link>
                    <Link
                        href="/tools/wan-ip-analyzer"
                        className="w-full sm:w-auto"
                    >
                        <Button type="button" className="w-full sm:w-auto">
                            Open WAN IP Analyzer
                        </Button>
                    </Link>
                </div>
                {/* Essentials Bar */}
                <div className="mb-4 grid gap-3 md:grid-cols-3 bg-card/60 border border-border rounded-md p-3 shadow-sm">
                    {[
                        {
                            label: "WAN IP",
                            value:
                                entry.wanIp || poolInfo?.interface?.ipPoolStart,
                        },
                        {
                            label: "Subnet Mask",
                            value:
                                entry.subnetMask ||
                                poolInfo?.interface?.subnetMask,
                        },
                        {
                            label: "Default Gateway",
                            value:
                                entry.defaultGateway ||
                                poolInfo?.interface?.defaultGateway ||
                                poolInfo?.pool?.defaultGateway,
                        },
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col gap-1">
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                                {item.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm break-all font-semibold text-green-700 dark:text-green-400">
                                    {item.value ? (
                                        item.value
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </span>
                                {item.value && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                item.value
                                            )
                                        }
                                        className="text-xs px-2 py-1 border border-border rounded hover:bg-secondary/30 transition-colors"
                                        aria-label={`Copy ${item.label}`}
                                    >
                                        Copy
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Card */}
                <div className="mb-6 border rounded-md p-4 bg-card text-foreground shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h2 className="text-lg font-semibold">
                            WAN IP Analysis Summary
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                type="button"
                                variant={showAdvanced ? "outline" : "default"}
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="px-4 py-2 text-sm"
                            >
                                {showAdvanced
                                    ? "Hide Advanced"
                                    : "Show Advanced"}
                            </Button>
                            <Link href="/tools/wan-ip-analyzer">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="px-4 py-2 text-sm"
                                >
                                    Analyze Another
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="font-semibold">WAN IP (User)</div>
                            <div className="font-mono break-all text-green-700 font-bold">
                                {entry.wanIp || (
                                    <span className="text-gray-400">—</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold">
                                Subnet (Resolved)
                            </div>
                            <div className="font-mono break-all text-green-700 font-bold">
                                {entry.subnetMask ||
                                    poolInfo?.interface?.subnetMask || (
                                        <span className="text-gray-400">—</span>
                                    )}
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold">
                                Gateway (Resolved)
                            </div>
                            <div className="font-mono break-all text-green-700 font-bold">
                                {entry.defaultGateway ||
                                    poolInfo?.interface?.defaultGateway ||
                                    poolInfo?.pool?.defaultGateway || (
                                        <span className="text-gray-400">—</span>
                                    )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground flex flex-wrap gap-4">
                        <span>
                            <span className="font-semibold">Analyzed:</span>{" "}
                            {dateTime}
                        </span>
                        <span>
                            <span className="font-semibold">Region:</span>{" "}
                            {entry.regionName ||
                                entry.region ||
                                entry.region_name || (
                                    <span className="text-gray-400">—</span>
                                )}
                        </span>
                        <span>
                            <span className="font-semibold">Interface:</span>{" "}
                            {entry.interfaceName ||
                                entry.interface ||
                                entry.interface_name ||
                                entry.interfaceType || (
                                    <span className="text-gray-400">—</span>
                                )}
                        </span>
                    </div>
                </div>

                {/* Date/Time (kept for legacy layout, could remove) */}
                <div className="mb-4 text-right text-sm text-gray-500 content-left">
                    <span className="font-semibold">Analyzed At:</span>{" "}
                    {dateTime}
                </div>

                {/* Router Recommendations */}
                <div className="mb-4">
                    <div className="text-sm">
                        {display(entry.routerRecommendation) || (
                            <span className="text-gray-400">
                                No recommendation available
                            </span>
                        )}
                    </div>
                </div>

                {/* WAN IP, Subnet Mask, Default Gateway Table (Advanced) */}
                {showAdvanced && (
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
                                                    poolInfo?.interface
                                                        ?.ipPoolStart
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold border px-2 py-2">
                                            Subnet Mask
                                        </td>
                                        <td className="font-mono border px-2 py-2 text-green-700 font-bold">
                                            {display(
                                                poolInfo?.interface
                                                    ?.subnetMask ||
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
                                                poolInfo?.interface
                                                    ?.defaultGateway
                                                    ? poolInfo.interface
                                                          .defaultGateway
                                                    : poolInfo?.pool
                                                          ?.defaultGateway
                                                    ? poolInfo.pool
                                                          .defaultGateway
                                                    : undefined
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Unified Advanced Details Table (rest - Advanced) */}
                {showAdvanced && (
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
                                                    poolInfo?.interface
                                                        ?.ipPoolEnd,
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
                                                    poolInfo?.interface
                                                        ?.regionName,
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
                )}
            </div>
        </div>
    );
}

export default function CalculationDetailPage() {
    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <Suspense
                fallback={
                    <div className="p-8 text-center text-lg text-foreground">
                        Loading...
                    </div>
                }
            >
                <CalculationDetailContent />
            </Suspense>
        </div>
    );
}
