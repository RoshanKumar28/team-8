"use client";

import Progress from "../ui/Progress";

/* Every onboarding step gets the same frame: scrollable body, pinned footer.
   Keeps the phone viewport from ever trapping the primary action off-screen. */
export default function StepShell({
  progress, eyebrow, title, subtitle, children, footer, onBack,
}: {
  progress: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-5 pb-3 pt-12">
        <Progress value={progress} />
        <div className="mt-4 flex items-start gap-2">
          {onBack && (
            <button onClick={onBack} aria-label="Back"
              className="-ml-1 mt-0.5 shrink-0 text-muted transition hover:text-ink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>}
            <h1 className="font-display text-[22px] font-semibold leading-tight text-ink">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-3">{children}</div>

      <div className="shrink-0 bg-surface px-5 pb-7 pt-3">{footer}</div>
    </div>
  );
}
