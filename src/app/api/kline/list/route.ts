import { NextResponse } from 'next/server';
import { enrichStoredKlineResult } from '@/lib/astrokline/stored-kline-result';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getUserKlines } from '@/shared/models/kline';
import { getSignUser } from '@/shared/models/user';

export async function GET() {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userTier = await getAstroUserTier(user);
    const klines = await getUserKlines(user.id);
    const enrichedKlines = klines.map((kline) => ({
      ...kline,
      klineResult: enrichStoredKlineResult(
        kline.klineResult as any,
        {
          name: kline.label || 'Unknown',
          date: kline.birthDate,
          timeSlot: kline.birthTime || 'unknown',
          location: kline.birthPlace,
          lat: kline.birthLat,
          lon: kline.birthLng,
        },
        userTier
      ),
    }));

    return NextResponse.json({ success: true, data: enrichedKlines });
  } catch (error: any) {
    console.error('KLine list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list KLines' },
      { status: 500 }
    );
  }
}
