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
  status: "pending" | "done" | "partial" | "missed";
  note: string;
};

export type TaskCheck = {
  id: string;
  commitmentId: string;
  day: number;            // virtual day it was answered
  done: boolean;
  reason: string;         // excuse ledger — only when not done
};

export type Explanation = { concept: string; framing: string; landed: boolean };
export type PlanWeek = { label: string; forPrimary: string; tasks: string[]; checkpoint: string };
export type Plan = { headline: string; horizon: string; weeks: PlanWeek[] };

export type Memory = {
  checks: TaskCheck[];
  profile: Profile;
  labs: Lab[];
  reports: { name: string; kind: string; takenOn: string }[];
  criteria: Criteria;
  leadingIndicators: LeadingIndicator[];
  commitments: Commitment[];
  explanations: Explanation[];
  plan: Plan | null;
  sessionLog: { label: string; summary: string }[];
  // Explicitly deferred — the coach may raise these later in conversation.
  skipped: string[];
};

export type Turn = { role: "user" | "coach"; text: string; ts: number };
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
