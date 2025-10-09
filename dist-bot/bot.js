"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
// Security guard: ensure insecure TLS override isn't silently active.
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    // eslint-disable-next-line no-console
    console.warn('[bot] NODE_TLS_REJECT_UNAUTHORIZED=0 detected. Removing for security.');
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED; // restore default secure behavior
}
const prisma = new client_1.PrismaClient();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const YOUTUBE_API_KEY = (_a = process.env.YOUTUBE_API_KEY) !== null && _a !== void 0 ? _a : "";
const YOUTUBE_CHANNEL_ID = "UC20UnSFgW5KadIRHbo-Rbkg";
if (!TOKEN)
    throw new Error("❌ Missing TELEGRAM_BOT_TOKEN in .env");
if (!YOUTUBE_API_KEY)
    throw new Error("❌ Missing YOUTUBE_API_KEY in .env");
// Optional: allow trusting an internal/self-signed CA without disabling verification globally.
// Provide path via CUSTOM_CA_BUNDLE_PATH or NODE_EXTRA_CA_CERTS.
let httpsAgent;
const caPath = process.env.CUSTOM_CA_BUNDLE_PATH || process.env.NODE_EXTRA_CA_CERTS;
if (caPath) {
    try {
        const ca = fs_1.default.readFileSync(caPath, 'utf8');
        httpsAgent = new https_1.default.Agent({ ca });
        console.log(`[bot] Loaded custom CA bundle from ${caPath}`);
    }
    catch (e) {
        console.warn('[bot] Failed to load custom CA bundle:', (e === null || e === void 0 ? void 0 : e.message) || e);
    }
}
// node-telegram-bot-api does not expose a simple https.Agent override in polling options; instead, rely on
// environment trust store for Telegram endpoints. We still apply custom CA to axios (YouTube) calls below.
const bot = new node_telegram_bot_api_1.default(TOKEN, { polling: true });
// Polling resilience state
let pollingRetry = 0;
const MAX_BACKOFF_MS = 30000;
const BASE_BACKOFF_MS = 1000;
let restarting = false;
function schedulePollingRestart(reason) {
    if (restarting)
        return; // prevent overlapping restarts
    pollingRetry++;
    const delay = Math.min(BASE_BACKOFF_MS * 2 ** (pollingRetry - 1), MAX_BACKOFF_MS);
    restarting = true;
    console.warn(`[bot] Scheduling polling restart in ${delay}ms (attempt #${pollingRetry}) – reason: ${reason}`);
    setTimeout(async () => {
        try {
            await bot.stopPolling();
        }
        catch (_) {
            /* ignore */
        }
        try {
            await bot.startPolling();
            console.log('[bot] Polling restarted successfully');
            restarting = false;
        }
        catch (err) {
            console.error('[bot] Polling restart failed:', (err === null || err === void 0 ? void 0 : err.message) || err);
            restarting = false; // allow another schedule
            schedulePollingRestart('restart-failed');
        }
    }, delay);
}
// Basic startup diagnostics
(async () => {
    try {
        const me = await bot.getMe();
        console.log(`🤖 YohTech Bot started successfully as @${me.username}`);
    }
    catch (e) {
        console.error('❌ Failed to start Telegram bot. Check TELEGRAM_BOT_TOKEN and network connectivity.');
    }
})();
// Throttle identical error messages to avoid log spam
const errorCounts = {};
const ERROR_LOG_WINDOW_MS = 60000; // compress counts per minute
const SELF_SIGNED_MAX_RETRIES = 5;
let selfSignedErrorCount = 0;
let selfSignedHalted = false;
function logThrottled(key, printer) {
    const now = Date.now();
    const bucket = errorCounts[key] || { count: 0, first: now, last: now };
    bucket.count++;
    bucket.last = now;
    errorCounts[key] = bucket;
    if (bucket.count === 1) {
        printer();
    }
    else if (now - bucket.first > ERROR_LOG_WINDOW_MS) {
        console.warn(`[bot] Repeated error '${key}' occurred ${bucket.count} times in ${(now - bucket.first) / 1000}s`);
        delete errorCounts[key];
    }
}
bot.on('polling_error', (err) => {
    var _a;
    const msg = String((err === null || err === void 0 ? void 0 : err.message) || err);
    const code = (err && (err.code || ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status))) || 'UNKNOWN';
    const unauthorized = /401|403/.test(String(code)) || /ETELEGRAM: 401/i.test(msg);
    const selfSigned = /self-signed certificate/i.test(msg) || /SELF_SIGNED_CERT_IN_CHAIN/i.test(msg);
    const isTransient = /ECONNRESET|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ECONNABORTED/i.test(msg) || selfSigned;
    if (unauthorized) {
        logThrottled('auth-error', () => console.error('🔴 Polling auth error (check TELEGRAM_BOT_TOKEN):', msg));
        return;
    }
    const key = selfSigned ? 'self-signed-chain' : code + ':' + (msg.split('\n')[0]);
    logThrottled(key, () => {
        console.error(`🔴 Polling error (code=${code}) transient=${isTransient}:`, msg);
        if (selfSigned) {
            selfSignedErrorCount++;
            console.warn(`[bot] Detected self-signed certificate (occurrence ${selfSignedErrorCount}/${SELF_SIGNED_MAX_RETRIES}).`);
            if (selfSignedErrorCount >= SELF_SIGNED_MAX_RETRIES && !selfSignedHalted) {
                selfSignedHalted = true;
                console.error('[bot] Halting polling restarts due to repeated self-signed TLS failures.');
                console.error('[bot] Remediation steps:\n' +
                    '  1. Export the intercepting root CA certificate (PEM).\n' +
                    '  2. Save as certs/corporate-root.pem (gitignored).\n' +
                    '  3. Set environment: CUSTOM_CA_BUNDLE_PATH=absolute_path_to_pem (or NODE_EXTRA_CA_CERTS).\n' +
                    '  4. Restart bot (npm run bot:dev).\n' +
                    '  5. Verify startup shows: "Loaded custom CA bundle" and polling success.');
            }
        }
    });
    if (selfSignedHalted)
        return; // do not attempt further restarts until fixed
    if (isTransient && !selfSignedHalted) {
        schedulePollingRestart(msg);
    }
    else if (!selfSigned) {
        // Only log non-transient if not self-signed (self-signed handled above)
        logThrottled('non-transient', () => console.error('[bot] Non-transient polling error – manual intervention may be required.'));
    }
});
process.on('unhandledRejection', (reason) => {
    console.error('🔴 Unhandled promise rejection in bot:', reason);
    // Attempt graceful recovery if network-like
    const r = String(reason);
    if (/ECONNRESET|ECONNREFUSED|ETIMEDOUT/.test(r)) {
        schedulePollingRestart('unhandled-rejection');
    }
});
// In-memory sessions
const sessions = {};
// Function to safely clear a user's session
function clearSession(chatId) {
    if (sessions[chatId]) {
        delete sessions[chatId];
    }
}
// /start command - Updated with empathetic and advanced messaging
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `👋 *Welcome to YohTech Solutions Support!* 🤖

I'm your virtual assistant, here to get you back online quickly.

🔁 *Did you recently reset your modem or router?*
If you've reset your device and lost your connection details like your *WAN IP, Subnet Mask, or Default Gateway*—don't worry! We're here to support you.

You only need to provide *one piece of information*:
    
📡 *Please enter your WAN IP address below.*

If you don't have it or can't find it, simply type "help" and I'll guide you on how to find it.`;
    // Send the message with Markdown parsing
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" })
        .then(() => {
        // Set the session after the welcome message is sent
        sessions[chatId] = { step: "awaiting_wan_ip" };
    })
        .catch((error) => {
        console.error("Error sending welcome message:", error);
    });
});
// Listen for messages
bot.on("message", async (msg) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const chatId = msg.chat.id;
    const text = (_a = msg.text) === null || _a === void 0 ? void 0 : _a.trim();
    // Ignore commands and empty messages
    if (!text || text.startsWith("/"))
        return;
    // If no session exists, likely a random message, guide them to /start
    if (!sessions[chatId]) {
        bot.sendMessage(chatId, "💡 Type /start to begin the setup assistance.");
        return;
    }
    const lowerText = text.toLowerCase();
    // Handle 'help' command at any point during the WAN IP step
    if (((_b = sessions[chatId]) === null || _b === void 0 ? void 0 : _b.step) === "awaiting_wan_ip" && lowerText === 'help') {
        const helpMessage = `🛠️ *Need help with your IP?*\n\nWe accept *either* of these:\n\n1. 🌍 *Public IP* (e.g. \`196.190.194.34\`) – Shown on external lookup sites. We'll classify it as Public.\n2. 🏠 *Private / Routed WAN IP* (e.g. \`10.239.139.51\`) – From your *Customer Acceptance Sheet*. This gives richer internal details (subnet, gateway, region).\n\n✅ *Best to send the 10.x IP* if you have it. If not, you can still send the public IP now.\n\n📄 *Finding the 10.x IP:*\n• Check your Acceptance Sheet: look for *WAN IP* / *Routed IP* / *Customer IP*.\n• Router UI: WAN / Internet Status page.\n\n💡 *Still stuck?* Ask the field team or support desk.\n\n➡️ *Send either IP now* (public or 10.x).`;
        await bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
        return; // Keep session at awaiting_wan_ip
    }
    // Step 1: WAN / Public IP capture & classification
    if (sessions[chatId].step === "awaiting_wan_ip") {
        // Full IPv4 validation (0-255 per octet)
        const ipv4Full = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
        if (!ipv4Full.test(text)) {
            bot.sendMessage(chatId, "⚠️ That doesn't look like a valid IPv4 address (example: 10.239.139.51 or 196.190.194.34). Please re-check and try again, or type 'help'.");
            return;
        }
        // Private ranges we care about (focus 10.x.x.x for internal WAN/Customer sheet scenario)
        const isPrivate10 = text.startsWith('10.');
        const isRFC1918 = isPrivate10 || /^192\.168\./.test(text) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(text);
        const isPublic = !isRFC1918;
        // Lookup any IP (public or private) in DB
        const customer = await prisma.customerWanIp.findFirst({
            where: { wanIp: text },
            include: { interface: { include: { region: true } } },
        });
        if (!customer) {
            const notFoundMsg = isPublic
                ? `⚠️ Public IP *${text}* not found in our records. If this is newly provisioned, wait a few minutes and try again, or provide the 10.x WAN IP from your acceptance sheet.`
                : `⚠️ WAN IP *${text}* not found in our database. Double-check the acceptance sheet. If you believe this is correct, contact support or type 'help' for guidance.`;
            bot.sendMessage(chatId, notFoundMsg, { parse_mode: 'Markdown' });
            return;
        }
        sessions[chatId].wanIp = text;
        sessions[chatId].interfaceRecord = customer.interface;
        let classificationNote;
        if (isPublic) {
            classificationNote = '🔎 *Classification:* Public ISP edge IP';
        }
        else if (isPrivate10) {
            classificationNote = '🔎 *Classification:* Private (10.x) routed WAN IP';
        }
        else {
            classificationNote = '🔎 *Classification:* Private RFC1918 IP';
        }
        const ipInfoMessage = `✅ *IP Found!* 🎉\n\n*Here are your network details:*\n┣ 🌐 *IP:* ${text}\n┣ 📡 *Subnet Mask:* ${(_d = (_c = customer.interface) === null || _c === void 0 ? void 0 : _c.subnetMask) !== null && _d !== void 0 ? _d : "N/A"}\n┣ 🚪 *Default Gateway:* ${(_f = (_e = customer.interface) === null || _e === void 0 ? void 0 : _e.defaultGateway) !== null && _f !== void 0 ? _f : "N/A"}\n┗ 🗺️ *Region:* ${(_j = (_h = (_g = customer.interface) === null || _g === void 0 ? void 0 : _g.region) === null || _h === void 0 ? void 0 : _h.name) !== null && _j !== void 0 ? _j : 'N/A'}\n${classificationNote}\n\n*Next, let's find tutorials for your specific device.*`;
        bot.sendMessage(chatId, ipInfoMessage, { parse_mode: "Markdown" });
        const nextStepMessage = `📝 *Please type your modem/router model* (e.g., *TP-Link Archer C6*, *Huawei HG8245H*, *D-Link DIR-825*):\n\n💡 *Tip:* Model number is printed on the sticker (underside/back).`;
        bot.sendMessage(chatId, nextStepMessage, { parse_mode: "Markdown" });
        sessions[chatId].step = "awaiting_router_search";
        return;
    }
    // Step 2: Router model input → go to YouTube search
    if (sessions[chatId].step === "awaiting_router_search") {
        sessions[chatId].router = text;
        handleRouterSelection(chatId, text);
        return;
    }
});
// Step 3: Handle router selection → YouTube search + keyword match + max 10 results
async function handleRouterSelection(chatId, routerModel) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const interfaceRecord = (_a = sessions[chatId]) === null || _a === void 0 ? void 0 : _a.interfaceRecord;
        // Show searching message
        const searchingMessage = `🔍 *Searching for tutorials for your ${routerModel}...*\n\nPlease wait a moment while I check our YouTube channel.`;
        await bot.sendMessage(chatId, searchingMessage, { parse_mode: "Markdown" });
        // Search YouTube for router model
        const ytRes = await axios_1.default.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                key: YOUTUBE_API_KEY,
                channelId: YOUTUBE_CHANNEL_ID,
                q: routerModel,
                order: "relevance", // Changed to relevance for better results
                maxResults: 20, // fetch more to filter later
                type: "video",
                part: "snippet",
            },
            httpsAgent
        });
        const items = (_b = ytRes.data.items) !== null && _b !== void 0 ? _b : [];
        // Filter results by title containing routerModel keyword (case-insensitive)
        const matchingVideos = items
            .filter((item) => { var _a, _b; return (_b = (_a = item.snippet) === null || _a === void 0 ? void 0 : _a.title) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(routerModel.toLowerCase()); })
            .slice(0, 10); // max 10
        // Build a comprehensive results message with emojis and markdown
        let message = `*📋 Your Network Configuration Summary*\\n\\n`;
        message += `┣ 🌐 *WAN IP:* ${(_c = sessions[chatId]) === null || _c === void 0 ? void 0 : _c.wanIp}\\n`;
        message += `┣ 🗺️ *Region:* ${(_e = (_d = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.region) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : "N/A"}\\n`;
        message += `┣ 📶 *Interface:* ${(_f = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.name) !== null && _f !== void 0 ? _f : "N/A"}\\n`;
        message += `┣ 📡 *Subnet Mask:* ${(_g = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.subnetMask) !== null && _g !== void 0 ? _g : "N/A"}\\n`;
        message += `┗ 🚪 *Default Gateway:* ${(_h = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.defaultGateway) !== null && _h !== void 0 ? _h : "N/A"}\\n\\n`;
        message += `*🎥 Tutorial Videos for your ${routerModel}:*\\n\\n`;
        if (matchingVideos.length === 0) {
            message += `*❌ No specific tutorial found for "${routerModel}"*\\n\\n`;
            message += `🔍 *Don't worry! Try these solutions:*\\n`;
            message += `• Check for typos in the model name\\n`;
            message += `• Search for your router's brand instead (e.g., "TP\\-Link" instead of "TP\\-Link Archer C6")\\n`;
            message += `• Visit our channel for general setup guides: [YohTech Solutions YouTube Channel](https://www.youtube.com/@Yoh-Tech-Solutions)\\n\\n`;
            message += `*👥 Need more help?* Contact our 24/7 support team for direct assistance\\.`;
        }
        else {
            message += `I found ${matchingVideos.length} video(s) that might help:\\n\\n`;
            matchingVideos.forEach((vid, index) => {
                // Escape special characters for MarkdownV2
                const safeTitle = vid.snippet.title.replace(/([_[\]()~>#+=|{}.!-])/g, '\\$1');
                message += `*${index + 1}\\.* [${safeTitle}](https://www.youtube.com/watch?v=${vid.id.videoId})\\n\\n`;
            });
            message += `*💡 Pro Tip:* The first video is usually the most relevant to your query\\.\\n\\n`;
            message += `_Happy learning! Type /start anytime if you need help with another device\\._`;
        }
        // Send the final message
        await bot.sendMessage(chatId, message, {
            parse_mode: "MarkdownV2",
            disable_web_page_preview: false, // Allow preview for YouTube links
        });
    }
    catch (err) {
        console.error("YouTube API Error:", (err === null || err === void 0 ? void 0 : err.message) || err);
        const errorMessage = `⚠️ *Oops!* Something went wrong while searching for tutorials\\.\\n\\nPlease try again in a few moments, or visit our channel directly: [YohTech Solutions YouTube](https://www.youtube.com/@Yoh-Tech-Solutions)\\n\\nIf the problem continues, please contact our support team\\. 👥`;
        bot.sendMessage(chatId, errorMessage, {
            parse_mode: "MarkdownV2",
            disable_web_page_preview: true
        });
    }
    finally {
        // Always clear the session whether successful or not
        clearSession(chatId);
    }
}
// Add a /cancel command for user convenience
bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    clearSession(chatId);
    bot.sendMessage(chatId, "🚫 Current operation cancelled. Type /start to begin again.");
});
// Add a /help command that works globally
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `ℹ️ *YohTech Solutions Bot Help*\\n\\n*Available Commands:*\\n┣ /start \\- Begin the setup assistance process\\n┣ /cancel \\- Cancel the current operation\\n┗ /help \\- Show this help message\\n\\n*Need human support?* Contact our 24/7 team for immediate assistance\\. 👥`;
    bot.sendMessage(chatId, helpMessage, {
        parse_mode: "MarkdownV2"
    });
});
