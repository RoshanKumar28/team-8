"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check, Circle, Droplets, CloudRainWind, Medal, MapPin, Telescope,
  Footprints, Utensils, Moon, Camera, Pill, NotebookPen, Sparkles,
  Flag, X, CalendarDays, Flower2, Leaf, Star, ChevronDown, ChevronUp,
} from "lucide-react";
import { predictFlare } from "@/lib/predict";
import type { Plan, Session } from "@/lib/types";

/* The road, on real calendar days. Each node is a date; period days bleed
   rose, the predicted flare window glows lavender, and tapping any day opens
   what happened there — or what's planned for it. */

type DayState = "done" | "partial" | "missed" | "today" | "future";

const X_OFF = [0, 44, 66, 44, 0, -44, -66, -44];
const DAY_MS = 86400000;

const TASK_ICONS: [RegExp, React.ElementType][] = [
  [/walk|steps|move/i, Footprints], [/protein|breakfast|meal|eat|food|lunch|dinner/i, Utensils],
  [/sleep|screen|bed|phone|wind/i, Moon], [/photo|picture|drain|mirror/i, Camera],
  [/med|metformin|inositol|supplement|tea/i, Pill], [/note|log|journal|write|energy/i, NotebookPen],
];
const TaskIcon = ({ t, className }: { t: string; className?: string }) => {
  const I = TASK_ICONS.find(([re]) => re.test(t))?.[1] ?? Sparkles;
  return <I size={13} className={className} />;
};

const STENCILS = [Flower2, Leaf, Star, Droplets, Sparkles];

function weekTheme(plan: Plan, week: number) {
  for (const w of plan.weeks) {
    const nums = (w.label.match(/\d+/g) ?? []).map(Number);
    if (week >= (nums[0] ?? 1) && week <= (nums[1] ?? nums[0] ?? 1)) return w;
  }
  return plan.weeks[plan.weeks.length - 1];
}

