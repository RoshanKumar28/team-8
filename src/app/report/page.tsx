"use client";

import { useEffect, useState } from "react";
import { OvyFlower } from "@/components/ui/Logo";
import type { Session } from "@/lib/types";

/* A doctor-ready summary, designed to be printed or saved as PDF from the
   native dialog — real typography, selectable text, no rasterizing library. */

const flagStyle: Record<string, string> = {
  high: "background:#fdecec;color:#b03636",
  low: "background:#fdf3e4;color:#a06b14",
  normal: "background:#e9f6f0;color:#2e7d5b",
  unknown: "background:#f2f2f2;color:#777",
};
const critLabel: Record<string, string> = { met: "Evidence present", not_met: "Not met", unknown: "Not yet evaluated" };

export default function ReportPage() {
  const [s, setS] = useState<Session | null>(null);
  useEffect(() => {
    try { setS(JSON.parse(localStorage.getItem("luteal.session") ?? "null")); } catch {}
  }, []);

  if (!s) {
    return <main className="grid min-h-dvh place-items-center text-sm text-muted">No data yet — set up ovy first.</main>;
  }

  const m = s.memory;
  const p = m.profile;
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const cycleGaps = gapsFrom(m.periodDates ?? []);

  return (
    <main className="mx-auto max-w-[720px] bg-white px-8 py-8 text-[#2a2a2a] print:px-0 print:py-0">
      <style>{`
        @media print {
          @page { margin: 14mm; }
          .no-print { display: none !important; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* action bar — screen only */}
      <div className="no-print mb-6 flex items-center justify-between rounded-2xl bg-[#fbd8e5] px-4 py-3">
        <p className="text-[13px] font-semibold text-[#c2447e]">Save this as a PDF and hand it over at the start of the visit.</p>
        <button onClick={() => window.print()}
          className="rounded-full bg-[#f06ba8] px-4 py-2 text-[13px] font-bold text-white">
          ↓ Save as PDF
        </button>
      </div>

      {/* letterhead */}
      <header className="flex items-end justify-between border-b-2 border-[#f06ba8] pb-4">
        <div className="flex items-center gap-2.5">
          <OvyFlower size={38} />
          <div>
            <p className="font-display text-[26px] font-semibold lowercase leading-none tracking-tight">ovy</p>
            <p className="mt-1 text-[11px] text-[#8a7580]">Patient-tracked summary · not a diagnosis</p>
          </div>
        </div>
        <div className="text-right text-[11.5px] leading-relaxed text-[#8a7580]">
          <p className="text-[15px] font-bold text-[#2a2a2a]">{p.name || "Patient"}{p.age ? `, ${p.age}` : ""}</p>
          <p>Prepared {today}</p>
          <p>PCOS status: {p.diagnosed === "yes" ? "diagnosed" : p.diagnosed === "no" ? "not diagnosed" : "not yet evaluated"}</p>
        </div>
      </header>

      {/* main concern */}
      {p.primaryConcern && (
        <section className="mt-5 rounded-2xl bg-[#fdf1f6] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c2447e]">Presenting concern</p>
          <p className="font-display mt-1 text-[19px] font-semibold">{p.primaryConcern}</p>
          {p.primaryConcernWhy && <p className="mt-1 text-[12.5px] italic text-[#6e5f66]">“{p.primaryConcernWhy}”</p>}
          {p.symptoms.length > 0 && (
            <p className="mt-2 text-[12px] text-[#6e5f66]"><strong>Also reported:</strong> {p.symptoms.join(" · ")}</p>
          )}
        </section>
      )}

      <div className="mt-5 grid grid-cols-2 gap-5">
        {/* cycle */}
        <section>
          <H>Cycle history</H>
          <Row k="Typical length" v={p.cycleLength} />
          <Row k="Regularity" v={p.cycleRegularity} />
          <Row k="Last period" v={p.lastPeriod} />
          {cycleGaps.length > 0 && <Row k="Logged cycle gaps" v={`${cycleGaps.join(", ")} days`} />}
        </section>

        {/* lifestyle */}
        <section>
          <H>Context</H>
          <Row k="Work" v={p.job} />
          <Row k="Stress" v={p.stress} />
          <Row k="Sleep" v={p.sleep} />
          <Row k="Activity" v={p.activity} />
        </section>
      </div>

      {/* rotterdam */}
      <section className="mt-5">
        <H>Rotterdam criteria — patient-tracked evidence</H>
        <table className="mt-1.5 w-full border-collapse text-[12px]">
          <tbody>
            {([
              ["Irregular / absent ovulation", m.criteria.irregularCycles],
              ["Signs of hyperandrogenism", m.criteria.highAndrogen],
              ["Polycystic ovarian morphology", m.criteria.ovarianMorphology],
            ] as const).map(([label, c]) => (
              <tr key={label} className="border-b border-[#f3dbe6]">
                <td className="py-1.5 pr-2 font-semibold">{label}</td>
                <td className="py-1.5 pr-2 text-[11px] font-bold" style={{ color: c.state === "met" ? "#2e7d5b" : c.state === "unknown" ? "#a06b14" : "#8a7580" }}>
                  {critLabel[c.state]}
                </td>
                <td className="py-1.5 text-[11.5px] text-[#6e5f66]">{c.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* labs */}
      {m.labs.length > 0 && (
        <section className="mt-5">
          <H>Lab values on file</H>
          <table className="mt-1.5 w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b-2 border-[#f3dbe6] text-left text-[10.5px] uppercase tracking-wide text-[#8a7580]">
                <th className="py-1">Marker</th><th className="py-1">Value</th><th className="py-1">Lab range</th><th className="py-1" />
              </tr>
            </thead>
            <tbody>
              {m.labs.map((l) => (
                <tr key={l.marker} className="border-b border-[#f3dbe6]">
                  <td className="py-1.5 pr-2 font-semibold">{l.marker}</td>
                  <td className="py-1.5 pr-2">{l.value}</td>
                  <td className="py-1.5 pr-2 text-[#6e5f66]">{l.refRange}</td>
                  <td className="py-1.5">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={cssOf(flagStyle[l.flag])}>{l.flag}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <div className="mt-5 grid grid-cols-2 gap-5">
        {(p.meds.length > 0 || (m.medications ?? []).length > 0) && (
          <section>
            <H>Current medications & supplements</H>
            <p className="mt-1 text-[12.5px] leading-relaxed">{[...p.meds, ...(m.medications ?? []).map((x) => x.name)].join(" · ")}</p>
          </section>
        )}
        {p.tried.length > 0 && (
          <section>
            <H>Previously tried</H>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#6e5f66]">{p.tried.join(" · ")}</p>
          </section>
        )}
      </div>

      {/* trends */}
      {m.leadingIndicators.length > 0 && (
        <section className="mt-5">
          <H>Self-reported trends</H>
          <div className="mt-1.5 space-y-1">
            {m.leadingIndicators.map((li) => (
              <p key={li.name} className="text-[12px]">
                <strong>{li.name}:</strong> <span className="text-[#8a7580] line-through">{li.baseline}</span>
                {" → "}{li.current}
                <span className="ml-1.5 text-[10.5px] font-bold" style={{ color: li.trend === "improving" ? "#2e7d5b" : li.trend === "worse" ? "#b03636" : "#8a7580" }}>
                  {li.trend}
                </span>
              </p>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 border-t border-[#f3dbe6] pt-3 text-[10px] leading-relaxed text-[#8a7580]">
        Generated by ovy from patient-entered data and uploaded reports. For discussion with a clinician —
        this document does not diagnose, prescribe, or replace medical judgment.
      </footer>
    </main>
  );
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="border-b border-[#f3dbe6] pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#c2447e]">{children}</h2>
);

const Row = ({ k, v }: { k: string; v?: string }) =>
  v ? <p className="mt-1 text-[12.5px]"><span className="font-semibold">{k}:</span> <span className="text-[#6e5f66]">{v}</span></p> : null;

function cssOf(s: string): React.CSSProperties {
  const o: Record<string, string> = {};
  for (const part of s.split(";")) {
    const [k, v] = part.split(":");
    if (k && v) o[k.trim().replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v.trim();
  }
  return o as React.CSSProperties;
}

function gapsFrom(dates: string[]): number[] {
  const days = [...new Set(dates)].sort();
  const starts: number[] = [];
  let prev = -Infinity;
  for (const d of days) {
    const t = new Date(d + "T00:00:00").getTime();
    if (t - prev > 2 * 86400000) starts.push(t);
    prev = t;
  }
  return starts.slice(1).map((t, i) => Math.round((t - starts[i]) / 86400000));
}
