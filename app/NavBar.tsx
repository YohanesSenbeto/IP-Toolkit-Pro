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
                        <img
                            src="/ethio-img-logo.png"
                            alt="Ethio Telecom Logo"
                            className="h-10 w-auto sm:h-12 mr-1"
                            style={{ marginLeft: "-0.5rem" }}
                        />
                        <span
                            className="font-extrabold tracking-tight whitespace-nowrap text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl ml-0 bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-400 bg-clip-text text-transparent drop-shadow dark:bg-none dark:text-gray-100 font-serif"
                            style={{
                                lineHeight: 1.1,
                                marginLeft: "-0.25rem",
                                fontFamily:
                                    "Georgia, Times, Times New Roman, serif",
                            }}
                        >
                            IP TOOLKit{" "}
                            <span className="font-black dark:text-gray-100 font-serif">
                                App
                            </span>
                        </span>
                    </Link>
                    <div className="flex-1 hidden md:block"></div>
                    {/* Desktop Nav Links & User Menu (hidden on mobile) */}
                    <div className="hidden md:flex items-center space-x-4 my-auto">
                        <Link href="/tools/wan-ip-analyzer">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                            >
                                <Globe className="h-2 w-2" />
                                WAN IP Analyzer
                            </Button>
                        </Link>
                        <Link href="/tools/modem-tutorials">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                            >
                                <Play className="h-4 w-4" />
                                Tutorials
                            </Button>
                        </Link>
                        {session && (
                            <Link href="/dashboard">
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                                >
                                    <History className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                        {/* User Menu */}
                        {isLoading ? (
                            <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                        ) : !session ? (
                            <div className="flex items-center space-x-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <Menu className="h-4 w-4" /> Menu
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48"
                                    >
                                        <DropdownMenuItem asChild>
                                            <span className="flex items-center w-full cursor-pointer">
                                                <ThemeToggle />
                                                <span className="ml-2">
                                                    Theme
                                                </span>
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => signIn()}
                                        >
                                            <LogIn className="mr-2 h-4 w-4" />{" "}
                                            Sign In
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
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
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
                                        <DropdownMenuItem asChild>
                                            <span className="flex items-center w-full cursor-pointer">
                                                <ThemeToggle />
                                                <span className="ml-2">
                                                    Theme
                                                </span>
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
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
                                            <LogOut className="mr-2 h-4 w-4" />{" "}
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu & ThemeToggle - single instance, right-aligned */}
                <div className="md:hidden flex items-center space-x-2 ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-2">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuItem asChild>
                                <span className="flex items-center w-full cursor-pointer">
                                    <ThemeToggle />
                                    <span className="ml-2">Theme</span>
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/tools/wan-ip-analyzer"
                                            className="flex items-center"
                                        >
                                            <Globe className="mr-2 h-4 w-4" />{" "}
                                            WAN IP Analyzer
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/tools/modem-tutorials"
                                            className="flex items-center"
                                        >
                                            <Play className="mr-2 h-4 w-4" />{" "}
                                            Tutorials
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signIn()}>
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
                                                {session?.user?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session?.user?.email}
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
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/tools/wan-ip-analyzer"
                                            className="flex items-center"
                                        >
                                            <Globe className="mr-2 h-4 w-4" />{" "}
                                            WAN IP Analyzer
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/tools/modem-tutorials"
                                            className="flex items-center"
                                        >
                                            <Play className="mr-2 h-4 w-4" />{" "}
                                            Tutorials
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center"
                                        >
                                            <History className="mr-2 h-4 w-4" />{" "}
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
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
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="text-destructive"
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
