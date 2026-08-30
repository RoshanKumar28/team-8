"use client";

import { Target, BookHeart, Sparkles } from "lucide-react";
import { OvyFlower } from "../ui/Logo";

const PROOF = [
  { Icon: Target, t: "Your one thing" },
  { Icon: BookHeart, t: "It remembers" },
  { Icon: Sparkles, t: "Proof in days" },
];

export default function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(168deg, #fff1f7 0%, #ffd9e9 28%, #ff9ec9 58%, #f06ba8 82%, #e2559b 100%)",
      }}
    >
      {/* lockup */}
      <div className="flex items-center gap-2 px-6 pt-12">
        <OvyFlower size={26} />
        <span className="font-display text-[19px] font-semibold lowercase tracking-tight text-ink">ovy</span>
      </div>

      {/* glowing flower centerpiece */}
      <div className="relative grid flex-1 place-items-center">
        {[168, 122, 82].map((d, i) => (
          <span
            key={d}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: d, height: d,
              background: `rgba(255,255,255,${0.12 + i * 0.1})`,
              boxShadow: "0 0 60px rgba(255,255,255,0.35)",
              animation: `pulseSoft ${2.6 + i * 0.5}s ease-in-out infinite`,
            }}
          />
        ))}
        <span className="relative drop-shadow-[0_10px_30px_rgba(226,85,155,0.5)]">
          <OvyFlower size={92} />
        </span>
      </div>

      {/* copy + CTA */}
      <div className="relative px-6 pb-8">
        <h1 className="font-display text-[30px] font-semibold leading-[1.1] text-white drop-shadow-sm">
          A coach,
          <br />
          not a course.
        </h1>
        <p className="mt-2 max-w-[260px] text-[13.5px] leading-relaxed text-white/85">
          PCOS advice is written for everyone. ovy starts from where <em>you</em> actually are — and remembers.
        </p>

        <div className="mt-4 flex gap-2">
          {PROOF.map(({ Icon, t }) => (
            <span key={t} className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-semibold text-white backdrop-blur-sm">
              <Icon size={11} />{t}
            </span>
          ))}
        </div>

        <button
          onClick={onStart}
          className="card-soft mt-5 w-full rounded-full bg-white py-3.5 text-[15px] font-bold text-accent transition active:scale-[0.98]"
        >
          Get started
        </button>
        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/70">
          Takes ~8 minutes, once. Not a diagnosis, not medical advice.
        </p>
      </div>
    </div>
  );
}
