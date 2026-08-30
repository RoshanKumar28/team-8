"use client";

import { useState } from "react";
import { Droplet, Droplets, Waves, CircleOff, X, Check } from "lucide-react";
import type { CycleDayLog, Flow } from "@/lib/types";

/* Clue-style day logger: big tappable tiles, one screen, no typing. A flow tap
   alone is a complete log — everything else is optional texture. */

const FLOWS: { id: Flow | null; label: string; icon: React.ReactNode; drops: number }[] = [
  { id: null, label: "None", icon: <CircleOff size={17} />, drops: 0 },
  { id: "spotting", label: "Spotting", icon: <Droplet size={15} />, drops: 1 },
  { id: "light", label: "Light", icon: <Droplet size={17} />, drops: 1 },
  { id: "medium", label: "Medium", icon: <Droplets size={17} />, drops: 2 },
  { id: "heavy", label: "Heavy", icon: <Waves size={17} />, drops: 3 },
];

const PAIN = ["Cramps", "Headache", "Backache", "Breast tenderness", "Ovulation pain"];
const BODY = ["Bloating", "Acne flare", "Fatigue", "Cravings", "Hair shedding", "Nausea"];

function niceDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export default function DayLogSheet({
  date, existing, onSave, onClose,
}: {
  date: string;
  existing: CycleDayLog | null;
  onSave: (log: CycleDayLog) => void;
  onClose: () => void;
}) {
  const [flow, setFlow] = useState<Flow | null>(existing?.flow ?? null);
  const [flowTouched, setFlowTouched] = useState(Boolean(existing));
  const [pain, setPain] = useState<string[]>(existing?.pain ?? []);
  const [body, setBody] = useState<string[]>(existing?.body ?? []);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const dirty = flowTouched || pain.length > 0 || body.length > 0;

  return (
    <div className="rise absolute inset-0 z-40 flex flex-col bg-surface">
      <div className="shrink-0 px-5 pb-2 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Log your day</p>
            <h1 className="font-display text-[20px] font-semibold leading-tight text-ink">{niceDate(date)}</h1>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-raised text-muted">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <p className="mb-2 mt-2 text-[11px] font-bold uppercase tracking-wider text-muted">Bleeding</p>
        <div className="grid grid-cols-5 gap-1.5">
          {FLOWS.map((f) => {
            const active = flowTouched && flow === f.id;
            return (
              <button
                key={f.label}
                onClick={() => { setFlow(f.id); setFlowTouched(true); }}
                className={`flex flex-col items-center gap-1 rounded-[var(--r-md)] px-1 py-3 transition ${
                  active
                    ? f.id === null ? "card-soft bg-ink text-surface" : "card-soft bg-brand text-brandink"
                    : "bg-raised text-muted hover:bg-brandsoft hover:text-brand"
                }`}
              >
                {f.icon}
                <span className="text-[10px] font-bold">{f.label}</span>
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-muted">Pain</p>
        <div className="flex flex-wrap gap-1.5">
          {PAIN.map((v) => (
            <button key={v} onClick={() => toggle(pain, setPain, v)}
              className={`rounded-full px-3 py-2 text-[12.5px] font-medium transition ${
                pain.includes(v) ? "card-soft bg-bad/90 text-brandink" : "bg-raised text-muted hover:bg-brandsoft"
              }`}>
              {v}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-muted">Body</p>
        <div className="flex flex-wrap gap-1.5">
          {BODY.map((v) => (
            <button key={v} onClick={() => toggle(body, setBody, v)}
              className={`rounded-full px-3 py-2 text-[12.5px] font-medium transition ${
                body.includes(v) ? "card-soft bg-accent text-brandink" : "bg-raised text-muted hover:bg-accentsoft"
              }`}>
              {v}
            </button>
          ))}
        </div>

        <p className="mt-5 rounded-[var(--r-md)] bg-goodsoft px-3.5 py-2.5 text-[11.5px] leading-relaxed text-muted">
          A single tap on bleeding is a complete log. The rest is optional — it just makes your patterns sharper.
        </p>
      </div>

      <div className="shrink-0 px-5 pb-7 pt-2">
        <button
          onClick={() => { onSave({ date, flow: flowTouched ? flow : null, pain, body, ts: Date.now() }); onClose(); }}
          disabled={!dirty}
          className="card-soft flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-3.5 text-[14px] font-bold text-brandink transition disabled:opacity-40"
        >
          <Check size={16} /> Save day
        </button>
      </div>
    </div>
  );
}
