# admin-payments — second-pass feature-completeness review

Date: 2026-11-25. Scope: `/admin/payments`. Working-tree versions were treated
as the source of truth. No shared file, other page, other report, `MANIFEST.md`,
or phase-2 report was edited. No destructive git command, build, test suite, dev
server, install, or browser tooling was run.

## Features verified (static source review)

- **Admin gate — fail closed.** `app/admin/payments/page.tsx:28-33` calls
  `auth.getUser()`, redirects unsigned users to `/login`, and requires Neon
  `getProfileRole(user.id) === 'admin'` before any order data is loaded.
  `app/actions/shortlist-order.ts:160-174` repeats the check in the shared
  `requireAdmin()` used by both mutations. If the role lookup throws, the page
  raises into the global error boundary and the action rejects; neither path
  grants access. `proxy.ts:130-137` covers `/admin/*` at the edge.
- **List and detail.** `page.tsx:35-60` loads all orders plus founder names and
  project titles; `payments-client.tsx:227-252` renders package, formatted amount
  (`formatAmount`), founder/project, fixed-UTC created time, short order ID, and
  a status badge with an `unknown` → “Needs review” fallback.
- **Status updates have a real server effect.** Confirm and Reject call the
  server actions (`payments-client.tsx:123-145`). Both actions re-check admin,
  reject non-`pending`/`submitted` rows, and write through
  `lib/neon-data.ts:1084-1113`, whose single `UPDATE` includes
  `status in ('pending', 'submitted')` and throws when no row transitions.
  A stale page cannot flip a decided order.
- **Failure handling / rollback.** The component does **not** apply a
  pre-success status change: `overrides` are set only inside `if (res.ok)`.
  A failed or thrown action leaves the server-derived status untouched, shows a
  `role="status"` failure line, clears `busyId`, and calls `router.refresh()` in
  `finally` so server props can reconcile. There is no optimistic status to roll
  back; this was verified in source, not at runtime.
- **Amounts and totals.** “Totals” here are queue counts, not a money sum.
  `awaitingCount` is derived from all items and `countLabel` from visible items
  (`payments-client.tsx:103-108`); both update after a successful override and
  after a refresh. No monetary aggregate is displayed, so no total can disagree
  with the rows.
- **Proof handling.** `page.tsx:62-80` mints fresh 1-hour signed URLs from the
  private `payment-screenshots` bucket with the admin's server session;
  `supabase/premium-shortlists.sql:58-68` permits admin reads. The link opens in
  a new tab with `rel="noopener noreferrer"`. Confirm is disabled unless a signed
  URL exists (`payments-client.tsx:220,284`), and `confirmOrder` re-signs the
  stored path before writing (`shortlist-order.ts:193-203`). Missing or
  un-signable proof has an explicit message and refresh control.
- **Filters and reset.** `FILTERS`/`SegmentedControl`
  (`payments-client.tsx:42-48,184-195`) filter by status, surface actionable rows
  first, and report the filtered count politely. The empty-filter state offers
  **Show all orders**, which sets `filter` back to `all`.
- **Empty / error / loading states.** The no-orders state (`147-159`) and
  filtered-empty state (`198-213`) are useful and include an `sr-only` heading.
  Server-load failures fall through to `app/error.tsx`; route-level loading is
  supplied by the existing `app/admin/loading.tsx` for the admin segment.
- **Runtime caveat.** Browser assertions for optimistic rollback, focus, and
  error-state rendering were not possible because this pass explicitly forbids
  dev-server and browser tooling. All claims above are source-verified only.

## Fixes made

- `app/admin/payments/payments-client.tsx:254-275` — added a **Refresh proof
  link** control beside a live “View payment screenshot” link for actionable
  orders. The 1-hour URL can expire while the page is open; previously the
  refresh control appeared only after the URL was gone. The new control calls
  `router.refresh()`, is disabled during an in-flight status change, has an
  order-specific accessible name, and uses the existing focus token.
- `app/admin/payments/page.tsx` — unchanged this pass; its admin gate, signed-URL
  minting, and `screenshotError` propagation were verified and preserved.

## Checks performed

