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

  if (n === 0 && !m.profile.primaryConcern) {
    // Her first message names the focus — capture it, don't make her pick from a form.
    const fromSymptoms = m.profile.symptoms.find((x) =>
      userMessage.toLowerCase().includes(x.toLowerCase().split(" ")[0].replace(/[^a-z]/g, ""))
    );
    const KNOWN = ["hair fall","hair loss","hair","acne","skin","weight","cycle","period","energy","fatigue","mood","conceive","fertility","cravings","bloating","facial hair"];
    const fromKnown = KNOWN.find((k) => userMessage.toLowerCase().includes(k));
    const guess = fromSymptoms ?? fromKnown ?? "";
    if (!guess) {
      // Don't guess a junk word — ask once more, with options in her own list.
      const opts = m.profile.symptoms.length ? m.profile.symptoms.slice(0, 4).join(", ") : "hair, skin, weight, cycles, energy";
      const ts0 = Date.now();
      s.transcript.push({ role: "user", text: userMessage, ts: ts0 }, { role: "coach", text: `Got it. Say it in a word or two for me — ${opts.toLowerCase()}? Whichever one you'd fix first if you could only fix one.`, ts: ts0 + 1 });
      return { reply: "", memory: m, phase: s.phase, changed: [], redFlag: { triggered: false, reason: "", action: "" }, suggestedTests: [] };
    }
    m.profile.primaryConcern = guess;
    m.profile.concerns = [m.profile.primaryConcern];
    m.profile.primaryConcernWhy = userMessage.slice(0, 160);
    changed.push("profile.primaryConcern");
    reply = `Okay. ${m.profile.primaryConcern[0].toUpperCase() + m.profile.primaryConcern.slice(1).toLowerCase()} it is — that's our lead, and everything I plan will be justified against it. The rest stays on the board, I'm not dropping anything. Now: how long has this been going on, and what does a bad day with it actually look like?`;
  } else if (false) {
    reply = `Okay, that's useful — and honestly, a very common story. Before I build anything: on the days ${concern.toLowerCase()} feels worst, what do the 24 hours around it look like? Sleep, food, stress — whatever you remember.`;
    m.leadingIndicators.push({
      name: "Afternoon energy", baseline: "Crashes most days (from what you described)",
      current: "Crashes most days", trend: "unknown", note: "Baseline set — this moves in days, so it's how we'll see early progress.",
    });
    changed.push("indicator.Afternoon energy");
  } else if (!m.plan && m.profile.primaryConcern) {
    reply = `That pattern you just described — poor sleep, then cravings, then the crash — those three feed each other. Here's the honest part: ${concern.toLowerCase()} itself will take months to visibly change. But the crash and the cravings move in *days*. So that's where we start, and that's how you'll know it's working long before the mirror does.\n\nHere's your plan — small on purpose, I'd rather you keep it than admire it. The whole road is on your Journey tab; today's piece is on Today.`;
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
  } else if (/^deal$/i.test(userMessage.trim())) {
    reply = `Good. One thing, done well, beats five things half-done — that's not a compromise, it's the strategy. I'll bring the rest back when this one feels boring. That's how we'll know you're ready.`;
    m.explanations.push({ concept: "Scope cut", framing: "One thing done well beats five half-done", landed: true });
    changed.push("explanations");
  } else if (/took (it|them).*(forgot|log)|forgot to log/i.test(userMessage)) {
    reply = `Fixed — I've marked yesterday's doses as taken. For what it's worth: the taking is the part that matters, the logging just keeps your doctor's picture honest. If ticking it feels like a chore, tell me and we'll make it lighter.`;
    const yesterday = s.day - 1;
    for (const med of m.medications ?? []) {
      for (const t of med.timings) {
        if (!(m.medTakes ?? []).some((k) => k.day === yesterday && k.medId === med.id && k.timing === t)) {
          m.medTakes.push({ day: yesterday, medId: med.id, timing: t, ts: Date.now() });
        }
      }
    }
    changed.push("medTakes");
  } else if (/i('| a)?ctually forgot|^i forgot/i.test(userMessage)) {
    reply = `Thank you for the honest answer — most people say "took it". Let's make forgetting harder instead of trying harder: put the strip next to your toothbrush tonight. Same trigger, every day. I'll check in tomorrow.`;
    m.explanations.push({ concept: "Habit stacking", framing: "Attach the dose to brushing teeth, not to memory", landed: true });
    changed.push("explanations");
  } else if (/stopped taking/i.test(userMessage)) {
    reply = `Okay — that's important, and I'm glad you told me instead of quietly skipping. I won't lecture you. But this is a conversation for your doctor, not me: side effects, cost, whatever the reason is, they can adjust it. I've noted it so it's on your next appointment list. Want me to add anything else to that list?`;
    changed.push("profile");
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
