# `/admin` (admin-overview) page-fix report

## Files changed

- `app/admin/page.tsx`
  - `metadata.title` is now `"Admin Dashboard"` (`app/admin/page.tsx:29`), so the
    root template at `app/layout.tsx:17-20` appends the brand once instead of
    producing a doubled suffix (audit U1).
  - Wrapped the four parallel Neon reads in a caught promise result. On failure
    the page logs on the server and renders an accessible, retryable
    "Platform overview" panel instead of a generic error boundary (audit W4,
    `app/admin/page.tsx:47-85`).
  - Replaced the throwaway per-member and per-status arrays with direct
    derivations from the aggregate rows (`app/admin/page.tsx:87-116`). Role and
    project counts are read/counted in place; no intermediate strings or
    `{ status }` objects are allocated (audit D4/D5).
  - Reconciled "Total members" with its breakdown: admins (and any out-of-vocabulary
    role) are now included when present, so the broadcast total and the printed
    detail agree (audit U3, `app/admin/page.tsx:93-122`).
  - Removed the standalone "Student accounts" stat. Founder and student counts
    now sit together in the lead detail, giving one leading figure and a short
    hairline ledger as required by `reports/dashboard-design-direction.md:57-63`
    (audit U4, `app/admin/page.tsx:118-134`).
  - Counted both `pending` and `submitted` orders as reviewable, changed the
    nudge wording to "waiting for review", and rendered `pending` as
    "Awaiting payment" in the recent-orders badge. This aligns the overview
    with the payments queue and the DB transition guard (audit W1,
    `app/admin/page.tsx:114-116,190-191,259-264`).

- `app/admin/admin-charts.tsx`
  - Removed the unreachable third activity-trend copy branch; with
    `activeMonths < 2`, only the 0-month and 1-month messages can render
    (audit U5, `app/admin/admin-charts.tsx:358-363`).
  - The pre-existing uncommitted "Other roles" bucket in `RoleDonut` was
    preserved untouched.

No other source file was edited; the only added file is this report.

## Checks performed

- Read before editing, per `reports/page-fixes/MANIFEST.md:13-25`:
  `reports/page-fixes/MANIFEST.md`, `reports/page-audits/admin-overview.md`,
  the relevant `/admin` and cross-route sections of
  `reports/page-audits/CONSOLIDATED.md`, `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `reports/dashboard-design-direction.md`,
  `lib/design-tokens.ts`, `app/globals.css`.
- Read the installed Next.js 16 guides for the APIs used:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`, and `14-metadata-and-og-images.md`. These confirm that
  a page is a Server Component, that expected data errors should be handled
  explicitly, and that page metadata composes with the root `title.template`.
- Verified every audit lead against current source before acting. Both owned
  files already carried uncommitted user work; that work was treated as the
  source of truth and preserved. No stash, reset, checkout, or clean was run.
- Traced the call graph without editing shared files: `lib/neon-data.ts:104-114,
  312-332,929-941,943-962,990-1019,1021-1031`, `proxy.ts:19-34,108-135`,
  `components/layout/workspace-stats.tsx:30-51`, `app/layout.tsx:15-20`,
  `neon/schema.sql:8-16,18-28,75-85`, and
  `app/admin/payments/payments-client.tsx:33-39,133-138`.
- `npx eslint app/admin/page.tsx app/admin/admin-charts.tsx` — passed with no
  findings.
- `npx tsc --noEmit --pretty false` — passed with no type errors.
- Reviewed `git diff -- app/admin/page.tsx app/admin/admin-charts.tsx` after
  editing; changes are limited to the bullets above.
- No `next build`, `npm test`, dev server, browser login, or database mutation
  was performed, per the manifest. Runtime verification remains with the
  orchestrator.

## Workflow findings routed to the workflow owner

- **W3 — `proxy.ts:28-34,124-131` (shared file, not edited).** Observed:
  `safeRole()` catches every `getProfileRole` error and returns `null`; the
  protected-route branch then falls back to `ROLE_HOME['student']` at
  `proxy.ts:126` and redirects an authenticated admin's `/admin` request to
  `/student`. The page-level guard at `app/admin/page.tsx:32-42` still fails
  closed, so no data leaks, but navigation is wrong during a transient Neon
  failure. Recommended fix: when an authenticated user has a `null` role,
  let the request reach the authoritative page guard, or return a 503 with a
  retry link. Do not guess the student home.
