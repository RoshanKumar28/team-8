"use client";

import { useState } from "react";
import StepShell from "./StepShell";
import Button from "../ui/Button";
import Chip from "../ui/Chip";

const FALLBACK = [
  "Hair fall / thinning", "Acne", "Weight that won't shift",
  "Irregular cycles", "Facial hair", "Low energy", "Trying to conceive",
];

/* The spine of the product. Everything the coach does aims here, so this gets
   its own screen rather than being one more question in a list. */
export default function OneThingStep({
  progress, symptoms, onDone, onBack,
}: {
  progress: number;
  symptoms: string[];
  onDone: (concern: string, why: string) => void;
  onBack: () => void;
}) {
  const options = symptoms.length ? symptoms : FALLBACK;
  const [concern, setConcern] = useState("");
  const [other, setOther] = useState("");
  const [why, setWhy] = useState("");

  const chosen = concern || other.trim();

  return (
    <StepShell
      progress={progress}
      onBack={onBack}
      eyebrow="The important one"
      title="Which one bothers you most?"
      subtitle="I'll keep an eye on everything else. But there's usually one thing you think about in the mirror — that's the one I want to aim at."
      footer={
        <div className="space-y-2">
          <Button full onClick={() => onDone(chosen, why.trim())} disabled={!chosen}>
            {chosen ? `Work on ${chosen.toLowerCase()}` : "Pick one"}
          </Button>
          <p className="text-center text-[11px] text-faint">You can change this whenever you want.</p>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} label={o} selected={concern === o}
            onClick={() => { setConcern(concern === o ? "" : o); setOther(""); }} />
        ))}
      </div>

      <input
        value={other}
        onChange={(e) => { setOther(e.target.value); setConcern(""); }}
        placeholder="Or something else entirely"
        className="mt-3 w-full rounded-[var(--r-sm)] border border-line bg-surface px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-faint focus:border-brand"
      />

      {chosen && (
        <div className="rise mt-5">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              What makes this the one? <span className="font-normal text-faint">Optional</span>
            </span>
            <textarea
              rows={3}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="However you want to put it. This is the bit I'll remember when you want to give up."
              className="w-full resize-none rounded-[var(--r-sm)] border border-line bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink outline-none placeholder:text-faint focus:border-brand"
            />
          </label>
        </div>
      )}
    </StepShell>
  );
}
