import { NextResponse } from 'next/server';
import { getSignUser } from '@/shared/models/user';
import { getUserKlines } from '@/shared/models/kline';

export async function GET() {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const klines = await getUserKlines(user.id);
    return NextResponse.json({ success: true, data: klines });
  } catch (error: any) {
    console.error('KLine list error:', error);
    return NextResponse.json({ error: error.message || 'Failed to list KLines' }, { status: 500 });
  }
}
