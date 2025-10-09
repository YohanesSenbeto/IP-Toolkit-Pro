"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme-provider";

const queryClient = new QueryClient();

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange storageKey="theme">
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
