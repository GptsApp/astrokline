import { NextResponse } from 'next/server';
import { getSignUser } from '@/shared/models/user';
import { saveKline } from '@/shared/models/kline';

export async function POST(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { birthData, klineResult } = body;

    if (!birthData?.date || !birthData?.location) {
      return NextResponse.json({ error: 'birthData with date and location required' }, { status: 400 });
    }

    // Save as user's own chart (isSelf=true), no quota consumed for self
    const kline = await saveKline(user.id, {
      isSelf: true,
      label: birthData.name || 'Me',
      birthDate: birthData.date,
      birthTime: birthData.timeSlot || null,
      birthPlace: birthData.location,
      birthLat: birthData.lat ? String(birthData.lat) : undefined,
      birthLng: birthData.lon ? String(birthData.lon) : undefined,
      klineResult: klineResult || null,
    });

    return NextResponse.json({ success: true, data: kline });
  } catch (error: any) {
    console.error('KLine migrate error:', error);
    return NextResponse.json({ error: error.message || 'Migration failed' }, { status: 500 });
  }
}
