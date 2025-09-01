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

<<<<<<< HEAD
type ProposalStatusType = "PENDING" | "ACCEPTED" | "DECLINED" | null;

interface RequestWithProposal {
    id: string;
    title: string;
    description: string;
    status: string;
    clientId: string;
    createdAt: string;
    durationDays: number;
    providerName: string;
    proposalId: string | null;
    proposalStatus: ProposalStatusType;
    proposalPrice: number | null;
}

=======
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
export default function ClientDashboard() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Fetch client requests
<<<<<<< HEAD
    const { data, isLoading } = useQuery<RequestWithProposal[]>({
        queryKey: ["clientRequests", session?.user?.id],
        queryFn: async () => {
            if (!session?.user?.id) return [];

            const res = await fetch("/api/requests");
            if (!res.ok) throw new Error("Failed to fetch requests");

            const json = await res.json();
            const requests: RequestWithProposal[] = json.requests ?? [];
            return requests;
=======
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
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
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
<<<<<<< HEAD
            queryClient.invalidateQueries({ queryKey: ["clientRequests"] });
        },
    });

    // Table columns
    const columns: ColumnDef<RequestWithProposal>[] = [
=======
            queryClient.invalidateQueries(["clientRequests"]);
        },
    });

    const columns: ColumnDef<any>[] = [
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
        { accessorKey: "title", header: "Request Title" },
        { accessorKey: "description", header: "Description" },
        { accessorKey: "providerName", header: "Provider" },
        { accessorKey: "proposalPrice", header: "Proposed Price" },
<<<<<<< HEAD
        { accessorKey: "durationDays", header: "Age (days)" },
=======
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
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

<<<<<<< HEAD
                const isProcessing = updateProposalStatus.status === "pending";

                return (
                    <div className="flex gap-2">
                        <button
                            disabled={isProcessing}
                            className={`px-2 py-1 rounded text-white ${
                                isProcessing
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600"
                            }`}
=======
                return (
                    <div className="flex gap-2">
                        <button
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
                            onClick={() =>
                                updateProposalStatus.mutate({
                                    proposalId,
                                    action: "ACCEPTED",
                                })
                            }
                        >
<<<<<<< HEAD
                            {isProcessing ? "Processing..." : "Accept"}
                        </button>
                        <button
                            disabled={isProcessing}
                            className={`px-2 py-1 rounded text-white ${
                                isProcessing
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-600"
                            }`}
=======
                            Accept
                        </button>
                        <button
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
                            onClick={() =>
                                updateProposalStatus.mutate({
                                    proposalId,
                                    action: "DECLINED",
                                })
                            }
                        >
<<<<<<< HEAD
                            {isProcessing ? "Processing..." : "Decline"}
=======
                            Decline
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
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
