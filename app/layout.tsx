import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { ThemeProvider } from "@/lib/theme-provider";
import NavBar from "./NavBar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "IP Toolkit Pro",
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
            <body className="antialiased transition-colors duration-300 bg-background text-foreground min-h-screen">
                <ThemeProvider>
                    <ClientProviders>
                        {/* NavBar is fully client-side */}
                        <NavBar />
                        <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
                            {children}
                        </main>
                        <Toaster />
                    </ClientProviders>
                </ThemeProvider>
            </body>
        </html>
    );
}
