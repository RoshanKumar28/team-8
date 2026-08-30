"use client";

import { useState } from "react";
import type { Session } from "@/lib/types";

type NodeState = "done" | "current" | "next" | "locked";

/* The whole plan as a winding path — one node per week, like a level map.
   Done weeks carry what actually happened (from the session log), the
   current week pulses, future weeks stay visible so the road is real. */
export default function JourneyView({ session }: { session: Session }) {
  const plan = session.memory.plan;
  const [open, setOpen] = useState<number | null>(null);

  if (!plan) {
    return (
      <div className="grid min-h-0 flex-1 place-items-center bg-raised/60 px-8 text-center">
        <p className="text-[13px] leading-relaxed text-muted">
          Your journey appears here once the coach builds your plan — talk to her first.
        </p>
      </div>
    );
  }

  const week = Math.max(1, Math.ceil(session.day / 7));
  const log = session.memory.sessionLog;

  const nodes = plan.weeks.map((w, i) => {
    // "Week 4 (now)" / "Week 2–3" — take the first number as the week anchor.
    const anchor = parseInt(w.label.match(/\d+/)?.[0] ?? `${i + 1}`, 10);
    const state: NodeState =
      anchor < week ? "done" : anchor === week ? "current" : anchor === week + 1 ? "next" : "locked";
    const history = log.find((l) => parseInt(l.label.match(/\d+/)?.[0] ?? "-1", 10) === anchor);
    return { w, state, anchor, history };
  });

  const dot = {
    done: "bg-good text-brandink border-good",
    current: "bg-brand text-brandink border-brand",
    next: "bg-surface text-brand border-brand",
    locked: "bg-surface text-faint border-line",
  };

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-raised/60 pb-8">
      <div className="px-5 pb-1 pt-4">
        <h2 className="font-display text-[18px] font-semibold text-ink">{plan.headline}</h2>
        <p className="mt-0.5 text-[11.5px] text-muted">{plan.horizon} · day {session.day}</p>
      </div>

      <div className="relative mx-auto mt-2 max-w-[300px]">
        {/* the road */}
        <div className="absolute bottom-6 left-1/2 top-2 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-line" />

        {nodes.map(({ w, state, history }, i) => {
          const side = i % 2 === 0 ? "mr-auto pl-4" : "ml-auto pr-4";
          const isOpen = open === i || (open === null && state === "current");
          return (
            <div key={w.label} className="relative py-3">
              {/* node on the road */}
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={`absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 font-display text-[13px] font-bold shadow-sm transition ${dot[state]} ${state === "current" ? "pulse-soft" : ""}`}
                aria-label={w.label}
              >
                {state === "done" ? "✓" : i + 1}
              </button>

              {/* card beside the node */}
              <div className={`w-[46%] ${side}`}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full text-left">
                  <p className={`text-[12px] font-bold ${state === "locked" ? "text-faint" : "text-ink"}`}>{w.label}</p>
                  <p className={`text-[11px] leading-snug ${state === "locked" ? "text-faint" : "text-muted"}`}>
                    {state === "done" && history ? history.summary : w.forPrimary}
                  </p>
                </button>
              </div>

              {/* expanded detail under the row */}
              {isOpen && state !== "locked" && (
                <div className="rise relative z-0 mx-4 mt-3 rounded-[var(--r-md)] border border-line bg-surface p-3">
                  <ul className="ml-4 list-disc space-y-1 text-[12px] text-muted">
                    {w.tasks.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                  <p className="mt-2 border-t border-line pt-2 text-[11px] text-faint">
                    <span className="font-semibold text-good">Checkpoint:</span> {w.checkpoint}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* the summit */}
        <div className="relative flex flex-col items-center pb-2 pt-4">
          <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-accent bg-surface text-[18px]">🏁</div>
          <p className="mt-1.5 max-w-[220px] text-center text-[11.5px] font-semibold text-ink">
            {session.memory.profile.primaryConcern
              ? `${session.memory.profile.primaryConcern} — visibly better`
              : "The goal"}
          </p>
          <p className="text-[10.5px] text-faint">this is the part that takes months — the road above is how we get there</p>
        </div>
      </div>
    </div>
  );
}
