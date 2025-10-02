"use client";
import React from "react";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    LogOut,
    LayoutDashboard,
    UserPlus,
    LogIn,
    Menu,
    Home,
    Globe,
    Play,
    History,
} from "lucide-react";

export default function NavBar() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    // Simple placeholder notification count
    const notificationQuery = useQuery({
        queryKey: ["notifications", session?.user?.id],
        queryFn: async () =>
            session?.user?.role === "ETHIO_TELECOM_TECHNICIAN" ? 0 : 0,
        enabled: !!session,
        refetchInterval: 5000,
    });

    const notificationsCount = notificationQuery.data ?? 0;

    const userInitial =
        session?.user?.name?.charAt(0).toUpperCase() ||
        session?.user?.email?.charAt(0).toUpperCase() ||
        "U";

    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    return (
        <header className="border-b bg-background shadow-sm transition-colors duration-300 dark:bg-gray-950 dark:border-gray-900">
            <nav className="w-full flex items-center justify-between pr-4 py-4 min-w-0 md:ml-auto text-gray-800 dark:text-gray-200">
                {/* Logo / Brand (always visible) */}
                <div className="flex items-center gap-2 min-w-0 ml-0 pl-2 sm:pl-4 lg:pl-8 w-full">
                    <Link
                        href="/"
                        aria-label="IP Toolkit Pro Home"
                        className="group flex items-center gap-2 min-w-0"
                    >
                        <span className="dark:bg-white dark:rounded-lg dark:p-1">
                            <img
                                src="/ethio-img-logo.png"
                                alt="Ethio Telecom Logo"
                                className="h-10 max-w-xs w-auto sm:h-12 mr-1 object-contain"
                                style={{ display: "block" }}
                            />
                        </span>
                        <span
                            className="font-extrabold tracking-tight whitespace-nowrap text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl ml-0 font-serif text-gray-800 dark:text-white drop-shadow"
                            style={{
                                lineHeight: 1.1,
                                marginLeft: "-0.25rem",
                                fontFamily:
                                    "Georgia, Times, Times New Roman, serif",
                            }}
                        >
                            IP TOOLKit <span className="font-black">App</span>
                        </span>
                    </Link>
                    <div className="flex-1 hidden md:block"></div>
                    {/* Desktop Nav Links & User Menu (hidden on mobile) */}
                    <div className="hidden md:flex items-center space-x-4 my-auto">
                        <span className="flex items-center">
                            <ThemeToggle />
                        </span>
                        <Link href="/tools/wan-ip-analyzer">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                            >
                                <Globe className="h-4 w-4 mr-1" /> WAN IP
                                Analyzer
                            </Button>
                        </Link>
                        <Link href="/tools/modem-tutorials">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                            >
                                <Play className="h-4 w-4 mr-1" /> Tutorials
                            </Button>
                        </Link>
                        {!session ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={() => signIn()}
                                >
                                    <LogIn className="h-4 w-4 mr-1" /> Sign In
                                </Button>
                                <Link href="/auth/signup">
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 ml-2"
                                    >
                                        <UserPlus className="h-4 w-4 mr-1" />{" "}
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-yellow-400 border-2 border-primary text-black flex items-center justify-center">
                                                {userInitial}
                                            </AvatarFallback>
                                        </Avatar>
                                        {notificationsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs px-1.5 py-0.5 rounded-full">
                                                {notificationsCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                >
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {session?.user?.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {session?.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {session?.user?.role ===
                                        "ETHIO_TELECOM_TECHNICIAN" && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/technician/dashboard"
                                                className="flex items-center"
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />{" "}
                                                Technician Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" /> Sign
                                        Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    {/* Mobile menu button (visible below md) */}
                    <div className="md:hidden ml-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Open menu"
                        >
                            <Menu className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                        </Button>
                    </div>
                </div>
                {/* Mobile menu dropdown */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950 bg-opacity-95 flex flex-col items-center justify-start pt-24 px-4 space-y-4 md:hidden overflow-y-auto">
                        <div
                            className="w-full flex items-center gap-2 text-lg px-2 py-1 rounded hover:bg-accent transition-colors cursor-pointer justify-center"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <ThemeToggle /> <span>Theme</span>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full flex items-center gap-2 text-lg"
                            asChild
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Link href="/tools/wan-ip-analyzer">
                                <Globe className="h-5 w-5 mr-2" /> WAN IP
                                Analyzer
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full flex items-center gap-2 text-lg"
                            asChild
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Link href="/tools/modem-tutorials">
                                <Play className="h-5 w-5 mr-2" /> Tutorials
                            </Link>
                        </Button>
                        {!session ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2 text-lg"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        signIn();
                                    }}
                                >
                                    <LogIn className="h-5 w-5 mr-2" /> Sign In
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2 text-lg"
                                    asChild
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Link href="/auth/signup">
                                        <UserPlus className="h-5 w-5 mr-2" />{" "}
                                        Sign Up
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="w-full flex flex-col items-center space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-yellow-400 border-2 border-primary text-black flex items-center justify-center">
                                                {userInitial}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-base font-medium">
                                            {session?.user?.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {session?.user?.email}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full flex items-center gap-2 text-lg"
                                    asChild
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Link href="/technician/dashboard">
                                        <LayoutDashboard className="h-5 w-5 mr-2" />{" "}
                                        Technician Dashboard
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full flex items-center gap-2 text-lg"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        signOut();
                                    }}
                                >
                                    <LogOut className="h-5 w-5 mr-2" /> Sign Out
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}
