import { chatJSON, MOCK } from "./llm";
import type { Memory, Session, Plan, RedFlag } from "./types";

export const SYSTEM = `You are a PCOS coach. Not a course, not a search engine, not a symptom checker. A coach for ONE person working on ONE thing.

## THE ONE THING
Every person has one symptom that actually drives them — hair fall, acne, weight, cycle chaos, fertility. That is their primary concern. You orient everything around it while managing the rest quietly in the background. Never hand out a generic PCOS checklist. If they told you it's hair fall, every plan item is justified as "this is for your hair."

## HOW YOU TALK
- Short turns. 3-6 sentences. ONE question at a time. You are texting, not writing a document.
- Warm but never flattering. If they are vague, press for specifics.
- Reference what you remember about them by name, constantly. That is your value.
- No emoji spam, no bullet-point lectures, no "As an AI".

## PHASES
"intake" — Interview them. Ask ONE question per turn, adaptive to the last answer. You need: cycle length and regularity, symptoms, diagnosis status, age, whether they have any reports, what they've already tried and why it failed, and their real lifestyle (job pressure, sleep, schedule). Deep intake is WELCOME — they are willing to spend 10 minutes once. But NEVER re-ask something you already know: check the memory digest first. When you have enough, ask the closing question: which ONE thing bothers them most, and why. Then set phase to "plan".

"plan" — Deliver a plan in the "plan" field. Every task must be checkable and tied to their primary concern. Calibrate to the hours and stress they actually reported. In "reply", give 2-3 sentences of rationale tied to what they told you. Then set phase to "session".

"session" — Run the coaching. Check commitments first. Make them EXPLAIN something back in their own words, then grade it honestly and record it. Set 1-3 new commitments. If life got in the way, CUT SCOPE — never repeat the plan louder.

## THE LAG GAP — your most important job
Their primary symptom will take months to move. Hair regrowth takes 6+ months. Cycles take 3-6. Motivation dies at week 3. So you track LEADING INDICATORS that move in days: afternoon energy crash, sleep quality, craving timing, mood stability, hair SHEDDING volume (which drops long before regrowth shows). Set baselines during intake. Then prove progress with them:
"Your hair isn't back and it won't be for a while — I told you that on day one. But you've gone from clumps to strands. That is the first thing that moves."

## FLARE MODE
If they report pain, a flare, or being mentally underwater: the plan collapses to ONE small thing. Missing a flare day breaks nothing. Never guilt them. Never mention streaks.

## WHAT YOU NEVER DO
- Never state a diagnosis. Never say "you have PCOS" or "you don't have PCOS".
- Never prescribe, dose, or suggest starting/stopping any medication or supplement.
- Never contradict their doctor.
- You MAY explain what a lab marker means and what range their lab used. Explaining is not diagnosing.
- You MAY show where they stand against the published Rotterdam criteria (2 of 3) with the gaps named explicitly — a checklist with holes in it, never a verdict.
- You MAY tell them which tests and which specialist to ask for.

Your honest line: "I can't tell you whether you have PCOS. I can get you to someone who can — in one appointment instead of five, with the right tests already asked for."

## OUTPUT
Return ONLY a JSON object, no prose, no code fences:
{
  "reply": "what you say to them",
  "phase": "intake" | "plan" | "session",
  "profileUpdate": null | { any subset of: name, age, diagnosed ("yes"|"no"|"unsure"), primaryConcern, primaryConcernWhy, cycleLength, cycleRegularity, symptoms[], job, stress, sleep, activity, tried[], meds[] },
  "leadingIndicatorUpdates": [ { "name": "", "baseline": "", "current": "", "trend": "improving"|"flat"|"worse"|"unknown", "note": "" } ],
  "criteriaUpdate": null | { "irregularCycles": {"state":"met"|"not_met"|"unknown","evidence":""}, "highAndrogen": {...}, "ovarianMorphology": {...}, "missingToConfirm": [] },
  "newCommitments": [ { "text": "", "due": "" } ],
  "commitmentUpdates": [ { "id": "", "status": "done"|"partial"|"missed"|"pending", "note": "" } ],
  "explanationNotes": [ { "concept": "", "framing": "", "landed": true|false } ],
  "plan": null | { "headline": "", "horizon": "", "weeks": [ { "label": "", "forPrimary": "", "tasks": [""], "checkpoint": "" } ] },
  "suggestedTests": [ "" ]
}
Use empty arrays and nulls where there is nothing to update. Only fill "plan" on the turn you deliver or revise it.`;

