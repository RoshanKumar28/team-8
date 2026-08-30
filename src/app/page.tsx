"use client";

import { useState } from "react";

import PhoneFrame from "@/components/ui/PhoneFrame";
import Welcome from "@/components/onboarding/Welcome";
import ReportStep from "@/components/onboarding/ReportStep";
import ReviewStep from "@/components/onboarding/ReviewStep";
import QuestionStep from "@/components/onboarding/QuestionStep";
import ReadyStep from "@/components/onboarding/ReadyStep";
import CoachScreen from "@/components/coach/CoachScreen";
import { seededSession } from "@/lib/seed";
import { useOnboarding } from "@/lib/useOnboarding";

export default function Page() {
  const o = useOnboarding();
  if (!o.session) return null;

  const q = o.queue[o.qIndex];

  return (
    <>
      <PhoneFrame>
        {o.stage === "welcome" && <Welcome onStart={() => o.setStage("report")} />}

        {o.stage === "report" && (
          <ReportStep
            progress={o.progress}
            onExtracted={o.applyReport}
            onSkip={() => o.setStage("questions")}
            onBack={() => o.setStage("welcome")}
          />
        )}

        {o.stage === "review" && o.lastReport && (
          <ReviewStep
            progress={o.progress}
            report={o.lastReport}
            onContinue={() => o.setStage("questions")}
            onAddAnother={() => o.setStage("report")}
            onBack={() => o.setStage("report")}
          />
        )}

        {o.stage === "questions" && q && (
          <QuestionStep
            key={q.id}
            progress={o.progress}
            question={q}
            index={o.qIndex}
            total={o.queue.length}
            value={o.session.memory.profile[q.id]}
            prefilled={false}
            onAnswer={(v) => o.answer(q.id, v)}
            onSkip={() => o.skip(q.id)}
            onBack={() => (o.qIndex > 0 ? o.setQIndex(o.qIndex - 1) : o.setStage("report"))}
          />
        )}

        {o.stage === "ready" && (
          <ReadyStep
            memory={o.session.memory}
            onStart={o.finish}
            onBack={() => o.setStage("questions")}
          />
        )}

        {o.stage === "coach" && (
          <CoachScreen
            session={o.session}
            onUpdate={(s) => o.patch((prev) => Object.assign(prev, s))}
          />
        )}
      </PhoneFrame>

      <DemoMenu
        onSeed={() => {
          const s2 = seededSession();
          o.patch((prev) => Object.assign(prev, s2));
          o.setStage("coach");
        }}
        onReset={o.reset}
      />
    </>
  );
}

function DemoMenu({ onSeed, onReset }: { onSeed: () => void; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed right-3 top-3 z-50 flex flex-col items-end gap-1.5">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Demo controls"
        className="grid h-7 w-7 place-items-center rounded-full bg-surface/80 text-[11px] text-faint shadow-sm backdrop-blur transition hover:text-ink"
      >
        {open ? "×" : "⋯"}
      </button>
      {open && (
        <>
          <button onClick={() => { onSeed(); setOpen(false); }}
            className="card-soft rounded-full bg-surface px-3 py-1.5 text-[11px] font-semibold text-brand">
            Week 4 demo
          </button>
          <button onClick={() => { onReset(); setOpen(false); }}
            className="card-soft rounded-full bg-surface px-3 py-1.5 text-[11px] font-medium text-muted">
            Restart
          </button>
        </>
      )}
    </div>
  );
}
