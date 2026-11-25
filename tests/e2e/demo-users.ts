/**
 * Seeded E2E accounts — NOT the legacy `@btc-test.com` demo users.
 *
 * WHY THESE ACCOUNTS
 * ------------------
 * These are real Neon Auth identities, not the placeholder rows inserted by
 * `scripts/neon-setup.mjs` (those have fixed IDs and cannot sign in). The
 * emails use the reserved `.test` TLD so a cleanup sweep of old `@btc-test.com`
 * demo accounts cannot delete them from a freshly migrated branch.
 *
 * E2E only SIGNS IN as these accounts. It never creates accounts through the
 * signup form and never tries to pick a role in the UI: the /signup page has
 * no role <select>, and `src/features/auth/actions.ts` intentionally creates
 * every new user as `student`. Founder/admin must be granted out of band by
 * updating the role in Neon Postgres.
 *
 * CREDENTIALS
 * -----------
 * Email defaults are non-secret test identifiers. Passwords have NO default:
 * set the matching E2E_*_PASSWORD variables in the shell that runs Playwright
 * (or in `.env.local`). No real secret is committed here.
 *
 * HOW TO SEED (disposable/local Neon branch only — never production)
 * ------------------------------------------------------------------
 * 1. Apply `neon/schema.sql` and seed local-only rows with:
 *      DATABASE_URL=<pooled-neon-url> node scripts/neon-setup.mjs
 * 2. Register the accounts below as real Neon Auth users with passwords you
 *    control (sign up through the app or use the Neon Auth admin/CLI). Neon
 *    Auth owns identities and sessions; the matching `public.profiles` row in
 *    Neon Postgres carries the application role. Promote the founder and
 *    admin accounts to the roles listed here by updating that row. Never put
 *    a literal password in this file — the E2E_*_PASSWORD variables supply it.
 * 3. Seed the data the flows assert on:
 *      - a completed `student_profiles` row + a PDF in the `cvs` bucket for
 *        the student (founder browse/detail pages require `cv_path`);
 *      - at least one `projects` row owned by the founder;
 *      - at least one `status = 'open'` project for the student to apply to;
 *      - a relationship between the founder and a browsable student (an
 *        application to one of the founder's projects, or one confirmed
 *        shortlist order for that founder) so "Request shortlist" succeeds;
 *      - at least one student profile for admin rank/verify;
 *      - at least one submitted `shortlist_orders` row with a
 *        `screenshot_path` for admin payment confirmation.
 * 4. Export the E2E_* environment variables and run `npm run test:e2e`.
 */

export type DemoRole = 'student' | 'founder' | 'admin';

export interface DemoUser {
  email: string;
  password: string;
  role: DemoRole;
}

function envOr(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function passwordOrEmpty(name: string): string {
  // Deliberately no fallback: a missing password must fail loudly in loginAs().
  return process.env[name] ?? '';
}

export const DEMO_USERS: Record<DemoRole, DemoUser> = {
  student: {
    email: envOr('E2E_STUDENT_EMAIL', 'student.tashi@btc-e2e.test'),
    password: passwordOrEmpty('E2E_STUDENT_PASSWORD'),
    role: 'student',
  },
  founder: {
    email: envOr('E2E_FOUNDER_EMAIL', 'founder.dorji@btc-e2e.test'),
    password: passwordOrEmpty('E2E_FOUNDER_PASSWORD'),
    role: 'founder',
  },
  admin: {
    email: envOr('E2E_ADMIN_EMAIL', 'admin@btc-e2e.test'),
    password: passwordOrEmpty('E2E_ADMIN_PASSWORD'),
    role: 'admin',
  },
};

/**
 * The payment flow uses a separate founder so the admin flow can confirm the
 * primary founder's basic order without unlocking this account's shortlist.
 */
export const PAYMENT_FOUNDER: DemoUser = {
  email: envOr('E2E_PAYMENT_FOUNDER_EMAIL', 'founder.pema@btc-e2e.test'),
  password: passwordOrEmpty('E2E_PAYMENT_FOUNDER_PASSWORD'),
  role: 'founder',
};

/** Dashboard paths enforced by proxy.ts / src/features/auth/actions.ts. */
export const ROLE_HOME: Record<DemoRole, string> = {
  student: '/student',
  founder: '/founder',
  admin: '/admin',
};

/*
 * ---------------------------------------------------------------------------
 * SEEDING REFERENCE (documentation only — do not add a migrations file)
 * ---------------------------------------------------------------------------
 * 1. Create the accounts with the emails above as Neon Auth identities. Use
 *    passwords from E2E_*_PASSWORD; never commit a literal password here.
 * 2. Confirm that each identity maps to a `public.profiles` row in Neon
 *    Postgres (Neon remains the source of truth for application roles), then
 *    set founder/admin roles out of band.
 * 3. The seeded placeholder profiles from `scripts/neon-setup.mjs` are NOT
 *    auth identities — do not try to sign in as them.
 */
