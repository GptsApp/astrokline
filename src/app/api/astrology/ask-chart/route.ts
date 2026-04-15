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
  openGeminiMultiTurnStream,
} from '@/lib/astrokline/gemini';

import {
  buildAskChartGeminiMessages,
  buildAskChartFallbackResponse,
  createAskChartTextResponse,
  createAskChartTextStreamResponse,
  extractGeminiTextFromStreamEvent,
  formatProfileForAskChartPrompt,
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
    case 'FREE': return { max: 0, period: 'lifetime' as const };
    default: return { max: 0, period: 'lifetime' as const };
  }
}

function normalizeAskChartContext(rawContext: unknown) {
  if (!rawContext || typeof rawContext !== 'object') {
    return null;
  }

  const context = rawContext as Record<string, unknown>;
  const sourceType = typeof context.sourceType === 'string' ? context.sourceType : null;
  const sourceKey = typeof context.sourceKey === 'string' ? context.sourceKey : null;

  if (!sourceType || !sourceKey) {
    return null;
  }

  const selectedYear = typeof context.selectedYear === 'number' ? context.selectedYear : undefined;
  const promptLabel = typeof context.promptLabel === 'string' ? context.promptLabel : undefined;
  const promptText = typeof context.promptText === 'string' ? context.promptText : undefined;
  const contextSnippet = typeof context.contextSnippet === 'string' ? context.contextSnippet : undefined;

  return {
    sourceType,
    sourceKey,
    selectedYear,
    promptLabel,
    promptText,
    contextSnippet,
  };
}

function parseChatMetadata(rawMetadata: unknown) {
  if (typeof rawMetadata !== 'string' || !rawMetadata.trim()) {
    return {} as Record<string, unknown>;
  }

  try {
    const parsed = JSON.parse(rawMetadata);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {} as Record<string, unknown>;
  }
}

function buildAskChartThreadTitle(
  context: ReturnType<typeof normalizeAskChartContext>,
  fallbackQuestion: string,
  existingTitle?: unknown
) {
  const safeExistingTitle =
    typeof existingTitle === 'string' && existingTitle.trim()
      ? existingTitle.trim()
      : null;

  if (context?.sourceType === 'answer' && safeExistingTitle) {
    return safeExistingTitle;
  }

  if (context?.promptLabel) {
    return context.selectedYear
      ? `${context.promptLabel} · ${context.selectedYear}`
      : context.promptLabel;
  }

  if (context?.sourceType === 'year' && context.selectedYear) {
    return `Year ${context.selectedYear}`;
  }

  return safeExistingTitle ?? fallbackQuestion.slice(0, 80);
}

function buildAskChartThreadTheme(
  context: ReturnType<typeof normalizeAskChartContext>,
  existingTheme?: unknown
) {
  const safeExistingTheme =
    typeof existingTheme === 'string' && existingTheme.trim()
      ? existingTheme.trim()
      : null;

  if (context?.sourceType === 'answer' && safeExistingTheme) {
    return safeExistingTheme;
  }

  if (context?.promptLabel) {
    return context.selectedYear
      ? `${context.promptLabel} · ${context.selectedYear}`
      : context.promptLabel;
  }

  if (context?.sourceType === 'year' && context.selectedYear) {
    return `Year ${context.selectedYear}`;
  }

  return safeExistingTheme;
}

