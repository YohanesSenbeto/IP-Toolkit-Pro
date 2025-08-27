"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RespondRequestPage({
    params,
}: {
    params: { requestId: string };
}) {
    const router = useRouter();
    const { requestId } = params;
    const [responseText, setResponseText] = useState("");

    const handleSubmit = async () => {
        const res = await fetch("/api/proposals", {
            method: "POST",
            body: JSON.stringify({ requestId, message: responseText }),
            headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
            alert("Response sent!");
            router.push("/dashboard/provider");
        } else {
            alert("Failed to send response");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                Respond to Client Request
            </h1>
            <textarea
                className="w-full p-2 border rounded mb-4"
                rows={6}
                placeholder="Write your proposal..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
            />
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSubmit}
            >
                Send Response
            </button>
        </div>
    );
}
