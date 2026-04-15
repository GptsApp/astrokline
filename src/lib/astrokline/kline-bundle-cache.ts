import { getServerCacheKey } from './ai-insight-cache';
import type { KeyYearInput } from './gemini';
import type { KlineAIBundle, KlineBundlePhase, KlineBundleTier } from './kline-ai-bundle';
import type { UserProfile } from './mock-astrology-data';

const KLINE_BUNDLE_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

let cacheTableReady = false;
const pendingBundleRequests = new Map<string, Promise<KlineAIBundle>>();
const memoryBundleCache = new Map<string, { bundle: KlineAIBundle; expiresAt: number }>();

export async function getKlineBundleD1(): Promise<any | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext() as { env: { DB?: any } };
    return env?.DB ?? null;
  } catch {
    return null;
  }
}

export async function ensureKlineBundleCacheTable(db: any): Promise<void> {
  if (cacheTableReady) {
    return;
  }

  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_insight_cache (
        cache_key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        expires_at INTEGER NOT NULL
      )
    `).run();
    cacheTableReady = true;
  } catch {
    // Non-critical in local dev or read-only environments.
  }
}

export async function buildKlineBundleCacheKey(input: {
  profile: UserProfile;
  tier: KlineBundleTier;
  phase: KlineBundlePhase;
  locale?: string;
  keyYears?: KeyYearInput[];
  includeDiagnosis: boolean;
  includeAction: boolean;
}): Promise<string> {
  const profileHash = await getServerCacheKey(input.profile);
  const yearsKey = (input.keyYears ?? [])
    .slice(0, 10)
    .map((item) => item.year)
    .join(',') || 'none';

  return [
    'kline-bundle',
    input.locale ?? 'en',
    input.tier,
    input.phase,
    input.includeDiagnosis ? 'diag' : 'hero-only',
    input.includeAction ? 'action' : 'no-action',
    yearsKey,
    profileHash,
  ].join(':');
}

export async function readKlineBundleCache(db: any, key: string): Promise<KlineAIBundle | null> {
  if (!db) {
    const cached = memoryBundleCache.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt <= Date.now()) {
      memoryBundleCache.delete(key);
      return null;
    }

    return cached.bundle;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const row = await db
      .prepare('SELECT data FROM ai_insight_cache WHERE cache_key = ? AND expires_at > ?')
      .bind(key, now)
      .first();

    if (row?.data) {
      return JSON.parse(row.data) as KlineAIBundle;
    }
  } catch {
    // Cache miss or D1 issue.
  }

  return null;
}

export async function writeKlineBundleCache(
  db: any,
  key: string,
  bundle: KlineAIBundle,
): Promise<void> {
  if (!db) {
    memoryBundleCache.set(key, {
      bundle,
      expiresAt: Date.now() + (KLINE_BUNDLE_CACHE_TTL_SECONDS * 1000),
    });
    return;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    await db
      .prepare(
        'INSERT OR REPLACE INTO ai_insight_cache (cache_key, data, created_at, expires_at) VALUES (?, ?, ?, ?)'
      )
      .bind(key, JSON.stringify(bundle), now, now + KLINE_BUNDLE_CACHE_TTL_SECONDS)
      .run();
  } catch {
    // Cache write failure should not block the request.
  }
}

export async function runKlineBundleRequest<T extends KlineAIBundle>(
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const pending = pendingBundleRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = factory().finally(() => {
    pendingBundleRequests.delete(key);
  });

  pendingBundleRequests.set(key, request);
  return request;
}