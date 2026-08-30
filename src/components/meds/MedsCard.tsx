"use client";

import { Pill, Leaf, Plus, BellRing, Check } from "lucide-react";
import type { MedTiming, Session } from "@/lib/types";

const TIMING_LABEL: Record<MedTiming, string> = { morning: "AM", afternoon: "Noon", evening: "PM" };

/* Today's doses as one-tap ticks. Adherence is shown as a fraction, never a
   streak — a missed dose is data for the coach, not a broken chain. */
export default function MedsCard({
  session, onTake, onManage,
}: {
  session: Session;
  onTake: (medId: string, timing: MedTiming) => void;
  onManage: () => void;
}) {
  const meds = session.memory.medications;
  const takes = session.memory.medTakes.filter((t) => t.day === session.day);
  const taken = (medId: string, timing: MedTiming) =>
    takes.some((t) => t.medId === medId && t.timing === timing);

  const doses = meds.flatMap((m) => m.timings.map((t) => ({ m, t })));
  const doneCount = doses.filter(({ m, t }) => taken(m.id, t)).length;

  if (meds.length === 0) {
    return (
      <button onClick={onManage}
        className="card-soft rise flex w-full items-center gap-3 rounded-[var(--r-md)] bg-accentsoft p-3.5 text-left transition hover:opacity-90">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-brandink">
          <Pill size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold text-ink">Track your meds & supplements</span>
          <span className="block text-[11.5px] leading-snug text-muted">
            Metformin, inositol, anything — one tap a day, gentle reminders.
          </span>
        </span>
        <Plus size={16} className="shrink-0 text-accent" />
      </button>
    );
  }

  return (
    <div className="card-soft rise rounded-[var(--r-md)] bg-surface p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
          <Pill size={13} /> Meds & supplements
        </p>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold text-faint">{doneCount}/{doses.length} today</span>
          <button onClick={onManage} className="grid h-6 w-6 place-items-center rounded-full bg-raised text-muted transition hover:text-brand" aria-label="Manage">
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {meds.map((m) => (
          <div key={m.id} className="flex items-center gap-2.5">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.kind === "medication" ? "bg-brandsoft text-brand" : "bg-goodsoft text-good"}`}>
              {m.kind === "medication" ? <Pill size={14} /> : <Leaf size={14} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">
                {m.name} <span className="font-normal text-faint">{m.dose}</span>
              </p>
              {m.remind && (
                <p className="flex items-center gap-1 text-[10px] text-faint">
                  <BellRing size={9} /> reminder on
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {m.timings.map((t) => {
                const done = taken(m.id, t);
                return (
                  <button
                    key={t}
                    onClick={() => onTake(m.id, t)}
                    className={`flex h-8 min-w-[42px] items-center justify-center gap-1 rounded-full px-2 text-[10.5px] font-bold transition ${
                      done ? "card-soft bg-good text-brandink" : "bg-raised text-muted hover:bg-goodsoft hover:text-good"
                    }`}
                  >
                    {done ? <Check size={11} /> : null}
                    {TIMING_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
