import type { MealLog, Session } from "./types";

/* Deterministic follow-back rules. The coach opens the conversation — she
   doesn't have to. Runs on app open and after every time-jump; independent
   of the model so the loop works in mock mode and can't flake on stage. */
export function followUp(s: Session): string | null {
  if (!s.memory.plan || s.day <= s.lastCoachPingDay) return null;

  const m = s.memory;
  const pending = m.commitments.filter((c) => c.status === "pending");
  const todayChecks = m.checks.filter((k) => k.day === s.day);
  const recent = m.checks.filter((k) => k.day >= s.day - 6);

  // 1) Same excuse twice+ → cut scope, name the pattern.
  const reasons = recent.filter((k) => !k.done && k.reason).map((k) => k.reason);
  const repeated = reasons.find((r, i) => reasons.indexOf(r) !== i);
  if (repeated) {
    return `I've noticed something. Twice now the thing that got in the way was "${repeated.toLowerCase()}". That's not a willpower problem, that's a plan problem — I planned around a life you don't have. So I'm cutting scope: this week, only the morning protein. Everything else is paused, and that's my call, not your failure. Deal?`;
  }

  // 2) Yesterday had misses → ask about it, warmly, specifically.
  const missedYesterday = m.checks.filter((k) => k.day === s.day - 1 && !k.done);
  if (missedYesterday.length > 0) {
    const c = m.commitments.find((x) => x.id === missedYesterday[0].commitmentId);
    const what = c ? c.text.toLowerCase() : "one of your tasks";
    const why = missedYesterday[0].reason;
    return why
      ? `Morning. Yesterday ${what} didn't happen — you said it was "${why.toLowerCase()}". Fair. Is today looking any different, or should we plan around it?`
      : `Morning. I saw yesterday's ${what} didn't happen — no explanation needed unless you want to give one. Today's a clean slate. What's realistic?`;
  }

  // 3) Everything done yesterday → notice it, tie it to the one thing.
  const doneYesterday = m.checks.filter((k) => k.day === s.day - 1 && k.done);
  if (doneYesterday.length > 0 && missedYesterday.length === 0) {
    const concern = m.profile.primaryConcern?.toLowerCase() || "your goal";
    return `Yesterday: everything, done. I want you to notice that — because ${concern} won't show it yet, but this is exactly the week that decides whether it does in month three. Same again today. Anything in the way?`;
  }

  // 3b) Meals say the same thing twice → name the pattern, not the person.
  //     This is the one insight the food log exists to produce.
  const recentMeals = m.meals.filter((x) => x.day >= s.day - 6);
  const crashy = recentMeals.filter(
    (x) => x.shape.includes("Mostly carbs") && ["Sleepy after", "Hungry again fast", "Craved sugar"].includes(x.after),
  );
  if (crashy.length >= 2) {
    const slots = [...new Set(crashy.map((x) => x.slot.toLowerCase()))].join(" and ");
    return `Something showed up in your food log, and I want to say it carefully: ${crashy.length} times this week a carb-led ${slots} was followed by "${crashy[0].after.toLowerCase()}". That's not you being greedy — that's the insulin thing we talked about, showing up on a plate. Try one change: put the protein in first at ${crashy[0].slot.toLowerCase()}, keep everything else identical. If the two hours after feel different, we've found your lever.`;
  }

  // 3c) Energy logged low three days running → say it before she has to.
  const lowDays = m.checkIns
    .filter((c) => c.day >= s.day - 3 && ["Running on empty", "Patchy"].includes(c.energy));
  if (lowDays.length >= 3) {
    return `Three days of check-ins in a row where energy came back "${lowDays[lowDays.length - 1].energy.toLowerCase()}". I'm not going to pretend that's nothing. Before we touch the plan — is this the 3-4pm dip we've been tracking, or is it all day? The answer changes what I'd do next.`;
  }

  // 4) Nothing checked in for 2+ days → gentle re-open, never guilt.
  const lastCheck = Math.max(0, ...m.checks.map((k) => k.day));
  if (m.checks.length === 0 || s.day - lastCheck >= 2) {
    return pending.length
      ? `Hey — no logs for a couple of days. Not chasing you, just checking in: still on for "${pending[0].text.toLowerCase()}", or has life changed shape? Either answer is fine, I just need the real one.`
      : `Hey, it's been quiet a couple of days. How are you doing — honestly?`;
  }

  // 5) Default daily nudge if there are tasks today.
  if (todayChecks.length === 0 && pending.length > 0) {
    return `Quick one for today: ${pending.map((c) => c.text.toLowerCase()).join(", ")}. Tick them off on the Today tab as you go — one tap, no essays.`;
  }

  return null;
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
