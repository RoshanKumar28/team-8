"use client";

import { useState } from "react";
import StepShell from "./StepShell";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import type { Question } from "@/lib/questions";

export default function QuestionStep({
  progress, question, index, total, value, prefilled, onAnswer, onSkip, onBack,
}: {
  progress: number;
  question: Question;
  index: number;
  total: number;
  value: string | string[];
  prefilled: boolean;
  onAnswer: (v: string | string[]) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const multi = Boolean(question.multi);
  const [picked, setPicked] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );
  const [other, setOther] = useState("");
  const [showWhy, setShowWhy] = useState(false);

  const allowOther = question.kind === "chipsWithOther";
  const answered = picked.length > 0 || other.trim().length > 0;

  function toggle(opt: string) {
    if (multi) setPicked((p) => (p.includes(opt) ? p.filter((x) => x !== opt) : [...p, opt]));
    else setPicked((p) => (p[0] === opt ? [] : [opt]));
  }

  function submit() {
    const all = [...picked, ...(other.trim() ? [other.trim()] : [])];
    onAnswer(multi ? all : all[0] ?? "");
  }

  return (
    <StepShell
      progress={progress}
      onBack={onBack}
      eyebrow={`${question.group} · ${index + 1} of ${total}`}
      title={question.ask}
      footer={
        <div className="space-y-2">
          <Button full onClick={submit} disabled={!answered}>
            {multi ? "Continue" : "Continue"}
          </Button>
          <button onClick={onSkip} className="w-full py-1 text-[12.5px] font-medium text-muted transition hover:text-ink">
            Skip — I&apos;ll tell you later
          </button>
        </div>
      }
    >
      {prefilled && (
        <div className="mb-3 rounded-[var(--r-sm)] bg-brandsoft px-3 py-2">
          <p className="text-[12px] text-brand">Filled in from your report — change it if it&apos;s wrong.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {question.options?.map((o) => (
          <Chip key={o} label={o} selected={picked.includes(o)} onClick={() => toggle(o)} />
        ))}
      </div>

      {multi && <p className="mt-2.5 text-[11.5px] text-faint">Pick as many as apply.</p>}

      {allowOther && (
        <input
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="Something else? Type it here"
          className="mt-3 w-full rounded-[var(--r-md)] bg-raised px-3.5 py-3 text-[13px] text-ink outline-none ring-1 ring-transparent transition placeholder:text-faint focus:ring-brand"
        />
      )}

      <button onClick={() => setShowWhy((s) => !s)}
        className="mt-4 text-[12px] font-medium text-brand underline underline-offset-2">
        {showWhy ? "Hide" : "Why does this matter?"}
      </button>
      {showWhy && (
        <p className="rise mt-2 rounded-[var(--r-sm)] border border-line bg-raised px-3 py-2.5 text-[12.5px] leading-relaxed text-muted">
          {question.why}
        </p>
      )}
    </StepShell>
  );
}
