# Kline P3-P6 Spec: Premium Depth, Proof Layer, Retention Threads, And Monetization Timing

Status: Draft
Date: 2026-04-12
Priority: P3-P6
Depends on: P0 Ask Chart reliability, P1 contextual Ask entry, P2 page hierarchy rewrite

## 1. Goal

Once Ask Chart is reliable and the page hierarchy is corrected, the product must do four things well:

- make Pro depth visible
- show why answers are trustworthy
- turn one-time insight into ongoing usage
- ask for payment at the right moment

This spec covers:

- P3 premium depth visibility
- P4 proof layer
- P5 retention through ongoing threads
- P6 monetization timing and upgrade logic

## 2. Product Thesis

AstroCurve already has enough depth to feel premium.

The current problem is not missing substance.
The problem is packaging, sequence, and continuity.

Right now too much of the best value is either:

- hidden in long-form reading text
- visible only to advanced users who already know what to look for
- disconnected from a follow-up action

## 3. P3 Objective: Make Depth Visible

Users should not have to infer that the answer used deeper astrology layers.

The product should visibly signal when an answer is using:

- D9 / Navamsa
- named Yogas
- advanced timing logic
- Pro-only interpretation layers

## 4. P3 Current Problem

Advanced value exists in the system, but it behaves like hidden infrastructure.

That means:

- advanced users notice it only if they inspect closely
- mainstream paid users feel the answer is good, but not necessarily why it is worth paying for
- the Pro plan can feel larger, but not obviously deeper

## 5. P3 Design Requirements

### P3-A. Source Badges

Add compact, readable source indicators where advanced depth is used.

Examples:

- D9 insight used
- Active Yoga referenced
- Advanced timing layer active
- Pro interpretation layer

Rules:

- badges should feel like proof, not marketing fluff
- badges should be compact and scan-friendly
- badges should only appear where true

### P3-B. High-Value Sections For Depth Exposure

Prioritize these surfaces:

- Marriage & Partnership
- Karmic Lessons
- Life Chapters & Timing
- Ask Chart premium answers
- key year analysis

### P3-C. Depth-Aware Copy

The copy should explain value in human language.

Bad:

- Pro AI insight active

Good:

- This answer used your D9 relationship layer
- A named Yoga is shaping this interpretation
- This timing read used a deeper chart layer

## 6. P3 Functional Requirements

### FR1

The answer renderer must support optional depth markers.

### FR2

Depth markers must support multiple simultaneous layers.

### FR3

Depth markers must be available both on the Kline page and in Ask Chart answers.

### FR4

Depth exposure should be measurable.

Suggested events:

- premium_depth_badge_seen
- premium_depth_badge_clicked
- premium_depth_answer_upgrade_click

## 7. P4 Objective: Add A Proof Layer

High-confidence answers need an optional explanation layer.

Not every user needs raw logic, but the users who do need it must be able to find it fast.

## 8. P4 Current Problem

The product speaks with confidence, but the user cannot always see the reasoning path.

That creates two issues:

- advanced users may distrust strong conclusions
- mainstream users may like the answer emotionally but not trust it enough for a decision

## 9. P4 Design Requirements

### P4-A. Why This Answer Layer

Add a collapsible block for major conclusions.

Suggested label:

- Why this answer?

The block should include:

- the relevant chart factor
- the timing or pattern factor
- any advanced layer used
- a short plain-language explanation of how they combine

### P4-B. Keep Default Experience Lightweight

The proof layer must not dominate the main reading.

Rules:

- hidden by default
- easy to open
- short enough to scan

### P4-C. Ask Chart Follow-Up Mode

After a premium answer, one suggested follow-up should be:

- Show me why

That turns proof-seeking into a natural continuation action.

## 10. P4 Functional Requirements

### FR1

Major result sections support expandable proof content.

### FR2

Ask Chart can generate a proof-oriented follow-up answer using existing answer context.

### FR3

Proof open rate and proof-driven follow-up usage are measurable.

Suggested events:

- proof_layer_open
- proof_layer_followup_send
- proof_layer_upgrade_click

## 11. P5 Objective: Turn Sessions Into Threads

The product should feel like it remembers the user's ongoing concerns.

The user should not come back to a blank slate.

## 12. P5 Current Problem

The current experience is rich but still too session-shaped.

Today the user can ask a question, but the product does not yet fully frame that question as an ongoing thread.

