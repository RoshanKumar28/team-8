"use client";

import Button from "../ui/Button";

const PROMISES = [
  { t: "Your one thing", d: "Whichever symptom actually bothers you is what everything points at.", tint: "bg-brandsoft", dot: "bg-brand" },
  { t: "It remembers", d: "What you promised, what you tried, which explanation made sense. Never repeat yourself.", tint: "bg-accentsoft", dot: "bg-accent" },
  { t: "Proof in days", d: "Cycles take months. I track what moves in days, so you see it working early.", tint: "bg-goodsoft", dot: "bg-good" },
];

export default function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Gradient hero */}
      <div
        className="relative shrink-0 overflow-hidden px-6 pb-8 pt-14"
        style={{ background: "linear-gradient(150deg, #fde7ec 0%, #f3ecfc 55%, #e9f7f1 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/50" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/40" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Your PCOS coach</p>
        <h1 className="font-display mt-2 text-[28px] font-semibold leading-[1.12] text-ink">
          Most advice is written for everyone.
          <br />
          <em className="text-brand">This one is written for you.</em>
        </h1>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
          A coach, not a course. It starts from where you actually are.
        </p>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-3">
          {PROMISES.map((p, i) => (
            <div key={p.t} className={`rise flex items-start gap-3 rounded-[var(--r-md)] ${p.tint} p-4`}
              style={{ animationDelay: `${90 + i * 80}ms` }}>
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${p.dot}`} />
              <div>
                <p className="text-[14px] font-bold text-ink">{p.t}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-5 pb-7 pt-1">
        <Button full onClick={onStart}>Let&apos;s start</Button>
        <p className="mt-3 text-center text-[10.5px] leading-relaxed text-faint">
          8 minutes of setup, once — then you never repeat it.
          <br />Not a diagnosis, not medical advice.
        </p>
      </div>
    </div>
  );
}
