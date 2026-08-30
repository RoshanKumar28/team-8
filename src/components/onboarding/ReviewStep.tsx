"use client";

import StepShell from "./StepShell";
import Button from "../ui/Button";
import type { ExtractedReport } from "@/lib/types";

const flagStyle = {
  high: "bg-bad/10 text-bad",
  low: "bg-warn/10 text-warn",
  normal: "bg-good/10 text-good",
  unknown: "bg-line text-muted",
};

export default function ReviewStep({
  progress, report, onContinue, onAddAnother, onBack,
}: {
  progress: number;
  report: ExtractedReport;
  onContinue: () => void;
  onAddAnother: () => void;
  onBack: () => void;
}) {
  const prefilled = Object.keys(report.prefill).length + Object.keys(report.criteriaSignals).length;

  return (
    <StepShell
      progress={progress}
      onBack={onBack}
      eyebrow="Step 2 of 3"
      title="Here's what I read"
      subtitle={`From ${report.sourceName}${report.takenOn ? ` · ${report.takenOn}` : ""}. Nothing here is a diagnosis — it's your report, in plain words.`}
      footer={
        <div className="space-y-2">
          <Button full onClick={onContinue}>That looks right</Button>
          <Button full variant="ghost" onClick={onAddAnother}>Add another report</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {report.labs.length > 0 && (
          <section>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Your bloodwork
            </h2>
            <ul className="space-y-2">
              {report.labs.map((l, i) => (
                <li key={l.marker} className="card-soft rise rounded-[var(--r-md)] bg-surface p-3"
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13.5px] font-semibold text-ink">{l.marker}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${flagStyle[l.flag]}`}>
                      {l.value}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-faint">Your lab&apos;s range: {l.refRange}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{l.plainMeaning}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {report.findings.length > 0 && (
          <section>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              What the scan says
            </h2>
            <ul className="space-y-1.5 rounded-[var(--r-md)] border border-line bg-surface p-3">
              {report.findings.map((f) => (
                <li key={f} className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {prefilled > 0 && (
          <div className="rounded-[var(--r-md)] bg-brandsoft p-3">
            <p className="text-[12.5px] font-semibold text-brand">
              I&apos;ve filled in {prefilled} thing{prefilled === 1 ? "" : "s"} from this.
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-brand/80">
              That&apos;s {prefilled} fewer question{prefilled === 1 ? "" : "s"} I have to ask you.
            </p>
          </div>
        )}

        {report.couldNotRead.length > 0 && (
          <div className="rounded-[var(--r-md)] border border-line bg-raised p-3">
            <p className="mb-1 text-[12px] font-semibold text-ink">Couldn&apos;t make out</p>
            {report.couldNotRead.map((c) => (
              <p key={c} className="text-[12px] leading-relaxed text-muted">{c}</p>
            ))}
          </div>
        )}
      </div>
    </StepShell>
  );
}
