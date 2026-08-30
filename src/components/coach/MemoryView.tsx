"use client";

import {
  Target, Sparkles, ClipboardCheck, Lightbulb, ListChecks, FlaskConical,
  HeartPulse, UtensilsCrossed, User, CalendarHeart, Pill, type LucideIcon,
} from "lucide-react";
import { mealsByDay } from "@/lib/followup";
import type { Memory } from "@/lib/types";

const trendColor = { improving: "text-good", flat: "text-faint", worse: "text-bad", unknown: "text-faint" };
const trendMark = { improving: "▲", flat: "—", worse: "▼", unknown: "·" };
const statusStyle: Record<string, string> = {
  done: "bg-good/15 text-good",
  partial: "bg-warn/15 text-warn",
  missed: "bg-bad/10 text-bad",
  pending: "bg-brandsoft text-brand",
  paused: "bg-raised text-faint",
};
const critLabel = { met: "Met", not_met: "Not met", unknown: "Unknown" };

let sectionIndex = 0;
function Section({ title, hint, icon: Icon, children }: { title: string; hint?: string; icon?: LucideIcon; children: React.ReactNode }) {
  const delay = (sectionIndex++ % 9) * 60;
  return (
    <section className="pop-spring border-b border-line px-4 py-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-display text-[13px] font-semibold text-ink">
          {Icon && <Icon size={14} className="text-brand" />}
          {title}
        </h2>
        {hint && <span className="text-[10px] text-faint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ t }: { t: string }) => <p className="text-[12px] italic text-faint">{t}</p>;

export default function MemoryView({ memory }: { memory: Memory }) {
  const p = memory.profile;

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-surface">
      <Section icon={Target} title="Your priorities" hint="in your order">
        {p.primaryConcern ? (
          <>
            <p className="font-display text-[19px] font-semibold text-brand">{p.primaryConcern}</p>
            {p.concerns.length > 1 && (
              <p className="mt-1 text-[12px] text-muted">
                then {p.concerns.slice(1).map((c) => c.toLowerCase()).join(" · ")}
              </p>
            )}
            {p.primaryConcernWhy && (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">&ldquo;{p.primaryConcernWhy}&rdquo;</p>
            )}
          </>
        ) : (
          <Empty t="Not chosen yet." />
        )}
      </Section>

      <Section icon={Sparkles} title="Early signs it's working" hint="these move in days, not months">
        {memory.leadingIndicators.length ? (
          <ul className="space-y-2.5">
            {memory.leadingIndicators.map((l) => (
              <li key={l.name} className="text-[12.5px]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-ink">{l.name}</span>
                  <span className={`shrink-0 text-[11.5px] font-bold ${trendColor[l.trend]}`}>
                    {trendMark[l.trend]} {l.trend}
                  </span>
                </div>
                <p className="text-muted">
                  <span className="opacity-60 line-through">{l.baseline}</span>
                  {" → "}
                  <span className="font-medium text-ink">{l.current}</span>
                </p>
                {l.note && <p className="mt-0.5 text-[11.5px] italic text-faint">{l.note}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <Empty t="Baselines get set as you talk with your coach." />
        )}
      </Section>

      <Section icon={HeartPulse} title="Your daily check-ins" hint="30 seconds a day, most days">
        {(memory.checkIns ?? []).length ? (
          <ul className="space-y-2">
            {[...(memory.checkIns ?? [])].sort((a, b) => b.day - a.day).slice(0, 7).map((c) => (
              <li key={c.day} className="text-[12.5px]">
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 font-semibold text-ink">Day {c.day}</span>
                  <span className="text-muted">
                    {[c.mood, c.sleep, c.energy].filter(Boolean).join(" · ") || "skipped"}
                  </span>
                </div>
                {c.note && <p className="mt-0.5 text-[11.5px] italic text-faint">&ldquo;{c.note}&rdquo;</p>}
              </li>
            ))}
          </ul>
        ) : (
          <Empty t="Mood, sleep and energy — the three that move in days, not months." />
        )}
      </Section>

      <Section icon={UtensilsCrossed} title="What you've been eating" hint="shape of the plate, never calories">
        {(memory.meals ?? []).length ? (
          <ul className="space-y-2.5">
            {mealsByDay(memory.meals ?? []).slice(0, 4).map(({ day, meals }) => (
              <li key={day}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Day {day}</p>
                <ul className="mt-0.5 space-y-1">
                  {meals.map((m) => (
                    <li key={m.id} className="text-[12.5px]">
                      <span className="font-semibold text-ink">{m.slot}</span>
                      {m.what && <span className="text-ink"> — {m.what}</span>}
                      {m.shape.length > 0 && (
                        <span className="text-muted"> · {m.shape.join(", ").toLowerCase()}</span>
                      )}
                      {m.after && (
                        <span className={`font-medium ${
                          ["Sleepy after", "Hungry again fast", "Craved sugar", "Bloated"].includes(m.after)
                            ? "text-warn" : "text-good"
                        }`}> → {m.after.toLowerCase()}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <Empty t="What went on the plate, and what the two hours after felt like." />
        )}
      </Section>

      <Section icon={ClipboardCheck} title="What you promised">
        {memory.commitments.length ? (
          <ul className="space-y-2">
            {memory.commitments.map((c) => (
              <li key={c.id} className="text-[12.5px]">
                <div className="flex items-start gap-2">
                  <span className={`mt-px shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[c.status]}`}>
                    {c.status}
                  </span>
                  <span className="text-ink">{c.text}</span>
                </div>
                {c.note && <p className="ml-1 mt-0.5 text-[11.5px] italic text-muted">↳ {c.note}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <Empty t="Commitments land here at the end of each session." />
        )}
      </Section>

      <Section icon={Lightbulb} title="Explanations that landed">
        {memory.explanations.length ? (
          <ul className="space-y-1.5">
            {memory.explanations.map((e, i) => (
              <li key={i} className="text-[12.5px]">
                <span className={e.landed ? "text-good" : "text-bad"}>{e.landed ? "✓" : "✕"}</span>{" "}
                <span className="font-semibold text-ink">{e.concept}:</span>{" "}
                <span className={e.landed ? "text-muted" : "text-faint line-through"}>&ldquo;{e.framing}&rdquo;</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty t="Tracks which way of explaining things works for you." />
        )}
      </Section>

      <Section icon={ListChecks} title="Where you stand" hint="a checklist, never a verdict">
        <ul className="space-y-1.5 text-[12.5px]">
          {([
            ["Irregular / absent ovulation", memory.criteria.irregularCycles],
            ["Signs of high androgen", memory.criteria.highAndrogen],
            ["Ovarian morphology", memory.criteria.ovarianMorphology],
          ] as const).map(([label, c]) => (
            <li key={label}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-ink">{label}</span>
                <span className={`shrink-0 text-[11.5px] font-bold ${
                  c.state === "met" ? "text-good" : c.state === "not_met" ? "text-faint" : "text-warn"
                }`}>{critLabel[c.state]}</span>
              </div>
              {c.evidence && <p className="text-[11.5px] text-faint">{c.evidence}</p>}
            </li>
          ))}
        </ul>
        <p className="mt-2.5 rounded-[var(--r-sm)] bg-brandsoft px-3 py-2 text-[10.5px] leading-relaxed text-brand">
          Doctors use 2 of these 3 to diagnose. This app never will — it shows what&apos;s known and what&apos;s missing, so one appointment does the work of five.
        </p>
      </Section>

      <Section icon={FlaskConical} title="Your reports, in plain words">
        {memory.labs.length ? (
          <ul className="space-y-2">
            {memory.labs.map((l) => (
              <li key={l.marker} className="text-[12.5px]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-ink">{l.marker}</span>
                  <span className={`shrink-0 text-[11.5px] font-bold ${
                    l.flag === "high" ? "text-bad" : l.flag === "low" ? "text-warn" : "text-good"
                  }`}>{l.value}</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-muted">{l.plainMeaning}</p>
              </li>
            ))}
          </ul>
        ) : (
          <Empty t="Add any report — even one taken for something else." />
        )}
      </Section>

      {memory.medications.length > 0 && (
        <Section icon={Pill} title="Meds & supplements" hint="what your doctor will ask about">
          <ul className="space-y-1.5 text-[12.5px]">
            {memory.medications.map((m) => {
              const due = memory.medTakes.filter((t) => t.medId === m.id).length;
              return (
                <li key={m.id} className="flex items-baseline justify-between gap-2">
                  <span className="text-ink">
                    <span className="font-semibold">{m.name}</span> {m.dose}
                    <span className="text-faint"> · {m.timings.join(", ")}</span>
                  </span>
                  <span className="shrink-0 text-[11.5px] font-bold text-good">{due} doses logged</span>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section icon={User} title="Your life" hint="context, not just symptoms">
        <dl className="space-y-1 text-[12.5px]">
          {([["Age", p.age], ["Cycle", [p.cycleLength, p.cycleRegularity].filter(Boolean).join(" · ")],
             ["Last period", p.lastPeriod], ["Work", p.job], ["Stress", p.stress], ["Sleep", p.sleep],
             ["Movement", p.activity], ["Medications", p.meds.join(", ")],
             ["Already tried", p.tried.join(" · ")]] as const)
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="inline font-semibold text-ink">{k}: </dt>
                <dd className="inline text-muted">{v}</dd>
              </div>
            ))}
        </dl>
      </Section>

      {memory.plan && (
        <Section icon={ClipboardCheck} title="The plan">
          <p className="font-display text-[14px] font-semibold text-brand">{memory.plan.headline}</p>
          <p className="mb-2 text-[10.5px] text-faint">{memory.plan.horizon}</p>
          <ul className="space-y-2">
            {memory.plan.weeks.map((w) => (
              <li key={w.label} className="rounded-[var(--r-md)] bg-raised p-3 text-[12.5px]">
                <p className="font-semibold text-ink">{w.label}</p>
                <p className="mb-1 italic text-brand">{w.forPrimary}</p>
                <ul className="ml-4 list-disc space-y-0.5 text-muted">
                  {w.tasks.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <p className="mt-1.5 text-[11px] text-faint">Checkpoint: {w.checkpoint}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {memory.sessionLog.length > 0 && (
        <Section icon={CalendarHeart} title="Past sessions">
          <ul className="space-y-1.5 text-[12.5px]">
            {memory.sessionLog.map((l) => (
              <li key={l.label}>
                <span className="font-semibold text-ink">{l.label}: </span>
                <span className="text-muted">{l.summary}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
