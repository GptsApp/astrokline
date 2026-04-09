import { NextRequest } from 'next/server';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';
import { db } from '@/core/db';
import { chat, chatMessage } from '@/config/db/schema';
import { eq, and, count, gte } from 'drizzle-orm';
import { getUserInfo } from '@/shared/models/user';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import {
  ASK_CHART_SYSTEM_PROMPT,
  callGeminiMultiTurn,
} from '@/lib/astrokline/gemini';

import {
  buildAskChartGeminiMessages,
  createAskChartTextResponse,
} from './route-helpers';

// ── Prompt Injection Detection ──
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /repeat\s+(your|the)\s+(system\s+)?prompt/i,
  /what\s+are\s+your\s+instructions/i,
  /show\s+me\s+your\s+(system\s+)?prompt/i,
  /act\s+as\s+(a\s+)?different\s+ai/i,
  /you\s+are\s+now\s+/i,
  /DAN\s+mode/i,
  /jailbreak/i,
  /reveal\s+your\s+(hidden|secret)/i,
];

function containsInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(text));
}

// ── Tier Quota Config ──
function getQuotaConfig(tier: string) {
  switch (tier) {
    case 'PREMIUM': return { max: Infinity, period: 'monthly' as const };
    case 'STANDARD': return { max: 3, period: 'monthly' as const };
    case 'FREE': return { max: 1, period: 'lifetime' as const };
    default: return { max: 0, period: 'lifetime' as const };
  }
}

// ── Build chart context ──
function buildChartContext(p: UserProfile): string {
  const planets = p.planets
    ?.map(pl => `${pl.name}: ${pl.sign} ${pl.degree}° (House ${pl.house})`)
    .join('\n  ') || '';
  return `[User's Birth Chart]
Sun: ${p.sun.sign} ${p.sun.degree}° (House ${p.sun.house})
Moon: ${p.moon.sign} ${p.moon.degree}° (House ${p.moon.house})
Rising: ${p.rising.sign} ${p.rising.degree}° (House ${p.rising.house})
${planets ? `Placements:\n  ${planets}` : ''}
Elements: Fire ${p.elements.fire}% / Earth ${p.elements.earth}% / Air ${p.elements.air}% / Water ${p.elements.water}%`;
}

export async function POST(request: NextRequest) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 3000,
    keyPrefix: 'ask-chart',
  });
  if (limited) return limited;

  const user = await getUserInfo();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Auth required' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json().catch(() => null);
  const clientMessages = Array.isArray(body?.messages) ? body.messages : [];
  const reqChatId = typeof body?.chatId === 'string' ? body.chatId : null;
  const profile = body?.profile && typeof body.profile === 'object'
    ? (body.profile as UserProfile)
    : null;

  // Extract latest user message
  const lastUserMsg = clientMessages
    ?.filter((m: any) => m.role === 'user')
    .pop();
  if (!lastUserMsg?.content?.trim()) {
    return new Response(JSON.stringify({ error: 'No message' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawQuestion = lastUserMsg.content.trim();
  const safeQuestion = containsInjection(rawQuestion)
    ? 'What does my birth chart reveal about my strengths?'
    : rawQuestion;

  // ── Quota check ──
  const tier = await getAstroUserTier(user);
  const quota = getQuotaConfig(tier);

  if (quota.max === 0) {
    return new Response(JSON.stringify({
      error: 'Subscription required',
      requiresUpgrade: true,
    }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  const database = db();

  if (quota.max !== Infinity) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const whereClause = quota.period === 'monthly'
      ? and(
          eq(chatMessage.userId, user.id),
          eq(chatMessage.role, 'user'),
          eq(chat.model, 'ask-chart'),
          gte(chatMessage.createdAt, monthStart)
        )
      : and(
          eq(chatMessage.userId, user.id),
          eq(chatMessage.role, 'user'),
          eq(chat.model, 'ask-chart')
        );

    const [result] = await database
      .select({ cnt: count() })
      .from(chatMessage)
      .innerJoin(chat, eq(chatMessage.chatId, chat.id))
      .where(whereClause);

    if ((result?.cnt ?? 0) >= quota.max) {
      return new Response(JSON.stringify({
        error: 'Limit reached',
        requiresUpgrade: true,
      }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // ── Resolve chat session ──
  let currentChatId = reqChatId;
  if (!currentChatId) {
    const newId = crypto.randomUUID();
    await database.insert(chat).values({
      id: newId,
      userId: user.id,
      status: 'active',
      model: 'ask-chart',
      provider: 'gemini',
      title: safeQuestion.slice(0, 80),
      parts: '[]',
      metadata: profile ? JSON.stringify({
        sunSign: profile.sun?.sign,
      }) : null,
    });
    currentChatId = newId;
  }

  // ── Build system prompt with chart data ──
  const chartContext = profile
    ? `\n\n${buildChartContext(profile)}`
    : '';
  const fullSystemPrompt = ASK_CHART_SYSTEM_PROMPT + chartContext;

  const aiMessages = buildAskChartGeminiMessages(clientMessages, safeQuestion);

  let replyText = '';
  try {
    replyText = await callGeminiMultiTurn(aiMessages, fullSystemPrompt, 2048);
  } catch (error) {
    console.error('Ask chart generation failed:', error);
    return Response.json({ error: 'AI service unavailable' }, { status: 502 });
  }

  if (!replyText.trim()) {
    console.error('Ask chart generation returned an empty response');
    return Response.json({ error: 'AI service unavailable' }, { status: 502 });
  }

  try {
    const db2 = db();
    await db2.insert(chatMessage).values([
      {
        id: crypto.randomUUID(),
        userId: user.id,
        chatId: currentChatId,
        status: 'active',
        role: 'user',
        parts: JSON.stringify([{ type: 'text', text: safeQuestion }]),
        model: 'ask-chart',
        provider: 'gemini',
      },
      {
        id: crypto.randomUUID(),
        userId: user.id,
        chatId: currentChatId,
        status: 'active',
        role: 'assistant',
        parts: JSON.stringify([{ type: 'text', text: replyText }]),
        model: 'ask-chart',
        provider: 'gemini',
      },
    ]);
  } catch (error) {
    console.error('Failed to save chat messages:', error);
  }

  return createAskChartTextResponse(replyText, currentChatId);
}
