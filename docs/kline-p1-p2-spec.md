# Kline P1-P2 Spec: Contextual Ask Entry And Page Hierarchy Rewrite

Status: Draft
Date: 2026-04-12
Priority: P1-P2
Depends on: P0 Ask Chart reliability improvements

## 1. Goal

After a user reads an insight on the Kline result page, the page should make the next best action obvious.

This spec covers two changes:

- P1: contextual Ask Chart entry points
- P2: action hierarchy rewrite with PDF demotion

## 2. Core Product Decision

The primary action on the Kline page is not export.

The primary action is:

- understand the current insight
- ask the next question
- go deeper in the same thread

Export is a utility action.
It should not compete with interpretation and continuation.

## 3. Current Problems

### Problem A: Ask Chart is too generic on the result page

Today the page mostly relies on:

- a floating Ask Chart entry
- a lower-page Open Ask Chart CTA

This is not enough because the user’s question is usually local and specific.

Examples:

- Why is 2027 called a peak window?
- Is this really a job-change year?
- What pattern is repeating in my relationships?

The page should convert those exact thoughts into direct actions.

### Problem B: PDF sits too high in the action order

The current toolbar gives PDF export a primary visible position before the user has fully deepened the reading.

This is backwards.

- export is what users do after value lands
- follow-up questioning is what increases value and conversion

## 4. P1 Objective

Make every major insight block a launch point into Ask Chart.

The user should never need to mentally translate a page insight into a generic chat action.

## 5. P2 Objective

Reorder the page so the action hierarchy matches product value.

Desired hierarchy:

1. understand current state
2. inspect the curve
3. ask a contextual follow-up
4. go deeper into premium layers
5. save, export, or share later

## 6. P1: Contextual Ask Entry Design

## P1-A. Module-level Ask CTAs

Add a contextual follow-up action under major AI reading modules.

Initial modules:

- Career & Direction
- Money & Finances
- Relationships & Love
- Marriage & Partnership
- Karmic Lessons
- Life Chapters & Timing

CTA behavior:

- each CTA opens Ask Chart
- it passes module context automatically
- it seeds a suggested question draft

Examples:

- Career & Direction:
  - Ask whether this is truly a career pivot year
  - Ask what kind of work suits this chart best now
- Marriage & Partnership:
  - Ask when the next serious relationship window opens
  - Ask what this chart needs in a partner
- Life Chapters & Timing:
  - Ask why this chapter is changing now
  - Ask what makes 2027 different from 2028

## P1-B. Year-level Ask CTAs

Key years already create strong curiosity.

Each featured year card should support:

- Ask about this year
- Ask what risk to avoid in this year
- Ask how this year compares with the next window

These year CTAs should automatically pass:

- chart id
- selected year
- current theme if present
- source section

## P1-C. Answer-level Ask CTAs

After a user receives an Ask Chart answer, the answer should not be a dead end.

Each answer should suggest 2-3 next-step prompts based on the answer theme.

Examples:

- Ask how to act on this timing
- Ask what pattern is blocking this area
- Ask for the evidence behind this answer

## 7. P1 UX Rules

### Rule 1

Ask CTAs must sound like thoughts the user is already having.

Bad:

- Open Ask Chart
- Continue with AI

Good:

- Ask why this year matters
- Ask whether this is a job-change year
- Ask what this pattern is trying to teach you

### Rule 2

Do not overload every module with equal visual weight.

Use contextual CTAs only where curiosity is naturally strongest.

### Rule 3

The CTA should preserve emotional momentum.

If the user just read a strong sentence, the next action should feel like a continuation of that insight.

## 8. P1 Functional Requirements

### FR1

Contextual Ask CTAs must open the same Ask Chart system used elsewhere.

### FR2

The opening state must preserve source context.

Required source fields:

- sourceType: module | year | hero | footer
- sourceKey
- chartId
- optional selectedYear

### FR3

Ask Chart must prefill a suggested draft, but the user can edit it before send.

### FR4

The ask action must be measurable via analytics.

Suggested events:

