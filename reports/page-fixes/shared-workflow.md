# Shared workflow fixes

Date: 2026-11-25. Role: shared workflow / server-side owner. Scope: owned paths in
`reports/page-fixes/MANIFEST.md`. The dirty worktree was treated as the source of
truth; no destructive git command, full build, full test suite, or dev server was
run.

## Files changed

- `app/actions/admin-students.ts`
- `app/actions/auth.ts`
- `app/actions/projects.ts`
- `app/actions/projects.test.ts`
- `app/actions/shortlist-order.ts`
- `app/actions/shortlist-order.test.ts`
- `app/actions/shortlist.ts`
- `app/actions/shortlist.test.ts`
- `app/actions/student-profile.ts`
- `app/actions/student-profile.test.ts`
- `app/api/cv/[id]/route.ts`
- `app/api/cv/[id]/route.test.ts`
- `lib/data/world-bank.ts`
- `lib/env.ts`
- `lib/rate-limit.ts`
- `lib/rate-limit.test.ts`
- `lib/validators.ts`
- `lib/validators.test.ts`
- `proxy.ts`
- `tests/e2e/admin-flow.test.ts`
- New focused tests: `app/actions/admin-students.test.ts`,
  `app/actions/auth.test.ts`, `app/api/cv/[id]/route.test.ts`,
  `lib/rate-limit.test.ts`.

Not counted in this list: `lib/neon-data.ts` is modified in the worktree but
belongs to the database owner and was read-only for this role.

## Changes by file

- `app/actions/auth.ts:22-49` — added `signupErrorToken()` so Supabase duplicate,
  weak-password, and unknown errors map to tokens the existing signup page
  already renders. Unknown errors no longer masquerade as "account exists".
- `app/actions/auth.ts:51-60` — hardened the rate-limit key by using the
  rightmost forwarded hop and trimming/normalising email.
- `app/actions/auth.ts:92-126` — login now fails closed when the Supabase profile
  read or Neon role sync fails, signs the user out, and keeps `redirect()` outside
  `try/catch`.
- `app/actions/auth.ts:129-164` — trimmed signup fields, rejected combined names
  over 80 characters instead of silently truncating, and used the mapped error
  token.
- `app/actions/auth.ts:190-219` — signup dashboard fallback signs out when no
  trustworthy role can be resolved instead of defaulting to `/student`.
- `proxy.ts:27-36` — role lookup returns `{ role, ok }` so a failed Neon read is
  no longer treated as "no role" / student.
- `proxy.ts:38-39` — added exact `ownsPath()` boundary check so `/founderish`
  does not match `/founder`.
- `proxy.ts:121-138` — auth-page and protected-route redirects only use known
  roles; failed lookups leave the page guard to fail closed.
- `lib/validators.ts:13-24` — unified skill parsing through `z.preprocess()` and
  kept the explicit 15-skill cap, so comma-separated strings cannot bypass it.
- `lib/validators.ts:28-42` — added explicit title and budget maxima.
- `lib/validators.ts:50-55` — `full_name` is trimmed and requires at least two
  characters.
- `lib/env.ts:34-60` — `resolveAppUrl()` validates URL/protocol, requires
  `NEXT_PUBLIC_APP_URL` in production, and allows localhost only outside
  production.
- `lib/rate-limit.ts:40-65` — blank keys share one bucket; invalid `limit` and
  `windowMs` fall back to defaults instead of creating broken buckets.
- `lib/data/world-bank.ts:61-88,156-166,377-463` — live-context result now
  carries `partial`, `missing`, and `errors`; dropped/failed indicators are
  reported instead of returning `ok: true` with no signal.
- `app/actions/shortlist.ts:36-55` — driver error text is logged server-side and
  replaced with a friendly message; duplicate rows remain idempotent.
- `app/actions/shortlist.ts:57-59` — revalidates the student detail path as well
  as the list routes.
- `app/actions/shortlist-order.ts:27,133-138,183-185,222-224` — added explicit
  reviewable statuses and guards for already-confirmed/rejected orders and
  screenshots on rejected orders.
- `app/actions/shortlist-order.ts:193-203` — confirmation checks that the stored
  proof path can actually produce a signed URL in Storage.
- `app/actions/shortlist-order.ts:160-174` — `requireAdmin()` returns the
  Supabase client so `confirmOrder()` can use it without a second client.
- `app/actions/projects.ts:138-145,199-222` — added an application transition map
  (`pending -> shortlisted|rejected`, `shortlisted -> accepted|rejected`) and a
  current-status guard before writing.
- `app/actions/admin-students.ts:97-110` — shortlist generation verifies the
  target is a founder and that a supplied project belongs to that founder.
- `app/actions/student-profile.ts:65-72` — profile-save errors are logged and
  replaced with a generic user-facing message.
- `app/actions/student-profile.ts:96-105` — CV upload checks the `.pdf` suffix
  and `%PDF-` header in addition to MIME type and size.
- `app/api/cv/[id]/route.ts:22-23,48-51` — invalid student IDs are rejected with
  400 before any database lookup.
- `app/api/cv/[id]/route.ts:25-42` — Storage signing failures are logged and
  returned as a friendly 502 instead of a raw failure.
- `tests/e2e/admin-flow.test.ts:47` — stale select-all comment replaced with the
  actual `Select all shown` control assertion.
