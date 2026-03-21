import { NextResponse } from 'next/server';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';

import { getQuotaStatus } from '@/shared/models/kline-quota';
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
    const quota = await getQuotaStatus(user.id, userTier);

    return NextResponse.json({ success: true, data: { ...quota, userTier } });
  } catch (error: any) {
    console.error('KLine quota error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get quota' },
      { status: 500 }
    );
  }
}
