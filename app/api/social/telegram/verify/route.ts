import { NextResponse } from "next/server";
import { z } from 'zod';
import { sanitizePlain } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';

// Yes, you need to add a key in your .env file:
// TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

// This API route verifies if a user is a member of a Telegram channel using the Bot API getChatMember method.
// Expects JSON: { userId: string, channel?: string }
// channel defaults to @YohTechSolutions
export async function POST(req: Request) {
  try {
    const ip = (req.headers as any).get?.('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rl = checkRateLimit(`telegram:verify:${ip}`, false);
    if (rl.limited) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
    }

    const schema = z.object({
      userId: z.string().min(1).max(30),
      channel: z.string().min(2).max(100).optional()
    });
    let parsed;
    try {
      parsed = schema.parse(await req.json());
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ ok: false, error: 'Bot token not configured' }, { status: 500 });
    }
    const chat = parsed.channel ? sanitizePlain(parsed.channel, { maxLength: 100 }) : '@YohTechSolutions';
    const userId = sanitizePlain(parsed.userId, { maxLength: 30 });
    const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(chat)}&user_id=${encodeURIComponent(userId)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data.ok) {
      return NextResponse.json({ ok: false, error: data.description || 'Telegram API error' }, { status: 200 });
    }
    const status = data.result?.status;
    const isMember = ['creator', 'administrator', 'member'].includes(status);
    return NextResponse.json({ ok: true, isMember, status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}


