import { NextRequest, NextResponse } from "next/server";
import { pushInbound } from "@/lib/whatsapp";

/* Twilio posts form-encoded params on every inbound WhatsApp message.
   Point the sandbox's "WHEN A MESSAGE COMES IN" at <public-url>/api/whatsapp/webhook */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "").trim();
  if (body) pushInbound(from, body);
  // Empty TwiML = no auto-reply; the coach decides what to say from the app.
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { "Content-Type": "text/xml" },
  });
}
