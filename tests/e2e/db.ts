/**
 * Supabase reachability guard for the E2E suite.
 *
 * These flows need a LIVE, SEEDED Supabase (auth + profiles + projects + CVs).
 * If Supabase cannot be reached we never let the run look green:
 *
 *   - default: the test is explicitly SKIPPED with a reason. Playwright
 *     reports it as "skipped", never as passed.
 *   - E2E_REQUIRE_DB set (e.g. "1"): the test FAILS loudly instead. Use this
 *     in CI so a missing database cannot quietly reduce coverage.
 *
 * The probe is cached per worker so a 4-file suite does not pay it four times.
 */
import type { TestInfo } from '@playwright/test';

interface ProbeResult {
  reachable: boolean;
  detail: string;
}

let cached: Promise<ProbeResult> | undefined;

async function probeSupabase(): Promise<ProbeResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    return { reachable: false, detail: 'NEXT_PUBLIC_SUPABASE_URL is not set' };
  }

  try {
    // GoTrue's health endpoint answers without auth; any HTTP status proves
    // the endpoint is up. DNS failure / connection refused / timeout do not.
    const response = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/health`, {
      headers: key ? { apikey: key } : undefined,
      signal: AbortSignal.timeout(5000),
    });
    await response.body?.cancel();
    return { reachable: true, detail: `HTTP ${response.status}` };
  } catch (error) {
    const err = error as Error;
    return { reachable: false, detail: `${err.name}: ${err.message}` };
  }
}

export async function requireSeededDb(testInfo: TestInfo): Promise<void> {
  const result = await (cached ??= probeSupabase());
  if (result.reachable) return;

  const reason =
    `Live seeded Supabase is unavailable (${result.detail}). ` +
    'Seed the accounts and data described in tests/e2e/demo-users.ts.';

  const dbRequired = /^(1|true|yes)$/i.test(process.env.E2E_REQUIRE_DB ?? '');
  if (dbRequired) {
    throw new Error(
      `E2E_REQUIRE_DB is set — failing instead of skipping. ${reason}`
    );
  }

  testInfo.skip(
    true,
    `${reason} Set E2E_REQUIRE_DB=1 to make this a hard failure.`
  );
}
