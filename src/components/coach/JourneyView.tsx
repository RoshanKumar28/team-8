"use client";

import { useEffect, useRef, useState } from "react";
import type { Plan, Session } from "@/lib/types";

/* Candy-crush-style map: every DAY is a node on a serpentine road, seven to a
   week, with a milestone "boss" node closing each week. States come from her
   real logs. The road doesn't end — plans renew; the last node says so. */

type DayState = "done" | "partial" | "missed" | "today" | "future";

const X = [0, 42, 64, 42, 0, -42, -64, -42]; // serpentine offsets, px from center

function weekTheme(plan: Plan, week: number) {
  for (const w of plan.weeks) {
    const nums = (w.label.match(/\d+/g) ?? []).map(Number);
    const lo = nums[0] ?? 1;
    const hi = nums[1] ?? lo;
    if (week >= lo && week <= hi) return w;
  }
  return plan.weeks[plan.weeks.length - 1];
}

const TASK_ICON: [RegExp, string][] = [
  [/walk|steps|move/i, "🚶‍♀️"], [/protein|breakfast|meal|eat|food|recipe/i, "🍳"],
  [/sleep|screen|bed|phone/i, "🌙"], [/photo|picture|drain|mirror/i, "📸"],
  [/water|hydrate/i, "💧"], [/note|log|journal|write|energy/i, "📝"],
  [/med|metformin|inositol|supplement|tea/i, "💊"],
];
const icon = (t: string) => TASK_ICON.find(([re]) => re.test(t))?.[1] ?? "✦";

