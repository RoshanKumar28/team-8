# Luteal — a PCOS coach, not a course

**Hackathon build · Team 8**

## The problem

Everyone with PCOS is already trying — diet changes, supplements, Instagram protocols. The failure isn't motivation or information, it's **follow-through across a months-long feedback gap**: cycles take 3–6 months to respond, hair regrowth takes 6+, and motivation dies at week 3. Courses and trackers teach ten thousand people identically. A coach trains one — starts where *she* is, builds the plan, checks what stuck, and course-corrects when life gets in the way.

## The product

A PCOS coach for **one person and one goal**:

- **The one thing.** Intake ends with "which symptom actually bothers you most?" Every plan item is justified against *that* — never a generic PCOS checklist.
- **It remembers.** What she promised last week, why she missed it, which explanation finally landed. She never repeats herself.
- **It proves progress early.** Tracks leading indicators that move in days (energy crash, shedding volume, cravings) so she can see it working long before the mirror does.
- **It follows up first.** The coach opens the conversation — missed yesterday, gone quiet, same excuse twice → scope cut, never guilt.
- **Checklist, never a verdict.** Shows where she stands against the Rotterdam criteria and exactly what's missing — so one doctor visit does the work of five. It never diagnoses, never prescribes.

## Core feature set (product brief)

The 10 features the product is built around — each with its one-line promise, tied to the two brand pillars (**Knowledge + Support**). Status: ✅ built · 🟡 partial · ❌ planned.

