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

      {/* drifting petals */}
      {[8, 26, 48, 66, 84].map((left, i) => (
        <span key={left} className="drift pointer-events-none absolute -top-8"
          style={{ left: `${left}%`, animationDuration: `${9 + i * 2.6}s`, animationDelay: `${i * 1.7}s` }}>
          <OvyFlower size={12 + (i % 3) * 6} />
        </span>
      ))}

      {/* glowing flower centerpiece */}
      <div className="relative grid flex-1 place-items-center">
        {[168, 122].map((d, i) => (
          <span key={d} className="ripple pointer-events-none absolute rounded-full border-2 border-white/50"
            style={{ width: d, height: d, animationDelay: `${i * 1.4}s` }} />
        ))}
        <span className="pointer-events-none absolute h-[120px] w-[120px] rounded-full bg-white/25 blur-xl" />
        <span className="floaty relative drop-shadow-[0_10px_30px_rgba(226,85,155,0.5)]">
          <span className="spin-slow block">
            <OvyFlower size={92} />
          </span>
        </span>
      </div>

      {/* copy + CTA */}
      <div className="relative px-6 pb-8">
        <h1 style={{ animationDelay: "80ms" }} className="pop-spring font-display text-[30px] font-semibold leading-[1.1] text-white drop-shadow-sm">
          A coach,
          <br />
          not a course.
        </h1>
        <p style={{ animationDelay: "170ms" }} className="pop-spring mt-2 max-w-[260px] text-[13.5px] leading-relaxed text-white/85">
          PCOS advice is written for everyone. ovy starts from where <em>you</em> actually are — and remembers.
        </p>

        <div style={{ animationDelay: "260ms" }} className="pop-spring mt-4 flex gap-2">
          {PROOF.map(({ Icon, t }) => (
            <span key={t} className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10.5px] font-semibold text-white backdrop-blur-sm">
              <Icon size={11} />{t}
            </span>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{ animationDelay: "350ms" }} className="pop-spring card-soft mt-5 w-full rounded-full bg-white py-3.5 text-[15px] font-bold text-accent transition active:scale-[0.98]"
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
