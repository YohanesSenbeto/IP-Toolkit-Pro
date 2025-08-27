"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

export default function ClientDashboard() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // ✅ Fetch client proposals
    const { data, isLoading } = useQuery({
        queryKey: ["clientProposals", session?.user?.id],
        queryFn: async () => {
            if (!session?.user?.id) return [];
            const res = await fetch("/api/proposals");
            const json = await res.json();
            return json.proposals || [];
        },
        enabled: !!session?.user?.id,
    });

    // ✅ Mutation to update proposal status
    const updateProposalStatus = useMutation({
        mutationFn: async ({
            proposalId,
            action,
        }: {
            proposalId: string;
            action: "ACCEPTED" | "DECLINED";
        }) => {
            const res = await fetch(`/api/proposals/${proposalId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Failed to update proposal");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["clientProposals"]);
        },
    });

    const proposals = data ?? [];

    // ✅ Table columns
    const columns: ColumnDef<any>[] = [
        { accessorKey: "request.title", header: "Request Title" },
        { accessorKey: "request.description", header: "Description" },
        {
            id: "providerName",
            header: "Provider",
            accessorFn: (row) => row.provider?.user?.name ?? "Pending",
        },
        {
            accessorKey: "request.createdAt",
            header: "Created Date",
            cell: ({ row }) =>
                new Date(row.original.request.createdAt).toLocaleString(
                    "en-GB",
                    {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                ),
        },
        { accessorKey: "price", header: "Proposed Price" },
        { accessorKey: "message", header: "Message" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                let variant: "success" | "destructive" | "secondary" =
                    "secondary";
                if (status === "ACCEPTED") variant = "success";
                else if (status === "DECLINED") variant = "destructive";
                return <Badge variant={variant}>{status}</Badge>;
            },
        },
        {
            id: "action",
            header: "Action",
            cell: ({ row }) => {
                const { id, status } = row.original;
                if (status !== "PENDING") return null;

                return (
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={() =>
                                updateProposalStatus.mutate({
                                    proposalId: id,
                                    action: "ACCEPTED",
                                })
                            }
                        >
                            Accept
                        </button>
                        <button
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() =>
                                updateProposalStatus.mutate({
                                    proposalId: id,
                                    action: "DECLINED",
                                })
                            }
                        >
                            Decline
                        </button>
                    </div>
                );
            },
        },
    ];

    // ✅ Initialize React Table
    const table = useReactTable({
        data: proposals,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (!session) return <p>Please log in to view your dashboard.</p>;
    if (isLoading) return <p>Loading proposals...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100">
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-2 text-left border-b font-medium"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-4 py-2 border-b text-sm text-gray-700"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-4 text-gray-500"
                                >
                                    No proposals found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
