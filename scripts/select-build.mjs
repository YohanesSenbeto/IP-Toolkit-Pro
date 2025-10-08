#!/usr/bin/env node
/**
 * Conditional build entrypoint.
 * - On Vercel (detected via VERCEL=1), we only build the web (Next.js) app by default.
 * - If BUILD_BOT=true env var is provided, we also build the bot (tsc -p tsconfig.bot.json).
 * - Locally you can still run `npm run build:all` if you want concurrency.
 */

import { spawnSync } from "node:child_process";

const isVercel = process.env.VERCEL === "1";
const buildBot = process.env.BUILD_BOT === "true";

function run(cmd, args, opts = {}) {
    const res = spawnSync(cmd, args, {
        stdio: "inherit",
        shell: process.platform === "win32",
        ...opts,
    });
    if (res.status !== 0) {
        process.exit(res.status || 1);
    }
}

console.log(`[build] Vercel=${isVercel} BUILD_BOT=${buildBot}`);

// Always build web first
run("npm", ["run", "web:build"]);

if (!isVercel && !buildBot) {
    console.log(
        "[build] Skipping bot build (not requested). To include set BUILD_BOT=true or use npm run build:all"
    );
} else if (buildBot) {
    console.log("[build] BUILD_BOT=true -> building bot");
    run("npm", ["run", "bot:build"]);
} else if (isVercel) {
    console.log(
        "[build] On Vercel and BUILD_BOT not true -> bot build skipped"
    );
}
