import { NextResponse } from 'next/server';
import {
  calculateNatalChart,
  timeSlotToHourMinute,
  type BirthInput,
} from '@/lib/astrology/engine';
import { buildPersonalizedKlineTimeline } from '@/lib/astrokline/personalized-report';

import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

export async function POST(req: Request) {
  const limited = enforceMinIntervalRateLimit(req, {
    intervalMs: 3000,
    keyPrefix: 'natal-chart',
  });
  if (limited) {
    return limited;
  }

  try {
    const body = await req.json();
    const { year, month, day, timeSlot, timezone, latitude, longitude } = body;

    if (!year || !month || !day || !latitude || !longitude) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: year, month, day, latitude, longitude',
        },
        { status: 400 }
      );
    }

    // Parse time slot to hour/minute
    const { hour, minute } = timeSlotToHourMinute(timeSlot || 'unknown');

    const input: BirthInput = {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour,
      minute,
      timezone: Number(timezone) || 0,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    const chart = await calculateNatalChart(input);
    const reportData = buildPersonalizedKlineTimeline(
      chart,
      `${input.year.toString().padStart(4, '0')}-${input.month
        .toString()
        .padStart(2, '0')}-${input.day.toString().padStart(2, '0')}`
    );

    return NextResponse.json({ success: true, data: chart, reportData });
  } catch (error: any) {
    console.error('Natal Chart API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate natal chart' },
      { status: 500 }
    );
  }
}
