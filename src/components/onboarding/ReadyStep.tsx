"use client";

import StepShell from "./StepShell";
import Button from "../ui/Button";
import Progress from "../ui/Progress";
import { completeness } from "@/lib/questions";
import type { Memory } from "@/lib/types";

export default function ReadyStep({
  memory, onStart, onBack,
}: { memory: Memory; onStart: () => void; onBack: () => void }) {
  const p = memory.profile;
  const score = completeness(p);

  const known: [string, string][] = [
    ["Working on", p.concerns.length ? p.concerns.join(" → ") : p.primaryConcern],
    ["Cycle", [p.cycleLength, p.cycleRegularity].filter(Boolean).join(" · ")],
    ["Symptoms", p.symptoms.join(", ")],
    ["Life", [p.job, p.stress && `${p.stress} stress`, p.sleep && `${p.sleep} sleep`].filter(Boolean).join(" · ")],
    ["Already tried", p.tried.join(" · ")],
    ["Medications", p.meds.join(", ")],
    ["Reports", memory.reports.map((r) => r.name).join(", ")],
  ];

  return (
    <StepShell
      progress={100}
      onBack={onBack}
      eyebrow="Done"
      title="Here's what I know about you"
      subtitle="Anything wrong, just tell me in the chat and I'll fix it."
      footer={
        <div className="space-y-2">
          <Button full onClick={onStart}>Start with my coach</Button>
          <p className="text-center text-[11px] leading-relaxed text-faint">
            Not a diagnosis and not medical advice. Always confirm with your doctor.
          </p>
        </div>
      }
    >
      <div className="mb-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[12px] font-medium text-ink">How well I know you</span>
          <span className="text-[12px] font-bold text-brand">{score}%</span>
        </div>
        <Progress value={score} />
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-faint">
          {score >= 80
            ? "That's plenty to start. The rest I'll pick up as we talk."
            : "Enough to start. The more I learn, the less generic I get — we can fill the gaps in conversation."}
        </p>
      </div>

      <dl className="space-y-2.5">
        {known.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="card-soft rounded-[var(--r-md)] bg-surface p-3.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{k}</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {memory.skipped.length > 0 && (
        <div className="mt-4 rounded-[var(--r-md)] bg-warnsoft p-3.5">
          <p className="text-[12px] font-semibold text-ink">You skipped {memory.skipped.length}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
            No problem. I might ask again later if it turns out to matter — never twice.
          </p>
        </div>
      )}
    </StepShell>
  );
}