- Read `AGENTS.md`, the required Next.js 16 docs under
  `node_modules/next/dist/docs/01-app/` (layouts/pages, server/client
  components, mutating data, error handling), design/brand/voice guidance,
  `lib/design-tokens.ts`, `app/globals.css`, and the audit/fix reports before
  editing.
- Re-read `app/actions/shortlist-order.ts`, `lib/neon-data.ts`, `proxy.ts`,
  `neon/schema.sql`, `supabase/premium-shortlists.sql`, the relevant E2E tests,
  `components/interactive/segmented-control.tsx`, and the Supabase storage-js
  source for `createSignedUrl`.
- `npx eslint app/admin/payments/page.tsx app/admin/payments/payments-client.tsx`
  — clean, exit 0.
- `npx tsc --noEmit --pretty false` — fails only on two pre-existing,
  out-of-scope student-project files:
  `app/student/projects/page.tsx:111` (`initialQuery` not in props) and
  `app/student/projects/projects-client.tsx:323` (missing `detailHref`). No error
  was reported in either owned file.
- `git diff --check` scoped to the owned files — no whitespace errors (only the
  repository's LF/CRLF warning).
- No full `next build`, `npm test`, dev server, install, or browser/Reticle run.

## Workflow findings routed to the workflow owner

- **Proof existence is not proven before confirmation (residual HIGH).**
  `app/actions/shortlist-order.ts:193-203` treats a successful `createSignedUrl`
  as proof availability. The storage-js source
  (`node_modules/@supabase/storage-js/src/packages/StorageFileApi.ts:704-755`)
  shows this signs a path and enforces the `select` policy; it does not prove the
  object still exists. A deleted object can therefore still unlock a shortlist.
  Recommended fix: call `info()` or `download()` for
  `order.screenshot_path` after `requireAdmin()` and before `setOrderStatus`,
  and keep the existing friendly failure message when it is absent.
- **No reviewer identity, decision time for rejection, or reason.**
  `app/actions/shortlist-order.ts:205-209,226-230` writes only status and
  `confirmed_at`; `lib/neon-data.ts:1084-1113` has no reviewer field;
  `neon/schema.sql:88-98` has no `reviewed_by`, `reviewed_at`, or
  `rejection_reason`. Recommended fix: add audited columns or a status-history
  table and write them atomically with the verified `user.id`.
- **Role source can drift.** `page.tsx:32` and
  `app/actions/shortlist-order.ts:170` read Neon `profiles.role`; identity comes
  from Supabase, and `scripts/neon-mirror-identities.mjs:49-57` mirrors roles one
  way. A Supabase-side demotion can leave stale Neon admin authority until the
  mirror runs. Recommended fix: make the IdP role authoritative or mirror
  synchronously, with a regression check covering this page and both actions.

## Database findings routed to the database owner

- **Project titles still scan every project.**
  `app/admin/payments/page.tsx:50-57` collects distinct project IDs but calls
  `listAllProjects()`; `lib/neon-data.ts:359-374` selects and sorts the whole
  `projects` table. Recommended fix: add `listProjectsByIds(ids)` with
  `where id = any(${ids}::uuid[])` and call it only when the list is non-empty.
- **Global order queue is unbounded and lacks a matching index.**
  `lib/neon-data.ts:1115-1127` reads and sorts every shortlist order by
  `created_at desc`; `neon/schema.sql:107-108` only indexes per-founder access.
  Recommended fix: add a bounded admin queue helper/cursor and consider
  `(status, created_at desc)` after checking the query plan.

## Deliberate non-changes

- No shared action, DB helper, schema, proxy, storage policy, or shared component
  was edited; the findings above are routed, not patched here.
- No new refresh-proof action or screenshot route was added; the existing
  `router.refresh()` path is sufficient for an owned-file fix.
- No monetary total was added: the page is a review queue, and summing confirmed,
  rejected, and pending orders would need a product decision.
- No `loading.tsx`, error boundary, new dependency, gradient, violet, emoji, or
  wholesale rewrite was introduced. The `admin` segment already has a loading
  UI and the app has a global error page.
- No optimistic pre-success status change was added. Current behaviour is safer:
  the UI waits for the server result and reconciles with a refresh.
- No runtime claim is made for rollback, focus, expiry, or error rendering; the
  explicit no-browser/no-dev-server constraint made those unprovable here.
