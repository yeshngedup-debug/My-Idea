# `/admin` (admin-overview) second-pass feature-completeness report

Date: 2026-11-25. Role: page owner, second pass. Scope: `app/admin/page.tsx` and
`app/admin/admin-charts.tsx` only. The dirty worktree was treated as the source
of truth. No destructive git command, shared-file edit, build, test suite, dev
server, browser session, or install was used.

## Features verified

### Admin-only access is fail closed

- `app/admin/page.tsx:32-42` calls `supabase.auth.getUser()`, redirects an
  unauthenticated visitor to `/login`, then calls `getProfileRole(user.id)`.
  Only the exact role `admin` continues; a missing, unknown, or other role is
  redirected to `/`. A lookup error throws before any overview read, so no
  admin data can render to an unverified visitor.
- `proxy.ts:27-36` now returns `{ role, ok }` from `lookupRole()`. On a failed
  lookup, `proxy.ts:130-132` lets the request reach the authoritative page
  guard. On an unknown role, `proxy.ts:134-137` redirects to that role's home
  or `/`. The stale phase-1 finding that a failed lookup sent admins to
  `/student` is no longer present in current source.
- `app/admin/layout.tsx:1-5` supplies only the shared workspace chrome; it does
  not bypass the page guard.

### Every stat and chart is derived from real rows

| Surface | Source | Derivation in owned file |
|---|---|---|
| Total members | `lib/neon-data.ts:118-128` (`listRoleCounts`) | Sum of all grouped role counts at `app/admin/page.tsx:101-104`; detail reconciles founders, students, admins and any other role at `:88-110`. |
| Open projects / total projects | `lib/neon-data.ts:334-342` (`listProjectStatuses`) | Row count and exact `open` filter at `app/admin/page.tsx:111-112`. |
| Payments to review | `lib/neon-data.ts:1115-1127` (`listOrders`) | `pending` plus `submitted` at `app/admin/page.tsx:114-116`, matching the actionable queue in `app/admin/payments/payments-client.tsx:41-48,218`. |
| Members by role donut | Same `listRoleCounts` call | `app/admin/admin-charts.tsx:117-239`; exact counts and rounded shares appear in the legend, SVG description and screen-reader table. Unknown roles are collected into `Other roles` at `:120-129`. |
| Projects by stage bars | Same `listProjectStatuses` call | `app/admin/admin-charts.tsx:242-304`; all schema stages stay visible as text, and unknown values become `Other` at `:252-259`. |
| Six-month activity trend | `listAllProjectsWithDetails` (`lib/neon-data.ts:344-357`) and `listOrders` | `app/admin/page.tsx:179-182` passes only `created_at` values; `app/admin/admin-charts.tsx:306-485` buckets them in UTC with exact screen-reader rows. |
| Recent payment orders | Same `listOrders` call | `app/admin/page.tsx:202-270`; package, amount, date and status come from the row. Amount is guarded at `:237-239`; unknown statuses are rendered from the stored string at `:259-264`. |

- No hardcoded platform figures, national indicators, mock rows, placeholders,
  `Math.random`, TODOs or invented social proof were found in either owned file.
- Status keys match the schema: project stages at `neon/schema.sql:25` and
  order statuses at `neon/schema.sql:94`. Order `package` is constrained to
  `basic`/`full` at `neon/schema.sql:92`, so the page's `Full Support`/`Basic`
  labels at `app/admin/page.tsx:236` are accurate.
- The lead stat and detail are reconciled; admins and any out-of-vocabulary role
  are included in "Total members" (`app/admin/page.tsx:88-110,120-123`).

### Links and external attribution

- Internal hrefs resolve to existing routes: `/login` (`:37`), `/` (`:41`),
  `/admin` retry (`:78`), `/admin/payments` (`:194,209,221`) and the three
  shortcut targets `/admin/students`, `/admin/payments`, `/admin/projects`
  (`:280-307`). The target page files exist under `app/admin/**`.
- Hero attribution uses `PhotoCredit` with the registered Commons file URL at
  `app/admin/page.tsx:163-167`. The component emits author and licence links
  with `target="_blank"` and `rel="noopener noreferrer"`
  (`components/ui/photo-credit.tsx:41-57`).

### Empty, error and loading states are honest

- A failed overview read is caught at `app/admin/page.tsx:47-61`, logged
  server-side, and rendered as an accessible retry panel with
  `role="alert"` at `:63-85`. No partial or placeholder figures are shown.
- Zero orders render a plain empty panel with a payments link
  (`app/admin/page.tsx:215-226`).
- The trend is withheld when fewer than two of the last six months have dated
  rows, with distinct 0-month and 1-month explanations
  (`app/admin/admin-charts.tsx:349-363`); the exact zero-count table remains
  available to screen readers at `:478-482`.
