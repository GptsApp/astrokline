import { NextResponse } from 'next/server';
import { callGeminiJson } from '@/lib/astrokline/gemini';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { profile } = await req.json();

    if (!profile || !profile.name || !profile.planets) {
      return NextResponse.json({ error: "Missing user profile data" }, { status: 400 });
    }

    const planetList = profile.planets?.map((p: any) => `- ${p.name}: ${p.sign} ${p.degree}° (House ${p.house})`).join('\n') || '';

    const prompt = `You are an elite professional astrologer with 20 years of experience, analyzing a real natal chart computed by Swiss Ephemeris DE431.
Your analysis must be shockingly accurate — the user should feel "this really understands me."
Use the "film production" metaphor: planets = actors, signs = performance styles, houses = sets, aspects = actor interactions.

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

## Analysis Requirements
Analyze this chart from these frameworks (based on professional astrology methodology):

1. **Foundation Analysis**: Identify the dominant pattern — is this a Bundle, Bucket, Locomotive, Splay, or See-Saw chart? What does the energy concentration in specific houses tell us?
2. **Core Three Interaction**: Don't analyze Sun/Moon/Rising individually — analyze how they interact. What internal tensions or synergies exist between the actor (Sun), their emotional script (Moon), and their costume/mask (Rising)?
3. **Career & Life Path**: Analyze 10th House cusp sign, any planets in 10th, ruler of 10th house placement, Sun aspects — what career archetype emerges?
4. **Relationships & Emotional Patterns**: Analyze 7th House, Venus sign/house/aspects, Moon sign/house — what attachment style and relationship pattern is encoded?
5. **Wealth Strategy**: Analyze 2nd House (earned income), 8th House (shared resources), Jupiter placement and aspects — what is the optimal wealth-building strategy?
6. **Health & Energy**: Analyze 6th House, Mars placement, any stress aspects (hard aspects to personal planets) — what physical/mental health patterns to watch?
7. **Hidden Talents & Blind Spots**: Analyze North/South Nodes, any retrograde planets, 12th House contents — what hidden gifts are untapped?
8. **Timing**: Based on current outer planet transits to natal positions, when is the next major opportunity window? When to be cautious?

## Output Format
Return ONLY valid JSON matching this structure. All values must contain REAL personalized analysis based on this specific chart. Each text field should be 2-4 sentences minimum. Do NOT use filler text or "...".

{
  "radarData": [
    {"dimension": "Personality", "score": <0-100>, "fullMark": 100, "house": "<relevant house & planet>", "description": "<2-3 sentence analysis>"},
    {"dimension": "Career", "score": <0-100>, "fullMark": 100, "house": "<10th house info>", "description": "<2-3 sentence analysis>"},
    {"dimension": "Wealth", "score": <0-100>, "fullMark": 100, "house": "<2nd/8th house info>", "description": "<2-3 sentence analysis>"},
    {"dimension": "Relationships", "score": <0-100>, "fullMark": 100, "house": "<7th house info>", "description": "<2-3 sentence analysis>"},
    {"dimension": "Family", "score": <0-100>, "fullMark": 100, "house": "<4th house info>", "description": "<2-3 sentence analysis>"},
    {"dimension": "Health", "score": <0-100>, "fullMark": 100, "house": "<6th house info>", "description": "<2-3 sentence analysis>"},
    {"dimension": "Lucky Elements", "score": <0-100>, "fullMark": 100, "house": "<Jupiter/Node info>", "description": "<2-3 sentence analysis>"}
  ],
  "destinyReading": {
    "structure": {
      "title": "<chart pattern name, e.g. 'Deep Earth Pattern with Hidden Fire'>",
      "element": "<dominant element analysis>",
      "description": "<3-4 paragraph deep analysis of the chart's fundamental architecture, referencing specific planet placements>",
      "coreChallenge": "<the user's core life challenge, traced to specific astrological configurations>"
    },
    "phase": {
      "title": "<current life phase name>",
      "whyStuck": "<why the user may feel stuck right now, referencing current transits to their natal chart>",
      "turningPoint": "<specific date or period when energy shifts, with astrological justification>",
      "momentum": <1-100>
    },
    "advice": {
      "career": "<3-4 sentences with specific actionable advice based on 10th house, Sun, MC>",
      "wealth": "<3-4 sentences including investment timing and strategy based on 2nd/8th house, Jupiter>",
      "relationships": "<3-4 sentences on relationship dynamics based on 7th house, Venus, Moon>",
      "health": "<3-4 sentences on health patterns based on 6th house, Mars, stress aspects>",
      "timing": "<3-4 sentences on the next 90-day critical window with specific dates and actions>"
    },
    "hiddenTalent": {
      "title": "<name of the hidden talent/gift>",
      "description": "<3-4 sentences explaining the untapped potential based on North Node, 12th house, retrograde planets>",
      "activationAdvice": "<specific steps to unlock this talent>"
    },
    "coreInsights": [
      {"tag": "Core Pattern", "text": "<a deeply personal insight that makes the user feel truly understood, 2-3 sentences>", "match": <85-98>},
      {"tag": "Hidden Gift", "text": "<insight about an ability they have but rarely acknowledge, 2-3 sentences>", "match": <85-98>},
      {"tag": "Shadow Pattern", "text": "<a difficult truth about a self-sabotaging pattern, 2-3 sentences>", "match": <85-98>},
      {"tag": "Strategic Edge", "text": "<their unique competitive advantage, 2-3 sentences>", "match": <85-98>},
      {"tag": "Body Wisdom", "text": "<physical/health pattern insight, 2-3 sentences>", "match": <85-98>}
    ],
    "cosmicQuote": "<a single powerful sentence that captures the user's cosmic essence — should feel like a revelation>"
  },
  "next30Days": {
    "theme": "<30-day theme>",
    "moonPhase": "<current moon phase>",
    "dos": ["<specific action 1>", "<specific action 2>", "<specific action 3>"],
    "donts": ["<specific warning 1>", "<specific warning 2>", "<specific warning 3>"]
  }
}

Output the JSON only, no explanation, no markdown code block.`;

    const parsed = await callGeminiJson(prompt);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Destiny Reading Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate destiny reading" }, { status: 500 });
  }
}
