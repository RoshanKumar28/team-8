// Provider-agnostic so the model can be swapped in one env var if GLM's JSON
// output turns out unreliable.
type Msg = { role: "system" | "user" | "assistant"; content: string };

const BASE = process.env.LLM_BASE_URL || "https://ai-gateway.vercel.sh/v1";
const MODEL = process.env.LLM_MODEL || "zai/glm-5.3-flash";
const KEY = process.env.LLM_API_KEY || "";
export const MOCK = process.env.MOCK_AI === "1";

export async function chatJSON<T>(system: string, messages: Msg[]): Promise<T> {
  if (!KEY) throw new Error("LLM_API_KEY is not set — add it to .env.local");

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: system }, ...messages],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 4000,
      ...(BASE.includes("ai-gateway.vercel.sh")
        ? { providerOptions: { gateway: { only: ["zai", "novita", "gmicloud"] } } }
        : {}),
    }),
  });

  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? "";
  return parseLoose<T>(raw);
}

// Flash-tier models wrap JSON in prose or fences often enough that this matters.
export function parseLoose<T>(raw: string): T {
  const cleaned = raw.replace(/```json/gi, "```").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error(`No JSON in model output: ${raw.slice(0, 200)}`);
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  }
}

export const modelInfo = () => ({ base: BASE, model: MODEL, keySet: Boolean(KEY) });