- `app/admin/loading.tsx:1-5` uses `WorkspaceLoading`, whose root has
  `role="status"` (`components/layout/workspace-loading.tsx:15`). It is a
  static shape, not fake data.
- The shared route-aware boundary at `app/error.tsx:25-30` still offers
  `Back to admin workspace` for uncaught failures.

## Fix made in this pass

- `app/admin/page.tsx:245` now passes `timeZone: "UTC"` when formatting a
  recent order's `created_at` as day and month. The data layer stores
  timestamps as UTC ISO strings, the activity chart already groups by UTC, and
  `app/admin/payments/payments-client.tsx:50-57` formats the same field in UTC.
  Without this option, a server in another timezone could show the adjacent
  day or month for late-night orders. This is a one-line, display-only fix.
- `app/admin/admin-charts.tsx` needed no change; its role bucket, stage bucket,
  accessible text and trend gate were complete.

## Checks performed

- Read the current source of both owned files, `proxy.ts`, the five Neon
  helpers used here, `neon/schema.sql`, the shared stats and loading components,
  the payments client, the route files behind every shortcut, the manifest,
  the phase-1 page report, and the three phase-2 shared reports.
- Re-read the installed Next.js 16 error-handling guide before assessing the
  caught failure state.
- `npx eslint app/admin/page.tsx app/admin/admin-charts.tsx` - exit 0, no
  findings.
- `npx tsc --noEmit --pretty false` - exit 0, no type errors.
- Source-verified all phase-1 findings against current code instead of trusting
  their old line numbers; the resolved ones are listed below.

## Routed findings

### Workflow owner

- No new workflow defect found. The previously routed W3 is resolved in current
  source: `proxy.ts:27-36,121-138` distinguishes lookup failure from unknown
  role, lets failed lookups reach the page guard, and never guesses `student`.
- Verified, not re-routed: W1 is aligned. `app/admin/page.tsx:114-116` counts
  both reviewable statuses, and the payments client treats the same two as
  actionable (`app/admin/payments/payments-client.tsx:41-48,218`).
- Residual observation, deliberately not patched here: a role-lookup error at
  `app/admin/page.tsx:40` still falls through to the shared error boundary
  rather than the in-page retry panel. It is fail closed and shows no data.
  The page comment at `:39` makes fail-render intentional, and the boundary is
  a shared-design-system file. If a route-specific retry is wanted, wrap only
  the `getProfileRole` call separately and render the same retry panel without
  catching the `redirect()` thrown at `:37` or `:41`.

### Database owner

- D1 remains open in shared code: `listRoleCounts` (`lib/neon-data.ts:118-128`),
  `listProjectStatuses` (`:334-342`), `listAllProjectsWithDetails` (`:344-357`)
  and `listOrders` (`:1115-1127`) are unscoped, and the schema states that
  authorization stays in application code (`neon/schema.sql:1-4`). `/admin` is
  protected by the page and proxy guards, but admin intent is not explicit in
  the helpers. Recommended fix remains an admin-named helper plus an in-layer
  role assertion, or RLS, owned by the database agent.
- D2/D3 remain partially open: the helpers now use explicit projections, but
  `listProjectStatuses` and `listAllProjectsWithDetails` still scan `projects`
  separately per overview load. Recommended fix is one `status, created_at`
  query feeding both the stage counts and the activity buckets. No database
  file was edited.
- Verified, not re-routed: the phase-1 status-vocabulary lead is stale. Project
  and order keys in `app/admin/admin-charts.tsx:26-31` match
  `neon/schema.sql:25,94`, and `Other` buckets cover future values.
- No injection, IDOR, user-supplied ID, server action or write surface exists
  in the owned files.

### Design-system owner

- The phase-1 U2 accessible-name defect is resolved in shared code:
  `components/layout/workspace-stats.tsx:36-43` now emits a visible ` · `
  separator between label and detail. No route-level workaround was added.
- No new design finding. The one change uses only an existing date option and
  introduces no new color, dependency, route, gradient, emoji or motion.

## Deliberate non-changes

- Pre-existing uncommitted work was preserved: the local hero and CSS
  background, `PhotoCredit`, removed client motion wrapper, amount guard,
  border/radius formatting, and the `Other roles` donut bucket were not
  rewritten.
- `app/admin/admin-charts.tsx` was left unchanged after verification.
- No shared component, server action, proxy, schema, query, test, report,
  manifest or phase-2 report was edited.
- No new dependency, route, error boundary, loading file or navigation state
  was introduced.
- No build, `npm test`, dev server, browser login, browser tooling, Reticle
  wiring, install, or database mutation was run, per the manifest.
