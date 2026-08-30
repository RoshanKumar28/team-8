"use client";

import { useEffect, useState } from "react";
import ChatThread from "./ChatThread";
import MemoryView from "./MemoryView";
import TodayScreen from "./TodayScreen";
import { followUp } from "@/lib/followup";
import type { Session } from "@/lib/types";

/* Opening line is built from the onboarding data — the first thing she sees
   is proof the coach was listening, not "Hi, how can I help you today?" */
function opener(s: Session): string {
  const p = s.memory.profile;
  const bits: string[] = [];
  if (p.primaryConcern) {
    const rest = p.concerns.slice(1);
    bits.push(
      rest.length
        ? `So — ${p.primaryConcern.toLowerCase()} first, with ${rest.map((c) => c.toLowerCase()).join(" and ")} on the board too. That's the order you gave me, and it's the order I'll work.`
        : `So — ${p.primaryConcern.toLowerCase()}. That's what we're aiming at.`
    );
    if (p.primaryConcernWhy) bits.push(`And I heard why: "${p.primaryConcernWhy}". I'll remember that on the days this feels pointless.`);
  }
  if (p.stress && p.job) {
    bits.push(`You also told me about ${p.job.toLowerCase()} and ${p.stress.toLowerCase()} stress, so I'm not going to hand you a plan written for someone with a quiet life.`);
  }
  bits.push(`One honest thing before we build the plan: how long has this been going on, and what does a bad day with it actually look like?`);
  return bits.join(" ");
}

export default function CoachScreen({
  session, onUpdate,
}: {
  session: Session;
  onUpdate: (s: Session) => void;
}) {
  const [tab, setTab] = useState<"today" | "chat" | "memory">(session.memory.plan ? "today" : "chat");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session.transcript.length === 0) {
      onUpdate({
        ...session,
        transcript: [{ role: "coach", text: opener(session), ts: Date.now() }],
      });
      return;
    }
    ping(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The coach speaks first when the rules say there's something to say.
  function ping(s: Session) {
    const msg = followUp(s);
    if (!msg) return;
    onUpdate({
      ...s,
      lastCoachPingDay: s.day,
      transcript: [...s.transcript, { role: "coach", text: msg, ts: Date.now() }],
    });
    setTab("chat");
  }

  function check(commitmentId: string, done: boolean, reason: string) {
    const next: Session = JSON.parse(JSON.stringify(session));
    next.memory.checks.push({
      id: Math.random().toString(36).slice(2, 8),
      commitmentId, day: next.day, done, reason,
    });
    const c = next.memory.commitments.find((x) => x.id === commitmentId);
    if (c && !done && reason) c.note = reason;
    onUpdate(next);
  }

  function jumpDay() {
    const next: Session = JSON.parse(JSON.stringify(session));
    next.day += 1;
    onUpdate(next);
    // Let state settle, then let the coach react to the new morning.
    setTimeout(() => ping(next), 350);
  }

  async function send(text: string) {
    setError("");
    setBusy(true);
    const optimistic: Session = {
      ...session,
      transcript: [...session.transcript, { role: "user", text, ts: Date.now() }],
    };
    onUpdate(optimistic);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      onUpdate(data.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed — try again");
      onUpdate(session);
    } finally {
      setBusy(false);
    }
  }

  const p = session.memory.profile;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-line bg-surface px-4 pb-0 pt-11">
        <div className="flex items-center gap-3 pb-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-display text-[15px] font-semibold text-brandink">
            {p.name ? p.name[0].toUpperCase() : "C"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-[15px] font-semibold text-ink">
              {p.primaryConcern ? `Your coach · ${p.primaryConcern}` : "Your coach"}
            </p>
            <p className="truncate text-[11px] text-muted">
              {busy ? "typing…" : session.memory.plan ? session.memory.plan.horizon : "Getting to know you"}
            </p>
          </div>
        </div>
        <nav className="flex gap-1">
          {(["today", "chat", "memory"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-[var(--r-sm)] px-3.5 py-2 text-[12.5px] font-semibold transition ${
                tab === t
                  ? "border-b-2 border-brand text-brand"
                  : "text-faint hover:text-muted"
              }`}
            >
              {t === "today" ? "Today" : t === "chat" ? "Coach" : "Memory"}
            </button>
          ))}
        </nav>
      </header>

      {tab === "today" && <TodayScreen session={session} onCheck={check} onJumpDay={jumpDay} />}
      {tab === "chat" && <ChatThread session={session} busy={busy} error={error} onSend={send} />}
      {tab === "memory" && <MemoryView memory={session.memory} />}
    </div>
  );
}
