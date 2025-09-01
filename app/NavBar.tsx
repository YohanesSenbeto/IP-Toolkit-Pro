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
import { LogOut, LayoutDashboard, UserPlus, LogIn } from "lucide-react";

export default function NavBar() {
    const { data: session } = useSession();

    // Fetch requests count for logged-in users
    const requestsQuery = useQuery({
        queryKey: ["requestsCount", session?.user?.id],
        queryFn: async () => {
            if (!session) return 0;
            const res = await fetch(`/api/requests`);
            const data = await res.json();
            let requests = data.requests || [];

            if (session.user.role === "PROVIDER") {
                requests = requests.filter(
                    (req: any) =>
                        !req.proposals?.some(
                            (p: any) => p.providerId === session.user.id
                        )
                );
            } else if (session.user.role === "CLIENT") {
                requests = requests.filter(
                    (req: any) => req.clientId === session.user.id
                );
            }

            return requests.length;
        },
        enabled: !!session,
        refetchInterval: 5000,
    });

    const requestsCount = requestsQuery.data ?? 0;

    const userInitial =
        session?.user?.name?.charAt(0).toUpperCase() ||
        session?.user?.email?.charAt(0).toUpperCase() ||
        "U";

    return (
        <header className="border-b bg-background shadow-sm">
            <nav className="container flex items-center justify-between p-4">
                {/* Logo / Brand */}
                <Link href="/" className="text-xl font-bold text-primary">
                    Addis Solution Hub
                </Link>

                <div className="flex items-center space-x-4">
                    {!session ? (
                        // 👇 Not Logged In Section
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => signIn()}
                                className="flex items-center gap-2"
                            >
                                <LogIn className="h-4 w-4" />
                                Sign In
                            </Button>
                            <Button asChild>
                                <Link
                                    href="/auth/signup"
                                    className="flex items-center gap-2"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Sign Up
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        // 👇 Logged In Section
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
                                    {/* Requests Badge */}
                                    {(session.user.role === "CLIENT" ||
                                        session.user.role === "PROVIDER") &&
                                        requestsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                {requestsCount}
                                            </span>
                                        )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
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

                                {(session.user.role === "CLIENT" ||
                                    session.user.role === "PROVIDER") && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={
                                                session.user.role === "CLIENT"
                                                    ? "/dashboard/client"
                                                    : "/dashboard/provider"
                                            }
                                            className="flex items-center"
                                        >
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            My Dashboard
                                            {requestsCount > 0 && (
                                                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {requestsCount}
                                                </span>
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className="text-destructive cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </nav>
        </header>
    );
}