export default function JourneyView({ session }: { session: Session }) {
  const plan = session.memory.plan;
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  const today = session.day;

  // Virtual day ↔ calendar date. Day `session.day` is literally today.
  const day1 = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return t.getTime() - (session.day - 1) * DAY_MS;
  }, [session.day]);
  const dateOf = (d: number) => new Date(day1 + (d - 1) * DAY_MS);
  const isoOf = (d: number) => new Date(day1 + (d - 1) * DAY_MS).toISOString().slice(0, 10);

  const periodSet = useMemo(() => new Set(session.memory.periodDates ?? []), [session.memory.periodDates]);
  const flare = useMemo(() => predictFlare(session.memory), [session.memory]);

  useEffect(() => { todayRef.current?.scrollIntoView({ block: "center" }); }, []);

  if (!plan) {
    return (
      <div className="grid min-h-0 flex-1 place-items-center bg-bg px-8 text-center">
        <p className="text-[13px] leading-relaxed text-muted">
          Your journey appears here once the coach builds your plan — talk to her first.
        </p>
      </div>
    );
  }

  const curWeek = Math.max(1, Math.ceil(today / 7));
  const planWeeks = Math.max(...plan.weeks.flatMap((w) => (w.label.match(/\d+/g) ?? ["1"]).map(Number)), 4);
  const showWeeks = Math.min(planWeeks, Math.max(curWeek + 2, 4));

  const checks = session.memory.checks ?? [];
  const checkIns = session.memory.checkIns ?? [];
  const meals = session.memory.meals ?? [];

  function stateOf(d: number): DayState {
    if (d === today) return "today";
    if (d > today) return "future";
    const dc = checks.filter((k) => k.day === d);
    const logged = checkIns.some((c) => c.day === d);
    if (dc.length === 0) return logged ? "partial" : "missed";
    if (dc.every((k) => k.done)) return "done";
    return dc.some((k) => k.done) ? "partial" : "missed";
  }
  const inFlare = (d: number) => !!flare && isoOf(d) >= flare.windowStart && isoOf(d) <= flare.windowEnd;
  const isPeriod = (d: number) => periodSet.has(isoOf(d));

  const doneDays = Array.from({ length: today - 1 }, (_, i) => stateOf(i + 1)).filter((s) => s !== "missed").length;

  const fmtLong = (d: number) => dateOf(d).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  /* ---------- the day sheet ---------- */
  function DaySheet({ d }: { d: number }) {
    const st = stateOf(d);
    const theme = weekTheme(plan!, Math.ceil(d / 7));
    const dc = checks.filter((k) => k.day === d);
    const ci = checkIns.find((c) => c.day === d);
    const dm = meals.filter((m) => m.day === d);
    const commitmentText = (id: string) => session.memory.commitments.find((c) => c.id === id)?.text ?? "a task";

    return (
      <div className="rise absolute inset-x-2 bottom-2 z-30 max-h-[62%] overflow-hidden rounded-[var(--r-lg)] border border-line bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-brand" />
            <p className="text-[13px] font-bold text-ink">{fmtLong(d)}</p>
            {isPeriod(d) && (
              <span className="flex items-center gap-1 rounded-full bg-brand/10 px-1.5 py-0.5 text-[9.5px] font-bold text-brand">
                <Droplets size={9} /> period
              </span>
            )}
            {!isPeriod(d) && inFlare(d) && (
              <span className="flex items-center gap-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-[9.5px] font-bold text-accent">
                <CloudRainWind size={9} /> flare window
              </span>
            )}
          </div>
          <button onClick={() => setSelected(null)} aria-label="Close"
            className="grid h-6 w-6 place-items-center rounded-full bg-raised text-muted">
            <X size={12} />
          </button>
        </div>

        <div className="scroll-thin max-h-[calc(62vh-44px)] overflow-y-auto px-4 py-3">
          {d <= today ? (
            <>
              {/* what actually happened */}
              {dc.length > 0 ? (
                <ul className="space-y-1.5">
                  {dc.map((k) => (
                    <li key={k.id} className="flex items-start gap-2 text-[12px]">
                      <span className={`mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full ${k.done ? "bg-good/15 text-good" : "bg-warn/15 text-warn"}`}>
                        {k.done ? <Check size={10} /> : <X size={10} />}
                      </span>
                      <span className="text-ink">
                        {commitmentText(k.commitmentId)}
                        {!k.done && k.reason && <span className="text-muted"> — “{k.reason.toLowerCase()}”</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] italic text-faint">
                  {st === "today" ? "Nothing ticked yet — the Today tab is one tap away." : "No task logs this day. That's data too, not a failure."}
                </p>
              )}

              {ci && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[["Mood", ci.mood], ["Sleep", ci.sleep], ["Energy", ci.energy]].filter(([, v]) => v).map(([k, v]) => (
                    <span key={k} className="rounded-full bg-brandsoft px-2 py-0.5 text-[10.5px] text-brand">
                      {k}: <strong>{v}</strong>
                    </span>
                  ))}
                  {ci.note && <span className="w-full text-[11px] italic text-muted">“{ci.note}”</span>}
                </div>
              )}

              {dm.length > 0 && (
                <div className="mt-2.5 space-y-1">
                  {dm.map((m) => (
                    <p key={m.id} className="flex items-start gap-1.5 text-[11.5px] text-muted">
                      <Utensils size={11} className="mt-0.5 shrink-0 text-accent" />
                      <span><strong className="text-ink">{m.slot}</strong>{m.what ? ` — ${m.what}` : ""}{m.after ? ` · after: ${m.after.toLowerCase()}` : ""}</span>
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* what's planned */}
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-faint">On the plan that day</p>
              <ul className="space-y-1.5">
                {theme.tasks.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[12px] text-ink">
                    <TaskIcon t={t} className="mt-0.5 shrink-0 text-brand" />{t}
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 flex items-start gap-1.5 border-t border-line pt-2 text-[11px] text-muted">
                <Flag size={11} className="mt-0.5 shrink-0 text-good" />
                Week checkpoint: {theme.checkpoint}
              </p>
              {inFlare(d) && (
                <p className="mt-2 rounded-[var(--r-sm)] bg-accent/10 px-2.5 py-2 text-[11px] leading-relaxed text-muted">
                  <CloudRainWind size={11} className="mr-1 inline text-accent" />
                  This lands in your likely rough patch — the coach will cut it to the light version if you need.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---------- the map ---------- */
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pb-8"
        style={{ background: "linear-gradient(180deg, var(--c-bg), var(--c-brand-soft) 55%, var(--c-bg))" }}>

        {/* header */}
        <div className="sticky top-0 z-20 border-b border-line bg-surface/90 px-5 py-3 backdrop-blur">
          <h2 className="font-display text-[16px] font-semibold leading-tight text-ink">{plan.headline}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            <span className="shimmer-bar rounded-full bg-brandsoft px-2 py-0.5 font-bold text-brand">{fmtLong(today)}</span>
            <span>Week {curWeek} of {planWeeks}</span>
            <span className="flex items-center gap-1 text-good"><Check size={11} /> {doneDays} day{doneDays === 1 ? "" : "s"} showed up</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-[330px] px-4 pt-4">
          {Array.from({ length: showWeeks }, (_, wi) => {
            const week = wi + 1;
            const theme = weekTheme(plan, week);
            const isOpen = openWeek === week;
            const weekDone = week < curWeek;
            const weekNow = week === curWeek;
            const WIcon = weekDone ? Medal : weekNow ? MapPin : Telescope;
            const Stencil = STENCILS[wi % STENCILS.length];

            return (
              <div key={week} className="relative">
                {/* faint stencil behind the road */}
                <Stencil className="floaty pointer-events-none absolute top-24 text-brand"
                  style={{ opacity: 0.07, width: 110, height: 110, [wi % 2 ? "left" : "right"]: -18 } as React.CSSProperties} />

                {/* week banner */}
                <button
                  onClick={() => setOpenWeek(isOpen ? null : week)}
                  className={`card-soft relative z-10 mb-1 flex w-full items-center gap-2.5 rounded-[var(--r-md)] border p-2.5 text-left transition ${
                    weekNow ? "border-brand/50 bg-surface" : weekDone ? "border-good/30 bg-surface/90" : "border-line bg-surface/70"
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${
                    weekDone ? "bg-good/15 text-good" : weekNow ? "bg-brand text-brandink" : "bg-raised text-faint"
                  }`}>
                    <WIcon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold text-ink">
                      Week {week}{weekNow ? " — you are here" : ""}
                    </span>
                    <span className={`block truncate text-[11px] ${week > curWeek ? "text-faint" : "text-muted"}`}>
                      {theme.forPrimary}
                    </span>
                  </span>
                  {isOpen ? <ChevronUp size={13} className="text-faint" /> : <ChevronDown size={13} className="text-faint" />}
                </button>

                {isOpen && (
                  <div className="card-soft rise relative z-10 mb-2 rounded-[var(--r-md)] border border-line bg-surface p-3">
                    <ul className="space-y-1.5">
                      {theme.tasks.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-[12px] text-muted">
                          <TaskIcon t={t} className="mt-0.5 shrink-0 text-brand" />{t}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 flex items-start gap-1.5 border-t border-line pt-2 text-[11px] text-faint">
                      <Flag size={11} className="mt-0.5 shrink-0 text-good" />
                      <span><span className="font-semibold text-good">Checkpoint:</span> {theme.checkpoint}</span>
                    </p>
                  </div>
                )}

                {/* seven days */}
                <div className="relative z-10 py-1">
                  {Array.from({ length: 7 }, (_, di) => {
                    const d = wi * 7 + di + 1;
                    const st = stateOf(d);
                    const x = X_OFF[di % 8];
                    const nx = X_OFF[(di + 1) % 8];
                    const period = isPeriod(d);
                    const flaring = !period && inFlare(d);
                    const sel = selected === d;

                    const base =
                      st === "done" ? "bg-good border-good text-brandink"
                      : st === "partial" ? "bg-warn/90 border-warn text-brandink"
                      : st === "today" ? "bg-brand border-brand text-brandink pulse-soft"
                      : "bg-surface border-line text-faint";

                    return (
                      <div key={d} ref={st === "today" ? todayRef : undefined}
                        className="pop-spring relative h-[54px]" style={{ animationDelay: `${di * 45}ms` }}>
                        {di < 6 && [0.35, 0.7].map((f) => (
                          <span key={f} className="absolute top-1/2 h-1 w-1 rounded-full bg-brand/25"
                            style={{ left: `calc(50% + ${x + (nx - x) * f}px)`, transform: `translateY(${18 + f * 18}px)` }} />
                        ))}

                        {/* flare halo */}
                        {flaring && (
                          <span className="absolute top-1/2 h-[46px] w-[46px] rounded-full bg-accent/15"
                            style={{ left: `calc(50% + ${x}px)`, transform: "translate(-50%, -50%)" }} />
                        )}

                        <button
                          onClick={() => setSelected(sel ? null : d)}
                          className={`absolute top-1/2 grid h-10 w-10 place-items-center rounded-full border-2 text-[12px] font-bold shadow-sm transition active:scale-95 ${base} ${
                            period ? "ring-2 ring-brand/50 ring-offset-1" : ""
                          } ${sel ? "scale-110 ring-2 ring-accent" : ""}`}
                          style={{ left: `calc(50% + ${x}px)`, transform: "translate(-50%, -50%)" }}
                          aria-label={fmtLong(d)}
                        >
                          {st === "done" ? <Check size={15} />
                            : st === "partial" ? <Circle size={11} className="fill-current" />
                            : dateOf(d).getDate()}
                          {period && <Droplets size={10} className="absolute -right-1 -top-1 rounded-full bg-surface p-px text-brand" />}
                          {st === "today" && (
                            <span className="absolute -top-5 whitespace-nowrap rounded-full bg-brand px-1.5 py-px text-[8.5px] font-bold text-brandink">
                              TODAY
                            </span>
                          )}
                        </button>

                        {/* weekday whisper opposite the node */}
                        <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-wide text-faint"
                          style={{ left: x >= 0 ? `calc(50% + ${x - 58}px)` : `calc(50% + ${x + 46}px)` }}>
                          {dateOf(d).toLocaleDateString(undefined, { weekday: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* the road continues */}
          <div className="mt-2 flex flex-col items-center pb-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-dashed border-accent bg-surface">
              <Sparkles size={18} className="text-accent" />
            </div>
            <p className="mt-1.5 text-[12px] font-semibold text-ink">
              {session.memory.profile.primaryConcern
                ? `${session.memory.profile.primaryConcern} — visibly better`
                : "Visibly better"}
            </p>
            <p className="mt-0.5 max-w-[240px] text-[10.5px] leading-relaxed text-faint">
              …and the road keeps going. The plan renews as your body answers — showing up is the win.
            </p>
          </div>
        </div>
      </div>

      {selected !== null && <DaySheet d={selected} />}
    </div>
  );
}