// Deterministic gate. Safety must not depend on the model behaving.
const RED_FLAGS: { re: RegExp; reason: string; action: string }[] = [
  { re: /\b(kill myself|suicidal|end my life|self.?harm|want to die)\b/i,
    reason: "Mental health emergency", action: "Stop coaching. Surface crisis lines and urge immediate human help." },
  { re: /\b(severe pain|unbearable pain|fainted|passed out|can'?t stand)\b/i,
    reason: "Severe pain / collapse", action: "Urgent in-person medical care." },
  { re: /\b(soaking|flooding|heavy bleeding|bleeding for (weeks|\d{2,} days))\b/i,
    reason: "Very heavy or prolonged bleeding", action: "Contact a doctor promptly." },
  { re: /\b(no period for (over |more than )?(9\d|1\d\d) days|no period in (4|5|6|\d\d) months)\b/i,
    reason: "Prolonged absence of periods", action: "Book a gynaecologist review." },
];

export function checkRedFlags(text: string): RedFlag {
  for (const f of RED_FLAGS) {
    if (f.re.test(text)) return { triggered: true, reason: f.reason, action: f.action };
  }
  return { triggered: false, reason: "", action: "" };
}

function digest(s: Session): string {
  const m = s.memory;
  const p = m.profile;
  const known = Object.entries({
    Name: p.name, Age: p.age, Diagnosed: p.diagnosed,
    "PRIMARY CONCERN": p.primaryConcern, "Why it matters": p.primaryConcernWhy,
    "Cycle length": p.cycleLength, "Cycle regularity": p.cycleRegularity,
    Symptoms: p.symptoms.join(", "), Job: p.job, Stress: p.stress,
    Sleep: p.sleep, Activity: p.activity,
    "Already tried": p.tried.join("; "), Medications: p.meds.join(", "),
  }).filter(([, v]) => v && v !== "unsure").map(([k, v]) => `${k}: ${v}`);

  return `WHAT YOU ALREADY KNOW (never re-ask any of this):
${known.join("\n") || "(nothing yet — this is the first turn)"}

LEADING INDICATORS:
${m.leadingIndicators.map((l) => `- ${l.name}: baseline ${l.baseline} -> now ${l.current} (${l.trend}) ${l.note}`).join("\n") || "(none set — set baselines during intake)"}

LABS ON FILE:
${m.labs.map((l) => `- ${l.marker}: ${l.value} [${l.flag}] ${l.plainMeaning}`).join("\n") || "(none)"}

ROTTERDAM CRITERIA SO FAR:
- Irregular/absent ovulation: ${m.criteria.irregularCycles.state} ${m.criteria.irregularCycles.evidence}
- Signs of high androgen: ${m.criteria.highAndrogen.state} ${m.criteria.highAndrogen.evidence}
- Ovarian morphology: ${m.criteria.ovarianMorphology.state} ${m.criteria.ovarianMorphology.evidence}
- Still missing: ${m.criteria.missingToConfirm.join(", ") || "unknown"}

COMMITMENTS:
${m.commitments.map((c) => `- [${c.id}] ${c.text} (due ${c.due}) — ${c.status}${c.note ? ` — ${c.note}` : ""}`).join("\n") || "(none)"}

EXPLANATIONS TRIED:
${m.explanations.map((e) => `- ${e.concept}: "${e.framing}" — ${e.landed ? "LANDED, reuse this framing" : "BOUNCED, do not reuse"}`).join("\n") || "(none)"}

PLAN: ${m.plan ? `${m.plan.headline} (${m.plan.horizon})` : "(not built yet)"}
PAST SESSIONS:
${m.sessionLog.map((l) => `- ${l.label}: ${l.summary}`).join("\n") || "(none)"}

Phase: ${s.phase}. Intake questions asked: ${s.intakeCount}.`;
}

type Raw = {
  reply: string;
  phase: "intake" | "plan" | "session";
  profileUpdate: Record<string, unknown> | null;
  leadingIndicatorUpdates: Memory["leadingIndicators"];
  criteriaUpdate: Memory["criteria"] | null;
  newCommitments: { text: string; due: string }[];
  commitmentUpdates: { id: string; status: string; note: string }[];
  explanationNotes: Memory["explanations"];
  plan: Plan | null;
  suggestedTests: string[];
};

export type TurnResult = {
  reply: string;
  memory: Memory;
  phase: Session["phase"];
  changed: string[];
  redFlag: RedFlag;
  suggestedTests: string[];
};

export async function runTurn(s: Session, userMessage: string): Promise<TurnResult> {
  if (MOCK) {
    const { mockTurn } = await import("./mockCoach");
    return mockTurn(s, userMessage);
  }
  const redFlag = checkRedFlags(userMessage);

  const history = s.transcript.slice(-14).map((t) => ({
    role: (t.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: t.text,
  }));

  const system = redFlag.triggered
    ? `${SYSTEM}\n\n## OVERRIDE — SAFETY GATE TRIPPED\nReason: ${redFlag.reason}. Required action: ${redFlag.action}\nDo not coach this turn. Do not give a plan or set commitments. Respond with warmth, name what you heard, and direct them to real human care now. Keep every array empty and plan null.`
    : SYSTEM;

  const out = await chatJSON<Raw>(system, [
    { role: "user", content: digest(s) },
    ...history,
    { role: "user", content: userMessage },
  ]);

  const m = s.memory;
  const changed: string[] = [];

  if (out.profileUpdate) {
    for (const [k, v] of Object.entries(out.profileUpdate)) {
      if (v === null || v === undefined || v === "") continue;
      if (Array.isArray(v) && v.length === 0) continue;
      const key = k as keyof Memory["profile"];
      if (key in m.profile && JSON.stringify(m.profile[key]) !== JSON.stringify(v)) {
        (m.profile as Record<string, unknown>)[key] = v;
        changed.push(`profile.${key}`);
      }
    }
  }

  for (const li of out.leadingIndicatorUpdates ?? []) {
    const i = m.leadingIndicators.findIndex((x) => x.name.toLowerCase() === li.name.toLowerCase());
    if (i >= 0) m.leadingIndicators[i] = { ...m.leadingIndicators[i], ...li };
    else m.leadingIndicators.push(li);
    changed.push(`indicator.${li.name}`);
  }

  if (out.criteriaUpdate) {
    m.criteria = { ...m.criteria, ...out.criteriaUpdate };
    changed.push("criteria");
  }

  for (const c of out.newCommitments ?? []) {
    m.commitments.push({
      id: `c${m.commitments.length + 1}`, text: c.text, due: c.due,
      status: "pending", note: "",
    });
    changed.push("commitments");
  }

  for (const u of out.commitmentUpdates ?? []) {
    const c = m.commitments.find((x) => x.id === u.id);
    if (c) {
      c.status = u.status as Memory["commitments"][number]["status"];
      c.note = u.note;
      changed.push("commitments");
    }
  }

  for (const e of out.explanationNotes ?? []) {
    m.explanations.push(e);
    changed.push("explanations");
  }

  if (out.plan) {
    m.plan = out.plan;
    changed.push("plan");
  }

  s.memory = m;
  s.phase = out.phase ?? s.phase;
  if (s.phase === "intake") s.intakeCount += 1;
  const ts = Date.now();
  s.transcript.push({ role: "user", text: userMessage, ts }, { role: "coach", text: out.reply, ts: ts + 1 });

  return {
    reply: out.reply, memory: m, phase: s.phase, changed, redFlag,
    suggestedTests: out.suggestedTests ?? [],
  };
}
