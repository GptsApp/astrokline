import { NextResponse } from 'next/server';
import { callGeminiJson } from '@/lib/astrokline/gemini';

import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';
import { getSignUser } from '@/shared/models/user';

export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getSignUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const limited = enforceMinIntervalRateLimit(req, {
    intervalMs: 10000,
    keyPrefix: 'destiny-reading',
  });
  if (limited) {
    return limited;
  }

  try {
    const { profile } = await req.json();

    if (!profile || !profile.name || !profile.planets) {
      return NextResponse.json(
        { error: 'Missing user profile data' },
        { status: 400 }
      );
    }

    const planetList =
      profile.planets
        ?.map(
          (p: any) => `- ${p.name}: ${p.sign} ${p.degree}° (House ${p.house})`
        )
        .join('\n') || '';

    const prompt = `You are an elite professional astrologer blending Western psychological astrology with Vedic timing wisdom (Nakshatras, Dasha periods).
Your analysis must be shockingly accurate — the user should feel "this person truly understands me."
Speak like a wise, trusted older sister who also happens to be a brilliant astrologer. Be warm but direct.

## Natal Chart Data
Name: ${profile.name}
Sun: ${profile.sun?.sign} ${profile.sun?.degree}° (House ${profile.sun?.house})
Moon: ${profile.moon?.sign} ${profile.moon?.degree}° (House ${profile.moon?.house})
Rising: ${profile.rising?.sign} ${profile.rising?.degree}° (House ${profile.rising?.house || 1})
Elements: Fire ${profile.elements?.fire}%, Earth ${profile.elements?.earth}%, Air ${profile.elements?.air}%, Water ${profile.elements?.water}%
Modalities: Cardinal ${profile.modalities?.cardinal}%, Fixed ${profile.modalities?.fixed}%, Mutable ${profile.modalities?.mutable}%
Life Path Number: ${profile.lifePathNumber}

Planetary Placements:
${planetList}

## Analysis Requirements (Ordered by User Priority)
Analyze this chart from these frameworks:

1. **Relationships & Love Timing**: Analyze 7th House, 5th House, Venus sign/house/aspects, Moon sign/house, Mars — what attachment style is encoded? What kind of partner does this chart call for? When does the next significant love window open? Reference Moon Nakshatra for emotional texture.
2. **Emotional Phase & Why You Feel This Way**: Based on current outer planet transits to natal positions, what emotional season is the user in? Why might they feel stuck, anxious, or restless? Frame any difficulty as temporary and purposeful.
3. **Career & Life Direction**: Analyze 10th House, 6th House, Sun aspects — what career archetype emerges? When does the next breakthrough arrive?
4. **Wealth & Financial Security**: Analyze 2nd House, 8th House, Jupiter — what is the optimal wealth-building strategy and timing?
5. **Health & Energy Patterns**: Analyze 6th House, Mars, stress aspects — what physical/mental patterns to watch?
6. **Hidden Talents**: Analyze North/South Nodes, retrograde planets, 12th House — what gifts are untapped?
7. **Timing Windows**: When is the next major love/career/wealth opportunity? When to protect energy?

## Output Format
Return ONLY valid JSON matching this structure. All values must contain REAL personalized analysis based on this specific chart.
CRITICAL: Each text description/advice field MUST be a deep, detailed analysis of 200-300 words. Provide rich, immersive reading. Do NOT use filler text or "...".

{
  "radarData": [
    {"dimension": "Personality", "score": <0-100>, "fullMark": 100, "house": "<relevant house & planet>", "description": "<deep 200-300 words analysis>"},
    {"dimension": "Career", "score": <0-100>, "fullMark": 100, "house": "<10th house info>", "description": "<deep 200-300 words analysis>"},
    {"dimension": "Wealth", "score": <0-100>, "fullMark": 100, "house": "<2nd/8th house info>", "description": "<deep 200-300 words analysis>"},
    {"dimension": "Relationships", "score": <0-100>, "fullMark": 100, "house": "<7th house info>", "description": "<deep 200-300 words analysis>"},
    {"dimension": "Family", "score": <0-100>, "fullMark": 100, "house": "<4th house info>", "description": "<deep 200-300 words analysis>"},
    {"dimension": "Health", "score": <0-100>, "fullMark": 100, "house": "<6th house info>", "description": "<deep 200-300 words analysis>"},
    {"dimension": "Lucky Elements", "score": <0-100>, "fullMark": 100, "house": "<Jupiter/Node info>", "description": "<deep 200-300 words analysis>"}
  ],
  "destinyReading": {
    "structure": {
      "title": "<chart pattern name, e.g. 'Deep Earth Pattern with Hidden Fire'>",
      "element": "<dominant element analysis>",
      "description": "<deep 200-300 words analysis of the chart's fundamental architecture, referencing specific planet placements>",
      "coreChallenge": "<the user's core life challenge, traced to specific astrological configurations, 100-150 words>"
    },
    "phase": {
      "title": "<current life phase name>",
      "whyStuck": "<why the user may feel stuck right now, referencing current transits, 150-200 words>",
      "turningPoint": "<specific date or period when energy shifts, with astrological justification, 100 words>",
      "momentum": <1-100>
    },
    "advice": {
      "career": "<200-300 words with specific actionable advice based on 10th house, Sun, MC>",
      "relationships": "<200-300 words on love patterns, attachment style, and what kind of partner this chart calls for. Include a 'What Your Partner Needs to Know' sentence.>",
      "wealth": "<200-300 words including financial timing and strategy based on 2nd/8th house, Jupiter>",
      "health": "<200-300 words on health patterns based on 6th house, Mars, stress aspects>",
      "timing": "<200-300 words on the next 90-day critical window with specific dates and actions>"
    },
    "hiddenTalent": {
      "title": "<name of the hidden talent/gift>",
      "description": "<200-300 words explaining the untapped potential based on North Node, 12th house, retrograde planets>",
      "activationAdvice": "<specific steps to unlock this talent, 100-150 words>"
    },
    "coreInsights": [
      {"tag": "Core Pattern", "text": "<a deeply personal insight that makes the user feel truly understood, ~100 words>", "match": <85-98>},
      {"tag": "Hidden Gift", "text": "<insight about an ability they have but rarely acknowledge, ~100 words>", "match": <85-98>},
      {"tag": "Shadow Pattern", "text": "<a difficult truth about a self-sabotaging pattern, ~100 words>", "match": <85-98>},
      {"tag": "Strategic Edge", "text": "<their unique competitive advantage, ~100 words>", "match": <85-98>},
      {"tag": "Body Wisdom", "text": "<physical/health pattern insight, ~100 words>", "match": <85-98>}
    ],
    "cosmicQuote": "<a single powerful sentence that captures the user's cosmic essence — should feel like a revelation>"
  },
  "next30Days": {
    "theme": "<30-day theme>",
    "moonPhase": "<current moon phase>",
    "dos": ["<specific action 1>", "<specific action 2>", "<specific action 3>"],
    "donts": ["<specific warning 1>", "<specific warning 2>", "<specific warning 3>"]
  },
  "loveForecast": {
    "currentPhase": "<seeking|bonding|testing|deepening|releasing>",
    "nextWindow": "<Age/Year when Venus/7th house activates next>",
    "oneLineTease": "<One sentence love preview for result page, e.g. 'A meaningful connection forms when...'>"
  }
}

Output the JSON only, no explanation, no markdown code block.`;

    const parsed = await callGeminiJson(prompt);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Destiny Reading Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate destiny reading' },
      { status: 500 }
    );
  }
}
