"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function NavBar() {
    const { data: session } = useSession();
    // Helper to get first name initial for avatar
    const getFirstNameInitial = (
        user: { id: string; role: string; password?: string } & {
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    ) => {
        if (!user?.name) return null;
        const firstName = user.name.split(" ")[0];
        return firstName.charAt(0).toUpperCase();
    };
    const pathname = usePathname();
    const navLinks = [
        { href: "/tools/wan-ip-analyzer", label: "WAN IP Analyzer" },
        { href: "/tools/modem-tutorials", label: "Tutorials" },
        { href: "/dashboard", label: "View Dashboard" },
    ];
    return (
        <Disclosure
            as="nav"
            className="relative bg-white text-black dark:bg-gray-900 dark:text-white after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-black/10 dark:after:bg-white/10"
        >
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 ml-8 sm:ml-12">
                {/* ...existing code... */}
            </div>
            <div className="flex h-16 items-center justify-between gap-2 sm:gap-0 w-full">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon
                            aria-hidden="true"
                            className="block size-6 group-data-[open]:hidden"
                        />
                        <XMarkIcon
                            aria-hidden="true"
                            className="hidden size-6 group-data-[open]:block"
                        />
                    </DisclosureButton>
                </div>
                <div className="flex flex-1 items-center justify-center gap-4 sm:gap-0 sm:items-stretch sm:justify-start">
                    <Link
                        href="/"
                        className="flex shrink-0 items-center group cursor-pointer ml-8 sm:ml-8"
                    >
                        <span className="bg-white dark:bg-white dark:rounded-lg dark:p-1 rounded-lg p-1">
                            <img
                                src="/ethio-img-logo.png"
                                alt="Ethio Telecom Logo"
                                className="h-8 w-auto"
                            />
                        </span>
                        <span className="font-extrabold tracking-tight whitespace-nowrap text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl ml-2 font-serif text-black dark:text-white drop-shadow group-hover:underline">
                            IP TOOLKit <span className="font-black">App</span>
                        </span>
                    </Link>
                    <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors " +
                                    (pathname === link.href
                                        ? "border-indigo-500 text-black dark:text-white"
                                        : "border-transparent text-gray-500 dark:text-gray-300 hover:border-black/20 dark:hover:border-white/20 hover:text-black dark:hover:text-white")
                                }
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center pr-2 gap-2 sm:ml-auto sm:pr-0">
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-block">
                            <ThemeToggle />
                        </span>
                        <span className="hidden sm:inline-block">
                            <button
                                type="button"
                                className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 ml-2"
                            >
                                <span className="absolute -inset-1.5" />
                                <span className="sr-only">
                                    View notifications
                                </span>
                                <BellIcon
                                    aria-hidden="true"
                                    className="size-6"
                                />
                            </button>
                        </span>
                        {/* Profile dropdown */}
                        {session && (
                            <Menu as="div" className="relative sm:mr-0">
                                <MenuButton className="relative flex rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                                    <span className="absolute -inset-1.5" />
                                    <span className="sr-only">
                                        Open user menu
                                    </span>
                                    {getFirstNameInitial(session.user) ? (
                                        <span className="size-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg outline outline-1 -outline-offset-1 outline-white/10">
                                            {getFirstNameInitial(session.user)}
                                        </span>
                                    ) : (
                                        <img
                                            alt=""
                                            src="/ethio-img-logo.png"
                                            className="size-8 rounded-full bg-gray-800 outline outline-1 -outline-offset-1 outline-white/10"
                                        />
                                    )}
                                </MenuButton>
                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 outline outline-1 -outline-offset-1 outline-white/10 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in mr-auto"
                                >
                                    <MenuItem>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:outline-none"
                                        >
                                            Your profile
                                        </Link>
                                    </MenuItem>
                                    <MenuItem>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:outline-none"
                                        >
                                            Settings
                                        </Link>
                                    </MenuItem>
                                    <MenuItem>
                                        <button
                                            onClick={() => signOut()}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:outline-none"
                                        >
                                            Sign out
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>
            <DisclosurePanel className="sm:hidden">
                <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900/95 backdrop-blur-md flex flex-col w-full h-full">
                    <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="dark:bg-white dark:rounded-lg dark:p-1">
                                <img
                                    src="/ethio-img-logo.png"
                                    alt="Ethio Telecom Logo"
                                    className="h-8 w-auto"
                                />
                            </span>
                            <span className="font-extrabold tracking-tight whitespace-nowrap text-base font-serif text-white drop-shadow">
                                IP TOOLKit{" "}
                                <span className="font-black">App</span>
                            </span>
                        </Link>
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                        </DisclosureButton>
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-2 px-6 py-8">
                        {navLinks.map((link) => (
                            <DisclosureButton
                                key={link.href}
                                as={Link}
                                href={link.href}
                                className={[
                                    "block rounded-lg px-4 py-3 text-lg font-medium transition-colors text-left border-l-4",
                                    pathname === link.href
                                        ? "bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border-indigo-500"
                                        : "bg-white dark:bg-transparent text-black dark:text-gray-200 border-transparent hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white",
                                ].join(" ")}
                            >
                                {link.label}
                            </DisclosureButton>
                        ))}
                        <div className="mt-8 flex justify-center">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
}
