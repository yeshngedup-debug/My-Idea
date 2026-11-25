import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  it('treats blank keys as the same bucket', () => {
    expect(rateLimit('   ', { limit: 1 }).ok).toBe(true);
    expect(rateLimit('', { limit: 1 }).ok).toBe(false);
  });

  it('falls back to the default limit for an invalid limit', () => {
    const result = rateLimit('invalid-limit-key', { limit: 0 });

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('falls back to the default window for an invalid window', () => {
    const before = Date.now();
    const result = rateLimit('invalid-window-key', { windowMs: Number.NaN });

    expect(result.ok).toBe(true);
    expect(result.resetAt).toBeGreaterThan(before);
  });
});
