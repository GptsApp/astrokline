import { NextResponse } from 'next/server';

import { processReferral } from '@/shared/models/referral';
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

    const { referralCode } = await req.json();
    if (!referralCode) {
      return NextResponse.json(
        { error: 'referralCode is required' },
        { status: 400 }
      );
    }

    const processed = await processReferral(String(referralCode), user.id);

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    console.error('Referral process error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process referral' },
      { status: 500 }
    );
  }
}
