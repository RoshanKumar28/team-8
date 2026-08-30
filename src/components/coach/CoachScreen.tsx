"use client";

import { useEffect, useState } from "react";
import ChatThread from "./ChatThread";
import MemoryView from "./MemoryView";
import TodayScreen from "./TodayScreen";
import JourneyView from "./JourneyView";
import CycleLog from "./CycleLog";
import { OvyFlower } from "../ui/Logo";
import DailyCheckIn from "../daily/DailyCheckIn";
import DayLogSheet from "../cycle/DayLogSheet";
import MedsManager from "../meds/MedsManager";
import { Sun, Map, Flower2, MessageCircleHeart, BookHeart } from "lucide-react";
import { applyScopeCut, composeFollowUp } from "@/lib/followup";
import { askPermission, notifyCoach } from "@/lib/notify";
import CoachToast from "../ui/CoachToast";
import type { CheckIn, CycleDayLog, MealLog, Medication, MedTiming, Session } from "@/lib/types";

/* Opening line is built from the onboarding data — the first thing she sees
   is proof the coach was listening, not "Hi, how can I help you today?" */
function opener(s: Session): string {
  const p = s.memory.profile;
  if (!p.primaryConcern) {
    return `Hey${p.name ? ` ${p.name}` : ""} — I've read everything you gave me. One question before anything else: which of it actually gets to you the most? ("I don't know, it all feels connected" is a fine answer too.)`;
  }
  const bits: string[] = [];
  bits.push(`So — ${p.primaryConcern.toLowerCase()}. That's our lead.`);
  if (p.primaryConcernWhy) bits.push(`I'll remember why.`);
  bits.push(`Quick one: what does a bad day with it look like?`);
  return bits.join(" ");
}

