"use client";

import { useRef, useState } from "react";
import StepShell from "./StepShell";
import Button from "../ui/Button";
import type { ExtractedReport } from "@/lib/types";

/* Physical paper is the norm for scans — camera capture is a first-class path
   here, not something hidden behind a file picker. */
export default function ReportStep({
  progress, onExtracted, onSkip, onBack,
}: {
  progress: number;
  onExtracted: (r: ExtractedReport) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  async function upload(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", f);
      const res = await fetch("/api/extract", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't read that");
      onExtracted(data as ExtractedReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file");
    } finally {
      setBusy(false);
    }
  }

  if (busy) return <Analyzing progress={progress} />;

  return (
    <StepShell
      progress={progress}
      onBack={onBack}
      eyebrow="Step 1 of 3"
      title="Do you have any reports?"
      subtitle="Bloodwork or a scan. Even one taken for something else — I can often still read useful things from it."
      footer={
        <div className="space-y-2">
          <Button full variant="secondary" onClick={onSkip}>
            I don&apos;t have any reports
          </Button>
          <p className="text-center text-[11px] text-faint">
            That&apos;s completely fine — nothing here needs one.
          </p>
        </div>
      }
    >
      <input ref={fileRef} type="file" accept="application/pdf,image/*" hidden
        onChange={(e) => upload(e.target.files?.[0])} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => upload(e.target.files?.[0])} />

      <div className="space-y-3">
        <Option
          onClick={() => camRef.current?.click()}
          title="Photograph a paper report"
          body="Most clinics only hand you a printout. Just point your camera at it — no scanner needed."
          badge="Most people"
          icon={<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />}
        />
        <Option
          onClick={() => fileRef.current?.click()}
          title="Upload a PDF"
          body="The file your lab emailed you."
          icon={<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />}
        />

        {error && (
          <p className="rounded-[var(--r-sm)] bg-bad/10 px-3 py-2 text-[12px] text-bad">{error}</p>
        )}

        <div className="rounded-[var(--r-sm)] border border-line bg-raised px-3 py-2.5">
          <p className="text-[12px] leading-relaxed text-muted">
            Whatever you share, I&apos;ll explain what each value means in plain words. I won&apos;t tell you
            whether you have PCOS — no app honestly can.
          </p>
        </div>
      </div>
    </StepShell>
  );
}

function Option({
  onClick, title, body, badge, icon,
}: { onClick: () => void; title: string; body: string; badge?: string; icon: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="flex w-full gap-3 rounded-[var(--r-md)] border border-line bg-surface p-3.5 text-left transition hover:border-brand">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--r-sm)] bg-brandsoft text-brand">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold text-ink">{title}</p>
          {badge && (
            <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-accent">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{body}</p>
      </div>
    </button>
  );
}

const STAGES = ["Reading the document", "Finding the values", "Checking against your lab's ranges", "Working out what it means"];

function Analyzing({ progress }: { progress: number }) {
  return (
    <StepShell progress={progress} title="Reading your report…"
      subtitle="A few seconds." footer={<div className="h-11" />}>
      <div className="space-y-3 pt-2">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-3 pulse-soft" style={{ animationDelay: `${i * 200}ms` }}>
            <div className="h-2 w-2 rounded-full bg-brand" />
            <p className="text-[13px] text-muted">{s}</p>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
