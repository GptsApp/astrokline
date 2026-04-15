# Kline AI Surface Map

## Current AI-generated surfaces

| Surface | UI consumer | Request path | Current payload shape | Current problem |
| --- | --- | --- | --- | --- |
| Hero quick line | `src/components/astrocurve/kline/result-command-deck.tsx` | `POST /api/astrology/ai-insight` with `tier=HERO/LITE/PRO` | `nickname`, `coreQuote`, partial `AiInsightData` | Hero still depends on the larger personality payload family, so copy ownership is blurry. |
| Diagnosis section | `src/components/astrocurve/kline/ai-reading-panels.tsx` | `POST /api/astrology/ai-insight` | 17-section `AiInsightData` | This is the heaviest generation path and also the source most other surfaces keep borrowing from. |
| Section 4 action cards | `src/components/astrocurve/kline/shared-kline-result.tsx` | `POST /api/astrology/key-year-insights` | `[{ year, aiSummary, aiAdvice }]` | Short-form action copy lives in a second pipeline with its own cache and tone contract. |
| Section 4 five-year rows | `src/components/astrocurve/kline/five-year-plan.tsx` | same `key-year-insights` payload | `aiSummary`, `aiAdvice` mixed with rule-based dims | The top of section 4 and the lower five-year area are not driven by one unified brief. |
| Ask Chart follow-up | `src/components/astrocurve/kline/ask-chart-panel.tsx` | `POST /api/astrology/ask-chart` | multi-turn answer stream | Ask Chart runs on a third prompt family, so tone and evidence style can drift away from the page reading. |
| Saved AI insight persistence | `src/app/api/kline/ai-insight/route.ts` | internal writeback after fetch | merged `AiInsightData` | Persistence stores a broad blob, not slice-specific outputs with clear ownership. |
| Legacy/parallel consumers | `ai-personality-insight.tsx`, `ai-reading-fullscreen.tsx` | `POST /api/astrology/ai-insight` | same broad payload | More than one component tree can still call the same generator family differently. |

## Current pipeline map

1. `ai-insight` route
   - File: `src/app/api/astrology/ai-insight/route.ts`
   - Generates `HERO`, `LITE`, or `PRO` slices.
   - Backed by `generatePersonalityInsight()` in `src/lib/astrokline/gemini.ts`.
   - Uses D1 cache keyed by chart hash + tier.

2. `key-year-insights` route
   - File: `src/app/api/astrology/key-year-insights/route.ts`
   - Generates year-level action copy for section 4.
   - Backed by `generateKeyYearInsights()` in `src/lib/astrokline/gemini.ts`.
   - Uses route-level singleflight plus D1 cache.

3. `ask-chart` route
   - File: `src/app/api/astrology/ask-chart/route.ts`
   - Generates chat answers with a separate prompt contract.
   - Streams and persists thread messages, but does not consume a dedicated Kline brief.

4. Client orchestration
   - `ai-reading-panels.tsx` progressively fetches `HERO -> LITE -> PRO` and persists the result.
   - `shared-kline-result.tsx` separately prefetches `key-year-insights`.
   - `result-command-deck.tsx` and section 4 consume different AI families.

## Why the current model feels fragile

1. One page is being driven by three AI contracts.
   - Hero, diagnosis, action, and Ask Chart do not share one explicit content schema.

2. Long-form and short-form ownership is mixed.
   - Diagnosis text is long-form.
   - Action text is short-form.
   - Components have repeatedly reused long-form fields in places that need short-form copy.

3. Components know too much about AI timing.
   - `ai-reading-panels.tsx` and `shared-kline-result.tsx` both orchestrate fetch, fallback, cache, and persistence concerns.

4. Persisted shape is too broad.
   - `AiInsightData` is acting as both a storage blob and a rendering contract.
   - That makes slice boundaries weak.

5. Tone can drift.
   - `ai-insight`, `key-year-insights`, and `ask-chart` can each sound like different products.

## Better solution

### Target architecture

Use one Kline AI bundle with explicit slices:

```text
KlineAIBundle
|- hero
|  |- title
|  |- supportLine
|  |- proofLine
|- diagnosis
|  |- relationship
|  |- career
|  |- money
|  |- health
|  |- strengths
|  |- warnings
|- action
|  |- currentFocus
|  |- nextWindow
|  |- guardrail
|  |- years[5]
|- askContext
   |- chartSummary
   |- currentQuestionHooks[]
```

### Generation layers

1. Snapshot layer
   - Fast path, under about 1.5s.
   - Only returns `hero` and a tiny `askContext` seed.
   - Used for first paint.

2. Reading layer
   - Medium path, under about 4s.
   - Returns `diagnosis` plus normalized evidence anchors.

3. Action layer
   - Structured short-form path, under about 4s.
   - Returns `currentFocus`, `nextWindow`, `guardrail`, and five-year rows.
   - No component should synthesize this from diagnosis text.

4. Ask layer
   - Keep `ask-chart` interactive and separate.
   - Feed it the saved `askContext` slice from the same Kline bundle so tone and evidence stay consistent.

## Implementation direction

1. Split the current storage type.
   - Keep `AiInsightData` only as a legacy compatibility bridge.
   - Add dedicated types such as `KlineHeroInsight`, `KlineDiagnosisInsight`, `KlineActionInsight`, and `KlineAskContext`.

2. Add one orchestrator route.
   - Example: `POST /api/astrology/kline-brief`.
   - Returns a typed bundle with slice-level completeness markers.

3. Move prompt budgets into slice contracts.
   - `hero.supportLine`: one sentence, tight word budget.
   - `action.currentFocus`: one summary + one advice.
   - `years[i]`: short summary + short advice.
   - No UI truncation.

4. Move persistence to bundle-level writes.
   - Persist one normalized bundle version per chart hash + model version.
   - Avoid piecemeal merges from different components.

5. Let components consume only their own slice.
   - Hero reads `bundle.hero` only.
   - Section 3 reads `bundle.diagnosis` only.
   - Section 4 reads `bundle.action` only.
   - Ask Chart reads `bundle.askContext` only.

## Recommended rollout

1. Phase 1
   - Keep existing routes.
   - Introduce dedicated types and stop cross-using diagnosis fields in section 4.

2. Phase 2
   - Add `kline-brief` route that internally calls hero/diagnosis/action generators and returns one normalized bundle.

3. Phase 3
   - Migrate `SharedKlineResult` and `AiReadingPanels` to consume the bundle.
   - Keep old fields only for backward compatibility during rollout.

4. Phase 4
   - Make `Ask Chart` consume `askContext` from the same saved bundle.

## Recommendation

The best next move is not to keep patching individual Kline sections.

The better move is:

1. Freeze hero/diagnosis/action into separate typed slices.
2. Introduce a single orchestrator response for the page.
3. Remove all cases where one section reuses another section's AI field.

That will solve four recurring problems at once:

1. inconsistent tone
2. wrong text length in the wrong place
3. fallback confusion
4. duplicated fetch/cache logic across components