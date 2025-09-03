import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar";
import ClientProviders from "./ClientProviders";
import { Toaster } from "sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "IP Toolkit Pro",
    description:
        "Comprehensive network configuration platform for Ethio Telecom",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
            >
                <ClientProviders>
                    <NavBar />
                    <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                    <Toaster />
                </ClientProviders>
            </body>
        </html>
    );
}
