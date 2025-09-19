import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import NavBar from "./NavBar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "IP Toolkit Pro",
  description:
    "The ultimate network configuration platform for Ethio Telecom professionals and customers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300">
        <ClientProviders>
          {/* NavBar is fully client-side */}
          <NavBar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
