type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const inFlightRequests = new Map<string, Promise<unknown>>();
const resolvedRequests = new Map<string, CacheEntry>();

export const DASHBOARD_KLINE_LIST_CACHE_KEY = 'dashboard-kline:list';
export const KLINE_REFERRAL_CACHE_KEY = 'kline:referral';
export const ASK_CHART_HISTORY_LIST_CACHE_KEY = 'ask-chart:history:list';
export const KEY_YEAR_INSIGHTS_CACHE_PREFIX = 'kline:key-year:';

export async function runClientRequest<T>(
  key: string,
  requestFactory: () => Promise<T>,
  options?: {
    ttlMs?: number;
    force?: boolean;
  }
): Promise<T> {
  if (typeof window === 'undefined') {
    return requestFactory();
  }

  const ttlMs = Math.max(0, options?.ttlMs ?? 0);
  const force = options?.force === true;

  if (!force) {
    const cached = resolvedRequests.get(key);
    if (cached) {
      if (cached.expiresAt > Date.now()) {
        return cached.value as T;
      }

      resolvedRequests.delete(key);
    }

    const pending = inFlightRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const request = requestFactory()
    .then((value) => {
      if (ttlMs > 0) {
        resolvedRequests.set(key, {
          value,
          expiresAt: Date.now() + ttlMs,
        });
      }

      return value;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request as Promise<unknown>);
  return request;
}

export function invalidateClientRequestCache(key: string) {
  resolvedRequests.delete(key);
  inFlightRequests.delete(key);
}

export function invalidateClientRequestCacheByPrefix(prefix: string) {
  for (const key of [...resolvedRequests.keys()]) {
    if (key.startsWith(prefix)) {
      resolvedRequests.delete(key);
    }
  }

  for (const key of [...inFlightRequests.keys()]) {
    if (key.startsWith(prefix)) {
      inFlightRequests.delete(key);
    }
  }
}