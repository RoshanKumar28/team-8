import type { Session } from "./types";
import type { TurnResult } from "./coach";

/* Scripted coaching turns so the whole UI is walkable with zero API calls.
   Each step also mutates memory the way the real model would, so the
   "What she remembers" tab visibly updates during a click-through. */
export async function mockTurn(s: Session, userMessage: string): Promise<TurnResult> {
  await new Promise((r) => setTimeout(r, 900));

  const m = s.memory;
  const n = s.transcript.filter((t) => t.role === "user").length; // turns so far
  const concern = m.profile.primaryConcern || "your main symptom";
  let reply = "";
  const changed: string[] = [];

  if (n === 0) {
    reply = `Okay, that's useful — and honestly, a very common story. Before I build anything: on the days ${concern.toLowerCase()} feels worst, what do the 24 hours around it look like? Sleep, food, stress — whatever you remember.`;
    m.leadingIndicators.push({
      name: "Afternoon energy", baseline: "Crashes most days (from what you described)",
      current: "Crashes most days", trend: "unknown", note: "Baseline set — this moves in days, so it's how we'll see early progress.",
    });
    changed.push("indicator.Afternoon energy");
  } else if (n === 1) {
    reply = `That pattern you just described — poor sleep, then cravings, then the crash — those three feed each other. Here's the honest part: ${concern.toLowerCase()} itself will take months to visibly change. But the crash and the cravings move in *days*. So that's where we start, and that's how you'll know it's working long before the mirror does.\n\nHere's your plan. Small on purpose — I'd rather you keep it than admire it.`;
    m.plan = {
      headline: `Steady the engine first — ${concern.toLowerCase()} follows`,
      horizon: "Week 1 of 12",
      weeks: [
        { label: "Week 1", forPrimary: `Everything here is for ${concern.toLowerCase()}, even when it doesn't look like it`, tasks: ["Protein within an hour of waking, 5 of 7 days", "10-minute walk after your biggest meal, 3 days", "Note your energy at 4pm — one word is enough"], checkpoint: "Fewer afternoon crashes than this week" },
        { label: "Week 2–3", forPrimary: "Hold the gains, protect sleep", tasks: ["Keep week 1", "Screens off 30 min earlier, 3 nights"], checkpoint: "One full week of the morning protein habit" },
      ],
    };
    m.commitments.push(
      { id: `c${m.commitments.length + 1}`, text: "Protein within an hour of waking, 5 of 7 days", due: "This week", status: "pending", note: "" },
      { id: `c${m.commitments.length + 2}`, text: "10-min walk after biggest meal, 3 days", due: "This week", status: "pending", note: "" },
    );
    s.phase = "session";
    changed.push("plan", "commitments");
  } else if (/skip|miss|couldn'?t|didn'?t|cramp|flare|bad week|too much/i.test(userMessage)) {
    reply = `Thank you for telling me instead of disappearing — that's the thing most people don't do. We're not repeating the same plan louder. New version: ONE thing this week. Just the morning protein. Everything else is paused, and missing a day breaks nothing.\n\nWhat happened, by the way — was it the schedule, or the energy?`;
    const c = m.commitments.find((x) => x.status === "pending");
    if (c) { c.status = "partial"; c.note = userMessage.slice(0, 120); changed.push("commitments"); }
    m.explanations.push({ concept: "Course correction", framing: "Cut scope on a miss, never guilt", landed: true });
    changed.push("explanations");
  } else {
    reply = `Noted — and I've written that down so you never have to tell me twice. Quick check before we go on: explain back to me, in your own words, why we're starting with food and walks when the thing you care about is ${concern.toLowerCase()}. If it doesn't make sense yet, that's on me, not you.`;
    m.explanations.push({ concept: "Why insulin first", framing: `It's the lever behind ${concern.toLowerCase()}, and it moves in days`, landed: true });
    changed.push("explanations");
  }

  const ts = Date.now();
  s.transcript.push({ role: "user", text: userMessage, ts }, { role: "coach", text: reply, ts: ts + 1 });

  return {
    reply, memory: m, phase: s.phase, changed,
    redFlag: { triggered: false, reason: "", action: "" },
    suggestedTests: [],
  };
}
