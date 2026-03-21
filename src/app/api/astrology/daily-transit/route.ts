import { NextResponse } from 'next/server';
import { callGeminiJson } from '@/lib/astrokline/gemini';

import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: Request) {
  const limited = enforceMinIntervalRateLimit(req, {
    intervalMs: 10000,
    keyPrefix: 'daily-transit',
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

    const currentYear = new Date().getFullYear();

    const prompt = `You are an elite, highly logical astrological calculation engine with a Cyber-Occult aesthetic.
Analyze the following natal chart profile and calculate the most critical planetary transits for year ${currentYear}.

User Profile:
Name: ${profile.name}
Sun: ${profile.sun?.sign} ${profile.sun?.degree}° (House ${profile.sun?.house})
Moon: ${profile.moon?.sign} ${profile.moon?.degree}° (House ${profile.moon?.house})
Rising: ${profile.rising?.sign} ${profile.rising?.degree}°

Planetary Placements:
${profile.planets?.map((p: any) => `- ${p.name}: ${p.sign} ${p.degree}° (House ${p.house})`).join('\n')}

Generate 1 to 3 MAJOR transit events currently active for this user.
Identify what heavy outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) are hitting their sensitive natal spots.

Output ONLY valid JSON matching this exact structure. All values must be filled with real analysis. Do NOT use placeholder text.

The JSON structure must be:
- transits: array of 1-3 objects, each with keys:
  - id: string like "t-${currentYear}-1"
  - year: number (${currentYear})
  - title: string (catchy cyber-occult title)
  - theme: string (one of: "Career", "Love", "Wealth", "Growth")
  - description: string (how this transit creates specific circumstances)
  - impactScore: number 1-10
  - planet: string (the transiting planet name)
  - aspect: string (one of: "Square", "Trine", "Conjunction", "Opposition", "Sextile")
  - advice: string (actionable strategic advice)

Output the JSON only, no explanation, no markdown code block.`;

    const parsed = await callGeminiJson(prompt);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Daily Transit Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate daily transit' },
      { status: 500 }
    );
  }
}
