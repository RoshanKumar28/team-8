"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import type { Session } from "@/lib/types";

export default function ChatThread({
  session, busy, error, onSend,
}: {
  session: Session;
  busy: boolean;
  error: string;
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.transcript.length, busy]);

  function submit() {
    if (!input.trim() || busy) return;
    onSend(input.trim());
    setInput("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scroll-thin min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-bg px-4 py-4">
        {session.transcript.map((t, i) => (
          <div key={i} className={`pop-spring flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[84%] whitespace-pre-wrap rounded-[var(--r-lg)] px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                t.role === "user"
                  ? "card-soft rounded-br-md bg-brand text-brandink"
                  : "card-soft rounded-bl-md bg-surface text-ink"
              }`}
            >
              {t.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="card-soft rounded-[var(--r-lg)] rounded-bl-md bg-surface px-4 py-3">
              <span className="dots"><span /><span /><span /></span>
            </div>
          </div>
        )}
        {error && (
          <p className="rounded-[var(--r-sm)] bg-bad/10 px-3 py-2 text-center text-[12px] text-bad">{error}</p>
        )}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-line bg-surface px-3 pb-5 pt-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
            }}
            rows={1}
            placeholder="Talk to your coach…"
            className="max-h-28 flex-1 resize-none rounded-[var(--r-lg)] bg-raised px-4 py-3 text-[13.5px] text-ink outline-none ring-1 ring-transparent transition placeholder:text-faint focus:ring-brand"
          />
          <button
            onClick={submit}
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-brandink transition disabled:opacity-40"
          >
            <SendHorizonal size={16} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[9.5px] text-faint">
          Not medical advice. Always confirm with your doctor.
        </p>
      </div>
    </div>
  );
}
