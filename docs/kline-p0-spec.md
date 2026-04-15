# Kline P0 Spec: Ask Chart Reliability, Loading, And First-Response Speed

Status: Draft
Date: 2026-04-12
Priority: P0
Owner: Product + Frontend + API

## 1. Why This Is P0

Ask Chart is the strongest premium continuation path on the Kline result page.

Right now it fails at the most sensitive moment:

- the user has just felt value
- the user is ready to ask a specific follow-up question
- the system either looks inactive or can fail with a hard stop

That breaks conversion trust faster than almost any other issue on the page.

## 2. Verified Product Facts

### Fact A: The first question can fail with 502

Observed behavior in real Pro testing:

- opening Ask Chart succeeds
- clicking a suggested first question can return 502
- the user sees a generic failure path

### Fact B: The current route is not truly streaming

The current API path waits for the full Gemini answer first and only then returns the final text response.

This means the current product cannot deliver true token-by-token streaming without backend changes.

### Fact C: Loading feedback is too weak in the highest-risk moment

The current UX shows a typing indicator inside the message list, but the first-send state still feels fragile because:

- the screen starts nearly empty
- there is no strong assistant placeholder card
- the user can still wonder whether the click worked

## 3. P0 Objective

Make Ask Chart feel immediate, reliable, and recoverable.

This P0 should achieve two outcomes:

1. perceived response start within 4 seconds
2. graceful recovery when generation fails

Important clarification:

- P0 can fully fix perceived responsiveness
- P0 cannot deliver true first-token streaming unless the backend generation path is changed

## 4. P0 Success Criteria

### Product KPIs

- first-question success rate >= 98%
- first visible acknowledgment <= 300 ms
- assistant placeholder visible <= 500 ms
- perceived response start <= 4 s
- retry success rate after first failure >= 60%
- Ask Chart abandonment after first send reduced materially from baseline

### UX Acceptance

- the user always sees that the send action worked
- every reply attempt shows a visible loading state
- a failed request does not wipe context
- the user always has a next action after failure

## 5. Scope

In scope:

- Kline floating Ask Chart panel
- Ask Chart dashboard page
- first send, follow-up send, retry, and failure states
- product instrumentation for send, success, latency, failure, retry

Out of scope for this P0:

- redesign of all chat information architecture
- deep proof layer
- contextual ask CTAs across all modules
- long-term thread resume system
- model-level quality rewriting beyond reliability and speed perception

## 6. Core Constraints

### Constraint A: Backend response is currently whole-text, not token stream

The current route does this:

- build full system prompt
- call Gemini
- wait for full text
- return plain text response

Implication:

- client-side pseudo-streaming is possible only after the full response has arrived
- real early content rendering requires server streaming work

### Constraint B: Rate limit exists

Current route enforces a minimum interval limit.

Implication:

- retry UX should not feel like a second punishment
- error messaging should distinguish between rate limiting and AI failure

## 7. P0 Product Strategy

P0 has two layers.

### Layer 1: Immediate Perceived Responsiveness

Do not wait for model completion before showing progress.

Required behavior:

- the moment the user sends, insert the user bubble immediately
- insert an assistant placeholder bubble immediately
- placeholder shows staged loading labels
- keep input disabled only when necessary, but visually preserve control

### Layer 2: Failure Recovery

If generation fails, the UI must preserve trust.

Required behavior:

- keep the original user question visible
- replace loading bubble with a failure state card
- show retry action
- show one fallback action such as ask a narrower version
- do not collapse or clear the conversation

## 8. Required UX States

## State 1: Idle Empty State

Required elements:

- sample prompts
- visible promise of what Ask Chart can do
- low-friction first action

Improve:

- add one line of expectation setting: answers usually begin within a few seconds

## State 2: Send Confirmed

Trigger:
- user taps suggested prompt or sends custom text

UI within 300 ms:

- user message bubble appears
- assistant placeholder bubble appears
- input visually remains present

Placeholder copy sequence:

- Reading your chart context...
- Checking timing and patterns...
- Writing your answer...

## State 3: Waiting For Full Model Result

Rules:

- never show a blank gap
- maintain animated loading in the assistant bubble
- keep the conversation scroll anchored

## State 4: Success

Rules:

- assistant bubble transitions from loading shell to real answer
- preserve subtle loading-to-answer motion
- keep one clear next action under the answer:
  - ask a follow-up
  - ask for timing
  - ask why this is happening

