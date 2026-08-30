"use client";

import { useState } from "react";
import { Pill, Leaf, X, Trash2, Plus, BellRing, BellOff } from "lucide-react";
import type { Medication, MedKind, MedTiming } from "@/lib/types";

const TIMINGS: { id: MedTiming; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

const COMMON = ["Metformin", "Inositol", "Vitamin D", "Spearmint tea", "Omega-3", "Spironolactone", "Iron", "Magnesium"];

/* Full-screen manager. Adding a med is three taps and a name — the schedule
   defaults to morning so the fast path is: name → Add. */
export default function MedsManager({
  meds, onAdd, onRemove, onToggleRemind, onClose,
}: {
  meds: Medication[];
  onAdd: (m: Omit<Medication, "id">) => void;
  onRemove: (id: string) => void;
  onToggleRemind: (id: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [kind, setKind] = useState<MedKind>("medication");
  const [timings, setTimings] = useState<MedTiming[]>(["morning"]);

  function add() {
    if (!name.trim() || timings.length === 0) return;
    onAdd({ name: name.trim(), dose: dose.trim(), kind, timings, remind: true });
    setName(""); setDose(""); setTimings(["morning"]); setKind("medication");
  }

  return (
    <div className="rise absolute inset-0 z-40 flex flex-col bg-surface">
      <div className="shrink-0 px-5 pb-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Meds & supplements</p>
            <h1 className="font-display text-[20px] font-semibold leading-tight text-ink">What are you taking?</h1>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              I&apos;ll remind you gently and keep the adherence history for your doctor. I never comment on your prescriptions — that&apos;s their job.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-raised text-muted">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {meds.length > 0 && (
          <div className="mb-5 space-y-2">
            {meds.map((m) => (
              <div key={m.id} className="card-soft pop-spring flex items-center gap-2.5 rounded-[var(--r-md)] bg-surface p-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${m.kind === "medication" ? "bg-brandsoft text-brand" : "bg-goodsoft text-good"}`}>
                  {m.kind === "medication" ? <Pill size={15} /> : <Leaf size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-ink">
                    {m.name} <span className="font-normal text-faint">{m.dose}</span>
                  </p>
                  <p className="text-[11px] capitalize text-muted">{m.timings.join(" · ")}</p>
                </div>
                <button onClick={() => onToggleRemind(m.id)} aria-label="Toggle reminder"
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${m.remind ? "bg-warnsoft text-warn" : "bg-raised text-faint"}`}>
                  {m.remind ? <BellRing size={14} /> : <BellOff size={14} />}
                </button>
                <button onClick={() => onRemove(m.id)} aria-label="Remove"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-raised text-faint transition hover:text-bad">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Add one</p>

        <div className="mb-2 flex flex-wrap gap-1.5">
          {COMMON.filter((c) => !meds.some((m) => m.name === c)).slice(0, 6).map((c) => (
            <button key={c} onClick={() => setName(c)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                name === c ? "card-soft bg-brand text-brandink" : "bg-raised text-muted hover:bg-brandsoft"
              }`}>
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
            className="min-w-0 flex-[2] rounded-[var(--r-md)] bg-raised px-3.5 py-3 text-[13px] text-ink outline-none ring-1 ring-transparent transition placeholder:text-faint focus:ring-brand" />
          <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Dose"
            className="min-w-0 flex-1 rounded-[var(--r-md)] bg-raised px-3.5 py-3 text-[13px] text-ink outline-none ring-1 ring-transparent transition placeholder:text-faint focus:ring-brand" />
        </div>

        <div className="mt-2.5 flex gap-1.5">
          {(["medication", "supplement"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold capitalize transition ${
                kind === k ? "card-soft bg-ink text-surface" : "bg-raised text-muted"
              }`}>
              {k === "medication" ? <Pill size={12} /> : <Leaf size={12} />} {k}
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex gap-1.5">
          {TIMINGS.map(({ id, label }) => (
            <button key={id}
              onClick={() => setTimings((t) => t.includes(id) ? t.filter((x) => x !== id) : [...t, id])}
              className={`flex-1 rounded-full py-2 text-[12px] font-semibold transition ${
                timings.includes(id) ? "card-soft bg-accent text-brandink" : "bg-raised text-muted"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <button onClick={add} disabled={!name.trim() || timings.length === 0}
          className="card-soft pop-spring mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-3 text-[13.5px] font-bold text-brandink transition disabled:opacity-40">
          <Plus size={15} /> Add
        </button>
      </div>
    </div>
  );
}
