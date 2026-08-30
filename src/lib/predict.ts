import type { Memory } from "./types";

export type Prediction = {
  windowStart: string;  // ISO
  windowEnd: string;
  daysAway: number;     // to window start; negative = inside the window
  gaps: number[];
  cycles: number;
};

const DAY = 86400000;
const isoOf = (t: number) => new Date(t).toISOString().slice(0, 10);

/* Deterministic, honest: needs 2+ logged cycle starts. Predicts a WINDOW from
   her real gap spread (never a confident single date) plus the flare runway —
   the mood/skin/energy dip that rides ~5 days ahead of a period. */
export function predictFlare(memory: Memory, today = new Date()): Prediction | null {
  const days = [...new Set(memory.periodDates ?? [])].sort();
  if (days.length < 2) return null;

  const starts: number[] = [];
  let prev = -Infinity;
  for (const d of days) {
    const t = new Date(d + "T00:00:00").getTime();
    if (t - prev > 2 * DAY) starts.push(t);
    prev = t;
  }
  if (starts.length < 2) return null;

  const gaps = starts.slice(1).map((t, i) => Math.round((t - starts[i]) / DAY));
  const lastStart = starts[starts.length - 1];
  const minGap = Math.min(...gaps);
  const maxGap = Math.max(...gaps);

  // Window: earliest plausible start minus the 5-day flare runway, through latest.
  let winStart = lastStart + minGap * DAY - 5 * DAY;
  let winEnd = lastStart + maxGap * DAY;
  const now = today.getTime();
  // If the window is fully behind us, roll forward one median cycle.
  const median = gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
  while (winEnd < now) { winStart += median * DAY; winEnd += median * DAY; }

  return {
    windowStart: isoOf(winStart),
    windowEnd: isoOf(winEnd),
    daysAway: Math.round((winStart - now) / DAY),
    gaps,
    cycles: starts.length,
  };
}

export function flareCopy(p: Prediction): { title: string; body: string } {
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const when =
    p.daysAway <= 0 ? "You're likely in that stretch now."
    : p.daysAway <= 3 ? `That starts in about ${p.daysAway} day${p.daysAway === 1 ? "" : "s"}.`
    : `That's roughly ${p.daysAway} days out.`;
  return {
    title: "Heads up — rough patch likely ahead",
    body: `Your last ${p.cycles} cycles suggest ${fmt(p.windowStart)}–${fmt(p.windowEnd)}. ${when} It's the pattern, not you — plan the light version of that week.`,
  };
}
