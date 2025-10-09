import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import https from 'https';
import fs from 'fs';

// Security guard: ensure insecure TLS override isn't silently active.
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  // eslint-disable-next-line no-console
  console.warn('[bot] NODE_TLS_REJECT_UNAUTHORIZED=0 detected. Removing for security.');
  delete process.env.NODE_TLS_REJECT_UNAUTHORIZED; // restore default secure behavior
}

const prisma = new PrismaClient();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";
const YOUTUBE_CHANNEL_ID = "UC20UnSFgW5KadIRHbo-Rbkg";

if (!TOKEN) throw new Error("❌ Missing TELEGRAM_BOT_TOKEN in .env");
if (!YOUTUBE_API_KEY) throw new Error("❌ Missing YOUTUBE_API_KEY in .env");

// Optional: allow trusting an internal/self-signed CA without disabling verification globally.
// Provide path via CUSTOM_CA_BUNDLE_PATH or NODE_EXTRA_CA_CERTS.
let httpsAgent: https.Agent | undefined;
const caPath = process.env.CUSTOM_CA_BUNDLE_PATH || process.env.NODE_EXTRA_CA_CERTS;
if (caPath) {
  try {
    const ca = fs.readFileSync(caPath, 'utf8');
    httpsAgent = new https.Agent({ ca });
    console.log(`[bot] Loaded custom CA bundle from ${caPath}`);
  } catch (e) {
    console.warn('[bot] Failed to load custom CA bundle:', (e as any)?.message || e);
  }
}

// node-telegram-bot-api does not expose a simple https.Agent override in polling options; instead, rely on
// environment trust store for Telegram endpoints. We still apply custom CA to axios (YouTube) calls below.
const bot = new TelegramBot(TOKEN, { polling: true });

// Polling resilience state
let pollingRetry = 0;
const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;
let restarting = false;

