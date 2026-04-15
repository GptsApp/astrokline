# Kline Dashboard Product PRD

Status: Draft
Date: 2026-04-12
Scope: Dashboard Kline result page, Ask Chart continuation flow, monetization path, retention loop

## 1. Goal

Turn the current Kline dashboard from a strong one-time reading page into a product that:

- creates a fast first aha moment
- converts that aha into a follow-up question
- turns follow-up questions into paid habit loops
- makes Pro value obvious before the user has to infer it

## 2. Product Thesis

The page already does one important thing well: it gives the answer first.

The current weakness is what happens next.

- After the first insight, users do not get a strong enough guided next action.
- The strongest premium promise, Ask Chart, is not reliable enough to carry conversion.
- Advanced value exists, but it is under-explained and under-exposed.
- PDF is positioned too early relative to the real value sequence.

The product should feel less like a static report and more like a guided personal decision system.

## 3. Target Users

### User A: Career Decision User

Profile:
- 28-42
- anxious about job changes, timing, money, and reputation
- wants a clear yes, no, or not yet

Primary job to be done:
- Understand whether now is a good time to change jobs, launch something, or wait.

What triggers payment:
- sharp year timing
- career-specific AI reading
- ability to ask follow-up questions in plain language

What breaks trust:
- vague language
- no immediate next step
- Ask Chart failure or slow first answer

### User B: Relationship Clarity User

Profile:
- 25-40
- primarily motivated by love, compatibility, belonging, and future partner timing
- wants emotional validation and practical clarity

Primary job to be done:
- Understand what pattern is repeating in love, and whether the next serious opening is close.

What triggers payment:
- marriage timing
- D9-based relationship depth
- ability to keep asking one thread until it feels resolved

What breaks trust:
- too much generic career-heavy language
- not enough emotional recognition
- no clear bridge from reading to specific love questions

### User C: Advanced Astrology User

Profile:
- already knows some astrology terms
- looks for depth, structure, and evidence
- can detect shallow AI quickly

Primary job to be done:
- Verify whether AstroCurve is actually deeper than generic astrology content.

What triggers payment:
- named yogas
- D9/Navamsa usage
- advanced timing logic
- visible proof that conclusions are derived from chart-specific signals

What breaks trust:
- unexplained conclusions
- buried advanced features
- no proof layer

## 4. Current Product Assessment

### Strengths

- The hero section leads with a clear current stage.
- The life curve creates an immediate visual hook.
- The AI reading modules are already rich enough to feel premium.
- The page has enough content depth to support real follow-up behavior.
- Advanced signals like D9 and Yogas already exist and can support a stronger Pro narrative.

### Weaknesses

- Ask Chart is the most important premium bridge, but first-question reliability is not yet trustworthy enough.
- The loading experience is not strong enough before the chat message stream is established.
- Premium value is still too implicit.
- PDF is over-positioned relative to its real product importance.
- The page reads well once, but the return loop is still weak.

## 5. Product Principles

1. Answer first.
2. Always offer the next best action.
3. Paid value should appear after value is felt, not before.
4. Every deep insight should support a follow-up question.
5. Advanced credibility should be visible, not hidden.
6. Retention must come from unresolved personal threads, not generic reminders.

## 6. North Star Outcomes

Primary outcomes:

- more users open Ask Chart from the Kline result page
- more first questions complete successfully
- more users continue the same thread instead of bouncing
- more Lite and Pro upgrades happen after a concrete value moment

Secondary outcomes:

- more 7-day and 30-day return visits
- more saved reading sessions per chart
- better perception of Pro as a serious astrology tool rather than a static report export

## 7. Prioritized Roadmap

## P0. Make Ask Chart Reliable And Fast

Problem:
- The strongest premium continuation path breaks trust if the first question fails or feels stalled.

Requirement:
- First answer target: under 4 seconds for perceived response start.
- Every send action must show immediate visible loading feedback.
- If the AI backend fails, the user must see a graceful fallback instead of a dead-end error feeling.

Functional requirements:

- Show a placeholder assistant card immediately after send.
- Show staged loading states before the full reply arrives.
- If generation fails, keep the user message in place and present a recovery path.
- Provide one-click retry.
- Provide one fallback suggestion such as narrowing the question or using a suggested follow-up.

UX requirements:

- Loading must be visible even on the first question when the screen is otherwise mostly empty.
- The user should never wonder whether the click worked.
- The user should never lose context after an error.

Success criteria:

- first-response-start under 4 seconds in normal conditions
- first question success rate above 98%
- retry success rate above 60% when the first attempt fails

## P1. Turn Reading Modules Into Follow-Up Gateways

Problem:
- The modules explain, but they do not yet push the user into the strongest next action.

Requirement:
- Every important module should end with a specific continuation CTA, not a generic chat CTA.

Functional requirements:

- Add contextual ask actions below major modules such as Career, Marriage, Karmic Lessons, and Timing.
- Add contextual ask actions under key years such as 2027 or 2029.
- Carry the module, year, and chart context into Ask Chart automatically.

UX requirements:

- CTA copy should read like a natural next thought.
- Examples:
  - Ask what makes 2027 different from 2028
  - Ask whether this is really a job-change year
  - Ask what your partner pattern is trying to teach you

Success criteria:

- Ask Chart open rate from module CTAs above current floating-button baseline
- at least 30% of Ask Chart opens from contextual entry points

## P2. Reorder The Page Around Value, Not Utility

