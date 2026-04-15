import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { AiInsightData } from '@/lib/astrokline/ai-insight-cache';
import { getUserKlineById, updateKlineResult } from '@/shared/models/kline';
import { getSignUser } from '@/shared/models/user';

const aiInsightSchema = z
  .object({
    nickname: z.string().optional(),
    coreQuote: z.string().optional(),
    summary: z.string().optional(),
    career: z.string().optional(),
    wealth: z.string().optional(),
    relationships: z.string().optional(),
    love: z.string().optional(),
    health: z.string().optional(),
    strengths: z.string().optional(),
    warnings: z.string().optional(),
    shadow: z.string().optional(),
    dashaTimeline: z.string().optional(),
    marriage: z.string().optional(),
    karma: z.string().optional(),
    family: z.string().optional(),
    children: z.string().optional(),
    spirituality: z.string().optional(),
    education: z.string().optional(),
    authority: z.string().optional(),
    lifestyle: z.string().optional(),
    hiddenDangers: z.string().optional(),
  })
  .passthrough();

const requestSchema = z.object({
  klineId: z.string().min(1),
  insight: aiInsightSchema,
});

export async function POST(request: Request) {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid AI insight payload' },
        { status: 400 }
      );
    }

    const kline = await getUserKlineById(user.id, parsed.data.klineId);
    if (!kline) {
      return NextResponse.json({ error: 'Kline not found' }, { status: 404 });
    }

    const existingResult =
      typeof kline.klineResult === 'string'
        ? JSON.parse(kline.klineResult)
        : (kline.klineResult ?? {});

    const nextInsight: AiInsightData = {
      ...((existingResult as { aiInsight?: AiInsightData }).aiInsight ?? {}),
      ...parsed.data.insight,
    };

    const updated = await updateKlineResult(user.id, kline.id, {
      ...existingResult,
      klineId: kline.id,
      aiInsight: nextInsight,
    });

    return NextResponse.json({
      success: true,
      data: {
        klineId: updated?.id ?? kline.id,
        aiInsight: nextInsight,
      },
    });
  } catch (error: any) {
    console.error('Persist AI insight error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to persist AI insight' },
      { status: 500 }
    );
  }
}