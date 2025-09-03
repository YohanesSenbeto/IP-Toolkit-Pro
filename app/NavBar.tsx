"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
    const { data: session, status } = useSession(); // Destructure 'status'
    const isLoading = status === "loading"; // Check if session is still loading

    return (
        <nav className="flex justify-between items-center p-4 bg-gray-100">
            <Link href="/" className="font-bold text-lg">
                IP Toolkit Pro
            </Link>

            <div className="flex gap-4 items-center">
                {/* Show nothing while session is being fetched */}
                {isLoading ? (
                    <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div> // Skeleton loader
                ) : !session ? (
                    <>
                        {/* User is not authenticated */}
                        <Link
                            href="/tools"
                            className="px-3 py-1 text-gray-700 hover:text-gray-900"
                        >
                            Tools
                        </Link>
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
                        {/* User is authenticated */}
                        <Link
                            href="/tools"
                            className="px-3 py-1 text-gray-700 hover:text-gray-900"
                        >
                            Tools
                        </Link>
                        
                        {(session.user.role === "CLIENT" ||
                            session.user.role === "PROVIDER") && (
                            <Link
                                href="/dashboard"
                                className="px-3 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
                            >
                                My Dashboard
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
