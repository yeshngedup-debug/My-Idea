/**
 * Neon Auth + Neon Postgres reachability guard for the E2E suite.
 *
 * These flows need a LIVE, SEEDED Neon branch (Neon Auth accounts, Neon
 * Postgres rows, and objects in the private storage bucket). If the branch
 * cannot be reached we never let the run look green:
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

async function probeNeon(): Promise<ProbeResult> {
  const authUrl = process.env.NEON_AUTH_BASE_URL;
  if (!authUrl) {
    return { reachable: false, detail: 'NEON_AUTH_BASE_URL is not set' };
  }
  if (!process.env.DATABASE_URL) {
    return { reachable: false, detail: 'DATABASE_URL is not set' };
  }

  try {
    // Better Auth's get-session endpoint answers without a session; any HTTP
    // status proves Neon Auth is up. DNS failure / refusal / timeout do not.
    const url = `${authUrl.replace(/\/+$/, '')}/get-session`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    await response.body?.cancel();

    // The app's health route runs pingDatabase() against Neon Postgres.
    const base = (process.env.E2E_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
    const health = await fetch(`${base}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const payload = (await health.json().catch(() => null)) as { db?: string } | null;
    if (!health.ok || payload?.db !== 'up') {
      return {
        reachable: false,
        detail: `Neon Auth HTTP ${response.status}, but Neon Postgres is not up (health HTTP ${health.status})`,
      };
    }

    return { reachable: true, detail: `Neon Auth HTTP ${response.status}, Neon Postgres up` };
  } catch (error) {
    const err = error as Error;
    return { reachable: false, detail: `${err.name}: ${err.message}` };
  }
}

export async function requireSeededDb(testInfo: TestInfo): Promise<void> {
  const result = await (cached ??= probeNeon());
  if (result.reachable) return;

  const reason =
    `Live seeded Neon Auth / Neon Postgres is unavailable (${result.detail}). ` +
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
