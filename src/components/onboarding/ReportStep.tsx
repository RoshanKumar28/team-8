"use client";

import { useRef, useState } from "react";
import { Camera, FileUp, ScanLine, ShieldCheck } from "lucide-react";
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
          tint="bg-brandsoft" fg="text-brand"
          title="Photograph a paper report"
          body="Most clinics only hand you a printout. Just point your camera at it — no scanner needed."
          badge="Most people"
          icon={<Camera size={19} />}
        />
        <Option
          onClick={() => fileRef.current?.click()}
          tint="bg-accentsoft" fg="text-accent"
          title="Upload a PDF"
          body="The file your lab emailed you."
          icon={<FileUp size={19} />}
        />

        {error && (
          <p className="rounded-[var(--r-sm)] bg-bad/10 px-3 py-2 text-[12px] text-bad">{error}</p>
        )}

        <div className="rounded-[var(--r-md)] bg-goodsoft px-3.5 py-3">
          <p className="flex gap-2 text-[12px] leading-relaxed text-muted">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-good" />
            <span>Whatever you share, I&apos;ll explain what each value means in plain words. I won&apos;t tell you
            whether you have PCOS — no app honestly can.</span>
          </p>
        </div>
      </div>
    </StepShell>
  );
}

function Option({
  onClick, title, body, badge, icon, tint = "bg-brandsoft", fg = "text-brand",
}: { onClick: () => void; title: string; body: string; badge?: string; icon: React.ReactNode; tint?: string; fg?: string }) {
  return (
    <button onClick={onClick}
      className={`card-soft flex w-full gap-3 rounded-[var(--r-md)] ${tint} p-4 text-left transition hover:-translate-y-0.5`}>
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface ${fg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold text-ink">{title}</p>
          {badge && (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-brand">
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
            <ScanLine size={13} className="text-brand" />
            <p className="text-[13px] text-muted">{s}</p>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
