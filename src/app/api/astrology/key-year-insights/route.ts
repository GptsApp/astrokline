import { NextResponse } from 'next/server';
import { generateKeyYearInsights, type KeyYearInput } from '@/lib/astrokline/gemini';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { getServerCacheKey } from '@/lib/astrokline/ai-insight-cache';
import { getSignUser } from '@/shared/models/user';

const CACHE_TTL = 90 * 24 * 60 * 60; // 90 days

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

  try {
    const { profile, keyYears } = await request.json() as {
      profile: UserProfile;
      keyYears: KeyYearInput[];
    };

    if (!profile || !keyYears?.length) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const years = keyYears.slice(0, 10);
    const profileKey = await getServerCacheKey(profile);
    const cacheKey = `ky-${profileKey}-${years.map(y => y.year).join(',')}`;

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
          return NextResponse.json({ insights: JSON.parse(row.data), _cached: true });
        }
      } catch {}
    }

    const insights = await generateKeyYearInsights(profile, years);

    // Cache
    if (db && insights.length > 0) {
      const now = Math.floor(Date.now() / 1000);
      db.prepare(
        'INSERT OR REPLACE INTO ai_insight_cache (cache_key, data, created_at, expires_at) VALUES (?, ?, ?, ?)'
      ).bind(cacheKey, JSON.stringify(insights), now, now + CACHE_TTL).run().catch(() => {});
    }

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('Key year insights error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
