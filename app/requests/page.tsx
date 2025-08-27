"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function RequestsPage() {
    const { data: session } = useSession();
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        const res = await fetch("/api/requests");
        const data = await res.json();
        setRequests(data.requests || []);
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Requests</h1>
            {requests.map((req) => (
                <div key={req.id} className="border p-4 mb-3 rounded">
                    <p>
                        <strong>{req.title}</strong>
                    </p>
                    <p>{req.description}</p>
                    <p>
                        Created at: {new Date(req.createdAt).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
