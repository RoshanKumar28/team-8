"use client";

import { useState } from "react";
import { Check, X, FastForward, NotebookPen, Sparkles, TrendingUp, TrendingDown, Minus, Pencil, MessageCircleHeart, ChevronRight } from "lucide-react";
import { CloudRainWind } from "lucide-react";
import MedsCard from "../meds/MedsCard";
import { todaysTasks } from "@/lib/followup";
import { flareCopy, predictFlare } from "@/lib/predict";
import type { MedTiming, Session } from "@/lib/types";

const REASONS = ["Schedule blew up", "No energy", "Flare / cramps", "Forgot", "Didn't feel like it"];

export default function TodayScreen({
  session, onCheck, onJumpDay, onOpenCheckIn, onTakeMed, onManageMeds, coachNote, onOpenChat,
}: {
  session: Session;
  onCheck: (commitmentId: string, done: boolean, reason: string) => void;
  onJumpDay: () => void;
  onOpenCheckIn: () => void;
  onTakeMed: (medId: string, timing: MedTiming) => void;
  onManageMeds: () => void;
  coachNote: boolean;
  onOpenChat: () => void;
}) {
  const [asking, setAsking] = useState<string | null>(null); // commitmentId awaiting a reason
  const tasks = todaysTasks(session);
  const doneCount = tasks.filter((t) => t.check?.done).length;
  const concern = session.memory.profile.primaryConcern;
  const checkIn = (session.memory.checkIns ?? []).find((c) => c.day === session.day) ?? null;
  const meals = (session.memory.meals ?? []).filter((m) => m.day === session.day);
  const prediction = predictFlare(session.memory);

  return (
    <div className="app-bg scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="px-4 pb-2 pt-1">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[19px] font-semibold text-ink">Day {session.day}</h2>
          <button onClick={onJumpDay}
            className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10.5px] font-semibold text-muted">
            <FastForward size={11} className="mr-1 inline-block align-[-1px]" />next day
          </button>
        </div>
        {concern && (
          <p className="mt-0.5 text-[12px] text-muted">
            Everything below is for <span className="font-semibold text-brand">{concern.toLowerCase()}</span> — even when it doesn&apos;t look like it.
          </p>
        )}
      </div>

      <div className="space-y-2.5 px-4 pb-6">
        {coachNote && (
          <button onClick={onOpenChat}
            className="card-soft rise flex w-full items-center gap-3 rounded-[var(--r-md)] bg-brand p-3.5 text-left text-brandink transition hover:opacity-95">
            <MessageCircleHeart size={18} className="shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold">Your coach left you a note</span>
              <span className="block text-[11.5px] opacity-80">One tap to read it — quick replies inside.</span>
            </span>
            <ChevronRight size={16} className="shrink-0" />
          </button>
        )}

        {prediction && prediction.daysAway <= 5 && (() => {
          const c = flareCopy(prediction);
          return (
            <div className="card-soft rise rounded-[var(--r-md)] border border-accent/40 bg-accent/10 p-3.5">
              <div className="flex items-center gap-2">
                <CloudRainWind size={15} className="shrink-0 text-accent" />
                <p className="text-[12.5px] font-bold text-ink">{c.title}</p>
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{c.body}</p>
            </div>
          );
        })()}
        {/* Sits above the plan on purpose — it costs 30 seconds and it is the
            only row that still makes sense on a day when nothing else does. */}
        {!checkIn ? (
          <button
            onClick={onOpenCheckIn}
            className="card-soft pop-spring flex w-full items-center gap-3 rounded-[var(--r-md)] bg-brandsoft p-3.5 text-left transition hover:opacity-90"
          >
            <span className="wave grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-brandink">
              <NotebookPen size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-ink">30-second check-in</span>
              <span className="block text-[11.5px] leading-snug text-muted">
                Mood, sleep, energy — then what you ate. Three taps and it&apos;s done.
              </span>
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenCheckIn}
            className="card-soft rise w-full rounded-[var(--r-md)] bg-surface p-3.5 text-left"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-good">Checked in today</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-brand"><Pencil size={10} />Edit</span>
            </span>
            <span className="mt-1 block text-[12.5px] text-ink">
              {[checkIn.mood, checkIn.sleep, checkIn.energy].filter(Boolean).join(" · ")}
            </span>
            <span className="mt-0.5 block text-[11.5px] text-muted">
              {meals.length
                ? `${meals.length} meal${meals.length > 1 ? "s" : ""} logged`
                : "No meals logged yet — tap to add them."}
            </span>
            {checkIn.note && (
              <span className="mt-1 block text-[11.5px] italic text-faint">&ldquo;{checkIn.note}&rdquo;</span>
            )}
          </button>
        )}

        <MedsCard session={session} onTake={onTakeMed} onManage={onManageMeds} />

        {tasks.length === 0 && (
          <div className="rounded-[var(--r-md)] border border-line bg-surface p-4 text-center">
            <p className="text-[13px] text-muted">No plan yet — talk to your coach first and it lands here.</p>
          </div>
        )}

        {tasks.map(({ commitment: c, check }, ti) => (
          <div key={c.id}
            className={`card-soft pop-spring rounded-[var(--r-md)] bg-surface p-3 transition ${check && !check.done ? "opacity-75" : ""}`}
            style={{ animationDelay: `${ti * 70}ms` }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => !check && onCheck(c.id, true, "")}
                disabled={!!check}
                aria-label={check?.done ? "Done" : "Mark done"}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 ${
                  check?.done
                    ? "wobble border-good bg-good text-brandink"
                    : check
                    ? "border-line bg-raised text-faint"
                    : "border-brand/40 bg-surface text-transparent hover:border-brand active:scale-90"
                }`}
              >
                {check && !check.done ? <X size={15} /> : <Check size={16} strokeWidth={3} />}
              </button>
              <p className={`min-w-0 flex-1 text-[13.5px] leading-snug transition-all duration-300 ${
                check?.done ? "text-faint line-through" : "text-ink"
              }`}>
                {c.text}
              </p>
              {!check && (
                <button onClick={() => setAsking(asking === c.id ? null : c.id)}
                  className="shrink-0 text-[11px] font-semibold text-faint underline underline-offset-2 hover:text-muted">
                  couldn&apos;t?
                </button>
              )}
            </div>

            {check && !check.done && check.reason && (
              <p className="mt-1.5 pl-12 text-[11px] italic text-warn">“{check.reason}” — no guilt, it&apos;s data.</p>
            )}

            {asking === c.id && !check && (
              <div className="rise mt-2.5 pl-12">
                <p className="mb-1.5 text-[11px] font-medium text-muted">What got in the way?</p>
                <div className="flex flex-wrap gap-1.5">
                  {REASONS.map((r) => (
                    <button key={r}
                      onClick={() => { onCheck(c.id, false, r); setAsking(null); }}
                      className="rounded-full border border-line bg-bg px-2.5 py-1 text-[11px] text-muted transition hover:border-brand hover:text-ink">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {tasks.length > 0 && (
          <p className="pt-1 text-center text-[11px] text-faint">
            {doneCount}/{tasks.length} today · a missed day breaks nothing
          </p>
        )}

      </div>
    </div>
  );
}
