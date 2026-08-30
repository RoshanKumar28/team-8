"use client";

import { useEffect, useState } from "react";
import ChatThread from "./ChatThread";
import MemoryView from "./MemoryView";
import TodayScreen from "./TodayScreen";
import DailyCheckIn from "../daily/DailyCheckIn";
import { followUp } from "@/lib/followup";
import type { CheckIn, MealLog, Session } from "@/lib/types";

/* Opening line is built from the onboarding data — the first thing she sees
   is proof the coach was listening, not "Hi, how can I help you today?" */
function opener(s: Session): string {
  const p = s.memory.profile;
  if (!p.primaryConcern) {
    const symptoms = p.symptoms.length
      ? `You told me about ${p.symptoms.slice(0, 4).map((x) => x.toLowerCase()).join(", ")}${p.symptoms.length > 4 ? " and more" : ""}. `
      : "";
    return `${symptoms}Before I build anything, one question that decides everything else: of all of it, which one actually gets to you — the one you think about in the mirror? There's no wrong answer, and "I honestly don't know, it all feels connected" is a fine one too — I'll figure it out with you as we go.`;
  }
  const bits: string[] = [];
  const rest = p.concerns.slice(1);
  bits.push(
    rest.length
      ? `So — ${p.primaryConcern.toLowerCase()} first, with ${rest.map((c) => c.toLowerCase()).join(" and ")} on the board too.`
      : `So — ${p.primaryConcern.toLowerCase()}. That's what we're aiming at.`
  );
  if (p.primaryConcernWhy) bits.push(`And I heard why: "${p.primaryConcernWhy}". I'll remember that on the days this feels pointless.`);
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
  const [checkingIn, setCheckingIn] = useState(false);

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

  // Re-answering the same day overwrites rather than stacking — she is
  // correcting the record, not logging a second morning.
  function saveCheckIn(c: Omit<CheckIn, "ts">) {
    const next: Session = JSON.parse(JSON.stringify(session));
    next.memory.checkIns = next.memory.checkIns.filter((x) => x.day !== c.day);
    next.memory.checkIns.push({ ...c, ts: Date.now() });
    onUpdate(next);
  }

  function saveMeals(meals: Omit<MealLog, "id" | "ts">[]) {
    if (meals.length === 0) return;
    const next: Session = JSON.parse(JSON.stringify(session));
    next.memory.meals.push(
      ...meals.map((m) => ({ ...m, id: Math.random().toString(36).slice(2, 8), ts: Date.now() })),
    );
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

  // The slides take the whole phone — this is a 30-second job, not a panel to
  // read the plan through.
  if (checkingIn) {
    return (
      <DailyCheckIn
        session={session}
        onSaveCheckIn={saveCheckIn}
        onSaveMeals={saveMeals}
        onClose={() => setCheckingIn(false)}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-line bg-surface px-4 pb-0 pt-11">
        <div className="flex items-center gap-3 pb-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-display text-[15px] font-semibold text-brandink">
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

      {tab === "today" && (
        <TodayScreen
          session={session}
          onCheck={check}
          onJumpDay={jumpDay}
          onOpenCheckIn={() => setCheckingIn(true)}
        />
      )}
      {tab === "chat" && <ChatThread session={session} busy={busy} error={error} onSend={send} />}
      {tab === "memory" && <MemoryView memory={session.memory} />}
    </div>
  );
}
