import type { MealLog, Session } from "./types";

/* Deterministic follow-back engine. The coach opens the conversation — she
   doesn't have to. Runs on app open and after every time-jump; independent of
   the model so the loop works in mock mode and can't flake on stage.

   Every rule emits a Signal instead of returning early, so a morning with two
   things worth saying produces ONE composed message (lead + "Also —"), the way
   a person would text — never two robotic pings, never a swallowed signal. */

export type Signal = {
  id: string;
  severity: number;         // 5 = say this first
  message: string;          // full lead paragraph
  brief: string;            // one-liner used when this rides along as the P.S.
  quick?: string[];         // one-tap replies offered under the bubble
  action?: "scopeCut";      // side-effect the UI must actually enact
};

export type FollowUp = {
  text: string;
  quick: string[];
  action?: "scopeCut";
};

export function composeFollowUp(s: Session): FollowUp | null {
  if (!s.memory.plan || s.day <= s.lastCoachPingDay) return null;
  const signals = collectSignals(s).sort((a, b) => b.severity - a.severity);
  if (signals.length === 0) return null;

  const [lead, second] = signals;
  let text = lead.message;
  if (second) text += `\n\nAlso — ${second.brief}`;
  return { text, quick: lead.quick ?? [], action: lead.action };
}

function collectSignals(s: Session): Signal[] {
  const m = s.memory;
  const out: Signal[] = [];
  const pending = m.commitments.filter((c) => c.status === "pending");
  const todayChecks = m.checks.filter((k) => k.day === s.day);
  const recent = m.checks.filter((k) => k.day >= s.day - 6);

  // Same excuse twice+ → cut scope, name the pattern — and actually enact it.
  const reasons = recent.filter((k) => !k.done && k.reason).map((k) => k.reason);
  const repeated = reasons.find((r, i) => reasons.indexOf(r) !== i);
  if (repeated && pending.length > 1) {
    const keep = pending[0];
    out.push({
      id: "scope-cut", severity: 5,
      message: `I've noticed something. Twice now the thing that got in the way was "${repeated.toLowerCase()}". That's not a willpower problem, that's a plan problem — I planned around a life you don't have. So I'm cutting scope: this week, only "${keep.text.toLowerCase()}". Everything else is paused, and that's my call, not your failure. Deal?`,
      brief: `the rest of the plan is paused until this lands — check Today, it's shorter now.`,
      quick: ["Deal", "Honestly, even that feels like a lot", "No — keep the full plan"],
      action: "scopeCut",
    });
  }

  // All reminded doses missed yesterday → gentle reminder, doctor-record framing.
  const meds = m.medications ?? [];
  if (meds.length > 0 && s.day > 1) {
    const due = meds.filter((x) => x.remind).flatMap((x) => x.timings.map((t) => ({ med: x, t })));
    const taken = (m.medTakes ?? []).filter((t) => t.day === s.day - 1);
    const missed = due.filter(({ med, t }) => !taken.some((k) => k.medId === med.id && k.timing === t));
    if (due.length > 0 && missed.length >= due.length) {
      const names = [...new Set(missed.map((d) => d.med.name))].join(" and ");
      out.push({
        id: "meds", severity: 4,
        message: `Small one, no lecture: yesterday's ${names} didn't get ticked. If you took ${missed.length > 1 ? "them" : "it"} and just didn't log, tell me and I'll fix the record — your doctor should see the real one. If you genuinely forgot, that's exactly what I'm here for.`,
        brief: `yesterday's ${names} never got ticked — tell me "took it" and I'll fix the record.`,
        quick: ["Took it, forgot to log", "I actually forgot", "I've stopped taking it"],
      });
    }
  }

  // Heavy flow + pain logged → check in like a person, offer flare mode.
  const heavy = (m.cycleLogs ?? []).find(
    (l) => l.flow === "heavy" && l.pain.length > 0 && Math.abs(new Date(l.date).getTime() - Date.now()) < 3 * 86400000,
  );
  if (heavy) {
    out.push({
      id: "flare", severity: 4,
      message: `I saw the heavy day with ${heavy.pain.join(" and ").toLowerCase()} in your log. Days like that, the plan shrinks to one thing — that's by design, not a concession. How are you feeling today, honestly?`,
      brief: `I saw the heavy day in your cycle log — be gentle with yourself today.`,
      quick: ["Still rough", "Better today", "Can we shrink today's plan?"],
    });
  }

  // Yesterday had misses → ask about it, warmly, specifically.
  const missedY = m.checks.filter((k) => k.day === s.day - 1 && !k.done);
  if (missedY.length > 0) {
    const c = m.commitments.find((x) => x.id === missedY[0].commitmentId);
    const what = c ? c.text.toLowerCase() : "one of your tasks";
    const why = missedY[0].reason;
    out.push({
      id: "missed", severity: 3,
      message: why
        ? `Morning. Yesterday ${what} didn't happen — you said it was "${why.toLowerCase()}". Fair. Is today looking any different, or should we plan around it?`
        : `Morning. I saw yesterday's ${what} didn't happen — no explanation needed unless you want to give one. Today's a clean slate. What's realistic?`,
      brief: `about yesterday's ${what} — clean slate, but tell me if the plan's fighting your week.`,
      quick: ["Today's different, I'm on it", "Same problem today", "Plan around it"],
    });
  }

  // Everything done yesterday → notice it, tie it to the one thing.
  const doneY = m.checks.filter((k) => k.day === s.day - 1 && k.done);
  if (doneY.length > 0 && missedY.length === 0) {
    const concern = m.profile.primaryConcern?.toLowerCase() || "your goal";
    out.push({
      id: "streakless-praise", severity: 2,
      message: `Yesterday: everything, done. I want you to notice that — because ${concern} won't show it yet, but this is exactly the week that decides whether it does in month three. Same again today. Anything in the way?`,
      brief: `yesterday was a clean sweep — noted in your record.`,
      quick: ["Nothing in the way", "Today's busier"],
    });
  }

  // Meals say the same thing twice → name the pattern, not the person.
  const recentMeals = m.meals.filter((x) => x.day >= s.day - 6);
  const crashy = recentMeals.filter(
    (x) => x.shape.includes("Mostly carbs") && ["Sleepy after", "Hungry again fast", "Craved sugar"].includes(x.after),
  );
  if (crashy.length >= 2) {
    const slots = [...new Set(crashy.map((x) => x.slot.toLowerCase()))].join(" and ");
    out.push({
      id: "meal-pattern", severity: 3,
      message: `Something showed up in your food log, and I want to say it carefully: ${crashy.length} times this week a carb-led ${slots} was followed by "${crashy[0].after.toLowerCase()}". That's not you being greedy — that's the insulin thing we talked about, showing up on a plate. Try one change: protein first at ${crashy[0].slot.toLowerCase()}, everything else identical. If the two hours after feel different, we've found your lever.`,
      brief: `your food log is showing the carb-then-crash pattern again — protein first, one meal, that's the whole experiment.`,
      quick: ["I'll try protein first", "What counts as protein first?"],
    });
  }

  // Energy logged low three days running → say it before she has to.
  const lowDays = m.checkIns.filter((c) => c.day >= s.day - 3 && ["Running on empty", "Patchy"].includes(c.energy));
  if (lowDays.length >= 3) {
    out.push({
      id: "energy-slide", severity: 4,
      message: `Three check-ins in a row where energy came back "${lowDays[lowDays.length - 1].energy.toLowerCase()}". I'm not going to pretend that's nothing. Before we touch the plan — is this the 3-4pm dip we've been tracking, or is it all day? The answer changes what I'd do next.`,
      brief: `three low-energy days in a row on your check-ins — I want to talk about it when you have a minute.`,
      quick: ["It's the 3-4pm dip", "It's all day", "It's my sleep"],
    });
  }

  // Nothing checked in for 2+ days → gentle re-open, never guilt.
  const lastCheck = Math.max(0, ...m.checks.map((k) => k.day));
  if (m.checks.length === 0 || s.day - lastCheck >= 2) {
    out.push({
      id: "quiet", severity: 2,
      message: pending.length
        ? `Hey — no logs for a couple of days. Not chasing you, just checking in: still on for "${pending[0].text.toLowerCase()}", or has life changed shape? Either answer is fine, I just need the real one.`
        : `Hey, it's been quiet a couple of days. How are you doing — honestly?`,
      brief: `it's been quiet a couple of days — no pressure, just wave back.`,
      quick: ["Still on it", "Life changed shape", "Just tired"],
    });
  }

  // Default daily nudge if there are tasks today and nothing else to say.
  if (out.length === 0 && todayChecks.length === 0 && pending.length > 0) {
    out.push({
      id: "nudge", severity: 1,
      message: `Quick one for today: ${pending.map((c) => c.text.toLowerCase()).join(", ")}. Tick them off on the Today tab as you go — one tap, no essays.`,
      brief: ``,
      quick: ["On it"],
    });
  }

  return out;
}

/* Enact the scope cut the message promised: keep the first pending commitment,
   pause the rest. Mutates the passed session copy. */
export function applyScopeCut(s: Session) {
  const pending = s.memory.commitments.filter((c) => c.status === "pending");
  for (const c of pending.slice(1)) {
    c.status = "paused";
    c.note = "Paused by your coach — one thing at a time.";
  }
}

/* Back-compat single-string API. */
export function followUp(s: Session): string | null {
  return composeFollowUp(s)?.text ?? null;
}

/* Grouped by day, newest first — the shape both the memory view and any future
   trends card want. */
export function mealsByDay(meals: MealLog[]): { day: number; meals: MealLog[] }[] {
  const days = [...new Set(meals.map((m) => m.day))].sort((a, b) => b - a);
  return days.map((day) => ({ day, meals: meals.filter((m) => m.day === day) }));
}

/* Tasks due "today" = every pending commitment's tasks, flattened for the checklist. */
export function todaysTasks(s: Session) {
  return s.memory.commitments
    .filter((c) => c.status === "pending" || c.status === "partial")
    .map((c) => ({
      commitment: c,
      check: s.memory.checks.find((k) => k.commitmentId === c.id && k.day === s.day) ?? null,
    }));
}
