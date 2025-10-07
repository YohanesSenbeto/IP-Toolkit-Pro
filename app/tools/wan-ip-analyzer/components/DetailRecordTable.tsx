"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

export interface DetailRecord {
    wanIp?: string;
    ipAddress?: string;
    subnetMask?: string;
    defaultGateway?: string;
    gateway?: string;
    cidr?: string | number;
    createdAt?: string | Date;
    routerRecommendation?: string;
    networkAddress?: string;
    broadcastAddress?: string;
    firstIp?: string;
    firstUsableIp?: string;
    lastIp?: string;
    lastUsableIp?: string;
    totalHosts?: number;
    usableHosts?: number;
    regionName?: string;
    region?: string;
    region_name?: string;
    interfaceName?: string;
    interface?: string;
    interfaceType?: string;
    assignmentStatus?: string;
    customerName?: string;
    customer?: string;
    accountNumber?: string;
    account?: string;
    location?: string;
    network_info?: {
        networkAddress?: string;
    };
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
}

interface DetailRecordTableProps {
    detailEntry: DetailRecord;
    analysis: any; // intentionally loose due to existing page typing
    expanded: boolean;
    onToggle: () => void;
}

const DetailRecordTable: React.FC<DetailRecordTableProps> = ({
    detailEntry,
    analysis,
    expanded,
    onToggle,
}) => {
    return (
        <Card className="p-2 md:p-2.5 shadow-sm md:shadow-md card border-border">
            <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-gray-900 dark:text-white m-0 leading-tight text-[12px] md:text-[13px]">
                    Detailed Record
                </h2>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    className="h-6 px-2 text-[11px] rounded border-border dark:border-border/70 dark:text-gray-200 dark:hover:text-white"
                >
                    {expanded ? "Collapse" : "Expand"}
                </Button>
            </div>
            {expanded && (
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
                            {/* Core Section */}
                            <tr className="bg-muted/50">
                                <td
                                    colSpan={2}
                                    className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                                >
                                    Core
                                </td>
                            </tr>
                            <Row
                                label="WAN IP"
                                value={
                                    detailEntry.wanIp ||
                                    detailEntry.ipAddress ||
                                    analysis?.ipAddress ||
                                    "—"
                                }
                                mono
                            />
                            <Row
                                label="Subnet Mask"
                                value={
                                    detailEntry.subnetMask ||
                                    detailEntry.networkInfo?.subnetMask ||
                                    analysis?.networkInfo?.subnetMask ||
                                    analysis?.interface?.subnetMask ||
                                    "—"
                                }
                                mono
                            />
                            <Row
                                label="Default Gateway"
                                value={
                                    detailEntry.defaultGateway ||
                                    detailEntry.gateway ||
                                    analysis?.interface?.defaultGateway ||
                                    "—"
                                }
                                mono
                            />
                            <Row
                                label="CIDR"
                                value={
                                    detailEntry.cidr
                                        ? `/${detailEntry.cidr}`
                                        : detailEntry.networkInfo?.cidr
                                        ? `/${detailEntry.networkInfo.cidr}`
                                        : analysis?.networkInfo?.cidr
                                        ? `/${analysis.networkInfo.cidr}`
                                        : "—"
                                }
                                mono
                            />
                            <Row
                                label="Analyzed At"
                                value={
                                    detailEntry.createdAt
                                        ? new Date(
                                              detailEntry.createdAt
                                          ).toLocaleString()
                                        : "—"
                                }
                            />
                            <Row
                                label="Router Recommendation"
                                value={detailEntry.routerRecommendation || "—"}
                            />

                            {/* Network Range */}
                            <SectionHeader title="Network Range" />
                            <Row
                                label="Network Address"
                                value={
                                    detailEntry.networkAddress ||
                                    detailEntry.network_info?.networkAddress ||
                                    detailEntry.networkInfo?.networkAddress ||
                                    analysis?.networkInfo?.networkAddress ||
                                    "—"
                                }
                                mono
                            />
                            <Row
                                label="Broadcast Address"
                                value={
                                    detailEntry.broadcastAddress ||
                                    detailEntry.networkInfo?.broadcastAddress ||
                                    analysis?.networkInfo?.broadcastAddress ||
                                    "—"
                                }
                                mono
                            />
                            <Row
                                label="First IP"
                                value={
                                    detailEntry.firstIp ||
                                    detailEntry.firstUsableIp ||
                                    detailEntry.networkInfo?.firstUsableIp ||
                                    analysis?.networkInfo?.firstUsableIp ||
                                    "—"
                                }
                                mono
                            />
                            <Row
                                label="Last IP"
                                value={
                                    detailEntry.lastIp ||
                                    detailEntry.lastUsableIp ||
                                    detailEntry.networkInfo?.lastUsableIp ||
                                    analysis?.networkInfo?.lastUsableIp ||
                                    "—"
                                }
                                mono
                            />
                            <Row
                                label="Total Hosts"
                                value={
                                    (
                                        detailEntry.totalHosts ??
                                        detailEntry.networkInfo?.totalHosts ??
                                        analysis?.networkInfo?.totalHosts
                                    )?.toLocaleString?.() || "—"
                                }
                            />
                            <Row
                                label="Usable Hosts"
                                value={
                                    (
                                        detailEntry.usableHosts ??
                                        detailEntry.networkInfo?.usableHosts ??
                                        analysis?.networkInfo?.usableHosts
                                    )?.toLocaleString?.() || "—"
                                }
                            />

                            {/* Region & Interface */}
                            <SectionHeader title="Region & Interface" />
                            <Row
                                label="Region"
                                value={
                                    detailEntry.regionName ||
                                    detailEntry.region ||
                                    detailEntry.region_name ||
                                    analysis?.region?.name ||
                                    "—"
                                }
                            />
                            <Row
                                label="Interface"
                                value={
                                    detailEntry.interfaceName ||
                                    detailEntry.interface ||
                                    detailEntry.interfaceType ||
                                    analysis?.interface?.name ||
                                    "—"
                                }
                            />

                            {/* Assignment */}
                            <SectionHeader title="Assignment" />
                            <Row
                                label="Status"
                                value={detailEntry.assignmentStatus || "—"}
                            />
                            <Row
                                label="Customer"
                                value={
                                    detailEntry.customerName ||
                                    detailEntry.customer ||
                                    "—"
                                }
                            />
                            <Row
                                label="Account #"
                                value={
                                    detailEntry.accountNumber ||
                                    detailEntry.account ||
                                    "—"
                                }
                            />
                            <Row
                                label="Location"
                                value={detailEntry.location || "—"}
                            />
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

const SectionHeader = ({ title }: { title: string }) => (
    <tr className="bg-muted/50">
        <td
            colSpan={2}
            className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
        >
            {title}
        </td>
    </tr>
);

const Row = ({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) => (
    <tr>
        <td className="font-semibold px-3 py-2 border w-40">{label}</td>
        <td className={`px-3 py-2 border break-all ${mono ? "font-mono" : ""}`}>
            {value}
        </td>
    </tr>
);

export default DetailRecordTable;
