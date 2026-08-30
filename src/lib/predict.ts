import type { Memory, Session } from "./types";

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

/* ---- Symptom-by-cycle-day engine (feeds the flare chart) ---- */


/* Flare prediction from her own logs — never a generic "PCOS causes X".
   Everything here is framed as observed frequency ("3 of your last 4 cycles"),
   never certainty, and stays silent until there are >= 2 cycles of evidence. */

export function cycleStarts(periodDates: string[]): string[] {
  const days = [...periodDates].sort();
  const starts: string[] = [];
  let prev = "";
  for (const d of days) {
    const gap = prev ? (new Date(d).getTime() - new Date(prev).getTime()) / 86400000 : 99;
    if (gap > 2) starts.push(d);
    prev = d;
  }
  return starts;
}

/* Cycle day for a date = days since the most recent start on/before it. */
function cycleDayOf(date: string, starts: string[]): number | null {
  const t = new Date(date).getTime();
  let best: number | null = null;
  for (const s of starts) {
    const st = new Date(s).getTime();
    if (st <= t) best = Math.floor((t - st) / 86400000) + 1;
  }
  return best !== null && best <= 60 ? best : null;
}

export type FlareStats = {
  cycles: number;                        // completed cycles of evidence
  histogram: { day: number; count: number; symptoms: string[] }[];
  window: { from: number; to: number; hits: number; symptoms: string[] } | null;
  currentDay: number | null;
  avgLen: number | null;
};

export function flareStats(s: Session): FlareStats {
  const starts = cycleStarts(s.memory.periodDates ?? []);
  const logs = (s.memory.cycleLogs ?? []).filter((l) => l.pain.length + l.body.length > 0);

  const byDay = new Map<number, { count: number; symptoms: Set<string>; cycles: Set<string> }>();
  for (const l of logs) {
    const d = cycleDayOf(l.date, starts);
    if (d === null) continue;
    const start = [...starts].reverse().find((x) => new Date(x) <= new Date(l.date))!;
    const row = byDay.get(d) ?? { count: 0, symptoms: new Set(), cycles: new Set() };
    row.count += l.pain.length + l.body.length;
    [...l.pain, ...l.body].forEach((x) => row.symptoms.add(x));
    row.cycles.add(start);
    byDay.set(d, row);
  }

  const gaps = starts.slice(1).map((d, i) =>
    Math.round((new Date(d).getTime() - new Date(starts[i]).getTime()) / 86400000));
  const avgLen = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
  const maxDay = Math.max(avgLen ?? 0, ...byDay.keys(), 28);

  const histogram = Array.from({ length: maxDay }, (_, i) => {
    const row = byDay.get(i + 1);
    return { day: i + 1, count: row?.count ?? 0, symptoms: row ? [...row.symptoms] : [] };
  });

  // Best 5-day window by symptom mass, needs evidence from >= 2 distinct cycles.
  let window: FlareStats["window"] = null;
  let bestScore = 0;
  for (let from = 1; from + 4 <= maxDay; from++) {
    const slice = histogram.slice(from - 1, from + 4);
    const score = slice.reduce((a, b) => a + b.count, 0);
    if (score > bestScore) {
      const cyclesHit = new Set<string>();
      for (const l of logs) {
        const d = cycleDayOf(l.date, starts);
        if (d !== null && d >= from && d <= from + 4) {
          const start = [...starts].reverse().find((x) => new Date(x) <= new Date(l.date))!;
          cyclesHit.add(start);
        }
      }
      if (cyclesHit.size >= 2) {
        bestScore = score;
        const syms = [...new Set(slice.flatMap((x) => x.symptoms))].slice(0, 3);
        window = { from, to: from + 4, hits: cyclesHit.size, symptoms: syms };
      }
    }
  }

  // Current cycle day from the last start; the virtual demo day offsets it.
  const last = starts[starts.length - 1];
  const currentDay = last
    ? Math.min(60, Math.floor((Date.now() - new Date(last).getTime()) / 86400000) + 1)
    : null;

  return { cycles: Math.max(0, starts.length - 1), histogram, window, currentDay, avgLen };
}

export function forecastLine(f: FlareStats): string | null {
  if (!f.window || f.currentDay === null) return null;
  const { from, to, hits, symptoms } = f.window;
  const what = symptoms.map((x) => x.toLowerCase()).join(", ") || "symptoms";
  const total = f.cycles;
  if (f.currentDay > to) return null;
  if (f.currentDay >= from) {
    return `You're on day ${f.currentDay} — inside the window where ${what} showed up in ${hits} of your last ${total} cycles. If today feels harder, that's the pattern, not you.`;
  }
  const inDays = from - f.currentDay;
  return `Heads-up: ${what} clustered around day ${from}–${to} in ${hits} of your last ${total} cycles. You're on day ${f.currentDay}, so that window starts in about ${inDays} day${inDays === 1 ? "" : "s"}. Nothing is certain — but you get to prepare instead of being blindsided.`;
}


