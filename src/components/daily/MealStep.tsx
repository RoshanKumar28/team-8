"use client";

import { useState } from "react";
import SlideShell from "./SlideShell";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import type { MealLog, MealSlot } from "@/lib/types";

const SLOTS: MealSlot[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

/* Plate *shape*, not calories. She has already done calorie apps and quit them;
   the only food data a coach can act on is what the plate was built around. */
const SHAPE = [
  "Protein first",
  "Mostly carbs",
  "Veg on the plate",
  "Something fried",
  "Sweet",
  "Skipped / grabbed something",
  "Ate out",
];

/* The half that makes it worth logging — the plate paired with the two hours
   after it is the insulin story in her own words. */
const AFTER = [
  "Steady after",
  "Sleepy after",
  "Hungry again fast",
  "Bloated",
  "Craved sugar",
  "Didn't notice",
];

export default function MealStep({
  day, existing, onSave, onBack, onClose,
}: {
  day: number;
  existing: MealLog[];
  onSave: (meals: Omit<MealLog, "id" | "ts">[]) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [slot, setSlot] = useState<MealSlot>("Breakfast");
  const [what, setWhat] = useState("");
  const [shape, setShape] = useState<string[]>([]);
  const [after, setAfter] = useState("");
  const [added, setAdded] = useState<Omit<MealLog, "id" | "ts">[]>([]);

  const filled = shape.length > 0 || what.trim().length > 0 || after !== "";

  function toggleShape(s: string) {
    setShape((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function stage() {
    if (!filled) return;
    setAdded((prev) => [...prev, { day, slot, what: what.trim(), shape, after }]);
    const next = SLOTS[Math.min(SLOTS.indexOf(slot) + 1, SLOTS.length - 1)];
    setSlot(next);
    setWhat("");
    setShape([]);
    setAfter("");
  }

  function finish() {
    const all = filled ? [...added, { day, slot, what: what.trim(), shape, after }] : added;
    onSave(all);
  }

  const total = added.length + (filled ? 1 : 0);

  return (
    <SlideShell
      step={2}
      of={2}
      onClose={onClose}
      eyebrow={`Meals · Day ${day}`}
      title="What did the plate look like?"
      subtitle="Not calories, and I'm not weighing anything. Just the shape of the meal and what the next two hours felt like — that pairing is the whole insulin picture."
      footer={
        <div className="space-y-2">
          <Button full disabled={total === 0} onClick={finish}>
            {total === 0 ? "Log at least one meal" : `Save ${total} meal${total > 1 ? "s" : ""}`}
          </Button>
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-[11.5px] font-semibold text-muted transition hover:text-ink">
              ‹ Back to check-in
            </button>
            <button
              onClick={stage}
              disabled={!filled}
              className="text-[11.5px] font-semibold text-brand transition disabled:opacity-40"
            >
              + Add another meal
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Which meal</p>
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((s) => (
              <Chip key={s} label={s} selected={slot === s} onClick={() => setSlot(s)} />
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            What was it? <span className="font-normal text-faint">Optional</span>
          </span>
          <input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder={"\u201cTwo eggs and toast\u201d is enough detail"}
            className="w-full rounded-[var(--r-sm)] border border-line bg-surface px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-faint focus:border-brand"
          />
        </label>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink">The shape of it</span>
            <span className="text-[10.5px] text-faint">tap all that fit</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SHAPE.map((s) => (
              <Chip key={s} label={s} selected={shape.includes(s)} onClick={() => toggleShape(s)} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink">The two hours after</span>
            <span className="text-[10.5px] text-faint">the part that matters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AFTER.map((a) => (
              <Chip key={a} label={a} selected={after === a} onClick={() => setAfter(after === a ? "" : a)} />
            ))}
          </div>
        </div>

        {added.length > 0 && (
          <div className="rise rounded-[var(--r-md)] bg-brandsoft p-3">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand">Logged so far today</p>
            {added.map((m, i) => (
              <p key={i} className="text-[12px] text-ink">
                <span className="font-semibold">{m.slot}</span>
                {m.what ? ` — ${m.what}` : ""}
                {m.after ? <span className="text-muted"> · {m.after.toLowerCase()}</span> : null}
              </p>
            ))}
          </div>
        )}

        {existing.length > 0 && (
          <p className="text-[11px] italic text-faint">
            You already logged {existing.length} meal{existing.length > 1 ? "s" : ""} today — these get added to them.
          </p>
        )}
      </div>
    </SlideShell>
  );
}
