import type { Session } from "./types";

// Act 3 of the demo: a relationship four weeks deep. Nothing here is generated
// live — it exists so judges can see what the coach looks like once it remembers.
export const seededSession = (): Session => ({
  id: "seed-maya",
  onboarded: true,
  day: 24,
  lastCoachPingDay: 24,
  phase: "session",
  intakeCount: 7,
  transcript: [
    { role: "coach", text: "Morning Maya. Before anything else — you promised me four 20-minute walks after lunch last week. How many happened?", ts: 1 },
  ],
  memory: {
    profile: {
      name: "Maya", age: "27", diagnosed: "yes",
      primaryConcern: "Hair fall",
      primaryConcernWhy: "Can see her scalp in photos now. Stopped tying her hair up. Says it's the thing she thinks about every morning.",
      cycleLength: "44 days average, last 6 cycles",
      cycleRegularity: "Irregular — range 38 to 61 days",
      lastPeriod: "18 days ago",
      symptoms: ["Hair fall", "Acne along jawline", "Bloating", "3-4pm energy crash", "Sugar cravings after dinner"],
      job: "Client servicing at an agency — 3 to 4 evening calls a week",
      stress: "High. Says Wednesdays are consistently the worst day.",
      sleep: "5h 40m average, phone in bed",
      activity: "Was doing nothing. Now walking after lunch.",
      tried: ["Keto for 3 weeks — quit, too restrictive with work lunches", "Biotin gummies for 4 months — no visible change", "Seed cycling from Instagram — stopped after 2 weeks"],
      meds: ["Metformin 500mg (prescribed by her gynaecologist)"],
    },
    checks: [
      { id: "k1", commitmentId: "c1", day: 22, done: true, reason: "" },
      { id: "k2", commitmentId: "c1", day: 23, done: false, reason: "Work ran late" },
      { id: "k3", commitmentId: "c2", day: 23, done: true, reason: "" },
    ],
    reports: [{ name: "Bloodwork — Dr Rao clinic", kind: "bloodwork", takenOn: "3 weeks ago" }],
    skipped: [],
    labs: [
      { marker: "Fasting insulin", value: "18 µIU/mL", refRange: "2–12 µIU/mL", flag: "high", plainMeaning: "Her lab's upper normal is 12. This is the marker most tied to her 4pm crash and sugar cravings." },
      { marker: "Total testosterone", value: "62 ng/dL", refRange: "8–48 ng/dL", flag: "high", plainMeaning: "Above her lab's female reference range. Associated with hair thinning and jawline acne." },
      { marker: "TSH", value: "2.1 mIU/L", refRange: "0.4–4.0 mIU/L", flag: "normal", plainMeaning: "Thyroid looks normal — worth knowing, because thyroid issues cause hair fall too." },
    ],
    criteria: {
      irregularCycles: { state: "met", evidence: "6 logged cycles averaging 44 days" },
      highAndrogen: { state: "met", evidence: "Raised testosterone on bloodwork + hair fall and jawline acne" },
      ovarianMorphology: { state: "unknown", evidence: "Ultrasound not done" },
      missingToConfirm: [],
    },
    leadingIndicators: [
      { name: "Hair shedding volume", baseline: "Clumps in the shower drain, daily", current: "Strands, most days", trend: "improving", note: "Regrowth is 6+ months out. Shedding is what moves first — this is the signal that matters right now." },
      { name: "3-4pm energy crash", baseline: "6 days a week", current: "2 days a week", trend: "improving", note: "Tracks with the post-lunch walk. Strongest signal that the insulin side is responding." },
      { name: "Sleep duration", baseline: "5h 20m", current: "5h 40m", trend: "flat", note: "Barely moved. Phone is still in the bedroom." },
      { name: "Post-dinner sugar craving", baseline: "Nightly", current: "3-4 nights", trend: "improving", note: "" },
    ],
    commitments: [
      { id: "c1", text: "20-minute walk after lunch, 4 days", due: "Last week", status: "partial", note: "Did 1. Work ran late Wednesday — third Wednesday in a row." },
      { id: "c2", text: "Protein at breakfast, 5 of 7 days", due: "Last week", status: "done", note: "All 7. Said eggs were easier than she expected." },
      { id: "c3", text: "Phone out of the bedroom, 3 nights", due: "Last week", status: "missed", note: "Zero nights. Didn't offer a reason — worth asking gently, not pushing." },
    ],
    explanations: [
      { concept: "Insulin resistance", framing: "A metabolic condition affecting glucose uptake", landed: false },
      { concept: "Insulin resistance", framing: "It's why you're starving at 4pm — your cells aren't getting the fuel even though it's in your blood", landed: true },
      { concept: "Why hair takes so long", framing: "Hair has a growth cycle like a crop — you stop the loss months before you see the regrowth", landed: true },
      { concept: "Androgens", framing: "Elevated serum androgen levels", landed: false },
    ],
    plan: {
      headline: "Slow the shedding first — insulin is the lever",
      horizon: "Week 4 of 12",
      weeks: [
        { label: "Week 4 (now)", forPrimary: "Shedding drops when insulin steadies — that's the whole play", tasks: ["Walk after lunch — 3 days, NOT Wednesday", "Protein at breakfast, 6 of 7", "Photograph the shower drain each Sunday"], checkpoint: "Shedding still strands, not clumps" },
        { label: "Week 5-6", forPrimary: "Hold the insulin gains, start protecting sleep", tasks: ["Keep walks", "Phone charges outside the bedroom — start with 2 nights"], checkpoint: "Sleep above 6h on at least 3 nights" },
        { label: "Week 8", forPrimary: "First honest look at regrowth", tasks: ["Scalp photo, same light, same parting"], checkpoint: "Compare against the week-1 photo" },
      ],
    },
    sessionLog: [
      { label: "Week 1", summary: "Intake. Named hair fall as the one thing. Baselines set. Explained the 6-month regrowth lag up front so she wouldn't quit at week 3." },
      { label: "Week 2", summary: "Insulin explanation bounced on the first framing, landed on the 4pm-hunger one. Started the post-lunch walk." },
      { label: "Week 3", summary: "Missed Wednesday again. Cut the walk target from 5 days to 4. First drop in shedding volume reported." },
    ],
  },
});