Problem:
- The top toolbar currently gives PDF export too much visual importance.

Requirement:
- Main actions above the fold should deepen understanding, not extract or save output.

Functional requirements:

- Remove PDF export from the top-right primary toolbar area.
- Move PDF to a secondary utility position.
- Prefer page footer or a subtle lower-left utility anchor.
- Keep the primary visual action focused on understanding and follow-up.

UX requirements:

- The page should guide users from current stage to why this pattern repeats to ask the next question.
- PDF should feel like save for later, not do this next.

Success criteria:

- higher scroll depth into diagnosis and action sections
- higher Ask Chart CTR before any export action

## P3. Make Pro Depth Visible At The Moment It Matters

Problem:
- Advanced value exists but still behaves like hidden depth.

Requirement:
- Users should know when an insight uses advanced layers.

Functional requirements:

- Add clear source markers where relevant:
  - D9 insight used
  - Named Yoga detected
  - Advanced timing layer active
  - Pro-only interpretation layer
- Use these markers in Marriage, Karma, Timing, and deep Ask Chart answers.

UX requirements:

- The copy should sound like proof of depth, not technical clutter.
- Users should feel that Pro is chart-specific and method-rich.

Success criteria:

- improved perceived Pro clarity in user testing
- improved upgrade intent after encountering advanced markers

## P4. Add A Proof Layer For High-Trust Decisions

Problem:
- Strong conclusions need optional evidence, especially for advanced users.

Requirement:
- Important claims should have an expandable why this answer layer.

Functional requirements:

- Add a collapsible proof block under major conclusions.
- Include:
  - relevant planetary signal
  - aspect type
  - house/theme impact
  - D9 or Yoga evidence where applicable
- In Ask Chart, support a follow-up mode like show me why.

UX requirements:

- The default page should remain emotionally legible.
- The proof layer should be optional and compact.

Success criteria:

- higher trust among advanced users
- lower drop-off after first premium answer

## P5. Build A Return Loop Around Ongoing Threads

Problem:
- The current experience is rich but still feels too session-based.

Requirement:
- Make users want to return to ongoing questions, not just re-read static content.

Functional requirements:

- Save Ask Chart conversations by chart and topic.
- Surface unfinished or high-interest threads on revisit.
- Create lightweight revisit hooks such as:
  - your next key window is approaching
  - continue your 2027 career thread
  - review what changed since your last reading

UX requirements:

- The product should feel like it remembers the user’s real questions.
- Returning should feel like resuming a personal thread, not starting from zero.

Success criteria:

- improved 7-day and 30-day return rate
- higher multi-session usage per chart

## P6. Rebuild Monetization Around Real Value Moments

Problem:
- Some paid prompts appear before users fully feel why they should pay.

Requirement:
- Upgrade prompts should follow demonstrated value.

Functional requirements:

- Lite upgrade triggers:
  - after first strong aha moment
  - after the user attempts a second or third continuation action
  - after the user sees that more practical modules exist
- Pro upgrade triggers:
  - after encountering D9, Yogas, karma, advanced timing, or unlimited follow-up contexts
  - after the user hits a cap while clearly engaged
- PDF should remain a support benefit, not the main hero monetization lever.

UX requirements:

- Upgrade prompts should say what unlocks next, not just what is blocked.
- The product should feel like a natural staircase from curiosity to depth.

Success criteria:

- better upgrade rate from reading-to-chat continuation moments
- lower reliance on generic export-based upgrade prompts

## 8. Key UI Changes

### Ask Chart Surface

- show immediate assistant placeholder after send
- show multi-stage loading state
- keep the input visible and anchored
- preserve failed question state
- support retry and guided reformulation

### Kline Result Page

- reduce toolbar emphasis on PDF
- add contextual ask buttons inside modules and year blocks
- place deeper-value prompts near insight, not only at page end
- keep footer for save, export, invite, and utility actions

### Premium Positioning

- move from feature-list framing to proof-of-depth framing
- show why Pro is different exactly where depth appears

## 9. Metrics

Core metrics:

- Ask Chart open rate from Kline page
- first-question completion rate
- time to first visible response
- module-to-question continuation rate
- Kline-to-Lite upgrade rate
- advanced-module-to-Pro upgrade rate

Retention metrics:

- 7-day return rate
- 30-day return rate
- average sessions per saved chart
- resumed-thread usage rate

Trust metrics:

- error rate on Ask Chart first question
- proof-layer open rate
- satisfaction score after first answer

## 10. Non-Goals For This Phase

- rebuilding the full astrology engine
- expanding PDF into the primary product surface
- redesigning all dashboard tools at once
- adding new astrology systems beyond the existing roadmap before Ask Chart reliability is fixed

## 11. Recommended Execution Order

Release 1:
- P0 Ask Chart reliability and loading
- P1 contextual continuation entry points

Release 2:
- P2 action hierarchy and PDF demotion
- P6 monetization timing rewrite

Release 3:
- P3 Pro depth exposure
- P4 proof layer

Release 4:
- P5 return-loop system

## 12. Final Product Call

The product is already close to being premium-worthy.

The real opportunity is not to add much more content.
The opportunity is to connect the content into a strong behavioral loop:

- first insight
- immediate follow-up question
- deeper answer
- visible advanced value
- saved ongoing thread
- reason to come back

If this loop is built well, AstroCurve will feel less like a report generator and more like a high-trust personal astrology operating system.