export default function JourneyView({ session }: { session: Session }) {
  const plan = session.memory.plan;
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    todayRef.current?.scrollIntoView({ block: "center" });
  }, []);

  if (!plan) {
    return (
      <div className="grid min-h-0 flex-1 place-items-center bg-raised/60 px-8 text-center">
        <p className="text-[13px] leading-relaxed text-muted">
          Your journey appears here once the coach builds your plan — talk to her first.
        </p>
      </div>
    );
  }

  const today = session.day;
  const curWeek = Math.max(1, Math.ceil(today / 7));
  const planWeeks = Math.max(...plan.weeks.flatMap((w) => (w.label.match(/\d+/g) ?? ["1"]).map(Number)), 4);
  const showWeeks = Math.min(planWeeks, Math.max(curWeek + 2, 4));

  const checks = session.memory.checks ?? [];
  const checkIns = session.memory.checkIns ?? [];

  function stateOf(day: number): DayState {
    if (day === today) return "today";
    if (day > today) return "future";
    const dc = checks.filter((k) => k.day === day);
    const logged = checkIns.some((c) => c.day === day);
    if (dc.length === 0) return logged ? "partial" : "missed";
    if (dc.every((k) => k.done)) return "done";
    return dc.some((k) => k.done) ? "partial" : "missed";
  }

  const nodeStyle: Record<DayState, string> = {
    done: "bg-good border-good text-brandink",
    partial: "bg-warn/90 border-warn text-brandink",
    missed: "border-line bg-surface text-faint",
    today: "bg-brand border-brand text-brandink pulse-soft scale-110",
    future: "border-line bg-surface text-faint",
  };
  const nodeMark: Record<DayState, (d: number) => string> = {
    done: () => "✓", partial: () => "◐", missed: () => "·",
    today: (d) => String(d), future: (d) => String(d),
  };

  // done-count for the header
  const doneDays = Array.from({ length: today - 1 }, (_, i) => stateOf(i + 1)).filter((s) => s === "done" || s === "partial").length;

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-raised/60 pb-8">
      {/* header */}
      <div className="sticky top-0 z-20 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur">
        <h2 className="font-display text-[16px] font-semibold leading-tight text-ink">{plan.headline}</h2>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted">
          <span className="rounded-full bg-brandsoft px-2 py-0.5 font-bold text-brand">Day {today}</span>
          <span>Week {curWeek} of {planWeeks}</span>
          <span className="text-good">✓ {doneDays} day{doneDays === 1 ? "" : "s"} showed up</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-[320px] px-4 pt-4">
        {Array.from({ length: showWeeks }, (_, wi) => {
          const week = wi + 1;
          const theme = weekTheme(plan, week);
          const isOpen = openWeek === week;
          const weekDone = week < curWeek;
          const weekNow = week === curWeek;

          return (
            <div key={week}>
              {/* week banner */}
              <button
                onClick={() => setOpenWeek(isOpen ? null : week)}
                className={`mb-1 flex w-full items-center gap-2.5 rounded-[var(--r-md)] border p-2.5 text-left transition ${
                  weekNow ? "border-brand bg-brandsoft" : weekDone ? "border-good/30 bg-surface" : "border-line bg-surface/60"
                }`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-[15px] ${
                  weekDone ? "bg-good/15" : weekNow ? "bg-brand text-brandink" : "bg-raised"
                }`}>
                  {weekDone ? "🏅" : weekNow ? "📍" : "🔭"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-bold text-ink">
                    Week {week}{weekNow ? " — you are here" : ""}
                  </span>
                  <span className={`block truncate text-[11px] ${week > curWeek ? "text-faint" : "text-muted"}`}>
                    {theme.forPrimary}
                  </span>
                </span>
                <span className="text-[10px] text-faint">{isOpen ? "▲" : "▼"}</span>
              </button>

              {/* expanded: this week's tasks + checkpoint */}
              {isOpen && (
                <div className="rise mb-2 rounded-[var(--r-md)] border border-line bg-surface p-3">
                  <ul className="space-y-1.5">
                    {theme.tasks.map((t) => (
                      <li key={t} className="flex gap-2 text-[12px] text-muted">
                        <span className="shrink-0">{icon(t)}</span>{t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 border-t border-line pt-2 text-[11px] text-faint">
                    🎯 <span className="font-semibold text-good">Checkpoint:</span> {theme.checkpoint}
                  </p>
                </div>
              )}

              {/* seven day-nodes on the serpentine */}
              <div className="relative py-1">
                {Array.from({ length: 7 }, (_, di) => {
                  const day = wi * 7 + di + 1;
                  const st = stateOf(day);
                  const x = X[di % X.length];
                  const nx = X[(di + 1) % X.length];
                  return (
                    <div key={day} ref={st === "today" ? todayRef : undefined} className="relative h-[52px]">
                      {/* connector dots to the next node */}
                      {di < 6 && [0.35, 0.7].map((f) => (
                        <span key={f} className="absolute top-1/2 h-1 w-1 rounded-full bg-line"
                          style={{ left: `calc(50% + ${x + (nx - x) * f}px)`, transform: `translateY(${18 + f * 18}px)` }} />
                      ))}
                      <div
                        className={`absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border-2 text-[12px] font-bold shadow-sm transition ${nodeStyle[st]}`}
                        style={{ left: `calc(50% + ${x}px)`, transform: "translate(-50%, -50%)" }}
                      >
                        {nodeMark[st](day)}
                        {st === "today" && (
                          <span className="absolute -top-5 whitespace-nowrap rounded-full bg-brand px-1.5 py-px text-[8.5px] font-bold text-brandink">
                            TODAY
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* the road continues */}
        <div className="mt-2 flex flex-col items-center pb-4 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-dashed border-accent bg-surface text-[18px]">
            🌱
          </div>
          <p className="mt-1.5 text-[12px] font-semibold text-ink">
            {session.memory.profile.primaryConcern
              ? `${session.memory.profile.primaryConcern} — visibly better`
              : "Visibly better"}
          </p>
          <p className="mt-0.5 max-w-[240px] text-[10.5px] leading-relaxed text-faint">
            …and the road keeps going. PCOS isn&apos;t a 12-week fix — the plan renews as your body answers. Showing up is the win.
          </p>
        </div>
      </div>
    </div>
  );
}
