import type { Profile } from "./types";

export type QuestionKind = "chips" | "text" | "longtext" | "chipsWithOther";

export type Question = {
  id: keyof Profile;
  group: "Your cycle" | "Your symptoms" | "Your life" | "What you've tried";
  ask: string;
  why: string;
  kind: QuestionKind;
  options?: string[];
  placeholder?: string;
  multi?: boolean;
};

// Ordered by how much the coach loses without it. Everything is skippable —
// what gets skipped is remembered and may be raised later in conversation.
export const QUESTIONS: Question[] = [
  {
    id: "name",
    group: "Your life",
    ask: "First — what should I call you?",
    why: "Because 'hey there' is how apps talk. Coaches use your name.",
    kind: "text",
    placeholder: "Your name or a nickname",
  },
  {
    id: "cycleLength",
    group: "Your cycle",
    ask: "Roughly how long are your cycles?",
    why: "Cycle length is one of the three things doctors look at. It also tells me whether to plan in weeks or work around a longer rhythm.",
    kind: "chipsWithOther",
    options: ["Under 21 days", "21–35 days", "35–45 days", "45–60 days", "Over 60 days", "I don't track it"],
  },
  {
    id: "cycleRegularity",
    group: "Your cycle",
    ask: "Are your cycles predictable?",
    why: "Irregular cycles are the first Rotterdam criterion. If yours are unpredictable, I won't plan your weeks as if they aren't.",
    kind: "chips",
    options: ["Fairly regular", "Varies by a week or so", "All over the place", "I've skipped months", "Not sure"],
  },
  {
    id: "lastPeriod",
    group: "Your cycle",
    ask: "When did your last period start?",
    why: "Tells me where you are right now, and flags anything that needs a doctor sooner rather than later.",
    kind: "chipsWithOther",
    options: ["Within 2 weeks", "2–4 weeks ago", "1–2 months ago", "2–3 months ago", "Over 3 months ago"],
  },
  {
    id: "symptoms",
    group: "Your symptoms",
    ask: "What are you actually dealing with?",
    why: "Pick everything that applies. I'll work on all of it quietly, but I'll aim at whichever one you tell me matters most.",
    kind: "chipsWithOther",
    multi: true,
    options: [
      "Hair fall / thinning", "Acne", "Facial or body hair", "Weight that won't shift",
      "Bloating", "Afternoon energy crash", "Sugar cravings", "Low mood or anxiety",
      "Poor sleep", "Painful periods", "Trouble conceiving", "Dark skin patches",
    ],
  },
  {
    id: "job",
    group: "Your life",
    ask: "What does your work look like?",
    why: "You told me nothing about your body happens in a vacuum. A high-pressure job changes what plan is realistic — and stress genuinely affects symptoms.",
    kind: "chipsWithOther",
    options: ["Desk job, predictable hours", "High-pressure, long hours", "Shift work", "Studying", "At home", "Physically active work"],
  },
  {
    id: "stress",
    group: "Your life",
    ask: "How stressed are you, honestly?",
    why: "I'd rather build a small plan you can keep than a good plan you'll abandon in week three.",
    kind: "chips",
    options: ["Manageable", "Constant background hum", "High most weeks", "I'm barely coping"],
  },
  {
    id: "sleep",
    group: "Your life",
    ask: "How much sleep do you actually get?",
    why: "Sleep moves within days, which makes it one of the first things I can prove is working.",
    kind: "chips",
    options: ["Under 5 hours", "5–6 hours", "6–7 hours", "7–8 hours", "Over 8 hours"],
  },
  {
    id: "activity",
    group: "Your life",
    ask: "How much are you moving right now?",
    why: "I need your real starting point, not your aspirational one. There's no wrong answer here.",
    kind: "chips",
    options: ["Basically nothing", "A walk here and there", "2–3 times a week", "Most days"],
  },
  {
    id: "tried",
    group: "What you've tried",
    ask: "What have you already tried that didn't stick?",
    why: "This is the most useful thing you can tell me. If I suggest something you've already quit, I've wasted your time.",
    kind: "chipsWithOther",
    multi: true,
    options: [
      "Keto or low carb", "Intermittent fasting", "Inositol", "Biotin or hair supplements",
      "Seed cycling", "Gym membership", "Cutting dairy", "Cutting gluten", "A diet plan from a nutritionist",
    ],
  },
  {
    id: "meds",
    group: "What you've tried",
    ask: "Anything prescribed to you right now?",
    why: "So I never suggest something that clashes. I won't comment on your prescriptions — that's your doctor's call.",
    kind: "chipsWithOther",
    multi: true,
    options: ["Metformin", "Birth control pill", "Spironolactone", "Letrozole or Clomid", "Thyroid medication", "Nothing"],
  },
];

export const GROUP_ORDER = ["Your cycle", "Your symptoms", "Your life", "What you've tried"] as const;

const WEIGHTS: Partial<Record<keyof Profile, number>> = {
  primaryConcern: 25, symptoms: 15, cycleLength: 10, cycleRegularity: 10,
  lastPeriod: 8, stress: 8, sleep: 7, job: 6, activity: 5, tried: 4, meds: 2, name: 0,
};

export function completeness(p: Profile): number {
  let score = 0;
  for (const [k, w] of Object.entries(WEIGHTS) as [keyof Profile, number][]) {
    const v = p[k];
    const filled = Array.isArray(v) ? v.length > 0 : Boolean(v);
    if (filled) score += w;
  }
  return Math.round(score);
}
