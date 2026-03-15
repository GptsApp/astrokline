import { NextResponse } from 'next/server';
import { getSignUser } from '@/shared/models/user';
import { saveKline, klineExists } from '@/shared/models/kline';
import { checkQuota, consumeQuota } from '@/shared/models/kline-quota';

export async function POST(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { isSelf, label, birthDate, birthTime, birthPlace, birthLat, birthLng, klineResult } = body;

    if (!birthDate || !birthPlace) {
      return NextResponse.json({ error: 'birthDate and birthPlace are required' }, { status: 400 });
    }

    // If not self, check if already exists (no quota consumed for duplicates)
    if (!isSelf) {
      const exists = await klineExists(user.id, birthDate, birthTime || null, birthPlace);
      if (!exists) {
        // Check quota
        const userTier = (user as any).plan || 'FREE';
        const quota = await checkQuota(user.id, userTier);
        if (!quota.hasQuota) {
          return NextResponse.json({
            error: 'Quota exceeded',
            quota,
          }, { status: 403 });
        }
        // Consume quota
        await consumeQuota(user.id, userTier);
      }
    }

    const kline = await saveKline(user.id, {
      isSelf: isSelf ?? false,
      label: label || (isSelf ? '我' : 'Unknown'),
      birthDate,
      birthTime,
      birthPlace,
      birthLat,
      birthLng,
      klineResult,
    });

    return NextResponse.json({ success: true, data: kline });
  } catch (error: any) {
    console.error('KLine save error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save KLine' }, { status: 500 });
  }
}
