"use client";
import React from "react";
import { Card } from "@/components/ui/card";

interface NetworkInfo {
    cidr?: string | number;
    subnetMask?: string;
    networkAddress?: string;
    broadcastAddress?: string;
    firstUsableIp?: string;
    lastUsableIp?: string;
    totalHosts?: number;
    usableHosts?: number;
}

interface Props {
    networkInfo?: NetworkInfo | null;
}

const NetworkInfoTable: React.FC<Props> = ({ networkInfo }) => {
    if (!networkInfo) return null;
    return (
        <Card className="p-2.5 md:p-3 shadow-sm md:shadow-md card border-border">
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-white leading-tight text-[13px] md:text-sm">
                Network Info
            </h2>
            <div className="overflow-x-auto -mx-1 md:mx-0">
                <table className="w-full text-xs md:text-sm border responsive-table table-strong-lines">
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
                        <tr className="bg-muted/50">
                            <td
                                colSpan={2}
                                className="px-3 py-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground"
                            >
                                Range & Capacity
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border w-40">
                                CIDR
                            </td>
                            <td className="font-mono px-3 py-2 border">
                                {networkInfo.cidr
                                    ? `/${networkInfo.cidr}`
                                    : "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                Network Address
                            </td>
                            <td className="font-mono px-3 py-2 border break-all">
                                {networkInfo.networkAddress || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                Broadcast Address
                            </td>
                            <td className="font-mono px-3 py-2 border break-all">
                                {networkInfo.broadcastAddress || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                First Usable IP
                            </td>
                            <td className="font-mono px-3 py-2 border break-all">
                                {networkInfo.firstUsableIp || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                Last Usable IP
                            </td>
                            <td className="font-mono px-3 py-2 border break-all">
                                {networkInfo.lastUsableIp || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                Total Hosts
                            </td>
                            <td className="px-3 py-2 border">
                                {networkInfo.totalHosts?.toLocaleString?.() ||
                                    "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                Usable Hosts
                            </td>
                            <td className="px-3 py-2 border">
                                {networkInfo.usableHosts?.toLocaleString?.() ||
                                    "—"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default NetworkInfoTable;
