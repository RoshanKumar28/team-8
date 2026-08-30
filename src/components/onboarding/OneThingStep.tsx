"use client";

import { useState } from "react";
import StepShell from "./StepShell";
import Button from "../ui/Button";

const FALLBACK = [
  "Hair fall / thinning", "Acne", "Weight that won't shift",
  "Irregular cycles", "Facial hair", "Low energy", "Trying to conceive",
];

/* She picks everything she wants worked on; tap order = priority order.
   Nothing gets dropped — the first pick just gets the spotlight. */
export default function OneThingStep({
  progress, symptoms, onDone, onBack,
}: {
  progress: number;
  symptoms: string[];
  onDone: (concerns: string[], why: string) => void;
  onBack: () => void;
}) {
  const options = symptoms.length ? symptoms : FALLBACK;
  const [picked, setPicked] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [why, setWhy] = useState("");

  function toggle(o: string) {
    setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  }

  function submit() {
    const all = [...picked, ...(other.trim() ? [other.trim()] : [])];
    onDone(all, why.trim());
  }

  const count = picked.length + (other.trim() ? 1 : 0);
  const top = picked[0] ?? other.trim();

  return (
    <StepShell
      progress={progress}
      onBack={onBack}
      eyebrow="Your focus"
      title="What do you want to work on?"
      subtitle="Pick everything that matters — the order you pick is the order I'll prioritise. Your first pick gets the most attention, but nothing gets ignored."
      footer={
        <div className="space-y-2">
          <Button full onClick={submit} disabled={count === 0}>
            {count === 0 ? "Pick at least one"
              : count === 1 ? `Focus on ${top.toLowerCase()}`
              : `Set my ${count} priorities`}
          </Button>
          <p className="text-center text-[11px] text-faint">You can reorder or change these anytime.</p>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const idx = picked.indexOf(o);
          const sel = idx >= 0;
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition ${
                sel
                  ? "border-brand bg-brand text-brandink"
                  : "border-line bg-surface text-muted hover:border-brand hover:text-ink"
              }`}
            >
              {sel && (
                <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-brandink/25 text-[10px] font-bold">
                  {idx + 1}
                </span>
              )}
              {o}
            </button>
          );
        })}
      </div>

      <input
        value={other}
        onChange={(e) => setOther(e.target.value)}
        placeholder="Something else? It goes last in the order"
        className="mt-3 w-full rounded-[var(--r-sm)] border border-line bg-surface px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-faint focus:border-brand"
      />

      {picked.length > 1 && (
        <p className="rise mt-3 rounded-[var(--r-sm)] bg-brandsoft px-3 py-2 text-[12px] leading-relaxed text-brand">
          Tap again to remove; re-tap in a new order to re-rank. Right now <strong>{picked[0].toLowerCase()}</strong> leads.
        </p>
      )}

      {count > 0 && (
        <div className="rise mt-5">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              What makes {count === 1 ? "this" : `${top.toLowerCase()}`} the big one?{" "}
              <span className="font-normal text-faint">Optional</span>
            </span>
            <textarea
              rows={3}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="However you want to put it. This is the bit I'll remember on the days you want to give up."
              className="w-full resize-none rounded-[var(--r-sm)] border border-line bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink outline-none placeholder:text-faint focus:border-brand"
            />
          </label>
        </div>
      )}
    </StepShell>
  );
}
