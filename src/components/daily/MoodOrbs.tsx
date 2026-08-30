"use client";

/* Inside-Out-style mood orbs: soft blurred gradient spheres with hand-drawn
   faces. Tapping the selected orb again clears it — skipping is an answer. */

type Orb = {
  value: string;
  label: string;
  core: string;   // orb center
  glow: string;   // halo
  face: React.ReactNode;
};

const stroke = { stroke: "#2a2a2a", strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };

const ORBS: Orb[] = [
  {
    value: "Low", label: "Low", core: "#7fb5f0", glow: "#b7d7fb",
    face: (
      <svg viewBox="0 0 48 48">
        <path d="M15 20 q3 -3 6 0" {...stroke} />
        <path d="M27 20 q3 -3 6 0" {...stroke} />
        <path d="M17 32 q7 -5 14 0" {...stroke} />
      </svg>
    ),
  },
  {
    value: "Flat", label: "Flat", core: "#9c98d8", glow: "#cfccf1",
    face: (
      <svg viewBox="0 0 48 48">
        <path d="M14 20 h7" {...stroke} />
        <path d="M27 20 h7" {...stroke} />
        <path d="M17 31 h13" {...stroke} />
      </svg>
    ),
  },
  {
    value: "Fine", label: "Fine", core: "#7ecfa9", glow: "#c2ecd9",
    face: (
      <svg viewBox="0 0 48 48">
        <circle cx="17.5" cy="19" r="2.1" fill="#2a2a2a" />
        <circle cx="30.5" cy="19" r="2.1" fill="#2a2a2a" />
        <path d="M17 29 q7 5 14 0" {...stroke} />
      </svg>
    ),
  },
  {
    value: "Restless", label: "Restless", core: "#f3a869", glow: "#fbd9b6",
    face: (
      <svg viewBox="0 0 48 48">
        <circle cx="17" cy="18.5" r="2.6" fill="#2a2a2a" />
        <circle cx="31" cy="18.5" r="2.6" fill="#2a2a2a" />
        <path d="M16 31 q2.5 -2.5 5 0 q2.5 2.5 5 0 q2.5 -2.5 6 0" {...stroke} />
      </svg>
    ),
  },
  {
    value: "Good", label: "Good", core: "#f6ce6b", glow: "#fbe9b8",
    face: (
      <svg viewBox="0 0 48 48">
        <path d="M14.5 18 a3.2 3.2 0 0 1 6 0" fill="#2a2a2a" />
        <path d="M27.5 18 a3.2 3.2 0 0 1 6 0" fill="#2a2a2a" />
        <path d="M15.5 27 q8.5 8 17 0" {...stroke} />
      </svg>
    ),
  },
];

export default function MoodOrbs({
  value, onPick,
}: { value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex items-start justify-between px-0.5">
      {ORBS.map((o) => {
        const sel = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onPick(o.value)}
            className={`group flex w-[19%] flex-col items-center gap-1.5 transition ${sel ? "" : value ? "opacity-45" : ""}`}
            aria-pressed={sel}
          >
            <span
              className={`relative grid aspect-square w-full max-w-[52px] place-items-center rounded-full transition-transform duration-200 ${
                sel ? "scale-110" : "group-active:scale-95"
              }`}
              style={{
                background: `radial-gradient(circle at 38% 30%, #ffffffcc 0%, ${o.core} 42%, ${o.core} 100%)`,
                boxShadow: sel
                  ? `0 0 0 2.5px var(--c-surface), 0 0 0 4.5px ${o.core}, 0 6px 22px ${o.glow}, 0 0 26px ${o.glow}`
                  : `0 5px 18px ${o.glow}`,
              }}
            >
              <span className="h-[74%] w-[74%]">{o.face}</span>
            </span>
            <span className={`text-[10px] font-semibold ${sel ? "text-ink" : "text-faint"}`}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
