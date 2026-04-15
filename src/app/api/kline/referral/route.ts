import { NextResponse } from 'next/server';

import {
  getOrCreateReferralCode,
  getReferralStats,
} from '@/shared/models/referral';
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

    const code = await getOrCreateReferralCode(user.id);
    const stats = await getReferralStats(user.id);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.astrocurve.net'}/?ref=${code}`;

    return NextResponse.json({
      success: true,
      data: {
        referralCode: code,
        shareUrl,
        totalReferred: stats.totalReferred,
        bonusQuota: stats.bonusQuota,
      },
    });
  } catch (error: any) {
    console.error('Referral error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed' },
      { status: 500 }
    );
  }
}
