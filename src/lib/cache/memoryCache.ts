/**
 * Minimal process-local TTL cache for expensive upstream GIS/API calls.
 * Not a distributed cache — fine for a single hackathon deployment / dev server.
 * Resets on cold start in serverless environments, which is an acceptable tradeoff
 * given upstream services (ArcGIS REST, EIA, FCC) are themselves rate-limit sensitive.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }
  const value = await fetcher();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export const TTL = {
  ONE_MINUTE: 60_000,
  FIVE_MINUTES: 5 * 60_000,
  FIFTEEN_MINUTES: 15 * 60_000,
  ONE_HOUR: 60 * 60_000,
  ONE_DAY: 24 * 60 * 60_000,
};
