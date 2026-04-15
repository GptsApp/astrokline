import { NextResponse } from 'next/server';
import {
  generateKeyYearInsights,
  type KeyYearInput,
  type KeyYearInsight,
} from '@/lib/astrokline/gemini';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { getServerCacheKey } from '@/lib/astrokline/ai-insight-cache';
import { getSignUser } from '@/shared/models/user';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';

const CACHE_TTL = 90 * 24 * 60 * 60; // 90 days
const pendingKeyYearInsightRequests = new Map<string, Promise<KeyYearInsight[]>>();

function logActionEvent(event: string, payload: Record<string, unknown>) {
  console.log(JSON.stringify({
    type: 'kline_action_event',
    event,
    at: new Date().toISOString(),
    ...payload,
  }));
}

async function getD1(): Promise<any | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext() as { env: { DB?: any } };
    return env?.DB ?? null;
  } catch { return null; }
}

export async function POST(request: Request) {
  const user = await getSignUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const tier = await getAstroUserTier(user);
  if (tier === 'FREE') {
    return NextResponse.json({ error: 'Requires subscription' }, { status: 403 });
  }

  try {
    const startedAt = Date.now();
    const { profile, keyYears, locale } = await request.json() as {
      profile: UserProfile;
      keyYears: KeyYearInput[];
      locale?: string;
    };

    if (!profile || !keyYears?.length) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const years = keyYears.slice(0, 10);
    const profileKey = await getServerCacheKey(profile);
    const cacheKey = `ky-${locale || 'en'}-${profileKey}-${years.map(y => y.year).join(',')}`;

    logActionEvent('kline_action_request_started', {
      userId: user.id,
      locale: locale || 'en',
      cacheKey,
      years: years.map((item) => item.year),
    });

    // Check D1 cache
    const db = await getD1();
    if (db) {
      try {
        await db.prepare(`CREATE TABLE IF NOT EXISTS ai_insight_cache (
          cache_key TEXT PRIMARY KEY, data TEXT NOT NULL,
          created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
        )`).run();
        const row = await db.prepare(
          'SELECT data FROM ai_insight_cache WHERE cache_key = ? AND expires_at > ?'
        ).bind(cacheKey, Math.floor(Date.now() / 1000)).first();
        if (row?.data) {
          logActionEvent('kline_cache_hit', {
            userId: user.id,
            locale: locale || 'en',
            cacheKey,
            phase: 'action',
          });
          return NextResponse.json({ insights: JSON.parse(row.data), _cached: true });
        }
      } catch {}
    }

    logActionEvent('kline_cache_miss', {
      userId: user.id,
      locale: locale || 'en',
      cacheKey,
      phase: 'action',
    });

    let insightsPromise = pendingKeyYearInsightRequests.get(cacheKey);

    if (!insightsPromise) {
      insightsPromise = (async () => {
        const insights = await generateKeyYearInsights(profile, years);

        if (db && insights.length > 0) {
          const now = Math.floor(Date.now() / 1000);
          db.prepare(
            'INSERT OR REPLACE INTO ai_insight_cache (cache_key, data, created_at, expires_at) VALUES (?, ?, ?, ?)'
          ).bind(cacheKey, JSON.stringify(insights), now, now + CACHE_TTL).run().catch(() => {});
        }

        return insights;
      })();

      pendingKeyYearInsightRequests.set(cacheKey, insightsPromise);
      insightsPromise.finally(() => {
        pendingKeyYearInsightRequests.delete(cacheKey);
      });
    }

    const insights = await insightsPromise;

    logActionEvent('kline_action_request_completed', {
      userId: user.id,
      locale: locale || 'en',
      cacheKey,
      years: insights.map((item) => item.year),
      latencyMs: Date.now() - startedAt,
    });

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('Key year insights error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
