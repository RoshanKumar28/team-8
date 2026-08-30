import { NextResponse } from "next/server";
import { modelInfo, chatJSON } from "@/lib/llm";

// Go/no-go on the model's JSON reliability — hit this before trusting a demo.
export async function GET() {
  const info = modelInfo();
  if (!info.keySet) return NextResponse.json({ ...info, ok: false, error: "LLM_API_KEY not set" });
  try {
    const t0 = Date.now();
    const out = await chatJSON<{ ok: boolean; nested: { n: number }; list: string[] }>(
      'Return ONLY this JSON: {"ok":true,"nested":{"n":7},"list":["a","b"]}',
      [{ role: "user", content: "go" }]
    );
    const shapeOk = out?.ok === true && out?.nested?.n === 7 && Array.isArray(out?.list);
    return NextResponse.json({ ...info, ok: shapeOk, latencyMs: Date.now() - t0, got: out });
  } catch (e) {
    return NextResponse.json({ ...info, ok: false, error: e instanceof Error ? e.message : "failed" });
  }
}