export default function CoachScreen({
  session, onUpdate,
}: {
  session: Session;
  onUpdate: (s: Session) => void;
}) {
  const [tab, setTab] = useState<"today" | "journey" | "cycle" | "chat" | "memory">(session.memory.plan ? "today" : "chat");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [dayLogDate, setDayLogDate] = useState<string | null>(null);
  const [managingMeds, setManagingMeds] = useState(false);
  const [unread, setUnread] = useState(false);

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

  // Ask once, in context — right when there is finally a coach worth hearing from.
  useEffect(() => {
    if (session.memory.plan) void askPermission();
  }, [session.memory.plan]);

  // The coach reaches out on her own after a quiet stretch — this is the
  // "it messages you first" beat, live, with no button press.
  useEffect(() => {
    if (!session.memory.plan) return;
    const t = setTimeout(() => {
      const next: Session = JSON.parse(JSON.stringify(session));
      next.day += 1;
      onUpdate(next);
      setTimeout(() => ping(next), 300);
    }, 50_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.memory.plan, session.transcript.length, session.day]);

  // The coach speaks first when the rules say there's something to say. She is
  // not yanked into the chat — badge, Today banner, and a browser notification.
  function ping(s: Session) {
    const fu = composeFollowUp(s);
    if (!fu) return;
    const next: Session = JSON.parse(JSON.stringify(s));
    next.lastCoachPingDay = next.day;
    if (fu.action === "scopeCut") applyScopeCut(next);
    next.transcript.push({ role: "coach", text: fu.text, ts: Date.now(), quick: fu.quick });
    onUpdate(next);
    const name = next.memory.profile.name;
    notifyCoach(name ? `ovy → ${name}` : "ovy", fu.text, () => { setTab("chat"); setUnread(false); });
    setUnread(true);
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
    next.memory.checkIns = (next.memory.checkIns ?? []).filter((x) => x.day !== c.day);
    next.memory.checkIns.push({ ...c, ts: Date.now() });
    onUpdate(next);
  }

  function saveMeals(meals: Omit<MealLog, "id" | "ts">[]) {
    if (meals.length === 0) return;
    const next: Session = JSON.parse(JSON.stringify(session));
    (next.memory.meals ??= []).push(
      ...meals.map((m) => ({ ...m, id: Math.random().toString(36).slice(2, 8), ts: Date.now() })),
    );
    onUpdate(next);
  }

  // Saving a day log is the single source of truth: flow presence drives the
  // period-dot grid, so the two can never disagree.
  function saveDayLog(log: CycleDayLog) {
    const next: Session = JSON.parse(JSON.stringify(session));
    next.memory.cycleLogs = (next.memory.cycleLogs ?? []).filter((l) => l.date !== log.date);
    next.memory.cycleLogs.push(log);
    const set = new Set(next.memory.periodDates ?? []);
    if (log.flow) set.add(log.date); else set.delete(log.date);
    next.memory.periodDates = [...set].sort();
    onUpdate(next);
  }

  function takeMed(medId: string, timing: MedTiming) {
    const next: Session = JSON.parse(JSON.stringify(session));
    const i = next.memory.medTakes.findIndex(
      (t) => t.day === next.day && t.medId === medId && t.timing === timing,
    );
    if (i >= 0) next.memory.medTakes.splice(i, 1);
    else next.memory.medTakes.push({ day: next.day, medId, timing, ts: Date.now() });
    onUpdate(next);
  }

  function addMed(m: Omit<Medication, "id">) {
    const next: Session = JSON.parse(JSON.stringify(session));
    next.memory.medications.push({ ...m, id: Math.random().toString(36).slice(2, 8) });
    onUpdate(next);
  }

  function removeMed(id: string) {
    const next: Session = JSON.parse(JSON.stringify(session));
    next.memory.medications = next.memory.medications.filter((m) => m.id !== id);
    onUpdate(next);
  }

  function toggleRemind(id: string) {
    const next: Session = JSON.parse(JSON.stringify(session));
    const m = next.memory.medications.find((x) => x.id === id);
    if (m) m.remind = !m.remind;
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
    <div className="relative flex h-full min-h-0 flex-col">
      <CoachToast onOpen={() => { setTab("chat"); setUnread(false); }} />
      <header className="shrink-0 px-4 pb-1 pt-11" style={{ background: "linear-gradient(150deg, var(--c-brand-soft), var(--c-raised))" }}>
        <div className="flex items-center gap-3 pb-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface shadow-sm"><OvyFlower size={26} /></div>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-[15px] font-semibold text-ink">
              {p.primaryConcern ? `ovy · ${p.primaryConcern.toLowerCase()}` : "ovy"}
            </p>
            <p className="truncate text-[11px] text-muted">
              {busy ? "typing…" : session.memory.plan ? session.memory.plan.horizon : "Getting to know you"}
            </p>
          </div>
        </div>

      </header>

      {!session.memory.plan ? (
        <ChatThread session={session} busy={busy} error={error} onSend={send} />
      ) : (
        <>
      {tab === "today" && (
        <TodayScreen
          session={session}
          onCheck={check}
          onJumpDay={jumpDay}
          onOpenCheckIn={() => setCheckingIn(true)}
          onTakeMed={takeMed}
          onManageMeds={() => setManagingMeds(true)}
          coachNote={unread}
          onOpenChat={() => { setTab("chat"); setUnread(false); }}
        />
      )}
      {tab === "journey" && <div key="journey" className="pop-spring flex min-h-0 flex-1 flex-col"><JourneyView session={session} /></div>}
      {tab === "cycle" && <div key="cycle" className="pop-spring flex min-h-0 flex-1 flex-col"><CycleLog session={session} onOpenDay={setDayLogDate} /></div>}
      {tab === "chat" && <ChatThread session={session} busy={busy} error={error} onSend={send} />}
      {tab === "memory" && <div key="memory" className="pop-spring flex min-h-0 flex-1 flex-col"><MemoryView memory={session.memory} /></div>}

      <nav className="shrink-0 border-t border-line bg-surface px-2 pb-4 pt-1.5">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); if (id === "chat") setUnread(false); }}
              className="flex flex-1 flex-col items-center gap-0.5 py-1"
            >
              <span className={`relative grid h-8 w-14 place-items-center rounded-full transition ${
                tab === id ? "bg-brandsoft text-brand" : "text-faint"
              }`}>
                <Icon size={19} strokeWidth={tab === id ? 2.4 : 1.9} />
                {id === "chat" && unread && tab !== "chat" && (
                  <span className="absolute right-3 top-0.5 h-2 w-2 rounded-full bg-brand" />
                )}
              </span>
              <span className={`text-[9.5px] font-bold ${tab === id ? "text-brand" : "text-faint"}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
        </>
      )}
    </div>
  );
}

const TABS = [
  { id: "today", label: "Today", Icon: Sun },
  { id: "journey", label: "Journey", Icon: Map },
  { id: "cycle", label: "Cycle", Icon: Flower2 },
  { id: "chat", label: "Coach", Icon: MessageCircleHeart },
  { id: "memory", label: "Memory", Icon: BookHeart },
] as const;
