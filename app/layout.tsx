import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar";
<<<<<<< HEAD
import SessionWrapper from "./SessionWrapper";
=======
import ClientProviders from "./ClientProviders";
<<<<<<< HEAD
import { Toaster } from "sonner";
=======
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd

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
    description: "Comprehensive network configuration platform for Ethio Telecom",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
<<<<<<< HEAD
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
            >
                <SessionWrapper>
                    <NavBar />
<<<<<<< HEAD
                    <main>{children}</main>
                </SessionWrapper>
=======
                    <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                    <Toaster />
=======
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
            >
                {/* Session + React Query Providers */}
                <ClientProviders>
                    {/* Navigation bar stays fixed across all pages */}
                    <NavBar />

                    {/* Main content area */}
                    <main className="min-h-screen px-4 md:px-8">
                        {children}
                    </main>
>>>>>>> f3177dfe03f1aa84833f761eef73058dd29aa04b
                </ClientProviders>
>>>>>>> b17a882604302812a3e97b57236ee5e2b57df7fd
            </body>
        </html>
    );
}
