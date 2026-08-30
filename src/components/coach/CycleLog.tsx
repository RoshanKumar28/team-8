"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import type { Session } from "@/lib/types";

/* Period log as a uterus-shaped dot grid — one shape per month, one dot per
   day, tap to log. A body-shaped record of a body, not a spreadsheet. */

// 8×7 bitmap, 32 cells — days fill in reading order; cells past the month's
// length simply don't render.
const SHAPE = [
  [1,1,0,0,0,0,1,1],
  [1,1,1,0,0,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0],
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function CycleLog({
  session, onToggle,
}: { session: Session; onToggle: (date: string) => void }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const logged = useMemo(() => new Set(session.memory.periodDates ?? []), [session.memory.periodDates]);
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());

  // naive stats from logged data — honest ranges, never a confident prediction
  const stats = useMemo(() => {
    const days = [...logged].sort();
    if (days.length < 2) return null;
    const starts: string[] = [];
    let prev = "";
    for (const d of days) {
      const gap = prev ? (new Date(d).getTime() - new Date(prev).getTime()) / 86400000 : 99;
      if (gap > 2) starts.push(d);
      prev = d;
    }
    if (starts.length < 2) return null;
    const gaps = starts.slice(1).map((d, i) => Math.round((new Date(d).getTime() - new Date(starts[i]).getTime()) / 86400000));
    return { cycles: gaps, last: starts[starts.length - 1] };
  }, [logged]);

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-raised/60 pb-8">
      <div className="flex items-center justify-between px-5 pb-1 pt-4">
        <div>
          <h2 className="flex items-center gap-1.5 font-display text-[18px] font-semibold text-ink"><Droplets size={16} className="text-brand" />Your cycle</h2>
          <p className="text-[11px] text-muted">Tap the days you bled. That&apos;s the whole job.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setYear((y) => y - 1)} className="grid h-7 w-7 place-items-center rounded-full border border-line bg-surface text-muted"><ChevronLeft size={14} /></button>
          <span className="font-display text-[14px] font-bold text-brand">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-line bg-surface text-muted"><ChevronRight size={14} /></button>
        </div>
      </div>

      {stats && (
        <div className="mx-5 mt-2 rounded-[var(--r-md)] bg-brandsoft px-3 py-2.5">
          <p className="text-[12px] leading-relaxed text-brand">
            Your last {stats.cycles.length + 1} cycles: {stats.cycles.join(", ")} days apart.
            {Math.max(...stats.cycles) - Math.min(...stats.cycles) > 7
              ? " That range is wide — which is exactly the kind of pattern worth showing a doctor. I won't pretend to predict it with a confident date."
              : " Fairly steady — I'll keep watching."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-x-2 gap-y-5 px-4 pt-4">
        {MONTHS.map((name, m) => {
          const daysInMonth = new Date(year, m + 1, 0).getDate();
          let day = 0;
          return (
            <div key={name} className="flex flex-col items-center">
              <p className="mb-1.5 text-[11px] font-bold text-ink">{name}</p>
              <div className="flex flex-col gap-[3px]">
                {SHAPE.map((row, r) => (
                  <div key={r} className="flex justify-center gap-[3px]">
                    {row.map((cell, c) => {
                      if (!cell) return <span key={c} className="h-[9px] w-[9px]" />;
                      day += 1;
                      if (day > daysInMonth) return <span key={c} className="h-[9px] w-[9px]" />;
                      const d = iso(year, m, day);
                      const on = logged.has(d);
                      const isToday = d === todayIso;
                      return (
                        <button
                          key={c}
                          onClick={() => onToggle(d)}
                          aria-label={`${name} ${day}`}
                          className={`h-[9px] w-[9px] rounded-[2.5px] transition ${
                            on ? "bg-brand" : "bg-brandsoft hover:bg-brand/40"
                          } ${isToday ? "ring-1 ring-accent ring-offset-1" : ""}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4 text-[10.5px] text-faint">
        <span className="flex items-center gap-1.5"><span className="h-[9px] w-[9px] rounded-[2.5px] bg-brandsoft" /> not logged</span>
        <span className="flex items-center gap-1.5"><span className="h-[9px] w-[9px] rounded-[2.5px] bg-brand" /> period day</span>
        <span className="flex items-center gap-1.5"><span className="h-[9px] w-[9px] rounded-[2.5px] bg-brandsoft ring-1 ring-accent" /> today</span>
      </div>
      <p className="mt-1 text-center text-[10px] text-faint">Each month is a uterus. Because it is.</p>
    </div>
  );
}