- Focused tests were added/expanded for signup error mapping and overlong names
  (`app/actions/auth.test.ts`), founder/project guards
  (`app/actions/admin-students.test.ts`), application transitions
  (`app/actions/projects.test.ts`), order status guards
  (`app/actions/shortlist-order.test.ts`), sanitized errors
  (`app/actions/shortlist.test.ts`, `app/actions/student-profile.test.ts`),
  validators (`lib/validators.test.ts`), rate-limit key handling
  (`lib/rate-limit.test.ts`), and the CV route (`app/api/cv/[id]/route.test.ts`).

`app/api/context-data/route.ts` was not edited because it already returns the
`getLiveContext()` result directly, so the new partial-outage fields flow through
without a route change.

## Checks

- `npx vitest run lib/validators.test.ts lib/rate-limit.test.ts app/actions/auth.test.ts app/actions/admin-students.test.ts app/actions/projects.test.ts app/actions/shortlist-order.test.ts app/actions/shortlist.test.ts app/actions/student-profile.test.ts "app/api/cv/[id]/route.test.ts" --reporter=dot`
  — 9 files, 64 tests passed. The stderr stack in `shortlist.test.ts` is the
  intentional negative-path log for a mocked DB failure.
- `npx eslint <all changed files above>` — clean, exit 0.
- `npx tsc --noEmit --pretty false` — clean, exit 0.
- Not run by design: full `next build`, full `npm test`, dev server.

## Routed findings — database owner

- Application status audit: `lib/neon-data.ts:439-465` already records the old
  status and `updated_at`; `neon/schema.sql:46-49,104` and
  `supabase/migrations/20261125000000_application_status_audit.sql:6-18` add the
  table/index. Recommended: deploy that migration and add a DB-side transition
  check/trigger for the map now enforced in `app/actions/projects.ts:142-145,217-222`
  so concurrent callers cannot bypass the application guard.
- Order status/project ownership: `lib/neon-data.ts:1021-1043` ties an order's
  `project_id` to its founder, and `lib/neon-data.ts:1064-1113` guards
  screenshot/status writes to `pending`/`submitted`. Recommended: keep these
  guards and add a schema CHECK constraint limiting `shortlist_orders.status` to
  `pending`, `submitted`, `confirmed`, `rejected`; do not add `expired` without a
  migration and admin UI change.

## Routed findings — design-system owner

- Partial live-data outage: server output is now honest at
  `lib/data/world-bank.ts:61-88,434-446`, but
  `components/data/live-context.tsx:70,94-101,230-239,360,426` still treats any
  `ok: true` result as fully healthy. Recommended: when `partial === true`, show
  a non-blocking warning that names `missing`/`errors` and keep the available
  figures visible; reserve the full "unavailable" note for `ok: false`.
- Login account-sync copy: `app/(auth)/login/page.tsx:16-24` has no explicit
  entry for the new `profile-sync` token. The generic fallback covers it, but a
  clearer line such as "We couldn't sync your account. Try again or contact
  support." would be better.

## Routed findings — page owner

- Password recovery (HIGH): `components/auth/login-form.tsx:158-161` shows
  "Forgot password?", but `app/(auth)/login/page.tsx:37-39` still points it at a
  `mailto:` link. Recommended: add a `/reset-password` page and a Supabase reset
  request/confirm flow (server action or API route), then set
  `passwordHelpHref` to `/reset-password`.

## Deliberate non-changes

- Distributed rate limit: `lib/rate-limit.ts:18,40-65` remains process-local. A
  shared Redis/Upstash store needs a new dependency and deployment decision, so
  only the key/validation hardening was applied here.
- Server-action body size: `next.config.ts:6` has empty `experimental`, while
  Next's documented default action body limit is 1 MB
  (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:83`) and the
  owned actions accept 5 MB files (`app/actions/student-profile.ts:103-104`,
  `app/actions/shortlist-order.ts:123-124`). Config is outside ownership;
  recommended fix is `serverActions: { bodySizeLimit: '6mb' }` or lowering the
  action caps consistently in the UI and schema.
- CV access rule: left the application-based founder grant at
  `app/api/cv/[id]/route.ts:79-98`. Current read-only copy already describes
  application OR confirmed order access (`app/privacy/page.tsx:138`,
  `app/for-founders/page.tsx:107`, `app/how-it-works/page.tsx:89`). Changing to
  order-only access would need a product decision plus page-copy edits outside
  this ownership.
- Application completeness gate: not added. Current copy presents completeness
  as guidance (`app/for-students/page.tsx:86`,
  `app/how-it-works/page.tsx:52,77`), so a hard application rejection would
  contradict the shipped flow.
- Order cancellation: not added. `app/actions/shortlist-order.ts` has no
  owner-checked cancel action; introducing one is new behavior rather than a
  stale-finding fix.
- `expired` payment status: not added. The live contract is
  `pending`/`submitted`/`confirmed`/`rejected`
  (`app/actions/shortlist-order.ts:27,183,222`); adding a status requires a DB
  migration and admin UI changes outside ownership.
- Unknown signup errors: mapped to the existing generic token rather than
  `exists`; the copy already exists at `app/(auth)/signup/page.tsx:24-25`.

## Final summary

Fixed the owned server-side workflow findings across auth/proxy, validation,
orders, applications, shortlists, CV/profile uploads, and live-context data.
Focused tests (64), ESLint, and TypeScript all pass. The highest unresolved item
is HIGH password recovery, which needs a new page and read-only component/page
edits; also routed out are the 1 MB server-action body limit and the need for a
shared rate-limit store.