| # | Feature | Promise | Status |
|---|---------|---------|--------|
| 1 | **Rant diary with voice** | *"Say it out loud. We'll listen."* One-tap voice → private transcript, auto-tagged to cycle phase. No prompts, no forced positivity. | ❌ |
| 2 | **Symptom-specific info feed** | *"Information that actually applies to you."* Content filtered by her logged symptom cluster — sourced, dated, plain language. | ❌ (interim: coach pushes one relevant explainer in chat) |
| 3 | **Name personalization everywhere** | *"This isn't a generic app. It's yours."* Captured once at onboarding, used naturally in every greeting, check-in, and report. | ❌ (name not yet asked at onboarding) |
| 4 | **Proactive check-ins** | *"We check on you. Not the other way around."* App reaches out after quiet days or a rough entry — warm, never guilt. | ✅ (7 deterministic follow-up rules, coach speaks first) |
| 5 | **Symptom-to-cause pattern mapping** | *"Find out what's actually triggering your symptoms."* Correlates her symptoms against her food/sleep/stress. Observations, never diagnoses — with pattern strength shown ("seen 4× in 2 months"). | 🟡 (meal→energy and low-energy-streak patterns live; full correlation engine planned) |
| 7 | **Cycle + symptom dual tracker** | *"Built for irregular cycles — because that's the reality of PCOS."* Two independent logs, layered on one dashboard; never assumes 28 days. | 🟡 (symptom/check-in log live; period tap-log live on a uterus-shaped dot grid with honest cycle-gap stats; layered dashboard planned) |
| 9 | **Medication & supplement log + reminders** | *"Remembering to take it is half the battle. We've got that half."* Dose, schedule, gentle reminders, adherence history. | 🟡 (meds captured at onboarding; dedicated rows + reminders planned) |
| 12 | **Mood-cycle correlation view** | *"Your mood isn't random. Let's see the pattern."* Mood plotted against cycle day — heat-map style, with a plain note when a pattern emerges. Turns "am I overreacting?" into "it's hormonal, not a character flaw." | ❌ |
| 15 | **Recipe & meal suggestions by symptom** | *"Meals that work with your body, not against it."* Recipes tagged by phenotype, each with a one-line sourced "why this helps." | ❌ (meal *logging* is live; suggestions planned) |
| 19 | **Flare-up predictor** | *"Know it's coming before it hits."* After 3+ logged cycles: "flare-ups have happened here in 3 of your last 4 cycles" — probability framing, paired with an action. | ❌ (needs #5 + #7 data) |

**Build order rationale:** 4 → 5 → 7 are the data spine (built/partial). 1, 3, 12 are the highest emotion-per-effort next. 2, 15, 19 sit on top of the spine and come last.

## Feature status

✅ done · 🟡 partial · ❌ planned

### Onboarding
- ✅ Welcome / positioning screen
- ✅ Two front doors: "I have reports" / "I don't" — nothing gated on a document
- ✅ Photograph a paper report (camera capture — clinics rarely give digital copies)
- ✅ Upload PDF report
- 🟡 Report extraction → labs (flow works; vision model call not yet wired, uses fixture)
- ✅ Report review — every value in plain words, with the lab's own ranges
- ✅ Pre-fill from report ("that's N fewer questions I have to ask")
- ✅ Works with reports taken for unrelated reasons
- ✅ 10 skippable questions (cycle, symptoms, lifestyle, what she's tried, meds)
- ✅ "Why does this matter?" on every question
- ✅ Skip tracking — coach may raise later, never re-asks what it knows
- ✅ One-thing picker + "what makes this the one?"
- ✅ "Here's what I know about you" summary + completeness score
- ❌ Ask her name (for personalization)
- ❌ Voice input during onboarding

### Coach
- ✅ Chat with coach (scripted mock; live model wired behind env flag)
- ✅ Personalized opener built from her onboarding data
- ✅ Plan generation tied to the one thing
- ✅ Course correction — scope cut on a miss, never "repeat the plan louder"
- ✅ Explain-it-back checks ("teach it back to me, then I grade it honestly")
- ✅ Explanation ledger — which framing landed vs. bounced, reuse winners
- ✅ Deterministic red-flag safety gate (runs before the model)
- ✅ Never-diagnose / never-prescribe rules
- ❌ Live model replies on (flip `MOCK_AI` + verify `/api/health`)
- ❌ Escalation screen ("see a doctor now" UI)
- ❌ Streaming replies
- ❌ Rant diary — voice-to-text for pre-period spiraling; coach quotes it back later
- ❌ Coach pushes one relevant explainer in chat (instead of a content feed)
- ❌ Appointment prep / rehearsal ("3 things to ask, in order — go")
- ❌ Suggested-tests list rendered in UI

### Daily loop
- ✅ Today checklist — ✓ Did it / ✕ Couldn't, one tap
- ✅ Excuse ledger — "what got in the way?" chips; misses become data, not guilt
- ✅ No streaks by design — "a missed day breaks nothing"
- ✅ Proactive follow-ups, coach speaks first (7 deterministic rules: repeated excuse → scope cut · missed yesterday · clean day noticed · carb-crash pattern in meals · 3 low-energy days · gone quiet · daily nudge)
- ✅ ⏭ next-day time jump (demo device)
- ✅ Early-signs strip on Today
- ✅ Journey map — candy-crush-style day-level road: 7 nodes/week from her real logs (done/partial/missed/today), week banners with tasks + checkpoints, "the road keeps going" ending
- 🟡 Med/supplement adherence (captured; no dedicated rows/reminders yet)
- ✅ Daily 30-second check-in — mood/sleep/energy chips, one tap each, every row skippable
- ✅ Meal log — plate *shape* + the two hours after, never calories (the insulin story in her words)
- ✅ Coach names the food pattern first ("carb-led lunch → sleepy after, twice this week")
- ✅ Coach flags three low-energy days in a row before she has to raise it
- ✅ Period logging — tap-to-log days on a uterus-shaped dot grid, one per month; cycle-gap stats with no fake predictions
- ❌ Flare-mode button — bad day collapses the plan to one thing
- ❌ Real notifications/reminders

### Memory & insight
- ✅ Memory view — everything she's told it, one screen
- ✅ Leading indicators — baseline → now → trend
- ✅ Commitments with status + reasons
- ✅ Rotterdam checklist-not-verdict + what's still missing to confirm
- ✅ Labs in plain words
- ✅ Life context (job pressure, stress, sleep) as first-class data
- ✅ Check-in history + meal history on the Memory screen
- ✅ Session log
- ✅ Persistence + old-session migration (localStorage)
- 🟡 Trends (cycle-gap stats live on Cycle; symptom charts planned)
- ❌ Mood-cycle correlation view ("I'm not crazy, it's hormonal")
- ❌ Flare-up predictor card ("your mood tends to dip around day 26 — that's Thursday")
- ❌ Symptom-to-trigger pattern card (framed "early pattern, not proof")
- ❌ Doctor report / share screen
- ❌ Edit profile outside chat

### Demo & infra
- ✅ Seeded week-4 persona (Maya) — full memory, one tap
- ✅ Restart / Week-4 demo buttons
- ✅ Brand system — pastel (blush/rose/lavender/mint/butter on white), Fraunces + Manrope, fully tokenized in `globals.css`
- ✅ Phone frame on desktop, bare app on real phones
- ✅ `/api/health` — model JSON-reliability go/no-go
- ❌ Home/dashboard ("Good afternoon, Maya")
- ❌ Vercel deploy (camera needs HTTPS)
- ❌ Name personalization pass across all copy
- ❌ Demo script

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · GLM 5.3 Flash via Vercel AI Gateway (providers: zai/novita/gmicloud) · localStorage memory (stateless API) · deterministic safety + follow-up rules independent of the model

## Run it

```bash
npm install
npm run dev
```

`.env.local`:

```
LLM_API_KEY=<gateway key>
LLM_BASE_URL=https://ai-gateway.vercel.sh/v1
LLM_MODEL=zai/glm-5.3-flash
MOCK_AI=1   # remove to go live
```

> Not a medical device. Never diagnoses, never prescribes. Always confirm with a doctor.
