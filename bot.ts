import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";
const YOUTUBE_CHANNEL_ID = "UC20UnSFgW5KadIRHbo-Rbkg";

if (!TOKEN) throw new Error("❌ Missing TELEGRAM_BOT_TOKEN in .env");
if (!YOUTUBE_API_KEY) throw new Error("❌ Missing YOUTUBE_API_KEY in .env");

const bot = new TelegramBot(TOKEN, { polling: true });

// Basic startup diagnostics
(async () => {
  try {
    const me = await bot.getMe();
    console.log(`🤖 YohTech Bot started successfully as @${me.username}`);
  } catch (e) {
    console.error('❌ Failed to start Telegram bot. Check TELEGRAM_BOT_TOKEN and network connectivity.');
  }
})();

bot.on('polling_error', (err) => {
  console.error('🔴 Polling error:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('🔴 Unhandled promise rejection in bot:', reason);
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
    const helpMessage = `🛠️ *No problem! Let's find your WAN IP together.*

Your WAN IP is the address assigned to your router by your ISP.

*The easiest way to find your WAN IP:*

1. 📱 Connect to your WiFi network
2. 🌐 Open any web browser  
3. 🔗 Visit this site:
   • *WhatIsMyIP.com* → https://www.whatismyip.com/

4. 🔍 The number shown is your *WAN IP address*
   Example: \`10.239.139.51\` (starts with 10.)

*💡 Your WAN IP will start with 10.* (like 10.239.139.51) - this is normal!

*Once you see your WAN IP, copy and paste it here!* 📋`;

    await bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
    return; // Stop further processing, keep the session at "awaiting_wan_ip"
  }

  // Step 1: WAN IP
  if (sessions[chatId].step === "awaiting_wan_ip") {
    // Basic validation for IP address format (simple check)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(text)) {
      bot.sendMessage(chatId, "⚠️ That doesn't look like a valid IP address format (e.g., 10.239.139.51). Please check and try again, or type 'help' for assistance.");
      return;
    }

    // Additional validation for 10.x.x.x IP range
    if (!text.startsWith('10.')) {
      bot.sendMessage(chatId, "⚠️ Your WAN IP should start with '10.' (like 10.239.139.51). Please check the IP address from WhatIsMyIP.com and try again, or type 'help' for assistance.");
      return;
    }

    const customer = await prisma.customerWanIp.findFirst({
      where: { wanIp: text },
      include: { interface: { include: { region: true } } },
    });

    if (!customer) {
      bot.sendMessage(chatId, "⚠️ WAN IP not found in our database. Please check that you entered the correct IP address from WhatIsMyIP.com, or type 'help' if you need assistance finding your WAN IP.");
      return;
    }

    sessions[chatId].wanIp = text;
    sessions[chatId].interfaceRecord = customer.interface;

    const ipInfoMessage = `✅ *Excellent! WAN IP Found!* 🎉\n\n*Here are your network details:*\n┣ 🌐 *WAN IP:* ${text}\n┣ 📡 *Subnet Mask:* ${customer.interface?.subnetMask ?? "N/A"}\n┗ 🚪 *Default Gateway:* ${customer.interface?.defaultGateway ?? "N/A"}\n\n*Next, let's find tutorials for your specific device.*`;

    bot.sendMessage(chatId, ipInfoMessage, { parse_mode: "Markdown" });

    const nextStepMessage = `📝 *Please type your modem/router model* (e.g., *TP-Link Archer C6*, *Huawei HG8245H*, *D-Link DIR-825*):\n\n💡 *Tip:* You can usually find the model number on a sticker on the bottom or back of your device.`;
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
    console.error("YouTube API Error:", err);
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