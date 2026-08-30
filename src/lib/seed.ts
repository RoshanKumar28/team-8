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
      concerns: ["Hair fall", "3-4pm energy crash", "Acne along jawline"],
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
    // Four days of check-ins and meals: enough for the Memory tab to have
    // something to show, and enough for the carb-crash rule to fire on open.
    periodDates: ["2026-06-03", "2026-06-04", "2026-06-05", "2026-06-06", "2026-07-15", "2026-07-16", "2026-07-17"],
    cycleLogs: [
      { date: "2026-07-15", flow: "light", pain: ["Cramps"], body: ["Bloating"], ts: 1 },
      { date: "2026-07-16", flow: "heavy", pain: ["Cramps", "Backache"], body: ["Bloating", "Fatigue"], ts: 2 },
      { date: "2026-07-17", flow: "medium", pain: [], body: ["Fatigue"], ts: 3 },
    ],
    medications: [
      { id: "m1", name: "Metformin", dose: "500mg", kind: "medication", timings: ["morning", "evening"], remind: true },
      { id: "m2", name: "Inositol", dose: "2g", kind: "supplement", timings: ["morning"], remind: true },
      { id: "m3", name: "Vitamin D", dose: "60k IU weekly", kind: "supplement", timings: ["afternoon"], remind: false },
    ],
    medTakes: [
      { day: 22, medId: "m1", timing: "morning", ts: 1 }, { day: 22, medId: "m1", timing: "evening", ts: 2 },
      { day: 22, medId: "m2", timing: "morning", ts: 3 },
      { day: 23, medId: "m1", timing: "morning", ts: 4 },
      { day: 23, medId: "m2", timing: "morning", ts: 5 },
    ],
    checkIns: [
      { day: 21, mood: "Fine", sleep: "Short but okay", energy: "Patchy", note: "", ts: 21 },
      { day: 22, mood: "Good", sleep: "Slept well", energy: "Steady", note: "Walked after lunch, felt it by evening.", ts: 22 },
      { day: 23, mood: "Flat", sleep: "Broken", energy: "Running on empty", note: "Wednesday. Calls till 9.", ts: 23 },
      { day: 24, mood: "Low", sleep: "Barely", energy: "Patchy", note: "", ts: 24 },
    ],
    meals: [
      { id: "m1", day: 22, slot: "Breakfast", what: "Two eggs, chai", shape: ["Protein first"], after: "Steady after", ts: 22 },
      { id: "m2", day: 22, slot: "Lunch", what: "Dal, rice, salad", shape: ["Veg on the plate", "Mostly carbs"], after: "Didn't notice", ts: 22 },
      { id: "m3", day: 23, slot: "Breakfast", what: "Toast on the way out", shape: ["Mostly carbs"], after: "Hungry again fast", ts: 23 },
      { id: "m4", day: 23, slot: "Lunch", what: "Sandwich at the desk", shape: ["Mostly carbs", "Ate out"], after: "Sleepy after", ts: 23 },
      { id: "m5", day: 23, slot: "Snack", what: "Biscuits", shape: ["Sweet"], after: "Craved sugar", ts: 23 },
      { id: "m6", day: 24, slot: "Breakfast", what: "Eggs again", shape: ["Protein first"], after: "Steady after", ts: 24 },
    ],
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
