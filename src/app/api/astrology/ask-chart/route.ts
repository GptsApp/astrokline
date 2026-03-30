import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/astrokline/gemini';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 5000,
    keyPrefix: 'ask-chart',
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { profile, question } = body;

    if (!profile?.sun || !question?.trim()) {
      return NextResponse.json(
        { error: 'Profile and question are required' },
        { status: 400 }
      );
    }

    const p = profile as UserProfile;
    const planetList = p.planets
      ?.map(pl => `${pl.name}: ${pl.sign} ${pl.degree}° (House ${pl.house})`)
      .join('\n  ') || '';

    const prompt = `You are AstroKline's personal astrology advisor. A user is asking you a personal question. Answer it using their birth chart data below.

## User's Birth Chart
Name: ${p.name}
Sun: ${p.sun.sign} ${p.sun.degree}° (House ${p.sun.house})
Moon: ${p.moon.sign} ${p.moon.degree}° (House ${p.moon.house})
Rising: ${p.rising.sign} ${p.rising.degree}° (House ${p.rising.house})
${planetList ? `Full Placements:\n  ${planetList}` : ''}
Elements: Fire ${p.elements.fire}% / Earth ${p.elements.earth}% / Air ${p.elements.air}% / Water ${p.elements.water}%

## User's Question
"${question}"

## Response Rules
1. Answer DIRECTLY and SPECIFICALLY — no generic advice
2. Reference specific placements from their chart as evidence
3. Be warm, wise, and practical — like a trusted older sister
4. Include a SPECIFIC timing recommendation if relevant
5. End with one concrete action step
6. Keep response under 300 words
7. Use second person ("You", "Your")
8. ALL RESPONSES MUST BE IN ENGLISH`;

    const answer = await callGemini(prompt, 2048);
    return NextResponse.json({ success: true, data: { answer } });
  } catch (error) {
    console.error('Ask chart error:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