That weakens:

- return motivation
- emotional continuity
- premium stickiness

## 13. P5 Design Requirements

### P5-A. Thread Model

Ask Chart conversations should be organized by:

- chart
- theme
- active year if relevant

Examples:

- Local QA / Career / 2027
- Local QA / Love / Partner timing
- Test D9 Yoga / Karma / repeating lesson

### P5-B. Resume Surfaces

On revisit, the dashboard should surface:

- continue your 2027 career thread
- revisit your relationship timing thread
- compare what changed since last reading

### P5-C. Timely Return Hooks

Retention prompts should come from meaningful time anchors:

- next key year window approaching
- monthly energy shift
- unfinished active thread

## 14. P5 Functional Requirements

### FR1

Ask Chart history should store thread metadata, not only generic chat titles.

### FR2

The Kline page should surface one resumed thread if relevant.

### FR3

The full Ask Chart page should show grouped thread history by theme or chart.

### FR4

Return prompts must be measurable.

Suggested events:

- thread_resume_shown
- thread_resume_opened
- thread_resume_completed
- thread_revisit_conversion

## 15. P6 Objective: Ask For Payment At The Right Time

Upgrades should follow value realization.

The product should feel like:

- you just saw why this matters
- here is what unlocks next

Not:

- you just opened the page
- here is a wall

## 16. P6 Current Problem

Some upgrade framing is still too feature-list oriented or too early relative to perceived value.

Also:

- PDF has been over-weighted in the experience
- deeper Pro differences are not always explained at the moment they matter

## 17. P6 Upgrade Logic

### Lite upgrade moments

Trigger after:

- first meaningful AI interpretation preview
- a second attempt to continue the reading
- the user understands that practical modules and follow-up questions exist

Primary Lite promise:

- keep going with personalized AI reading and limited chart chat

### Pro upgrade moments

Trigger after:

- the user encounters D9, Yoga, karma, advanced timing, or unlimited follow-up value
- the user tries to continue a high-value thread beyond Lite limits
- the user asks for deeper proof or repeated ongoing analysis

Primary Pro promise:

- deeper chart layers, unlimited continuation, and advanced timing intelligence

## 18. P6 UX Rules

### Rule 1

Upgrade copy should explain what unlocks next, not only what is blocked.

### Rule 2

Upgrade prompts should be local to the current moment.

Examples:

- Unlock deeper relationship timing with your D9 layer
- Continue this thread with unlimited chart questions
- See why this answer changes in your next major window

### Rule 3

PDF should never be the main justification for paying.

PDF is a supporting benefit, not the core reason to subscribe.

## 19. P6 Functional Requirements

### FR1

Upgrade prompts must accept source context.

Required source examples:

- ask_chart_failure
- ask_chart_limit
- depth_badge_click
- proof_layer_open
- module_followup_cta

### FR2

Upgrade modal copy should adapt to context.

### FR3

The system must distinguish Lite-fit and Pro-fit prompts.

## 20. Suggested Copy Framework

### For mainstream users

- Continue this answer with a deeper chart read
- Ask what this means for your next relationship chapter
- Keep this conversation going

### For advanced users

- Unlock D9-backed relationship analysis
- Continue with advanced timing and chart layers
- See the deeper logic behind this answer

## 21. Metrics

### P3 metrics

- depth badge impression rate
- depth badge interaction rate
- upgrade rate after depth badge exposure

### P4 metrics

- proof layer open rate
- proof-layer-driven follow-up rate
- proof-layer-driven upgrade rate

### P5 metrics

- thread resume rate
- repeat sessions per chart
- return rate from ongoing thread prompts

### P6 metrics

- upgrade rate by trigger context
- Lite conversion after second continuation attempt
- Pro conversion after advanced-depth exposure

## 22. Release Sequence

### Release A

- P3 source badges in highest-value sections
- basic Pro depth copy refinement

### Release B

- P4 proof layer for major sections and Ask Chart follow-up

### Release C

- P5 thread metadata and basic resume surfaces

### Release D

- P6 context-aware upgrade logic and copy

## 23. Final Decision

AstroCurve does not need more random features first.

It needs stronger continuity between:

- insight
- proof
- follow-up
- memory
- payment

If P3-P6 are executed well, users will stop experiencing AstroCurve as a one-off reading and start experiencing it as an ongoing, high-trust system that gets more valuable the more they use it.