function schedulePollingRestart(reason: string) {
  if (restarting) return; // prevent overlapping restarts
  pollingRetry++;
  const delay = Math.min(BASE_BACKOFF_MS * 2 ** (pollingRetry - 1), MAX_BACKOFF_MS);
  restarting = true;
  console.warn(`[bot] Scheduling polling restart in ${delay}ms (attempt #${pollingRetry}) – reason: ${reason}`);
  setTimeout(async () => {
    try {
      await bot.stopPolling();
    } catch (_) {
      /* ignore */
    }
    try {
      await bot.startPolling();
      console.log('[bot] Polling restarted successfully');
      restarting = false;
    } catch (err) {
      console.error('[bot] Polling restart failed:', (err as any)?.message || err);
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
  } catch (e) {
    console.error('❌ Failed to start Telegram bot. Check TELEGRAM_BOT_TOKEN and network connectivity.');
  }
})();

// Throttle identical error messages to avoid log spam
const errorCounts: Record<string, { count: number; first: number; last: number }> = {};
const ERROR_LOG_WINDOW_MS = 60_000; // compress counts per minute
const SELF_SIGNED_MAX_RETRIES = 5;
let selfSignedErrorCount = 0;
let selfSignedHalted = false;

function logThrottled(key: string, printer: () => void) {
  const now = Date.now();
  const bucket = errorCounts[key] || { count: 0, first: now, last: now };
  bucket.count++;
  bucket.last = now;
  errorCounts[key] = bucket;
  if (bucket.count === 1) {
    printer();
  } else if (now - bucket.first > ERROR_LOG_WINDOW_MS) {
    console.warn(`[bot] Repeated error '${key}' occurred ${bucket.count} times in ${(now - bucket.first)/1000}s`);
    delete errorCounts[key];
  }
}

bot.on('polling_error', (err: any) => {
  const msg = String(err?.message || err);
  const code = (err && (err.code || err.response?.status)) || 'UNKNOWN';
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

  if (selfSignedHalted) return; // do not attempt further restarts until fixed

  if (isTransient && !selfSignedHalted) {
    schedulePollingRestart(msg);
  } else if (!selfSigned) {
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
const sessions: Record<
  number,
  { step: string; wanIp?: string; interfaceRecord?: any; router?: string }
> = {};

// Function to safely clear a user's session
function clearSession(chatId: number) {
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
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Ignore commands and empty messages
  if (!text || text.startsWith("/")) return;

  // If no session exists, likely a random message, guide them to /start
  if (!sessions[chatId]) {
    bot.sendMessage(chatId, "💡 Type /start to begin the setup assistance.");
    return;
  }

  const lowerText = text.toLowerCase();

  // Handle 'help' command at any point during the WAN IP step
  if (sessions[chatId]?.step === "awaiting_wan_ip" && lowerText === 'help') {
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

      let classificationNote: string;
      if (isPublic) {
        classificationNote = '🔎 *Classification:* Public ISP edge IP';
      } else if (isPrivate10) {
        classificationNote = '🔎 *Classification:* Private (10.x) routed WAN IP';
      } else {
        classificationNote = '🔎 *Classification:* Private RFC1918 IP';
      }

      const ipInfoMessage = `✅ *IP Found!* 🎉\n\n*Here are your network details:*\n┣ 🌐 *IP:* ${text}\n┣ 📡 *Subnet Mask:* ${customer.interface?.subnetMask ?? "N/A"}\n┣ 🚪 *Default Gateway:* ${customer.interface?.defaultGateway ?? "N/A"}\n┗ 🗺️ *Region:* ${customer.interface?.region?.name ?? 'N/A'}\n${classificationNote}\n\n*Next, let's find tutorials for your specific device.*`;

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
async function handleRouterSelection(chatId: number, routerModel: string) {
  try {
    const interfaceRecord = sessions[chatId]?.interfaceRecord;

    // Show searching message
    const searchingMessage = `🔍 *Searching for tutorials for your ${routerModel}...*\n\nPlease wait a moment while I check our YouTube channel.`;
    await bot.sendMessage(chatId, searchingMessage, { parse_mode: "Markdown" });

    // Search YouTube for router model
    const ytRes = await axios.get<{ items: any[] }>(
      "https://www.googleapis.com/youtube/v3/search",
      {
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
      }
    );

    const items = ytRes.data.items ?? [];

    // Filter results by title containing routerModel keyword (case-insensitive)
    const matchingVideos = items
      .filter((item) =>
        item.snippet?.title?.toLowerCase().includes(routerModel.toLowerCase())
      )
      .slice(0, 10); // max 10

    // Build a comprehensive results message with emojis and markdown
    let message = `*📋 Your Network Configuration Summary*\\n\\n`;
    message += `┣ 🌐 *WAN IP:* ${sessions[chatId]?.wanIp}\\n`;
    message += `┣ 🗺️ *Region:* ${interfaceRecord?.region?.name ?? "N/A"}\\n`;
    message += `┣ 📶 *Interface:* ${interfaceRecord?.name ?? "N/A"}\\n`;
    message += `┣ 📡 *Subnet Mask:* ${interfaceRecord?.subnetMask ?? "N/A"}\\n`;
    message += `┗ 🚪 *Default Gateway:* ${interfaceRecord?.defaultGateway ?? "N/A"}\\n\\n`;

    message += `*🎥 Tutorial Videos for your ${routerModel}:*\\n\\n`;

    if (matchingVideos.length === 0) {
      message += `*❌ No specific tutorial found for "${routerModel}"*\\n\\n`;
      message += `🔍 *Don't worry! Try these solutions:*\\n`;
      message += `• Check for typos in the model name\\n`;
      message += `• Search for your router's brand instead (e.g., "TP\\-Link" instead of "TP\\-Link Archer C6")\\n`;
      message += `• Visit our channel for general setup guides: [YohTech Solutions YouTube Channel](https://www.youtube.com/@Yoh-Tech-Solutions)\\n\\n`;
      message += `*👥 Need more help?* Contact our 24/7 support team for direct assistance\\.`;
    } else {
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

  } catch (err) {
  console.error("YouTube API Error:", (err as any)?.message || err);
    const errorMessage = `⚠️ *Oops!* Something went wrong while searching for tutorials\\.\\n\\nPlease try again in a few moments, or visit our channel directly: [YohTech Solutions YouTube](https://www.youtube.com/@Yoh-Tech-Solutions)\\n\\nIf the problem continues, please contact our support team\\. 👥`;
    bot.sendMessage(chatId, errorMessage, { 
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true 
    });
  } finally {
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