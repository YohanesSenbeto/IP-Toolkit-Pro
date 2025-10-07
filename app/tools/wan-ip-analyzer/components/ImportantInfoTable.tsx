"use client";
import React from "react";
import { Card } from "@/components/ui/card";

interface Props {
    wanIp?: string;
    subnetMask?: string;
    defaultGateway?: string;
}

export const ImportantInfoTable: React.FC<Props> = ({
    wanIp,
    subnetMask,
    defaultGateway,
}) => {
    return (
        <Card className="p-2.5 md:p-3 shadow-sm md:shadow-md card border-border relative">
            <h2 className="font-semibold mb-2 text-gray-900 dark:text-white leading-tight text-[13px] md:text-sm">
                Important Info for Modem Configuration
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
                                Essentials
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border w-40">
                                WAN IP
                            </td>
                            <td className="font-mono px-3 py-2 border break-all">
                                {wanIp || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                Subnet Mask
                            </td>
                            <td className="font-mono px-3 py-2 border break-all">
                                {subnetMask || "—"}
                            </td>
                        </tr>
                        <tr>
                            <td className="font-semibold px-3 py-2 border">
                                Default Gateway
                            </td>
                            <td className="font-mono px-3 py-2 border break-all">
                                {defaultGateway || "—"}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ImportantInfoTable;
