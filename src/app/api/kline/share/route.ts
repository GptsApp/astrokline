import { NextResponse } from 'next/server';
import { getSignUser } from '@/shared/models/user';
import { generateShareToken, toggleKlinePublic } from '@/shared/models/kline';

export async function POST(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { klineId, action } = await req.json();
    if (!klineId) {
      return NextResponse.json({ error: 'klineId is required' }, { status: 400 });
    }

    if (action === 'disable') {
      const success = await toggleKlinePublic(user.id, klineId, false);
      return NextResponse.json({ success });
    }

    // Default: generate/enable share
    const token = await generateShareToken(user.id, klineId);
    if (!token) {
      return NextResponse.json({ error: 'KLine not found' }, { status: 404 });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://astrokline.com'}/share/${token}`;
    return NextResponse.json({ success: true, data: { token, shareUrl } });
  } catch (error: any) {
    console.error('Share error:', error);
    return NextResponse.json({ error: error.message || 'Share failed' }, { status: 500 });
  }
}
