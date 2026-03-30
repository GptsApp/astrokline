import { NextRequest, NextResponse } from 'next/server';
import { generateSynergyReading } from '@/lib/astrokline/gemini';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 10000,
    keyPrefix: 'synastry',
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { profileA, profileB } = body;

    if (!profileA?.sun || !profileB?.sun) {
      return NextResponse.json(
        { error: 'Both profiles must include sun/moon/rising data' },
        { status: 400 }
      );
    }

    const result = await generateSynergyReading(
      profileA as UserProfile,
      profileB as UserProfile
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Synastry API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate synastry reading' },
      { status: 500 }
    );
  }
}
