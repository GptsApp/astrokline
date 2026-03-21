import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalityInsight } from '@/lib/astrokline/gemini';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';

import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 5000,
    keyPrefix: 'ai-insight',
  });
  if (limited) {
    return limited;
  }

  try {
    const body = await request.json();
    const profile = body.profile as UserProfile;

    if (!profile || !profile.sun || !profile.moon || !profile.rising) {
      return NextResponse.json(
        { error: 'Invalid profile data' },
        { status: 400 }
      );
    }

    const insight = await generatePersonalityInsight(profile);
    return NextResponse.json(insight);
  } catch (error) {
    console.error('AI insight error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
