import { NextResponse } from 'next/server';
import { getSignUser } from '@/shared/models/user';
import { getQuotaStatus } from '@/shared/models/kline-quota';

export async function GET() {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userTier = (user as any).plan || 'FREE';
    const quota = await getQuotaStatus(user.id, userTier);

    return NextResponse.json({ success: true, data: { ...quota, userTier } });
  } catch (error: any) {
    console.error('KLine quota error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get quota' }, { status: 500 });
  }
}
