"use client";

import React from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Disclosure, Menu } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, BellIcon } from "@heroicons/react/24/outline";

export default function NavBar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navLinks = [
        { href: "/tools/wan-ip-analyzer", label: "WAN IP Analyzer" },
        { href: "/tools/modem-tutorials", label: "Tutorials" },
        { href: "/dashboard", label: "Dashboard" },
    ];

    const getFirstNameInitial = (user: any) => {
        if (!user?.name) return null;
        return user.name.split(" ")[0][0].toUpperCase();
    };

    return (
        <Disclosure
            as="nav"
            className="relative bg-background text-foreground shadow-sm"
        >
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                        <div className="flex h-14 sm:h-16 items-center justify-between">
                            {/* Logo with larger size */}
                            <Link
                                href="/"
                                className="flex items-center gap-3 flex-shrink-0"
                            >
                                {/* Wrapper applies dark-mode filter from CSS variable */}
                                <span
                                    className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 select-none"
                                    style={{ filter: "var(--logo-filter)" }}
                                >
                                    <Image
                                        src="/ethio-img-logo.png"
                                        alt="Logo"
                                        width={80}
                                        height={80}
                                        priority
                                        className="h-full w-auto object-contain"
                                    />
                                </span>
                                <span className="font-medium text-lg sm:text-xl md:text-2xl lg:text-2xl whitespace-nowrap">
                                    IP TOOLKit
                                </span>
                            </Link>

                            {/* Desktop Links - Hidden on mobile */}
                            <div className="hidden md:flex md:space-x-4 lg:space-x-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`inline-flex items-center px-2 lg:px-3 py-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                                            pathname === link.href
                                                ? "border-primary text-primary"
                                                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                {/* Theme Toggle - Hidden on mobile, shown on desktop */}
                                <div className="hidden md:flex">
                                    <ThemeToggle />
                                </div>

                                {/* Notification Bell - Hidden on small mobile */}
                                <button className="hidden xs:flex relative p-1.5 rounded-full hover:bg-muted transition-colors">
                                    <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>

                                {session ? (
                                    <Menu as="div" className="relative">
                                        <Menu.Button className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/80 transition-colors text-sm sm:text-base">
                                            {getFirstNameInitial(session.user)}
                                        </Menu.Button>
                                        <Menu.Items className="absolute right-0 mt-2 w-48 bg-card text-card-foreground border border-border rounded-md shadow-lg py-1 z-50">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        href="/profile"
                                                        className={`block px-4 py-2 text-sm ${
                                                            active
                                                                ? "bg-muted text-foreground"
                                                                : "text-foreground"
                                                        }`}
                                                    >
                                                        Profile
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        href="/settings"
                                                        className={`block px-4 py-2 text-sm ${
                                                            active
                                                                ? "bg-muted text-foreground"
                                                                : "text-foreground"
                                                        }`}
                                                    >
                                                        Settings
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() =>
                                                            signOut()
                                                        }
                                                        className={`w-full text-left px-4 py-2 text-sm ${
                                                            active
                                                                ? "bg-muted text-foreground"
                                                                : "text-foreground"
                                                        }`}
                                                    >
                                                        Sign Out
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Menu>
                                ) : null}

                                {/* Mobile menu button */}
                                <Disclosure.Button className="md:hidden inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    {open ? (
                                        <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    ) : (
                                        <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <Disclosure.Panel className="md:hidden bg-card text-card-foreground border-t border-border">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {/* Navigation Links */}
                            {navLinks.map((link) => (
                                <Disclosure.Button
                                    key={link.href}
                                    as={Link}
                                    href={link.href}
                                    className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                                        pathname === link.href
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    {link.label}
                                </Disclosure.Button>
                            ))}

                            {/* Theme Toggle in Mobile Menu */}
                            <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-medium text-muted-foreground">
                                        Theme
                                    </span>
                                    <ThemeToggle />
                                </div>
                            </div>

                            {/* Mobile notification and profile for signed-in users */}
                            {session && (
                                <>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <Disclosure.Button
                                            as="button"
                                            className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            <BellIcon className="h-5 w-5 mr-3" />
                                            Notifications
                                        </Disclosure.Button>
                                    </div>

                                    {/* Mobile Profile Links */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <Disclosure.Button
                                            as={Link}
                                            href="/profile"
                                            className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            👤 Profile
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as={Link}
                                            href="/settings"
                                            className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            ⚙️ Settings
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as="button"
                                            onClick={() => signOut()}
                                            className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-destructive hover:bg-destructive-foreground/10 transition-colors"
                                        >
                                            🚪 Sign Out
                                        </Disclosure.Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
