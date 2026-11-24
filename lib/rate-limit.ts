/**
 * Simple in-memory rate limiter for server actions.
 *
 * Tracks requests per (key, window) and rejects when the limit is exceeded.
 * Intended for single-instance deploys (Vercel serverless, etc.). For
 * multi-instance deploys, back this with Redis/Upstash instead.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rate-limit';
 *   const { ok, remaining } = rateLimit(`login:${email}`);
 *   if (!ok) return { ok: false, message: 'Too many requests. Try again later.' };
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();
const DEFAULT_LIMIT = 10;   // max requests per window
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_BUCKETS = 5000; // hard cap so unique keys cannot exhaust memory

/**
 * Drop expired buckets on every call. Callers do not have to remember to
 * schedule `sweepRateLimitBuckets()`, so a flood of unique keys cannot grow
 * the map without bound.
 */
export function sweepRateLimitBuckets() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key);
  }
  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

export function rateLimit(
  key: string,
  { limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; remaining: number; resetAt: number } {
  sweepRateLimitBuckets();
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
