import { NextResponse } from 'next/server';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { enrichStoredKlineResult } from '@/lib/astrokline/stored-kline-result';

import { klineExists, saveKline } from '@/shared/models/kline';
import { checkQuota, consumeQuota } from '@/shared/models/kline-quota';
import { getSignUser } from '@/shared/models/user';

export async function POST(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      isSelf,
      label,
      birthDate,
      birthTime,
      birthPlace,
      birthLat,
      birthLng,
      klineResult,
    } = body;

    if (!birthDate || !birthPlace) {
      return NextResponse.json(
        { error: 'birthDate and birthPlace are required' },
        { status: 400 }
      );
    }

    const userTier = await getAstroUserTier(user);

    // If not self, check if already exists (no quota consumed for duplicates)
    if (!isSelf) {
      const exists = await klineExists(
        user.id,
        birthDate,
        birthTime || null,
        birthPlace
      );
      if (!exists) {
        // Check quota
        const quota = await checkQuota(user.id, userTier);
        if (!quota.hasQuota) {
          return NextResponse.json(
            {
              error: 'Quota exceeded',
              quota,
            },
            { status: 403 }
          );
        }
        // Consume quota
        await consumeQuota(user.id, userTier);
      }
    }

    const enrichedKlineResult = enrichStoredKlineResult(
      klineResult,
      {
        name: label || (isSelf ? 'Me' : 'Unknown'),
        date: birthDate,
        timeSlot: birthTime || 'unknown',
        location: birthPlace,
        lat: birthLat,
        lon: birthLng,
      },
      userTier
    );

    const kline = await saveKline(user.id, {
      isSelf: isSelf ?? false,
      label: label || (isSelf ? 'Me' : 'Unknown'),
      birthDate,
      birthTime,
      birthPlace,
      birthLat,
      birthLng,
      klineResult: enrichedKlineResult,
    });

    return NextResponse.json({ success: true, data: kline });
  } catch (error: any) {
    console.error('KLine save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save KLine' },
      { status: 500 }
    );
  }
}
