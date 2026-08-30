/* WhatsApp via the Twilio sandbox. Free trial, two-way. Plain REST — no SDK.
   Server-side only: the auth token must never reach the client. */

const SID = process.env.TWILIO_ACCOUNT_SID || "";
const TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"; // sandbox default
const TO = process.env.WHATSAPP_TO || "";

export const waConfigured = () => Boolean(SID && TOKEN && TO);

export async function sendWhatsApp(body: string): Promise<{ ok: boolean; detail: string }> {
  if (!waConfigured()) return { ok: false, detail: "TWILIO_AUTH_TOKEN / WHATSAPP_TO not set" };
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: FROM, To: TO, Body: body }),
    },
  );
  const detail = await res.text();
  return { ok: res.ok, detail: res.ok ? "sent" : detail.slice(0, 300) };
}

/* Inbound replies land here from the webhook. In-memory is fine for a live
   demo on one dev server; a deployed version would need real storage. */
type Inbound = { id: string; from: string; body: string; ts: number };
const g = globalThis as unknown as { __waInbox?: Inbound[] };
const inbox = (g.__waInbox ??= []);

export function pushInbound(from: string, body: string) {
  inbox.push({ id: Math.random().toString(36).slice(2, 8), from, body, ts: Date.now() });
  if (inbox.length > 50) inbox.shift();
}

export function readInbox(since: number): Inbound[] {
  return inbox.filter((m) => m.ts > since);
}
