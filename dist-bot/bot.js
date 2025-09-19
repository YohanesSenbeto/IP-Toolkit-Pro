"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const YOUTUBE_API_KEY = (_a = process.env.YOUTUBE_API_KEY) !== null && _a !== void 0 ? _a : "";
const YOUTUBE_CHANNEL_ID = "UC20UnSFgW5KadIRHbo-Rbkg";
if (!TOKEN)
    throw new Error("❌ Missing TELEGRAM_BOT_TOKEN in .env");
if (!YOUTUBE_API_KEY)
    throw new Error("❌ Missing YOUTUBE_API_KEY in .env");
const bot = new node_telegram_bot_api_1.default(TOKEN, { polling: true });
// Basic startup diagnostics
(async () => {
    try {
        const me = await bot.getMe();
        console.log(`🤖 Telegram bot started as @${me.username} (id=${me.id})`);
    }
    catch (e) {
        console.error('Failed to start Telegram bot. Check TELEGRAM_BOT_TOKEN and network connectivity.');
    }
})();
bot.on('polling_error', (err) => {
    console.error('Polling error:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection in bot:', reason);
});
// In-memory sessions
const sessions = {};
// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome! Please enter your **WAN IP address**:");
    sessions[chatId] = { step: "awaiting_wan_ip" };
});
// Listen for messages
bot.on("message", async (msg) => {
    var _a, _b, _c, _d, _e;
    const chatId = msg.chat.id;
    const text = (_a = msg.text) === null || _a === void 0 ? void 0 : _a.trim();
    if (!sessions[chatId] || !text || text.startsWith("/"))
        return;
    // Step 1: WAN IP
    if (sessions[chatId].step === "awaiting_wan_ip") {
        const customer = await prisma.customerWanIp.findFirst({
            where: { wanIp: text },
            include: { interface: { include: { region: true } } },
        });
        if (!customer) {
            bot.sendMessage(chatId, "⚠️ WAN IP not found. Please check and try again.");
            return;
        }
        sessions[chatId].wanIp = text;
        sessions[chatId].interfaceRecord = customer.interface;
        bot.sendMessage(chatId, `✅ WAN IP Found!
- Subnet Mask: ${(_c = (_b = customer.interface) === null || _b === void 0 ? void 0 : _b.subnetMask) !== null && _c !== void 0 ? _c : "N/A"}
- Default Gateway: ${(_e = (_d = customer.interface) === null || _d === void 0 ? void 0 : _d.defaultGateway) !== null && _e !== void 0 ? _e : "N/A"}`);
        bot.sendMessage(chatId, "Please type your **modem/router model** (e.g., TP-Link, Huawei):");
        sessions[chatId].step = "awaiting_router_search";
        return;
    }
    // Step 2: Skip DB router search → go straight to YouTube
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
        // Search YouTube for router model
        const ytRes = await axios_1.default.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                key: YOUTUBE_API_KEY,
                channelId: YOUTUBE_CHANNEL_ID,
                q: routerModel,
                order: "date",
                maxResults: 20, // fetch more to filter later
                type: "video",
                part: "snippet",
            },
        });
        const items = (_b = ytRes.data.items) !== null && _b !== void 0 ? _b : [];
        // Filter results by title containing routerModel keyword (case-insensitive)
        const matchingVideos = items
            .filter((item) => { var _a, _b; return (_b = (_a = item.snippet) === null || _a === void 0 ? void 0 : _a.title) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(routerModel.toLowerCase()); })
            .slice(0, 10); // max 10
        let message = `📡 WAN IP Information:
- WAN IP: ${(_c = sessions[chatId]) === null || _c === void 0 ? void 0 : _c.wanIp}
- Region: ${(_e = (_d = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.region) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : "N/A"}
- Interface: ${(_f = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.name) !== null && _f !== void 0 ? _f : "N/A"}
- Subnet Mask: ${(_g = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.subnetMask) !== null && _g !== void 0 ? _g : "N/A"}
- Default Gateway: ${(_h = interfaceRecord === null || interfaceRecord === void 0 ? void 0 : interfaceRecord.defaultGateway) !== null && _h !== void 0 ? _h : "N/A"}

🎥 Tutorials for your ${routerModel}:\n`;
        if (matchingVideos.length === 0) {
            message += "No tutorial found matching your router. Visit our channel: https://www.youtube.com/@Yoh-Tech-Solutions";
        }
        else {
            matchingVideos.forEach((vid, index) => {
                message += `${index + 1}. Title: ${vid.snippet.title}\n   Link: https://www.youtube.com/watch?v=${vid.id.videoId}\n\n`;
            });
        }
        bot.sendMessage(chatId, message);
        // Clean up session
        delete sessions[chatId];
    }
    catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again later.");
        delete sessions[chatId];
    }
}
