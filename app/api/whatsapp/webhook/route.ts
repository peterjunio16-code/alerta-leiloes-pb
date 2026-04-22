import { NextRequest, NextResponse } from "next/server";
import { getKeywordResponse } from "@/lib/whatsapp/keywords";
import { sendWhatsAppMessage } from "@/lib/whatsapp/client";

// Webhook verification (Meta requires GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// Incoming messages — handles keyword replies only
// Welcome message is sent by /api/leads at registration time (not here)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages?.length) {
      return NextResponse.json({ status: "no_message" });
    }

    const message = messages[0];
    const from = message.from as string;
    const text = message.text?.body as string;

    if (!text) return NextResponse.json({ status: "non_text" });

    // Handle keyword commands
    const { match, message: responseMessage } = getKeywordResponse(text);
    if (match) {
      await sendWhatsAppMessage(from, responseMessage);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
