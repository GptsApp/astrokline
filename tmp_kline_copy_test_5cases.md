# Kline Hero Copy Test After Deploy

Deploy tested: ba39b5da-7b78-478f-8a31-017938e2880a

## Scope

Tested 5 production charts on https://www.astrocurve.net/dashboard/kline.
Goal: check whether the top hero copy feels varied, useful, and low-AI-smell across different birth data.

## Cases

| Label | Identity | Headline | Third Line Status | Verdict |
| --- | --- | --- | --- | --- |
| Copilot QA | Leo Sun / Gemini Moon / Scorpio Rising | This is a season where things can start moving for you | AI-assisted line present: "I see a profound calling..." | Best of the 5 for perceived personalization |
| QA Mina | Sagittarius Sun / Gemini Moon / Virgo Rising | This is a season where things can start moving for you | Fallback line only; same emotional sentence reused | Too similar to other high-score charts |
| QA Freya | Libra Sun / Cancer Moon / Sagittarius Rising | This is a season where things can start moving for you | Fallback line only; same emotional sentence reused | Too similar to QA Mina |
| QA Iris | Cancer Sun / Leo Moon / Sagittarius Rising | This is a season where things can start moving for you | Fallback line only; same emotional sentence reused | Too similar to QA Mina / QA Freya |
| QA Luna | Aquarius Sun / Pisces Moon / Pisces Rising | Right now your chart is asking for gentler pacing and better boundaries | Distinct fallback line about boundaries and heaviness | Strongest non-AI variant |

## What Stood Out

1. Variation is too low across the 3 positive-growth cases.
2. QA Mina, QA Freya, and QA Iris all landed on the same top pattern:
   - same headline
   - same summary
   - same action frame
   - same emotional recognition sentence
3. QA Luna is materially better because the tone changes with the chart state:
   - softer
   - more protective
   - more specific emotionally
4. Copilot QA is the only case where the hero clearly feels more "AI-assisted" and more personalized.

## Production Behavior Finding

Freshly created charts did not persist aiInsight during testing.

Observed behavior:

1. 4 new production charts were created successfully.
2. After waiting on the hero, the top card still showed fallback recognition copy.
3. After opening section 03 (diagnosis) and waiting longer, aiInsight was still not persisted for the fresh chart.
4. The list API still returned `hasAiInsight: false` for the 4 new charts.

This means the deployed hero is currently judged mostly by its fallback path for brand-new charts.

## Practical Conclusion

If the goal is "5 different charts should feel noticeably different on first impression", the current build does not pass yet.

Current pass/fail read:

- Pass: 2 of 5
  - Copilot QA
  - QA Luna
- Weak: 3 of 5
  - QA Mina
  - QA Freya
  - QA Iris

## Suggested Next Moves

1. Debug why fresh charts are not getting aiInsight on dashboard load.
2. Strengthen the fallback hero logic so even without aiInsight, high-score charts do not collapse into the same emotional sentence.
3. Add more distinct fallback branches for:
   - growth-supportive momentum
   - intuitive but blurry momentum
   - expansion with overcommitment risk
   - pressure-and-boundaries phases

## Post-Fix Validation

Updated production deploy: b4f82aa0-7da8-4eac-9a8c-b96eea257bb0

What changed:

1. Added a fast HERO insight mode that returns nickname/coreQuote without waiting for full LITE/PRO insight generation.
2. Wired the dashboard to prefetch that fast hero insight and persist it for the current Kline.
3. Allowed the hero card to use the more human second half of coreQuote when the full sentence is too astrological or too long.

Fresh production validation:

- New chart created: QA Nora
- Identity: Taurus Sun / Scorpio Moon / Leo Rising
- Within ~10 seconds on production, the hero third line became:
   - "A combination that makes you unforgettable to those who truly see you."
- Server-side Kline data showed `hasAiInsight: true` with `coreQuote` already persisted.

Interpretation:

- The original failure mode was real: fresh charts stayed on fallback because the first useful AI payload arrived too slowly for the hero.
- After the fix, fresh charts can surface a personalized third line quickly, even before the full long-form insight finishes.