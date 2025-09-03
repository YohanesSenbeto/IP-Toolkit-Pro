"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

export default function ProviderDashboard() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");

    // Fetch requests for provider
    const { data, isLoading } = useQuery({
        queryKey: ["providerRequests", session?.user?.id],
        queryFn: async () => {
            if (!session?.user?.id) return [];
            const res = await fetch("/api/requests");
            const json = await res.json();
            let requests = json.requests || [];

<<<<<<< HEAD
            // Map durationDays and proposalsCount
=======
            // Show requests where provider hasn't submitted proposal
            requests = requests.filter(
                (r: any) =>
                    !r.proposals?.some(
                        (p: any) => p.providerId === session.user.id
                    )
            );

            // Compute durationDays
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
            requests = requests.map((r: any) => {
                const completedDate =
                    r.status === "COMPLETED"
                        ? new Date(r.updatedAt)
                        : new Date();
                const durationDays = Math.floor(
                    (completedDate.getTime() -
                        new Date(r.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                );
<<<<<<< HEAD
                const proposalsCount = r.proposals?.length ?? 0;
                const hasProposed = r.proposals?.some(
                    (p: any) => p.providerId === session.user.id
                );
                return { ...r, durationDays, proposalsCount, hasProposed };
=======
                return {
                    ...r,
                    durationDays,
                    proposalsCount: r.proposals?.length ?? 0,
                };
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
            });

            return requests;
        },
        enabled: !!session?.user?.id,
    });

    const requests = data ?? [];

    // Submit proposal mutation
    const submitProposal = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    price: Number(price),
                    message,
                }),
            });
            if (!res.ok) throw new Error("Failed to submit proposal");
            return res.json();
        },
        onSuccess: () => {
<<<<<<< HEAD
            queryClient.invalidateQueries({ queryKey: ["providerRequests"] });
=======
            queryClient.invalidateQueries(["providerRequests"]);
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
            setSelectedRequest(null);
            setPrice("");
            setMessage("");
        },
    });

    const columns: ColumnDef<any>[] = [
        { accessorKey: "client.name", header: "Client" },
        { accessorKey: "title", header: "Request Title" },
        { accessorKey: "description", header: "Description" },
        { accessorKey: "createdAt", header: "Created Date" },
        { accessorKey: "proposalsCount", header: "Proposals" },
        { accessorKey: "durationDays", header: "Days Since Creation" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const durationDays = row.original.durationDays;
                let variant: "success" | "destructive" | "secondary" =
                    "secondary";

                if (status === "COMPLETED") variant = "success";
                else if (durationDays >= 10) variant = "destructive";

                return (
                    <Badge variant={variant}>
                        {status} {durationDays >= 5 ? `(${durationDays}d)` : ""}
                    </Badge>
                );
            },
        },
        {
            id: "action",
            header: "Action",
<<<<<<< HEAD
            cell: ({ row }) => {
                const { hasProposed } = row.original;
                return !hasProposed ? (
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setSelectedRequest(row.original)}
                    >
                        Respond
                    </button>
                ) : (
                    <Badge variant="secondary">Proposal Submitted</Badge>
                );
            },
=======
            cell: ({ row }) => (
                <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setSelectedRequest(row.original)}
                >
                    Respond
                </button>
            ),
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
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
            <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>

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

            {/* Proposal Form Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            Respond to: {selectedRequest.title}
                        </h2>
                        <div className="mb-2">
                            <label className="block mb-1 font-medium">
                                Price
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">
                                Message (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => submitProposal.mutate()}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
