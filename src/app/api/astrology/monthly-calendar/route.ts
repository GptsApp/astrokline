import { NextRequest, NextResponse } from 'next/server';
import { callGeminiJson } from '@/lib/astrokline/gemini';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 10000,
    keyPrefix: 'monthly-calendar',
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { profile, year, month } = body;

    if (!profile?.sun) {
      return NextResponse.json({ error: 'Profile required' }, { status: 400 });
    }

    const p = profile as UserProfile;
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1, 1).toLocaleString('en', { month: 'long' });

    const prompt = `You are a practical astrology advisor. Based on this person's birth chart, generate a 30-day action calendar for ${monthName} ${year}.

## Birth Chart Data
Sun: ${p.sun.sign} (House ${p.sun.house})
Moon: ${p.moon.sign} (House ${p.moon.house})
Rising: ${p.rising.sign}
Elements: Fire ${p.elements.fire}% / Earth ${p.elements.earth}% / Air ${p.elements.air}% / Water ${p.elements.water}%

## Rules
- Generate exactly ${daysInMonth} days
- Each day: type (green=favorable/red=caution/neutral), a 1-sentence advice, max 2 do items, max 2 dont items
- Mark 3 KEY dates: best_action (green), rest_day (blue), caution_day (red)
- Be SPECIFIC and PRACTICAL, not generic
- ALL RESPONSES MUST BE IN ENGLISH

## Output Format
Return a JSON object:
{
  "monthTheme": "One sentence theme for the month",
  "keyDates": {
    "bestAction": { "day": 12, "reason": "..." },
    "restDay": { "day": 20, "reason": "..." },
    "cautionDay": { "day": 7, "reason": "..." }
  },
  "days": [
    {
      "day": 1,
      "type": "green",
      "advice": "Perfect day for...",
      "do": ["Start new projects", "Reach out to contacts"],
      "dont": ["Avoid impulsive spending"]
    }
  ]
}`;

    const result = await callGeminiJson<{
      monthTheme: string;
      keyDates: {
        bestAction: { day: number; reason: string };
        restDay: { day: number; reason: string };
        cautionDay: { day: number; reason: string };
      };
      days: Array<{
        day: number;
        type: 'green' | 'red' | 'neutral';
        advice: string;
        do: string[];
        dont: string[];
      }>;
    }>(prompt);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Monthly calendar error:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    );
  }
}
