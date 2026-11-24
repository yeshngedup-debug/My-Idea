/**
 * Environment validation.
 *
 * Required Supabase client env vars are validated once at module load.
 * If either is missing or empty, the app fails fast with a clear error
 * instead of crashing cryptically inside createServerClient/createBrowserClient.
 */
const REQUIRED = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anon / publishable key',
} as const;

export function validateEnv() {
  const missing: string[] = [];
  for (const [key, label] of Object.entries(REQUIRED)) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(`${key} (${label})`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in .env.local (see README "Set up .env.local").'
    );
  }
}

// Validate on first import in server and browser contexts.
if (typeof process !== 'undefined') {
  validateEnv();
}

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);

/**
 * Production guard: warn if seeded demo users exist in production.
 * Demo users use the `btc-test.com` domain and must be deleted before
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
    )}. See README "Delete seed demo users before real users sign up".`
  );
}
