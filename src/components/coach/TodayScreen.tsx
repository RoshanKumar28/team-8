"use client";

import { useState } from "react";
import { todaysTasks } from "@/lib/followup";
import type { Session } from "@/lib/types";

const REASONS = ["Schedule blew up", "No energy", "Flare / cramps", "Forgot", "Didn't feel like it"];

export default function TodayScreen({
  session, onCheck, onJumpDay,
}: {
  session: Session;
  onCheck: (commitmentId: string, done: boolean, reason: string) => void;
  onJumpDay: () => void;
}) {
  const [asking, setAsking] = useState<string | null>(null); // commitmentId awaiting a reason
  const tasks = todaysTasks(session);
  const doneCount = tasks.filter((t) => t.check?.done).length;
  const concern = session.memory.profile.primaryConcern;

  return (
    <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg">
      <div className="px-4 pb-2 pt-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[19px] font-semibold text-ink">Day {session.day}</h2>
          <button onClick={onJumpDay}
            className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10.5px] font-semibold text-muted">
            ⏭ next day
          </button>
        </div>
        {concern && (
          <p className="mt-0.5 text-[12px] text-muted">
            Everything below is for <span className="font-semibold text-brand">{concern.toLowerCase()}</span> — even when it doesn&apos;t look like it.
          </p>
        )}
      </div>

      <div className="space-y-2.5 px-4 pb-6">
        {tasks.length === 0 && (
          <div className="rounded-[var(--r-md)] border border-line bg-surface p-4 text-center">
            <p className="text-[13px] text-muted">No plan yet — talk to your coach first and it lands here.</p>
          </div>
        )}

        {tasks.map(({ commitment: c, check }) => (
          <div key={c.id} className={`card-soft rise rounded-[var(--r-md)] bg-surface p-3.5 ${check && !check.done ? "opacity-80" : ""}`}>
            <p className={`text-[13.5px] leading-snug ${check?.done ? "text-faint line-through" : "text-ink"}`}>
              {c.text}
            </p>

            {check ? (
              <p className={`mt-1.5 text-[11.5px] font-semibold ${check.done ? "text-good" : "text-warn"}`}>
                {check.done ? "Done — logged." : `Skipped — "${check.reason}". No guilt, it's data.`}
              </p>
            ) : asking === c.id ? (
              <div className="mt-2.5">
                <p className="mb-1.5 text-[11.5px] font-medium text-muted">What got in the way? One tap — this is how I learn your life.</p>
                <div className="flex flex-wrap gap-1.5">
                  {REASONS.map((r) => (
                    <button key={r}
                      onClick={() => { onCheck(c.id, false, r); setAsking(null); }}
                      className="rounded-full border border-line bg-bg px-2.5 py-1 text-[11.5px] text-muted transition hover:border-brand hover:text-ink">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-2.5 flex gap-2">
                <button onClick={() => onCheck(c.id, true, "")}
                  className="flex-1 rounded-full bg-good py-2 text-[12.5px] font-bold text-brandink">
                  ✓ Did it
                </button>
                <button onClick={() => setAsking(c.id)}
                  className="flex-1 rounded-full border border-line bg-surface py-2 text-[12.5px] font-semibold text-muted">
                  ✕ Couldn&apos;t
                </button>
              </div>
            )}
          </div>
        ))}

        {tasks.length > 0 && (
          <p className="pt-1 text-center text-[11px] text-faint">
            {doneCount}/{tasks.length} today · a missed day breaks nothing
          </p>
        )}

        {session.memory.leadingIndicators.length > 0 && (
          <div className="mt-2 rounded-[var(--r-md)] bg-accentsoft p-3.5">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">Early signs</p>
            {session.memory.leadingIndicators.slice(0, 3).map((l) => (
              <div key={l.name} className="flex items-baseline justify-between py-0.5 text-[12px]">
                <span className="text-ink">{l.name}</span>
                <span className={`font-bold ${l.trend === "improving" ? "text-good" : l.trend === "worse" ? "text-bad" : "text-faint"}`}>
                  {l.trend === "improving" ? "▲ improving" : l.trend === "worse" ? "▼ watch" : "— steady"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
