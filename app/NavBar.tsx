"use client";

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
} from "lucide-react";
import { useState } from "react";

export default function NavBar() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    // Simple notification count for technician (could be expanded later)
    const notificationQuery = useQuery({
        queryKey: ["notifications", session?.user?.id],
        queryFn: async () => {
            if (!session || session.user.role !== "ETHIO_TELECOM_TECHNICIAN")
                return 0;
            // Placeholder for future notifications
            return 0;
        },
        enabled: !!session,
        refetchInterval: 5000,
    });

    const notificationsCount = notificationQuery.data ?? 0;

    const userInitial =
        session?.user?.name?.charAt(0).toUpperCase() ||
        session?.user?.email?.charAt(0).toUpperCase() ||
        "U";

    return (
        <header className="border-b bg-background shadow-sm">
            <nav className="container flex items-center justify-between p-4">
                {/* Logo / Brand */}
                <Link
                    href="/"
                    aria-label="IP Toolkit Pro Home"
                    className="group inline-flex items-center gap-2"
                >
                    <span className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
                        IP Toolkit
                        <span className="text-primary group-hover:text-primary/80 transition-colors ml-1">
                            Pro
                        </span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-4">
                    {isLoading ? (
                        <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                    ) : !session ? (
                        // Not Logged In (desktop): collapse into dropdown
                        <div className="flex items-center space-x-2">
                            <ThemeToggle />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Menu className="h-4 w-4" />
                                        Menu
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem
                                        onClick={() => signIn()}
                                        className="cursor-pointer"
                                    >
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign In
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/auth/signup"
                                            className="flex items-center"
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Sign Up
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        // Logged In (desktop)
                        <>
                            <ThemeToggle />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary text-white">
                                                {userInitial}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Notifications Badge */}
                                        {notificationsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
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
                                                {session.user?.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {session.user.role ===
                                        "ETHIO_TELECOM_TECHNICIAN" && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/technician/dashboard"
                                                className="flex items-center"
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Technician Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="text-destructive cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" /> Sign
                                        Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>

                {/* Mobile actions: collapse Sign In / Sign Up into menu */}
                <div className="md:hidden flex items-center space-x-2">
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-2">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            {!session ? (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/"
                                            className="flex items-center"
                                        >
                                            <Home className="mr-2 h-4 w-4" />{" "}
                                            Home
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => signIn()}
                                        className="cursor-pointer"
                                    >
                                        <LogIn className="mr-2 h-4 w-4" /> Sign
                                        In
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/auth/signup"
                                            className="flex items-center"
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />{" "}
                                            Sign Up
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">
                                                {session.user?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/"
                                            className="flex items-center"
                                        >
                                            <Home className="mr-2 h-4 w-4" />{" "}
                                            Home
                                        </Link>
                                    </DropdownMenuItem>
                                    {session.user.role ===
                                        "ETHIO_TELECOM_TECHNICIAN" && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/technician/dashboard"
                                                className="flex items-center"
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />{" "}
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="text-destructive cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" /> Sign
                                        Out
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
        </header>
    );
}
