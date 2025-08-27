"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

export default function ClientDashboard() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Fetch client requests
    const { data, isLoading } = useQuery({
        queryKey: ["clientRequests", session?.user?.id],
        queryFn: async () => {
            if (!session?.user?.id) return [];
            const res = await fetch("/api/requests");
            const json = await res.json();
            let requests = json.requests || [];

            // Only requests belonging to this client
            requests = requests.filter(
                (r: any) => r.clientId === session.user.id
            );

            // Map providerName and first proposal id & status
            return requests.map((r: any) => ({
                ...r,
                providerName:
                    r.proposals?.[0]?.provider?.user?.name ?? "Pending",
                proposalId: r.proposals?.[0]?.id ?? null,
                proposalStatus: r.proposals?.[0]?.status ?? null,
                proposalPrice: r.proposals?.[0]?.price ?? null,
            }));
        },
        enabled: !!session?.user?.id,
    });

    const requests = data ?? [];

    // Mutation to update proposal status
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
            queryClient.invalidateQueries(["clientRequests"]);
        },
    });

    const columns: ColumnDef<any>[] = [
        { accessorKey: "title", header: "Request Title" },
        { accessorKey: "description", header: "Description" },
        { accessorKey: "providerName", header: "Provider" },
        { accessorKey: "proposalPrice", header: "Proposed Price" },
        { accessorKey: "createdAt", header: "Created Date" },
        {
            accessorKey: "status",
            header: "Request Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge
                        variant={
                            status === "COMPLETED"
                                ? "success"
                                : status === "IN_PROGRESS"
                                ? "warning"
                                : "secondary"
                        }
                    >
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: "proposalStatus",
            header: "Proposal Status",
            cell: ({ row }) => {
                const status = row.original.proposalStatus;
                if (!status) return <span>Pending</span>;

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
                const { proposalId, proposalStatus } = row.original;
                if (!proposalId || proposalStatus !== "PENDING") return null;

                return (
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={() =>
                                updateProposalStatus.mutate({
                                    proposalId,
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
                                    proposalId,
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

    const table = useReactTable({
        data: requests,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (!session) return <p>Please log in to view your dashboard.</p>;
    if (isLoading) return <p>Loading requests...</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Client Dashboard</h1>
                <Link href="/dashboard/client/create-request" passHref>
                    <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        + Create Request
                    </button>
                </Link>
            </div>

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
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
