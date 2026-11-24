/**
 * Seeded E2E accounts — NOT the legacy `@btc-test.com` demo users.
 *
 * WHY THESE ACCOUNTS
 * ------------------
 * Migration `20261122000000_security_hardening.sql` deletes every auth user
 * whose email ends in `@btc-test.com`, so the old demo accounts cannot exist
 * in a freshly migrated database. The emails below use the reserved `.test`
 * TLD and are never deleted by that migration.
 *
 * E2E only SIGNS IN as these accounts. It never creates accounts through the
 * signup form and never tries to pick a role in the UI: the redesigned
 * /signup page has no role <select>, and `app/actions/auth.ts` intentionally
 * creates every new user as `student`. Founder/admin must be granted by an
 * admin or by SQL (out of band).
 *
 * CREDENTIALS
 * -----------
 * Email defaults are non-secret test identifiers. Passwords have NO default:
 * set the matching E2E_*_PASSWORD variables in the shell that runs Playwright
 * (or in `.env.local`). No real secret is committed here.
 *
 * HOW TO SEED (disposable/local Supabase only — never production)
 * ----------------------------------------------------------------
 * 1. Apply all migrations, including `20261122000000_security_hardening.sql`.
 * 2. Create the three auth users below with passwords you control. Confirm
 *    their email and set `raw_user_meta_data->>'role'` to the role listed
 *    here. The existing `on_auth_user_created` trigger creates the matching
 *    `profiles` row. Sketch (psql variable interpolation, no literal secret):
 *
 *      psql "$DATABASE_URL" \
 *        -v student_email="$E2E_STUDENT_EMAIL" \
 *        -v founder_email="$E2E_FOUNDER_EMAIL" \
 *        -v admin_email="$E2E_ADMIN_EMAIL" \
 *        -v student_pw="$E2E_STUDENT_PASSWORD" \
 *        -v founder_pw="$E2E_FOUNDER_PASSWORD" \
 *        -v admin_pw="$E2E_ADMIN_PASSWORD" -f tests/e2e/seed-users.sql
 *
 *    The SQL is kept as a comment at the bottom of this file (it is
 *    documentation, not a new Supabase migration).
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

/** Dashboard paths enforced by middleware.ts / app/actions/auth.ts. */
export const ROLE_HOME: Record<DemoRole, string> = {
  student: '/student',
  founder: '/founder',
  admin: '/admin',
};

/*
 * ---------------------------------------------------------------------------
 * tests/e2e/seed-users.sql  (REFERENCE ONLY — do not add a Supabase migration)
 * ---------------------------------------------------------------------------
 * Run with the psql command in step 2 above. `:password` values come from the
 * operator's environment; nothing here is a real secret.
 *
 * do $$
 * declare
 *   u jsonb;
 *   new_id uuid;
 *   accounts jsonb := jsonb_build_array(
 *     jsonb_build_object('email', :'student_email', 'role', 'student', 'full_name', 'E2E Student', 'password', :'student_pw'),
 *     jsonb_build_object('email', :'founder_email', 'role', 'founder', 'full_name', 'E2E Founder', 'password', :'founder_pw'),
 *     jsonb_build_object('email', :'admin_email',   'role', 'admin',   'full_name', 'E2E Admin',   'password', :'admin_pw')
 *   );
 * begin
 *   for u in select * from jsonb_array_elements(accounts) loop
 *     continue when exists (select 1 from auth.users where email = u->>'email');
 *
 *     insert into auth.users (
 *       instance_id, id, aud, role, email, encrypted_password,
 *       email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
 *       created_at, updated_at, confirmation_token, recovery_token,
 *       email_change, email_change_token_new
 *     ) values (
 *       '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
 *       'authenticated', 'authenticated', u->>'email',
 *       extensions.crypt(u->>'password', extensions.gen_salt('bf')),
 *       now(),
 *       '{"provider":"email","providers":["email"]}'::jsonb,
 *       jsonb_build_object('role', u->>'role', 'full_name', u->>'full_name'),
 *       now(), now(), '', '', '', ''
 *     ) returning id into new_id;
 *
 *     insert into auth.identities (
 *       provider_id, provider, user_id, identity_data, created_at, updated_at
 *     ) values (
 *       u->>'email', 'email', new_id,
 *       jsonb_build_object('sub', new_id::text, 'email', u->>'email', 'email_verified', true),
 *       now(), now()
 *     );
 *   end loop;
 * end $$;
 *
 * Also pass -v student_email="$E2E_STUDENT_EMAIL" etc. to psql, or replace the
 * email expressions with the non-secret defaults above.
 */
