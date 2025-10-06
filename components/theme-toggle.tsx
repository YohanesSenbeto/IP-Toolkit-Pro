"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="relative flex items-center gap-2 px-2 py-1 rounded-full bg-[rgb(var(--muted-rgb))] hover:bg-[rgb(var(--accent-rgb))] transition-colors border border-[rgb(var(--border-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--foreground-rgb))]"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            <Sun
                className={`h-4 w-4 transition-all ${
                    isDark ? "opacity-40" : "opacity-100"
                }`}
            />
            <span className="relative inline-block w-10 h-6">
                <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-4 rounded-full transition-colors duration-200 ${
                        isDark
                            ? "bg-[rgb(var(--foreground-rgb))]"
                            : "bg-[rgb(var(--background-rgb))]"
                    }`}
                />
                <span
                    className={`absolute top-1/2 -translate-y-1/2 left-0 w-5 h-5 rounded-full bg-[rgb(var(--card-rgb))] shadow transition-transform duration-200 border border-[rgb(var(--border-rgb))] ${
                        isDark ? "translate-x-5" : "translate-x-0"
                    }`}
                />
            </span>
            <Moon
                className={`h-4 w-4 transition-all ${
                    isDark ? "opacity-100" : "opacity-40"
                }`}
            />
        </button>
    );
}
