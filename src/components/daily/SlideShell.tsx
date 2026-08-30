"use client";

/* Same frame as the onboarding StepShell, but for slides that open *inside* the
   coach — no top progress bar competing with the tab header, and a dismiss
   affordance, because every one of these is skippable by design. */
export default function SlideShell({
  eyebrow, title, subtitle, step, of, children, footer, onClose,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  step: number;
  of: number;
  children?: React.ReactNode;
  footer: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="rise flex h-full min-h-0 flex-col bg-bg">
      <div className="shrink-0 px-5 pb-3 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: of }, (_, i) => (
              <span
                key={i}
                className={`h-1 w-7 rounded-full transition-colors ${i < step ? "bg-brand" : "bg-line"}`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 text-[11.5px] font-semibold text-faint transition hover:text-ink"
          >
            Not now
          </button>
        </div>

        <div className="mt-4">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
          )}
          <h1 className="text-[21px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-3">{children}</div>

      <div className="shrink-0 border-t border-line bg-surface px-5 pb-6 pt-3">{footer}</div>
    </div>
  );
}
