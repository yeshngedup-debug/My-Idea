import { createNeonAuth, type NeonAuth } from '@neon/auth/next/server';

/**
 * Managed Better Auth server instance (Neon Auth).
 *
 * Created lazily so `next build` does not need auth secrets: createNeonAuth()
 * rejects a missing/short cookie secret at construction time. The proxy below
 * defers construction until the first real call, where a clear error is better
 * than a build failure.
 */
let cached: NeonAuth | undefined;

function getAuth(): NeonAuth {
  if (!cached) {
    const baseUrl = process.env.NEON_AUTH_BASE_URL;
    const secret = process.env.NEON_AUTH_COOKIE_SECRET;
    if (!baseUrl || !secret || secret.length < 32) {
      throw new Error(
        'NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (>=32 characters) are required. ' +
          'Run `neon env pull` and see README "Set up .env.local".'
      );
    }
    cached = createNeonAuth({ baseUrl, cookies: { secret } });
  }
  return cached;
}

export const auth = new Proxy({} as NeonAuth, {
  get(_target, property) {
    const instance = getAuth();
    const value = Reflect.get(instance, property);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