async function persistAskChartMessages(
  chatId: string,
  userId: string,
  safeQuestion: string,
  replyText: string
) {
  try {
    const database = db();
    await database.insert(chatMessage).values([
      {
        id: crypto.randomUUID(),
        userId,
        chatId,
        status: 'active',
        role: 'user',
        parts: JSON.stringify([{ type: 'text', text: safeQuestion }]),
        model: 'ask-chart',
        provider: 'gemini',
      },
      {
        id: crypto.randomUUID(),
        userId,
        chatId,
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
  const askChartContext = normalizeAskChartContext(body?.context);
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
  let existingChatMetadata: Record<string, unknown> = {};
  let storedActiveContext: ReturnType<typeof normalizeAskChartContext> = null;

  if (currentChatId) {
    const existingChats = await database
      .select({ id: chat.id, metadata: chat.metadata })
      .from(chat)
      .where(and(eq(chat.id, currentChatId), eq(chat.userId, user.id)))
      .limit(1);

    const existingChat = existingChats[0];

    if (existingChat) {
      existingChatMetadata = parseChatMetadata(existingChat.metadata);
      storedActiveContext = normalizeAskChartContext(
        existingChatMetadata.activeContext ?? existingChatMetadata.askContext
      );
    } else {
      currentChatId = null;
    }
  }

  const effectiveAskChartContext = askChartContext?.sourceType === 'answer'
    ? storedActiveContext ?? askChartContext
    : askChartContext ?? storedActiveContext;

  const nextThreadTitle = buildAskChartThreadTitle(
    effectiveAskChartContext,
    safeQuestion,
    existingChatMetadata.threadTitle ?? existingChatMetadata.title
  );
  const nextThreadTheme = buildAskChartThreadTheme(
    effectiveAskChartContext,
    existingChatMetadata.threadTheme
  );
  const nextChartLabel =
    profile?.name?.trim() ||
    (typeof existingChatMetadata.chartLabel === 'string'
      ? existingChatMetadata.chartLabel
      : undefined);

  const nextChatMetadata = {
    ...existingChatMetadata,
    sunSign: profile?.sun?.sign ?? existingChatMetadata.sunSign,
    chartLabel: nextChartLabel,
    threadTitle: nextThreadTitle,
    threadTheme: nextThreadTheme,
    askContext: effectiveAskChartContext,
    activeContext: askChartContext && askChartContext.sourceType !== 'answer'
      ? askChartContext
      : effectiveAskChartContext,
    lastUserQuestion: safeQuestion,
    lastUpdatedAt: new Date().toISOString(),
  };

  if (!currentChatId) {
    const newId = crypto.randomUUID();
    await database.insert(chat).values({
      id: newId,
      userId: user.id,
      status: 'active',
      model: 'ask-chart',
      provider: 'gemini',
      title: nextThreadTitle,
      parts: '[]',
      metadata: JSON.stringify(nextChatMetadata),
    });
    currentChatId = newId;
  } else {
    await database
      .update(chat)
      .set({
        title: nextThreadTitle,
        metadata: JSON.stringify(nextChatMetadata),
      })
      .where(and(eq(chat.id, currentChatId), eq(chat.userId, user.id)));
  }

  // ── Build system prompt with chart data ──
  const chartContext = profile
    ? `\n\n${formatProfileForAskChartPrompt(profile)}`
    : '';
  const fullSystemPrompt = ASK_CHART_SYSTEM_PROMPT + chartContext;

  const aiMessages = buildAskChartGeminiMessages(clientMessages, safeQuestion, effectiveAskChartContext);

  try {
    const upstreamResponse = await openGeminiMultiTurnStream(aiMessages, fullSystemPrompt, 768, undefined, 0);
    if (!upstreamResponse.body) {
      throw new Error('Gemini stream body is missing');
    }

    const upstreamReader = upstreamResponse.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';
    let replyText = '';

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const emitEventText = (eventBlock: string) => {
          const eventData = eventBlock
            .split(/\r?\n/)
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trimStart())
            .join('\n');
          const nextText = extractGeminiTextFromStreamEvent(eventData);
          if (!nextText) {
            return;
          }

          const deltaText = nextText.startsWith(replyText)
            ? nextText.slice(replyText.length)
            : nextText;

          if (!deltaText) {
            return;
          }

          replyText += deltaText;
          controller.enqueue(encoder.encode(deltaText));
        };

        try {
          while (true) {
            const { done, value } = await upstreamReader.read();

            if (value) {
              buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');
            }

            let separatorIndex = buffer.indexOf('\n\n');
            while (separatorIndex !== -1) {
              const eventBlock = buffer.slice(0, separatorIndex);
              buffer = buffer.slice(separatorIndex + 2);
              emitEventText(eventBlock);
              separatorIndex = buffer.indexOf('\n\n');
            }

            if (done) {
              break;
            }
          }

          const remainingEvent = buffer.trim();
          if (remainingEvent) {
            emitEventText(remainingEvent);
          }

          if (!replyText.trim()) {
            const fallbackText = buildAskChartFallbackResponse(profile, safeQuestion);
            replyText = fallbackText;
            controller.enqueue(encoder.encode(fallbackText));
          }

          controller.close();
        } catch (error) {
          console.error('Ask chart stream failed:', error);
          if (!replyText.trim()) {
            const fallbackText = buildAskChartFallbackResponse(profile, safeQuestion);
            replyText = fallbackText;
            controller.enqueue(encoder.encode(fallbackText));
          }
          controller.close();
        } finally {
          upstreamReader.releaseLock();
          await persistAskChartMessages(currentChatId, user.id, safeQuestion, replyText);
        }
      },
    });

    return createAskChartTextStreamResponse(stream, currentChatId);
  } catch (error) {
    console.error('Ask chart generation failed:', error);
    const replyText = buildAskChartFallbackResponse(profile, safeQuestion);
    await persistAskChartMessages(currentChatId, user.id, safeQuestion, replyText);
    return createAskChartTextResponse(replyText, currentChatId);
  }
}
