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
import { neon } from '@neondatabase/serverless';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

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

/** 1×1 PNG used as a deterministic payment-proof fixture for E2E setup. */
const TEST_PAYMENT_PROOF = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

/** Upload a real object to the Neon storage bucket through its S3 endpoint. */
async function uploadPaymentProof(key: string): Promise<void> {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Neon storage credentials are not set for admin E2E');
  }

  const client = new S3Client({
    endpoint,
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  await client.send(
    new PutObjectCommand({
      Bucket: 'payment-screenshots',
      Key: key,
      Body: TEST_PAYMENT_PROOF,
      ContentType: 'image/png',
    })
  );
}

/**
 * Restore the seeded Basic order to a confirmable state.
 *
 * The admin flow confirms this order and also generates a shortlist for the
 * same founder. Once the order is confirmed, generation enforces Basic's
 * 3–5 student rule against the two seeded profiles. Resetting it in test
 * setup keeps both steps runnable in any order, on a reused seeded branch.
 *
 * confirmOrder checks that the proof object exists, not only that the row has
 * a screenshot path. Setup therefore uploads a real proof and points the row
 * at it, so repeated runs do not depend on a stale storage object.
 */
export async function resetSeededBasicOrderForAdmin(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const sql = neon(url);
  const rows = await sql`
    with target as (
      select o.id, p.id as founder_id
      from public.shortlist_orders o
      join public.profiles p on p.id = o.founder_id
      where p.full_name = 'Ugyen Dorji' and o.package = 'basic'
    )
    update public.shortlist_orders o
    set status = 'submitted',
        screenshot_path = target.founder_id::text || '/local-receipt.png'
    from target
    where o.id = target.id
    returning o.id, target.founder_id
  `;

  if (rows.length === 0) {
    throw new Error('Seeded Basic shortlist order is missing for admin E2E');
  }

  const founderIds = [...new Set(rows.map((row) => String(row.founder_id)))];
  await Promise.all(
    founderIds.map((founderId) =>
      uploadPaymentProof(`${founderId}/local-receipt.png`)
    )
  );
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
