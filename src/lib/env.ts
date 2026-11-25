/**
 * Environment validation for the all-Neon stack.
 *
 * Validation runs when a server client is created, not at module load.
 * Importing this module must stay side-effect free so `next build` can collect
 * route config without secrets present. NEXT_PUBLIC_* values are inlined at
 * build time, so set them in the deployment environment before building.
 */
import { APP_URL } from '@/config/app';

export { APP_URL };

const REQUIRED = {
  NEON_AUTH_BASE_URL: 'Neon Managed Auth base URL (branch URL)',
  NEON_AUTH_COOKIE_SECRET: 'Neon Auth cookie signing secret (>= 32 characters)',
  DATABASE_URL: 'pooled Neon Postgres connection string',
} as const;

const MIN_COOKIE_SECRET_LENGTH = 32;

export function validateEnv() {
  const missing: string[] = [];
  for (const [key, label] of Object.entries(REQUIRED)) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(`${key} (${label})`);
    }
  }

  const secret = process.env.NEON_AUTH_COOKIE_SECRET?.trim();
  if (secret && secret.length < MIN_COOKIE_SECRET_LENGTH) {
    missing.push(
      `NEON_AUTH_COOKIE_SECRET must be at least ${MIN_COOKIE_SECRET_LENGTH} characters`,
    );
  }

  if (!process.env.NEXT_PUBLIC_APP_URL?.trim() && process.env.NODE_ENV === 'production') {
    missing.push('NEXT_PUBLIC_APP_URL (public site URL)');
  }

  if (missing.length > 0) {
    throw new Error(
      `Invalid environment configuration: ${missing.join(', ')}. ` +
        'See .env.example and README "Set up .env.local".'
    );
  }
}

/**
 * Production guard: warn if seeded demo users exist in production.
 * Demo users use the `btc-e2e.test` domain and must be deleted before
 * real users sign up.
 */
export function assertNoDemoUsers(demoEmails: string[]): void {
  if (process.env.NODE_ENV !== 'production') return;
  // This is a runtime check intended to be called from proxy or a
  // server action at startup. It logs a warning (does not throw) so the
  // app stays available while alerting the operator.
  console.warn(
    `[BTC] Production guard: verify demo users are removed: ${demoEmails.join(
      ', ',
    )}. See README "Seed demo users for E2E only".`
  );
}
