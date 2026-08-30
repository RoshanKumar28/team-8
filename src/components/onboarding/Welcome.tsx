"use client";

import Button from "../ui/Button";

const PROMISES = [
  { t: "It works on your one thing", d: "Not a generic PCOS checklist. Whichever symptom actually bothers you is what everything points at." },
  { t: "It remembers", d: "What you promised, what you tried, which explanation finally made sense. You won't repeat yourself." },
  { t: "It proves it's working early", d: "Your cycle takes months to shift. I track the things that move in days, so you can see progress before then." },
];

export default function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-16">
        <div className="rise">
          <div className="mb-5 h-11 w-11 rounded-[var(--r-md)] bg-brand" />
          <h1 className="text-[27px] font-bold leading-[1.15] tracking-tight text-ink">
            Most PCOS advice is written for everyone.
            <br />
            <span className="text-brand">This one is written for you.</span>
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            A coach, not a course. It starts from where you actually are.
          </p>
        </div>

        <div className="mt-7 space-y-4">
          {PROMISES.map((p, i) => (
            <div key={p.t} className="rise flex gap-3" style={{ animationDelay: `${80 + i * 70}ms` }}>
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <div>
                <p className="text-[14px] font-semibold text-ink">{p.t}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-6 pb-7">
        <div className="mb-3 rounded-[var(--r-sm)] bg-brandsoft px-3 py-2.5">
          <p className="text-[12px] leading-relaxed text-brand">
            Setting up takes about 8 minutes, once. After that I won&apos;t make you repeat any of it.
          </p>
        </div>
        <Button full onClick={onStart}>Let&apos;s start</Button>
        <p className="mt-3 text-center text-[10.5px] leading-relaxed text-faint">
          This app doesn&apos;t diagnose and isn&apos;t medical advice.
        </p>
      </div>
    </div>
  );
}
