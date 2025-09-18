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

// In-memory sessions
const sessions: Record<
  number,
  { step: string; wanIp?: string; interfaceRecord?: any; router?: string }
> = {};

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome! Please enter your **WAN IP address**:");
  sessions[chatId] = { step: "awaiting_wan_ip" };
});

// Listen for messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!sessions[chatId] || !text || text.startsWith("/")) return;

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

    bot.sendMessage(
      chatId,
      `✅ WAN IP Found!
- Subnet Mask: ${customer.interface?.subnetMask ?? "N/A"}
- Default Gateway: ${customer.interface?.defaultGateway ?? "N/A"}`
    );

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
async function handleRouterSelection(chatId: number, routerModel: string) {
  try {
    const interfaceRecord = sessions[chatId]?.interfaceRecord;

    // Search YouTube for router model
    const ytRes = await axios.get<{ items: any[] }>(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: YOUTUBE_API_KEY,
          channelId: YOUTUBE_CHANNEL_ID,
          q: routerModel,
          order: "date",
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

    let message = `📡 WAN IP Information:
- WAN IP: ${sessions[chatId]?.wanIp}
- Region: ${interfaceRecord?.region?.name ?? "N/A"}
- Interface: ${interfaceRecord?.name ?? "N/A"}
- Subnet Mask: ${interfaceRecord?.subnetMask ?? "N/A"}
- Default Gateway: ${interfaceRecord?.defaultGateway ?? "N/A"}

🎥 Tutorials for your ${routerModel}:\n`;

    if (matchingVideos.length === 0) {
      message += "No tutorial found matching your router. Visit our channel: https://www.youtube.com/@Yoh-Tech-Solutions";
    } else {
      matchingVideos.forEach((vid, index) => {
        message += `${index + 1}. Title: ${vid.snippet.title}\n   Link: https://www.youtube.com/watch?v=${vid.id.videoId}\n\n`;
      });
    }

    bot.sendMessage(chatId, message);

    // Clean up session
    delete sessions[chatId];
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again later.");
    delete sessions[chatId];
  }
}
