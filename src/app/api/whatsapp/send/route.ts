import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp, waConfigured } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const r = await sendWhatsApp(text.slice(0, 1200));
  return NextResponse.json(r, { status: r.ok ? 200 : 502 });
}

export async function GET() {
  return NextResponse.json({ configured: waConfigured() });
}