## State 5: Recoverable Failure

If 502 or empty response:

- render failure inside the assistant bubble area
- copy example:
  - I could not complete that answer just now.
  - Try again or ask a narrower version.
- actions:
  - Retry
  - Shorten question
  - Ask suggested question

## State 6: Rate Limit Or Plan Limit

If 429 or 403:

- do not use generic error copy
- show the exact reason
- show plan-appropriate next action

## 9. Detailed Functional Requirements

### FR1. Immediate assistant placeholder

Both Ask Chart surfaces must create a placeholder assistant message immediately after send.

### FR2. Loading on every reply

Every reply attempt must visibly show a loading state.

This includes:

- first question
- follow-up question
- retry question
- example prompt click

### FR3. Message persistence on failure

The user message and failed assistant shell must remain in the conversation.

### FR4. Retry support

Retry must reuse the same user question without forcing re-entry.

### FR5. Error classification

The UI must distinguish at least these buckets:

- 401 auth required
- 403 subscription required
- 429 limit reached
- 502 AI service unavailable
- network error

### FR6. Unified behavior across both Ask Chart surfaces

The Kline floating panel and the full Ask Chart dashboard page must behave the same for:

- loading
- success shell
- failure shell
- retry

### FR7. Track latency and failure reasons

Add structured event tracking for:

- ask_chart_send
- ask_chart_first_feedback_shown
- ask_chart_success
- ask_chart_failure
- ask_chart_retry

## 10. API And Architecture Recommendations

## Phase P0-A: Client-first reliability fix

Implement now:

- immediate assistant placeholder
- staged loading labels on client
- failure-state rendering
- retry action
- latency instrumentation from send to visible feedback and send to full success

Expected result:

- strong perceived responsiveness
- much better trust even before backend streaming exists

## Phase P0-B: Backend performance hardening

Implement next if needed:

- log Gemini latency separately from route overhead
- classify failure reasons in server logs
- add timeout-aware fallback copy instead of generic 502 only
- consider shorter-token first-answer mode for first response

## Phase P0-C: True streaming investigation

Only if needed after P0-A and P0-B.

Would require:

- server streaming response support
- model streaming support in Gemini path
- client handling for partial assistant tokens

Important:

- do not block P0 release waiting for true token streaming
- perceived response quality matters first

## 11. Performance Budget

### Client-side budget

- send acknowledgement: <= 100 ms
- placeholder rendered: <= 500 ms
- loading state change visible: <= 1 s

### End-to-end budget

- perceived response start: <= 4 s
- full answer completion target: <= 8 s for first question in normal conditions

### Monitoring breakdown

Track these separately:

- input submit to placeholder render
- placeholder render to response received
- response received to final UI commit

## 12. Interaction Copy Guidelines

Loading copy should feel confident, not robotic.

Good examples:

- Reading your chart context...
- Checking timing and pattern signals...
- Writing your answer...

Failure copy should preserve trust.

Good examples:

- I could not finish that answer just now.
- Your question is still here. Try again or ask a narrower version.

Avoid:

- Sorry, something went wrong.
- Connection error.
- Silent spinner without framing

## 13. Analytics Spec

Add or refine the following event props:

- source: kline_panel | ask_chart_page | module_cta | year_cta
- isFirstQuestion: true | false
- chartId
- latencyMs
- failureType: auth | upgrade | quota | ai_unavailable | timeout | network
- retryCount

Use these for:

- funnel analysis
- failure clustering
- performance regression alerts

## 14. QA Scenarios

Must test:

1. First suggested prompt on floating panel
2. First custom prompt on floating panel
3. Follow-up prompt on floating panel
4. First suggested prompt on full Ask Chart page
5. 502 failure behavior
6. 429 quota behavior
7. 403 upgrade behavior
8. network disconnect behavior
9. retry flow after 502
10. retry flow after network failure

## 15. Release Plan

### Release 1

- client placeholder
- staged loading copy
- failure shell
- retry action
- basic latency instrumentation

### Release 2

- server failure classification
- timeout handling improvements
- copy refinement based on logs

### Release 3

- optional backend streaming evaluation if still needed

## 16. Final Decision

P0 should optimize for perceived speed and reliability first.

That means:

- do not wait for true streaming before shipping
- do not leave the user staring at an ambiguous empty state
- do not show a dead-end generic error

If the product can visibly respond immediately, preserve context on failure, and recover cleanly, Ask Chart will stop feeling fragile and start feeling premium.