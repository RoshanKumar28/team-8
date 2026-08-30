"use client";

import { useMemo } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { flareStats, forecastLine } from "@/lib/predict";
import type { Session } from "@/lib/types";

/* Symptom mass by cycle day, as a soft bar chart with the flare window shaded
   and a "you are here" marker. Honest by construction: renders nothing but an
   explanation until there are two cycles of evidence. */
export default function FlareForecast({ session }: { session: Session }) {
  const f = useMemo(() => flareStats(session), [session]);
  const line = forecastLine(f);

  if (f.cycles < 1 || f.histogram.every((h) => h.count === 0)) {
    return (
      <div className="mx-5 mt-5 rounded-[var(--r-md)] bg-raised p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
          <TrendingUp size={12} /> Flare forecast
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
          Once you&apos;ve logged symptoms across two cycles, I&apos;ll show you <em>when</em> in your cycle
          they tend to hit — so you can prepare instead of being blindsided. Patterns get clearer the more you log.
        </p>
      </div>
    );
  }

  const W = 300, H = 84, PAD = 6;
  const n = f.histogram.length;
  const bw = (W - PAD * 2) / n;
  const max = Math.max(1, ...f.histogram.map((h) => h.count));
  const x = (day: number) => PAD + (day - 1) * bw;

  return (
    <div className="card-soft mx-5 mt-5 rounded-[var(--r-md)] bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
          <Sparkles size={12} /> Your flare pattern
        </p>
        <span className="text-[10px] text-faint">{f.cycles} cycle{f.cycles === 1 ? "" : "s"} of evidence</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H + 16}`} className="mt-2 w-full">
        {f.window && (
          <rect
            x={x(f.window.from)} y={0}
            width={bw * (f.window.to - f.window.from + 1)} height={H}
            rx={6} fill="var(--c-brand-soft)"
          />
        )}
        {f.histogram.map((h) =>
          h.count > 0 ? (
            <rect
              key={h.day}
              x={x(h.day) + bw * 0.18}
              y={H - (h.count / max) * (H - 10)}
              width={bw * 0.64}
              height={(h.count / max) * (H - 10)}
              rx={2.5}
              fill={f.window && h.day >= f.window.from && h.day <= f.window.to ? "var(--c-brand)" : "var(--c-accent)"}
              opacity={0.9}
            />
          ) : null,
        )}
        {f.currentDay !== null && f.currentDay <= n && (
          <>
            <line x1={x(f.currentDay) + bw / 2} y1={0} x2={x(f.currentDay) + bw / 2} y2={H} stroke="var(--c-ink)" strokeWidth={1.2} strokeDasharray="3 3" />
            <circle cx={x(f.currentDay) + bw / 2} cy={H} r={3.5} fill="var(--c-ink)" />
            <text x={Math.min(x(f.currentDay) + bw / 2, W - 30)} y={H + 12} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--c-ink)">
              you · day {f.currentDay}
            </text>
          </>
        )}
        <text x={PAD} y={H + 12} fontSize="8" fill="var(--c-faint)">day 1</text>
        <text x={W - PAD} y={H + 12} textAnchor="end" fontSize="8" fill="var(--c-faint)">day {n}</text>
      </svg>

      {line ? (
        <p className="mt-2 rounded-[var(--r-sm)] bg-brandsoft px-3 py-2.5 text-[12px] leading-relaxed text-ink">
          {line}
        </p>
      ) : f.window ? (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          {f.window.symptoms.map((s) => s.toLowerCase()).join(", ")} have clustered around day {f.window.from}–{f.window.to} ({f.window.hits} of {f.cycles} cycles). The shaded band is that window.
        </p>
      ) : (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          Bars show when in your cycle symptoms have landed so far. One more logged cycle and I can name a window.
        </p>
      )}
      <p className="mt-1.5 text-[10px] text-faint">A pattern, not a certainty — your body isn&apos;t a schedule.</p>
    </div>
  );
}
