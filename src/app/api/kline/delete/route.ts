import { NextResponse } from 'next/server';

import { deleteKline } from '@/shared/models/kline';
import { getSignUser } from '@/shared/models/user';

export async function DELETE(req: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const klineId = searchParams.get('id');

    if (!klineId) {
      return NextResponse.json(
        { error: 'KLine id is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteKline(user.id, klineId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Cannot delete this KLine (not found or is your own chart)' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('KLine delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete KLine' },
      { status: 500 }
    );
  }
}
