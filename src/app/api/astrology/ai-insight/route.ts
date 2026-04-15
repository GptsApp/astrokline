import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalityInsight } from '@/lib/astrokline/gemini';
import { getServerCacheKey } from '@/lib/astrokline/ai-insight-cache';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { normalizePersonalityInsight } from '@/lib/astrokline/personality-insight-normalizer';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';
import { getSectionsForTier, LITE_SECTION_KEYS } from '@/lib/astrokline/section-prompts';

// D1 cache TTL: 30 days in seconds
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Strip non-requested sections from the response to prevent tier leakage. */
function filterSections(data: Record<string, any>, sections: string[]): Record<string, any> {
  const allowed = new Set([...sections, 'nickname', 'coreQuote', '_cached', '_fallback']);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (allowed.has(k)) out[k] = v;
  }
  return out;
}

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
 * Ensure the cache table exists (idempotent, runs only once per process).
 */
let _cacheTableReady = false;
async function ensureCacheTable(db: any): Promise<void> {
  if (_cacheTableReady) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_insight_cache (
        cache_key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        expires_at INTEGER NOT NULL
      )
    `).run();
    _cacheTableReady = true;
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
      .prepare('SELECT data FROM ai_insight_cache WHERE cache_key = ? AND expires_at > ?')
      .bind(key, now)
      .first();
    if (row?.data) {
      return JSON.parse(row.data);
    }
  } catch {
    // Cache miss or DB error — fall through to generation
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
        'INSERT OR REPLACE INTO ai_insight_cache (cache_key, data, created_at, expires_at) VALUES (?, ?, ?, ?)'
      )
      .bind(key, JSON.stringify(data), now, expiresAt)
      .run();
  } catch {
    // Cache write failure is non-critical — silently continue
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth check: prevent unauthenticated Gemini API abuse ──
    const { getSignUser } = await import('@/shared/models/user');
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const profile = body.profile as UserProfile;
    const tier = ((body.tier as string) || 'PRO').toUpperCase(); // default PRO for backward compat
    const isHeroTier = tier === 'HERO';

    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: isHeroTier ? 1500 : 5000,
      keyPrefix: `ai-insight:${tier.toLowerCase()}`,
    });
    if (limited) return limited;

    if (!profile || !profile.sun || !profile.moon || !profile.rising) {
      return NextResponse.json(
        { error: 'Invalid profile data' },
        { status: 400 }
      );
    }

    // Resolve which sections to generate based on tier
    const sections = isHeroTier ? [] : getSectionsForTier(tier);
    if (!isHeroTier && sections.length === 0) {
      return NextResponse.json(
        { error: 'Tier does not support AI insights' },
        { status: 403 }
      );
    }

    // ── 1. Check D1 cache (tier-scoped key) ──
    const profileHash = await getServerCacheKey(profile);
    const cacheKey = `${profileHash}:${tier}`;
    const db = await getD1();

    if (db) {
      await ensureCacheTable(db);
      const cached = await readCache(db, cacheKey);
      if (cached) {
        const { insight: normalizedCached, usedFallbackCount } = normalizePersonalityInsight(profile, cached);
        // Self-heal stale or malformed cache entries in the background.
        if (usedFallbackCount > 0) {
          writeCache(db, cacheKey, normalizedCached).catch(() => {});
        }
        return NextResponse.json(filterSections({ ...normalizedCached, _cached: true }, sections));
      }
    }

    // ── 2. Cache miss — generate via AI ──
    let insight: Record<string, any>;

    // PRO optimisation: reuse LITE cache for the 7 core sections
    if (tier === 'PRO' && db) {
      const liteCacheKey = `${profileHash}:LITE`;
      const liteCache = await readCache(db, liteCacheKey);
      if (liteCache) {
        // Only generate the 10 PRO-exclusive sections (skip nickname — reuse from LITE cache)
        const proOnlySections = sections.filter(s => !LITE_SECTION_KEYS.includes(s));
        const proInsight = await generatePersonalityInsight(profile, { sections: proOnlySections, skipNickname: true });
        // Merge: preserve LITE cached content for core sections
        insight = { ...proInsight };
        for (const key of LITE_SECTION_KEYS) {
          if (liteCache[key]) insight[key] = liteCache[key];
        }
        // Keep nickname/coreQuote from whichever has real data
        if (liteCache.nickname) insight.nickname = liteCache.nickname;
        if (liteCache.coreQuote) insight.coreQuote = liteCache.coreQuote;
      } else {
        insight = await generatePersonalityInsight(profile, { sections });
      }
    } else if (isHeroTier) {
      insight = await generatePersonalityInsight(profile, { sections: [] });
    } else {
      insight = await generatePersonalityInsight(profile, { sections });
    }

    // ── 3. Write to D1 cache ──
    if (db && !insight._fallback) {
      writeCache(db, cacheKey, insight).catch(() => {});
    }

    return NextResponse.json(filterSections(insight, sections));
  } catch (error) {
    console.error('AI insight error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
