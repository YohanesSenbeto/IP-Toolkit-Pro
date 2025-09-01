"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
<<<<<<< HEAD
=======
import type { Session } from "next-auth";
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
import { ReactNode } from "react";

const queryClient = new QueryClient();

<<<<<<< HEAD
export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
=======
export default function ClientProviders({
    children,
    session,
}: {
    children: ReactNode;
    session?: Session | null;
}) {
    return (
        <SessionProvider session={session}>
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    );
}
