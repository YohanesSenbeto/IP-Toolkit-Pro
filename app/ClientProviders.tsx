"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export default function ClientProviders({
    children,
    session,
}: {
    children: ReactNode;
    session?: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    );
}
