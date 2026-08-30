import { NextRequest, NextResponse } from "next/server";
import { runTurn } from "@/lib/coach";
import type { Session } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { session, message } = (await req.json()) as { session: Session; message: string };
    if (!session || typeof message !== "string") {
      return NextResponse.json({ error: "session and message required" }, { status: 400 });
    }
    const result = await runTurn(session, message);
    return NextResponse.json({ ...result, session });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "coach failed" },
      { status: 500 }
    );
  }
}
