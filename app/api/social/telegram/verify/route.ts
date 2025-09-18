import { NextResponse } from "next/server";

// Yes, you need to add a key in your .env file:
// TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

// This API route verifies if a user is a member of a Telegram channel using the Bot API getChatMember method.
// Expects JSON: { userId: string, channel?: string }
// channel defaults to @YohTechSolutions
export async function POST(req: Request) {
  try {
    const { userId, channel } = await req.json();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }
    // The bot token must be set in your .env file as TELEGRAM_BOT_TOKEN
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({
        ok: false,
        error: "Bot token not configured. Please add TELEGRAM_BOT_TOKEN to your .env file.",
      }, { status: 500 });
    }
    const chat = channel || "@YohTechSolutions";
    const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(chat)}&user_id=${encodeURIComponent(userId)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data.ok) {
      return NextResponse.json({ ok: false, error: data.description || "Telegram API error" }, { status: 200 });
    }
    const status = data.result?.status;
    const isMember = ["creator", "administrator", "member"].includes(status);
    return NextResponse.json({ ok: true, isMember, status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}