- **W1 — product/status contract now aligned on this page; shared owner must not
  reverse it unilaterally.** Observed: `neon/schema.sql:81` permits
  `pending`, `submitted`, `confirmed`, `rejected`; `lib/neon-data.ts:955` creates
  orders as `pending`; `lib/neon-data.ts:1010` allows both `pending` and
  `submitted` to transition via `setOrderStatus`; and
  `app/admin/payments/payments-client.tsx:137` treats both as actionable. The
  overview previously counted only `submitted`, so an actionable order could be
  missing from its count and nudge. This page now counts both. If product
  instead intends `pending` to mean "awaiting founder proof and not yet
  admin-actionable", the workflow owner must change
  `app/admin/payments/payments-client.tsx:137` and `lib/neon-data.ts:1010`
  together, not just the overview.
- **W4 — fixed inside the owned file.** The four reads are now caught at
  `app/admin/page.tsx:47-85`; the underlying error is logged server-side and the
  visitor gets a plain retry action. No shared error boundary was added.

## Database findings routed to the database owner

- **D1 — unscoped list helpers rely on page-level authorization.** Observed:
  `lib/neon-data.ts:104-114,312-320,322-332,1021-1031` run `select` over
  `profiles`, `projects`, and `shortlist_orders` with no role argument or row
  scoping; the module header (`lib/neon-data.ts:4-7`) states there is no RLS.
  `/admin` is protected only by `proxy.ts:111-132` and
  `app/admin/page.tsx:31-45`, and the same helpers are reused by other routes.
  Recommended fix: give admin reads explicit names and an in-layer
  `requireRole('admin')` assertion, and/or enable RLS so a future caller that
  omits the page guard cannot expose platform-wide rows.
- **D2 — full-row reads where only timestamps are needed.** Observed:
  `app/admin/page.tsx:50-51` calls `listAllProjectsWithDetails()`
  (`lib/neon-data.ts:322-332`, `select * from public.projects`) and `listOrders()`
  (`lib/neon-data.ts:1021-1031`, `select * from public.shortlist_orders`), but
  the page uses only `created_at` for the trend inputs
  (`app/admin/page.tsx:180-181`) plus the order fields rendered at
  `app/admin/page.tsx:229-265`. Recommended fix: add narrow helpers selecting
  only `created_at` and the order columns actually rendered, or move the
  six-month grouping into SQL.
- **D3 — `projects` is scanned twice per overview load.** Observed:
  `listProjectStatuses()` (`lib/neon-data.ts:315`) and
  `listAllProjectsWithDetails()` (`lib/neon-data.ts:326`) are awaited together
  at `app/admin/page.tsx:49-50`. Recommended fix: return `status, created_at`
  from one query and derive stage counts and activity dates from that result.
- **D6 — verified negative, no routing needed.** No owned file reads a
  user-supplied id, search param, or header; there are no server actions,
  writes, or `fetch` calls. All traced queries are constant statements, the only
  parameterised lookup is `getProfileRole` (`lib/neon-data.ts:50`), and the
  chart status keys match `neon/schema.sql:25,81` with out-of-vocabulary buckets
  handled in `app/admin/admin-charts.tsx:20-31,118-145`.
- No schema, seed, query, or index file was edited. No stale status literal was
  introduced: the overview now uses the schema's `pending` and `submitted`
  values.

## Deliberately not changed

- **U2 — shared stat naming.** `components/layout/workspace-stats.tsx:36-40`
  renders label and detail in the same `<dt>` with no whitespace text node,
  producing accessible names like `Open projects7 projects total`. This is a
  real WCAG 1.3.1 / 2.5.3 naming defect, but the file belongs to the
  design-system owner (`reports/page-fixes/MANIFEST.md:95-103`). Recommended
  fix: add a real separator there (for example a visible ` · ` plus an
  `sr-only` em dash) or set `aria-label={stat.label}` on the `<dt>`. No
  route-level string hack was used, because it would not reliably change the
  accessibility name.
- **U4 alternative.** A fifth "Founder accounts" stat card was not added. The
  design direction calls for one leading figure plus a compact ledger, so the
  asymmetry was removed by dropping the standalone student card rather than by
  expanding the stat block.
- **Pre-existing user work.** The "Other roles" donut bucket in
  `admin-charts.tsx`, the local hero/PhotoCredit replacement, motion removal,
  amount guard, and radius/formatting changes in `app/admin/page.tsx` were
  already uncommitted before this pass. They were preserved and not rewritten.
- **Shared status contract.** `app/admin/payments/payments-client.tsx`,
  `lib/neon-data.ts`, `neon/schema.sql`, and `proxy.ts` were read only; the
  remaining fixes are routed above rather than made here.
- **No new `error.tsx` or `loading.tsx`.** Those paths are outside this route's
  ownership; W4 was fixed with an in-page retry state instead.
- **No new dependencies, gradients, violet, emoji, build, test run, dev server,
  or browser verification.** The only gradient in the file is the pre-existing
  hero overlay from user work.
