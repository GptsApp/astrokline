/**
 * AI Insight Cache — D1 + localStorage dual-layer caching
 *
 * Cache key = sha256(sun_sign + moon_sign + rising_sign + birthDate)
 * D1 TTL = 30 days
 * localStorage = permanent (keyed by same hash)
 */

// ── Client-side cache helpers (localStorage) ──

const LS_PREFIX = 'ai_insight_';

export interface AiInsightData {
  nickname?: string;
  coreQuote?: string;
  summary?: string;
  career?: string;
  wealth?: string;
  relationships?: string;
  love?: string;
  health?: string;
  strengths?: string;
  warnings?: string;
  shadow?: string;
  _cached?: boolean;
  _fallback?: boolean;
}

export function getInsightCacheKey(profile: {
  sun?: { sign: string };
  moon?: { sign: string };
  rising?: { sign: string };
  birthDate?: string;
}): string {
  const raw = [
    profile.sun?.sign ?? '',
    profile.moon?.sign ?? '',
    profile.rising?.sign ?? '',
    profile.birthDate ?? '',
  ].join('|');
  // Simple hash for localStorage (no need for crypto)
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function getCachedInsight(cacheKey: string): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_PREFIX + cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Check if data looks valid
    if (parsed && parsed.summary) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function setCachedInsight(cacheKey: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PREFIX + cacheKey, JSON.stringify(data));
  } catch {
    // localStorage full — silently fail
  }
}

// ── Server-side cache key generator (sha256 for D1) ──

export async function getServerCacheKey(profile: {
  sun?: { sign: string };
  moon?: { sign: string };
  rising?: { sign: string };
  birthDate?: string;
}): Promise<string> {
  const raw = [
    profile.sun?.sign ?? '',
    profile.moon?.sign ?? '',
    profile.rising?.sign ?? '',
    profile.birthDate ?? '',
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
