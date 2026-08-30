"use client";

import { useState } from "react";
import { Check, X, FastForward, NotebookPen, Sparkles, TrendingUp, TrendingDown, Minus, Pencil } from "lucide-react";
import { CloudRainWind } from "lucide-react";
import MedsCard from "../meds/MedsCard";
import { todaysTasks } from "@/lib/followup";
import { flareCopy, predictFlare } from "@/lib/predict";
import type { MedTiming, Session } from "@/lib/types";

const REASONS = ["Schedule blew up", "No energy", "Flare / cramps", "Forgot", "Didn't feel like it"];

export default function TodayScreen({
  session, onCheck, onJumpDay, onOpenCheckIn, onTakeMed, onManageMeds,
}: {
  session: Session;
  onCheck: (commitmentId: string, done: boolean, reason: string) => void;
  onJumpDay: () => void;
  onOpenCheckIn: () => void;
  onTakeMed: (medId: string, timing: MedTiming) => void;
  onManageMeds: () => void;
}) {
  const [asking, setAsking] = useState<string | null>(null); // commitmentId awaiting a reason
  const tasks = todaysTasks(session);
  const doneCount = tasks.filter((t) => t.check?.done).length;
  const concern = session.memory.profile.primaryConcern;
  const checkIn = (session.memory.checkIns ?? []).find((c) => c.day === session.day) ?? null;
  const meals = (session.memory.meals ?? []).filter((m) => m.day === session.day);
  const prediction = predictFlare(session.memory);

  return (
    <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg">
      <div className="px-4 pb-2 pt-4">
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
        {prediction && prediction.daysAway <= 10 && (() => {
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

        {tasks.map(({ commitment: c, check }) => (
          <div key={c.id} className={`card-soft rise rounded-[var(--r-md)] bg-surface p-3.5 ${check && !check.done ? "opacity-80" : ""}`}>
            <p className={`text-[13.5px] leading-snug ${check?.done ? "text-faint line-through" : "text-ink"}`}>
              {c.text}
            </p>

            {check ? (
              <p className={`mt-1.5 text-[11.5px] font-semibold ${check.done ? "text-good" : "text-warn"}`}>
                {check.done ? "Done — logged." : `Skipped — "${check.reason}". No guilt, it's data.`}
              </p>
            ) : asking === c.id ? (
              <div className="mt-2.5">
                <p className="mb-1.5 text-[11.5px] font-medium text-muted">What got in the way? One tap — this is how I learn your life.</p>
                <div className="flex flex-wrap gap-1.5">
                  {REASONS.map((r) => (
                    <button key={r}
                      onClick={() => { onCheck(c.id, false, r); setAsking(null); }}
                      className="rounded-full border border-line bg-bg px-2.5 py-1 text-[11.5px] text-muted transition hover:border-brand hover:text-ink">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-2.5 flex gap-2">
                <button onClick={() => onCheck(c.id, true, "")}
                  className="flex-1 rounded-full bg-good py-2 text-[12.5px] font-bold text-brandink">
                  <Check size={14} className="mr-1 inline-block align-[-2px]" />Did it
                </button>
                <button onClick={() => setAsking(c.id)}
                  className="flex-1 rounded-full border border-line bg-surface py-2 text-[12.5px] font-semibold text-muted">
                  <X size={14} className="mr-1 inline-block align-[-2px]" />Couldn&apos;t
                </button>
              </div>
            )}
          </div>
        ))}

        {tasks.length > 0 && (
          <p className="pt-1 text-center text-[11px] text-faint">
            {doneCount}/{tasks.length} today · a missed day breaks nothing
          </p>
        )}

        {session.memory.leadingIndicators.length > 0 && (
          <div className="mt-2 rounded-[var(--r-md)] bg-accentsoft p-3.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent"><Sparkles size={12} />Early signs</p>
            {session.memory.leadingIndicators.slice(0, 3).map((l) => (
              <div key={l.name} className="flex items-baseline justify-between py-0.5 text-[12px]">
                <span className="text-ink">{l.name}</span>
                <span className={`font-bold ${l.trend === "improving" ? "text-good" : l.trend === "worse" ? "text-bad" : "text-faint"}`}>
                  {l.trend === "improving" ? <><TrendingUp size={11} className="inline align-[-1px]" /> improving</> : l.trend === "worse" ? <><TrendingDown size={11} className="inline align-[-1px]" /> watch</> : <><Minus size={11} className="inline align-[-1px]" /> steady</>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
