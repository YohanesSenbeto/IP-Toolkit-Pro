"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function NavBar() {
    const { data: session } = useSession();

    // Fetch requests for client or provider
    const requestsQuery = useQuery({
        queryKey: ["requestsCount", session?.user?.id],
        queryFn: async () => {
            if (!session) return 0;
            const res = await fetch(`/api/requests`);
            const data = await res.json();
            let requests = data.requests || [];

            if (session.user.role === "PROVIDER") {
                // Only show requests without provider's proposal
                requests = requests.filter(
                    (req: any) =>
                        !req.proposals?.some(
                            (p: any) => p.providerId === session.user.id
                        )
                );
            } else if (session.user.role === "CLIENT") {
                // Only show requests created by the client
                requests = requests.filter(
                    (req: any) => req.clientId === session.user.id
                );
            }

            return requests.length;
        },
        enabled: !!session,
        refetchInterval: 5000, // optional: refresh count periodically
    });

    const requestsCount = requestsQuery.data ?? 0;

    return (
        <nav className="flex justify-between items-center p-4 bg-gray-100">
            <Link href="/" className="font-bold text-lg">
                Addis Solution Hub
            </Link>

            <div className="flex gap-4 items-center">
                {!session ? (
                    <>
                        <button
                            onClick={() => signIn()}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Sign in
                        </button>
                        <Link
                            href="/auth/signup"
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        {(session.user.role === "CLIENT" ||
                            session.user.role === "PROVIDER") && (
                            <Link
                                href={
                                    session.user.role === "CLIENT"
                                        ? "/dashboard/client"
                                        : "/dashboard/provider"
                                }
                                className="relative px-3 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
                            >
                                My Dashboard
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {requestsCount}
                                </span>
                            </Link>
                        )}

                        <span className="mr-4 font-medium">
                            {session.user?.name}
                        </span>

                        <button
                            onClick={() => signOut()}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Sign out
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