- result_context_ask_open
- result_context_ask_send
- result_context_ask_success

## 9. P2: Page Hierarchy Rewrite

## P2-A. Remove PDF As A Top-Level Primary Action

Current product logic problem:

- PDF appears too early in the user journey
- it competes with the stronger follow-up behavior

Desired change:

- remove or visually demote top-toolbar PDF action
- keep PDF accessible, but secondary

Recommended placement:

- page footer utility cluster
- subtle lower-left utility rail on desktop
- not in the most prominent top-right action slot

## P2-B. Strengthen The Reading Path

The visible path should become:

### Step 1

Current Life Stage

The user gets the current answer fast.

### Step 2

Life Curve and Key Years

The user sees where the curve is moving and where curiosity should deepen.

### Step 3

Why This Pattern Keeps Repeating

The user reads the richest interpretation modules.

### Step 4

Ask the next question from a specific insight.

### Step 5

Save, export, share, or branch into adjacent tools.

## P2-C. Treat Export As Utility, Not Narrative Progression

PDF is valuable, but its product role is:

- save
- archive
- share later

It is not the main continuation mechanic.

That means:

- export should live after insight and after questioning
- export should not visually interrupt the reading flow

## 10. P2 UX Rules

### Rule 1

The page should always answer this question for the user:

What do I do next?

The answer should almost never be export.

### Rule 2

Top actions must create more meaning, not merely preserve output.

### Rule 3

Secondary utilities should feel available but quiet.

## 11. Proposed Layout Changes

### Above the fold

- keep chart tabs
- keep current stage deck
- keep inspect the curve
- remove strong PDF emphasis

### In diagnosis modules

- add contextual ask chips or inline buttons
- surface deeper-value hooks where curiosity is highest

### In action and timeline section

- add ask-about-this-year actions
- add compare-two-years action

### In footer

- keep export
- keep share/invite
- keep save-oriented utilities

## 12. Suggested Copy System

Use action copy that is:

- local to the section
- written in user language
- short enough to scan

Examples by section:

- Current Stage:
  - Ask what to prioritize now
- 2027 card:
  - Ask why 2027 is a peak year
- Career block:
  - Ask whether now is the move
- Marriage block:
  - Ask when love gets serious
- Karma block:
  - Ask what lesson keeps repeating

## 13. Analytics Spec

Add or refine these events:

- result_context_ask_impression
- result_context_ask_open
- result_context_ask_send
- result_context_ask_success
- result_export_click
- result_export_position_seen

Useful props:

- sourceSection
- chartId
- selectedYear
- tier
- wasPrefilled

## 14. Success Metrics

For P1:

- contextual Ask open rate
- contextual Ask send rate
- follow-up question completion rate
- second-question rate per session

For P2:

- reduced premature export clicks
- increased depth into diagnosis modules
- increased Ask Chart opens before export
- improved Lite/Pro conversion from mid-page value moments

## 15. Risks

### Risk 1

Too many CTAs could make the page noisy.

Mitigation:

- only place CTAs in high-curiosity zones
- keep one primary contextual ask action per major block

### Risk 2

Removing PDF from the top may reduce discoverability.

Mitigation:

- keep it clearly available in footer or utility rail
- test discoverability after move

### Risk 3

Prefilled Ask drafts may feel too scripted.

Mitigation:

- keep draft editable
- allow one-click send or quick edit

## 16. Release Plan

### Release P1-A

- add contextual Ask CTAs under 3 highest-value modules
- add year-level ask actions for key years
- add analytics

### Release P1-B

- add answer-level next prompts inside Ask Chart
- refine copy based on usage

### Release P2-A

- visually demote top-toolbar PDF action
- move export to footer or lower-left utility area

### Release P2-B

- tune page hierarchy and CTA weight after funnel data review

## 17. Final Decision

The Kline page should not primarily ask users to save the report.

It should primarily help them continue the most important thought the page just triggered.

If P1 and P2 are done well, the page will feel more alive, more premium, and more conversion-ready without needing a major content rewrite.