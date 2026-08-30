export type Diagnosed = "yes" | "no" | "unsure";
export type CriterionState = "met" | "not_met" | "unknown";
export type Flag = "high" | "low" | "normal" | "unknown";

export type Lab = {
  marker: string;
  value: string;
  refRange: string;
  flag: Flag;
  plainMeaning: string;
};

export type ExtractedReport = {
  fileKey?: string;
  kind: "bloodwork" | "ultrasound" | "mixed" | "unreadable";
  sourceName: string;
  takenOn: string;
  labs: Lab[];
  findings: string[];
  // Fields the report lets us pre-fill so she is never asked for them again.
  prefill: Partial<Profile>;
  criteriaSignals: Partial<Criteria>;
  couldNotRead: string[];
};

export type Profile = {
  name: string;
  age: string;
  diagnosed: Diagnosed;
  concerns: string[];        // priority order — first is the main focus
  primaryConcern: string;    // = concerns[0]
  primaryConcernWhy: string;
  cycleLength: string;
  cycleRegularity: string;
  lastPeriod: string;
  symptoms: string[];
  job: string;
  stress: string;
  sleep: string;
  activity: string;
  tried: string[];
  meds: string[];
};

export type Criteria = {
  irregularCycles: { state: CriterionState; evidence: string };
  highAndrogen: { state: CriterionState; evidence: string };
  ovarianMorphology: { state: CriterionState; evidence: string };
  missingToConfirm: string[];
};

export type LeadingIndicator = {
  name: string;
  baseline: string;
  current: string;
  trend: "improving" | "flat" | "worse" | "unknown";
  note: string;
};

export type Commitment = {
  id: string;
  text: string;
  due: string;
  status: "pending" | "done" | "partial" | "missed" | "paused";
  note: string;
};

export type TaskCheck = {
  id: string;
  commitmentId: string;
  day: number;            // virtual day it was answered
  done: boolean;
  reason: string;         // excuse ledger — only when not done
};

/* The 30-second check-in. Three taps, no typing required — it has to survive a
   bad day, so nothing here is mandatory and there is no streak to break. */
export type CheckIn = {
  day: number;
  mood: string;
  sleep: string;
  energy: string;
  note: string;           // optional one-liner, never required
  ts: number;
};

export type MealSlot = "Breakfast" | "Lunch" | "Dinner" | "Snack";

/* Meals are logged for shape, not calories. What went on the plate and what
   the next two hours felt like — that pairing is the insulin story, and it is
   the only part of food a coach can actually act on. */
export type MealLog = {
  id: string;
  day: number;
  slot: MealSlot;
  what: string;           // free text, optional
  shape: string[];        // plate-shape chips
  after: string;          // how the next couple of hours went
  ts: number;
};

/* Clue/Flo-style day log — flow plus whatever her body is doing that day.
   Everything optional; a flow tap alone is a complete log. */
export type Flow = "spotting" | "light" | "medium" | "heavy";

export type CycleDayLog = {
  date: string;            // ISO yyyy-mm-dd
  flow: Flow | null;       // null = logged the day but no bleeding
  pain: string[];
  body: string[];
  ts: number;
};

export type MedKind = "medication" | "supplement";
export type MedTiming = "morning" | "afternoon" | "evening";

export type Medication = {
  id: string;
  name: string;
  dose: string;            // "500mg", "2 tsp" — her words
  kind: MedKind;
  timings: MedTiming[];
  remind: boolean;
};

/* One row per med per timing per day — adherence history the coach can read. */
export type MedTake = {
  day: number;
  medId: string;
  timing: MedTiming;
  ts: number;
};

export type Explanation = { concept: string; framing: string; landed: boolean };
export type PlanWeek = { label: string; forPrimary: string; tasks: string[]; checkpoint: string };
export type Plan = { headline: string; horizon: string; weeks: PlanWeek[] };

export type Memory = {
  checks: TaskCheck[];
  checkIns: CheckIn[];
  meals: MealLog[];
  periodDates: string[];   // ISO yyyy-mm-dd, tap-logged on the cycle grid
  cycleLogs: CycleDayLog[];
  medications: Medication[];
  medTakes: MedTake[];
  profile: Profile;
  labs: Lab[];
  reports: { name: string; kind: string; takenOn: string; fileKey?: string }[];
  criteria: Criteria;
  leadingIndicators: LeadingIndicator[];
  commitments: Commitment[];
  explanations: Explanation[];
  plan: Plan | null;
  sessionLog: { label: string; summary: string }[];
  // Explicitly deferred — the coach may raise these later in conversation.
  skipped: string[];
};

export type Turn = { role: "user" | "coach"; text: string; ts: number; quick?: string[] };
export type Phase = "intake" | "plan" | "session";

export type Session = {
  id: string;
  onboarded: boolean;
  phase: Phase;
  intakeCount: number;
  day: number;            // virtual day for the demo time-jump
  lastCoachPingDay: number;
  memory: Memory;
  transcript: Turn[];
};

export const emptyProfile = (): Profile => ({
  name: "", age: "", diagnosed: "unsure", concerns: [], primaryConcern: "", primaryConcernWhy: "",
  cycleLength: "", cycleRegularity: "", lastPeriod: "", symptoms: [],
  job: "", stress: "", sleep: "", activity: "", tried: [], meds: [],
});

export const emptyCriteria = (): Criteria => ({
  irregularCycles: { state: "unknown", evidence: "" },
  highAndrogen: { state: "unknown", evidence: "" },
  ovarianMorphology: { state: "unknown", evidence: "" },
  missingToConfirm: [],
});

export const emptyMemory = (): Memory => ({
  checks: [],
  checkIns: [],
  meals: [],
  periodDates: [],
  cycleLogs: [],
  medications: [],
  medTakes: [],
  profile: emptyProfile(),
  labs: [],
  reports: [],
  criteria: emptyCriteria(),
  leadingIndicators: [],
  commitments: [],
  explanations: [],
  plan: null,
  sessionLog: [],
  skipped: [],
});

export const newSession = (): Session => ({
  id: Math.random().toString(36).slice(2, 10),
  onboarded: false,
  phase: "intake",
  intakeCount: 0,
  day: 1,
  lastCoachPingDay: 0,
  memory: emptyMemory(),
  transcript: [],
});

export type RedFlag = { triggered: boolean; reason: string; action: string };
