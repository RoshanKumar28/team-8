import { NextRequest, NextResponse } from "next/server";
import { readInbox } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const since = Number(req.nextUrl.searchParams.get("since") ?? 0);
  return NextResponse.json({ messages: readInbox(since) });
}
