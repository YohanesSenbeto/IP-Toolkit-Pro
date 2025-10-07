#!/usr/bin/env node
/**
 * Documentation guard: ensures only whitelisted top-level markdown files exist.
 * Whitelist: README.md, TESTING_GUIDE.md, LICENSE (if added later), CHANGELOG.md (optional future).
 * Any other root-level *.md files (excluding .github templates) will cause a non-zero exit.
 */
import { readdirSync, statSync, rmSync } from "node:fs";
import { exit, argv } from "node:process";
import path from "node:path";

const ROOT = process.cwd();
const ALLOWED = new Set([
    "README.md",
    "TESTING_GUIDE.md",
    "LICENSE",
    "CHANGELOG.md",
]);

function listRootMarkdown() {
    return readdirSync(ROOT)
        .filter((f) => f.toLowerCase().endsWith(".md"))
        .filter((f) => statSync(path.join(ROOT, f)).isFile());
}

const mdFiles = listRootMarkdown();
const extra = mdFiles.filter((f) => !ALLOWED.has(f));
const FIX_MODE = argv.includes("--fix");

if (extra.length) {
    if (FIX_MODE) {
        console.warn("[docs-guard] --fix enabled. Removing:", extra.join(", "));
        for (const file of extra) {
            try {
                rmSync(path.join(ROOT, file));
                console.warn(`[docs-guard] Deleted ${file}`);
            } catch (e) {
                console.error(
                    `[docs-guard] Failed to delete ${file}:`,
                    e.message
                );
                exit(1);
            }
        }
        const remaining = listRootMarkdown().filter((f) => !ALLOWED.has(f));
        if (remaining.length) {
            console.error(
                "[docs-guard] Some files could not be removed:",
                remaining.join(", ")
            );
            exit(1);
        }
        console.log("[docs-guard] Cleanup complete.");
        exit(0);
    } else {
        console.error(
            "\n[docs-guard] Unexpected markdown files detected:",
            extra.join(", ")
        );
        console.error(
            "[docs-guard] Run with --fix to auto-remove or merge content into README.md."
        );
        exit(1);
    }
}

console.log("[docs-guard] OK – only approved markdown docs present.");
exit(0);
