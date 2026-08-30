"use client";

import { useState } from "react";
import { Smile, Moon, Zap, type LucideIcon } from "lucide-react";
import SlideShell from "./SlideShell";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import MoodOrbs from "./MoodOrbs";
import type { CheckIn } from "@/lib/types";

/* Three rows, one tap each. The wording is deliberately not clinical — she is
   answering this at 8am with one hand, not filling in a symptom diary. */
type Row = { key: "mood" | "sleep" | "energy"; label: string; hint: string; options: string[] };

const ROWS: Row[] = [
  {
    key: "mood",
    label: "Mood",
    hint: "no wrong answer, and I don't grade this",
    options: ["Flat", "Low", "Fine", "Restless", "Good"],
  },
  {
    key: "sleep",
    label: "Sleep",
    hint: "roughly — I only need the shape of it",
    options: ["Barely", "Broken", "Short but okay", "Slept well"],
  },
  {
    key: "energy",
    label: "Energy right now",
    hint: "this is the one that moves first",
    options: ["Running on empty", "Patchy", "Steady", "Actually good"],
  },
];

export default function CheckInStep({
  day, existing, onSave, onClose,
}: {
  day: number;
  existing: CheckIn | null;
  onSave: (c: Omit<CheckIn, "ts">) => void;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState({
    mood: existing?.mood ?? "",
    sleep: existing?.sleep ?? "",
    energy: existing?.energy ?? "",
  });
  const [note, setNote] = useState(existing?.note ?? "");

  const answered = Object.values(answers).filter(Boolean).length;

  // Tapping the selected chip again clears it — skipping a row is a real answer.
  function pick(key: Row["key"], option: string) {
    setAnswers((prev) => ({ ...prev, [key]: prev[key] === option ? "" : option }));
  }

  return (
    <SlideShell
      step={1}
      of={2}
      onClose={onClose}
      eyebrow={`30 seconds · Day ${day}`}
      title="How did today actually go?"
      subtitle="Three taps. This is where the patterns come from — mood against your cycle, energy against what you ate. Skip any row you don't feel like answering."
      footer={
        <div className="space-y-2">
          <Button
            full
            disabled={answered === 0}
            onClick={() => onSave({ day, ...answers, note: note.trim() })}
          >
            {answered === 0 ? "Tap at least one" : "Next — what you ate"}
          </Button>
          <p className="text-center text-[11px] text-faint">
            No streaks here. A missed day breaks nothing.
          </p>
        </div>
      }
    >
      <div className="space-y-5">
        {ROWS.map((row) => (
          <div key={row.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                {(() => { const I: LucideIcon = row.key === "mood" ? Smile : row.key === "sleep" ? Moon : Zap; return <I size={14} className="text-brand" />; })()}
                {row.label}
              </span>
              <span className="text-[10.5px] text-faint">{row.hint}</span>
            </div>
            {row.key === "mood" ? (
              <MoodOrbs value={answers.mood} onPick={(v) => pick("mood", v)} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {row.options.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    selected={answers[row.key] === o}
                    onClick={() => pick(row.key, o)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Anything else? <span className="font-normal text-faint">Optional</span>
          </span>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One line is plenty. I'll quote it back to you when it matters."
            className="w-full resize-none rounded-[var(--r-sm)] border border-line bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink outline-none placeholder:text-faint focus:border-brand"
          />
        </label>
      </div>
    </SlideShell>
  );
}
