import { NextRequest, NextResponse } from "next/server";

// This runs on the server only — the bot token never reaches the browser.
export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not set on the server." }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const chatId = body?.chatId;
  const message = body?.message;
  if (!chatId || !message) {
    return NextResponse.json({ error: "chatId and message are required." }, { status: 400 });
  }

  const telegramResponse = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  const telegramData = await telegramResponse.json();
  if (!telegramData.ok) {
    // Most common cause: this chat ID hasn't messaged the bot yet, or the
    // chat ID is wrong. Surface Telegram's own error so it's easy to debug.
    return NextResponse.json({ error: telegramData.description || "Telegram rejected the message." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
