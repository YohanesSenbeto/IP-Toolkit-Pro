"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProposalsPage() {
    const { data: session } = useSession();
    const [requests, setRequests] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [price, setPrice] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        const res = await fetch("/api/requests");
        const data = await res.json();
        setRequests(data.requests || []);
    }

    async function submitProposal(requestId: string) {
        if (!price) return;
        await fetch("/api/proposals", {
            method: "POST",
            body: JSON.stringify({ requestId, price: Number(price) }),
        });
        alert("Proposal submitted!");
        setPrice("");
    }

    async function fetchProposals(requestId: string) {
        const res = await fetch(`/api/proposals?requestId=${requestId}`);
        const data = await res.json();
        setProposals(data.proposals || []);
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold mb-4">Proposals</h1>
            {requests.map((req) => (
                <div key={req.id} className="border p-3 rounded">
                    <p>
                        <strong>{req.title}</strong> - {req.description}
                    </p>
                    {session?.user?.role === "PROVIDER" && (
                        <div className="mt-2">
                            <input
                                type="number"
                                placeholder="Proposal Price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="border px-2 py-1 mr-2"
                            />
                            <button
                                onClick={() => submitProposal(req.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                                Submit Proposal
                            </button>
                        </div>
                    )}
                    {session?.user?.role === "CLIENT" && (
                        <button
                            onClick={() => fetchProposals(req.id)}
                            className="bg-purple-600 text-white px-3 py-1 mt-2 rounded"
                        >
                            View Proposals
                        </button>
                    )}
                </div>
            ))}
            {proposals.length > 0 && (
                <div className="mt-4 border p-3 rounded">
                    <h2 className="font-bold">
                        Proposals for Selected Request
                    </h2>
                    {proposals.map((p) => (
                        <div key={p.id} className="p-2 border-b">
                            <p>Price: ${p.price}</p>
                            <p>Provider: {p.provider?.user?.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
