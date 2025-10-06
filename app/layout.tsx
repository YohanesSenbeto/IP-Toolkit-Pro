import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { ThemeProvider } from "@/lib/theme-provider";
import NavBar from "./NavBar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "IP Toolkit App",
    description:
        "The ultimate network configuration platform for Ethio Telecom professionals and customers",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased transition-colors duration-300 bg-white dark:bg-black text-black dark:text-white min-h-screen">
                <ThemeProvider>
                    <ClientProviders>
                        {/* NavBar is fully client-side */}
                        <NavBar />
                        <main className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
                            {children}
                        </main>
                        <Toaster />
                    </ClientProviders>
                </ThemeProvider>
            </body>
        </html>
    );
}
