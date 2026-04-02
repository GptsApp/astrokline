import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalityInsight } from '@/lib/astrokline/gemini';
import { getServerCacheKey } from '@/lib/astrokline/ai-insight-cache';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

// D1 cache TTL: 30 days in seconds
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Try to get D1 binding from Cloudflare context.
 * Returns null in local dev or if not available.
 */
async function getD1(): Promise<any | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext() as { env: { DB?: any } };
    return env?.DB ?? null;
  } catch {
    return null;
  }
}

/**
 * Ensure the cache table exists (idempotent).
 */
async function ensureCacheTable(db: any): Promise<void> {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_insight_cache (
        cache_key TEXT PRIMARY KEY,
        insight_json TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        expires_at INTEGER NOT NULL
      )
    `).run();
  } catch {
    // Table might already exist or DB is read-only — skip silently
  }
}

/**
 * Read from D1 cache.
 */
async function readCache(db: any, key: string): Promise<any | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const row = await db
      .prepare('SELECT insight_json FROM ai_insight_cache WHERE cache_key = ? AND expires_at > ?')
      .bind(key, now)
      .first();
    if (row?.insight_json) {
      return JSON.parse(row.insight_json);
    }
  } catch {
    // Cache miss or DB error — fall through to Gemini
  }
  return null;
}

/**
 * Write to D1 cache.
 */
async function writeCache(db: any, key: string, data: any): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + CACHE_TTL_SECONDS;
    await db
      .prepare(
        'INSERT OR REPLACE INTO ai_insight_cache (cache_key, insight_json, created_at, expires_at) VALUES (?, ?, ?, ?)'
      )
      .bind(key, JSON.stringify(data), now, expiresAt)
      .run();
  } catch (e) {
    console.warn('Failed to write AI insight cache:', e);
  }
}

export async function POST(request: NextRequest) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 5000,
    keyPrefix: 'ai-insight',
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const profile = body.profile as UserProfile;

    if (!profile || !profile.sun || !profile.moon || !profile.rising) {
      return NextResponse.json(
        { error: 'Invalid profile data' },
        { status: 400 }
      );
    }

    // ── 1. Check D1 cache ──
    const cacheKey = await getServerCacheKey(profile);
    const db = await getD1();

    if (db) {
      await ensureCacheTable(db);
      const cached = await readCache(db, cacheKey);
      if (cached) {
        return NextResponse.json({ ...cached, _cached: true });
      }
    }

    // ── 2. Cache miss — call Gemini ──
    const insight = await generatePersonalityInsight(profile);

    // ── 3. Write to D1 cache (non-blocking) — only cache real AI results ──
    if (db && !insight._fallback) {
      writeCache(db, cacheKey, insight).catch(() => {});
    }

    return NextResponse.json(insight);
  } catch (error) {
    console.error('AI insight error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
