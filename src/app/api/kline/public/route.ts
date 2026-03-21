import { NextResponse } from 'next/server';
import { getKlineByShareToken } from '@/shared/models/kline';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
    }

    const kline = await getKlineByShareToken(token);
    if (!kline) {
      return NextResponse.json({ error: 'Chart not found or no longer shared' }, { status: 404 });
    }

    // Return only safe public data (no userId, no private fields)
    const result = kline.klineResult as any;
    return NextResponse.json({
      success: true,
      data: {
        label: kline.label,
        profile: result?.profile || null,
        radarData: result?.radarData || null,
        createdAt: kline.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Public view error:', error);
    return NextResponse.json({ error: 'Failed to load chart' }, { status: 500 });
  }
}
