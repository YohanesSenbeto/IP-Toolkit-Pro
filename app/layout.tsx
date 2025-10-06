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
                            <div className="w-full mx-auto">{children}</div>
                        </main>
                        <Toaster
                            position="top-center"
                            duration={4000}
                            richColors
                            closeButton
                            toastOptions={{
                                classNames: {
                                    toast: "text-sm sm:text-base",
                                    title: "font-medium",
                                    description: "text-muted-foreground",
                                    actionButton: "bg-blue-600",
                                    cancelButton: "bg-gray-600",
                                    error: "text-red-600",
                                    success: "text-green-600",
                                    warning: "text-yellow-600",
                                    info: "text-blue-600",
                                },
                            }}
                        />
                    </ClientProviders>
                </ThemeProvider>
            </body>
        </html>
    );
}
