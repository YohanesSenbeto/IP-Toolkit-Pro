"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            {!session ? (
                <>
                    <h1>You are not signed in</h1>
                    <button
                        onClick={() => signIn()}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Sign in
                    </button>
                </>
            ) : (
                <>
                    <h1>Hello, {session.user?.name}</h1>
                    <p>Your role: {session.user?.role}</p>
                    <button
                        onClick={() => signOut()}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Sign out
                    </button>
                </>
            )}
        </div>
    );
}
