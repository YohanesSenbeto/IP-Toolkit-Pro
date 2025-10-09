"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

export interface CustomerLookupResultProps {
    customerId?: string;
    name?: string;
    phone?: string;
}

interface CustomerInfoTableProps {
    customer: CustomerLookupResultProps;
    detailBasePath?: string; // e.g. /dashboard/history/detail
    dense?: boolean;
}

const CustomerInfoTable: React.FC<CustomerInfoTableProps> = ({
    customer,
    detailBasePath = "/dashboard/history/detail",
    dense = true,
}) => {
    const showDetail = Boolean(customer.customerId);
    return (
        <Card
            className={`p-4 shadow-lg card border-border mt-4 ${
                dense ? "" : "md:p-5"
            }`}
        >
            <h2 className="font-bold mb-2 text-gray-900 dark:text-white">
                Customer Info
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
                                Customer
                            </td>
                        </tr>
                        <Row
                            label="Customer ID"
                            value={customer.customerId || "—"}
                        />
                        <Row label="Name" value={customer.name || "—"} />
                        <Row label="Phone" value={customer.phone || "—"} />
                    </tbody>
                </table>
            </div>
            {showDetail && (
                <div className="mt-3 flex justify-end">
                    <a
                        href={`${detailBasePath}?id=${customer.customerId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium px-6 py-2 rounded-md">
                            Detail
                        </Button>
                    </a>
                </div>
            )}
        </Card>
    );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <tr>
        <td className="font-semibold px-3 py-2 border">{label}</td>
        <td className="px-3 py-2 border break-all">{value}</td>
    </tr>
);

export default CustomerInfoTable;
