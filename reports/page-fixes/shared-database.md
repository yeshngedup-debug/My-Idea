# Shared database / data-layer fixes

Source-verified from the current dirty working tree. Audit line numbers were
treated as leads, not as current truth. No destructive git command, full build,
full test run, dev server, or live database mutation was used.

## Files changed

- `lib/neon-data.ts`
  - Added one `isoString()` mapper and applied it to application, project,
    student-profile, shortlist, order, profile and confirmed-at timestamps so a
    driver `Date` cannot leak a locale-specific `Date.toString()` into the UI.
  - `getProfile()` now selects and returns `profiles.created_at`; the founder
    profile page can drop its Supabase `user.created_at` workaround later.
  - Replaced `select *` with explicit `ProjectRow`, `StudentProfileRow`,
    `ShortlistRow` and `OrderRow` projections in the shared read helpers.
  - `listStudentApplications()` now selects `a.student_id`, `a.project_id` and
    `p.id`, so `mapApplication()` no longer produces `"undefined"` IDs. The
    project object type now carries `id` as well as `title`.
  - `updateApplicationStatus()` now writes `applications.updated_at` and one
    `application_status_history` row for each accepted transition; re-applying
    the same status is a no-op and records no history.
  - Scoped `getShortlist()` and `listShortlistedStudentIds()` to general founder
    rows (`source = 'founder' and project_id is null`) so an admin or
    project-scoped row cannot masquerade as a general request.
  - Wrapped both halves of `replaceAdminShortlist()` in one Neon HTTP
    transaction, so a failed stale-row delete rolls back the upsert.
  - `insertOrder()` now verifies that a project-scoped order belongs to the
    paying founder before insert; a missing/foreign project throws
    `NeonDataError`.
  - `setOrderScreenshot()` now accepts only `pending` or `submitted` orders and
    throws when the order can no longer take a receipt.
  - Added `BrowseStudentRow` and narrowed `listBrowseableStudents()` to the
    eight directory fields actually used by the page; CV/PII fields are no
    longer fetched for the browse list.
- `neon/schema.sql`
  - Added `applications.updated_at` with an idempotent `add column if not exists`
    for existing databases.
  - Added `application_status_history` with `application_id`, `from_status`,
    `to_status`, `changed_at` and `changed_by_ref`.
  - Added composite indexes `projects_founder_status_idx`,
    `application_status_history_app_idx` and
    `shortlist_orders_founder_status_idx`.
  - All SQL is idempotent and compatible with `scripts/neon-setup.mjs`, which
    splits this file on semicolons; no `DO` block was introduced.
- `supabase/migrations/20261125000000_application_status_audit.sql` (new)
  - Mirrors the `updated_at` column and status-history table in the Supabase
    schema and enables RLS on the history table so PostgREST anon clients cannot
    read it directly.

## Findings fixed by source area

- Student applications / student overview: missing application IDs, project
  link ID, timestamp normalization and status history are now available in the
  data layer. Rendering the history in `components/ui/status-timeline.tsx`
  remains a design-system task.
- Founder project detail / founder projects: `getProject()`,
  `listProjectsByFounder()` and `listAllProjectsWithDetails()` now use explicit
  projections; status changes are recorded atomically with the update.
- Founder profile: `getProfile()` now exposes `profiles.created_at`.
- Founder browse students / founder student detail: general shortlist helpers
  are scoped correctly and the directory read drops unused CV/PII columns.
- Founder shortlists / admin students: shortlist replacement is transactional;
  order reads use explicit columns; project ownership is checked when an order
  is inserted; receipt writes are blocked after confirmation/rejection.
- Admin overview / how-it-works: added `(founder_id, status)` indexes for
  project and order status filters. Explicit projections reduce over-fetch even
  where pagination is still outstanding.
- Status contracts: re-verified against `neon/schema.sql`. Project
  (`open`, `in_progress`, `review`, `completed`), application
  (`pending`, `shortlisted`, `accepted`, `rejected`) and order
  (`pending`, `submitted`, `confirmed`, `rejected`) values match the current
  actions and UI. No stale status literal was introduced.

## Routed to the workflow owner

These need call-site or server-action changes outside this owner's file list,
so they were not partially patched here:

- `app/actions/projects.ts`: rename/replace `updateApplicationStatus` with a
  founder-scoped conditional update (check `projects.founder_id` inside the SQL)
  and treat zero affected rows as an authorization failure. The current action
  still checks the parent project first, so there is no active bypass.
- `app/actions/shortlist-order.ts`: require `founderId` in `getOrder()` and
  `setOrderScreenshot()` so ownership is enforced inside the helpers. The action
  currently checks `order.founder_id` before upload.
- `app/actions/auth.ts`, `proxy.ts`, `lib/rate-limit.ts`: automatic/authoritative
  role mirroring after Neon outages, shared atomic rate-limit counters, and an
  explicit retry or "profile setup incomplete" state when `ensureProfile`
  fails.
- `app/actions/student-profile.ts`, `app/founder/profile/actions.ts`:
  session-bound own-profile helpers with actor/owner comparison;
  `updateProfileFullName(id, name)` still accepts any primary key.
- Application boundary: verify a complete student profile and an existing CV
  object before `insertApplication()`. `cv_path` remains a plain text path with
  no object-existence guarantee.
- Confirmed-order proof: decide whether the database must reject
  `status = 'confirmed'` with a null `screenshot_path`/`confirmed_at`. A check
  constraint would need a backfill decision for existing rows, so none was
  added in this pass.
- Deletion/retention and account suspension: no tombstone, deletion-request
  state, or `active`/`suspended` profile column exists. The privacy and terms
  promises need a defined flow before schema or lifecycle work.
- Admin overview N+1/duplicate scan and founder-browse N+1 eligibility checks:
  need new batched helpers plus page/action call-site changes.
- `lib/validators.ts` budget/title bounds, `lib/env.ts` production `APP_URL`
  guard, and World Bank partial-failure fields are outside the database-owner
  file list.

## Routed to the design-system / test owners

- `components/ui/status-timeline.tsx`: use the new status history instead of
  index-based "Not yet" inference; 11px guidance text remains shared.
- `components/data/live-context.tsx`, `components/marketing/*`,
  `components/layout/workspace-stats.tsx`: partial-outage warning, photo credit
  provenance, and stat accessible names remain with their owners.
- Cross-founder negative tests for application status, order ownership,
  shortlist scope and rejected receipt uploads still need a focused test file;
  none was added because the current suite has no direct harness for
  `lib/neon-data.ts` and no live database mutations were allowed.

## Deliberately not changed

- Global Neon no-RLS posture: `neon/schema.sql:1-4` states authorization stays
  in the application layer. This is an architecture-wide decision already owned
  by the final/orchestrator audits; adding partial RLS here would be misleading.
- Unbounded reads: `listAdminStudents()`, `listAllApplicationStudentIds()`,
  `listStudentApplications()`, `listOrders()`, `listFounderOrders()`,
  `listBrowseableStudents()` and `listProjectApplicants()` still have no default
  limit. Adding a silent cap would truncate real pages; a pagination contract
  and caller changes are required.
- `getStudentProfile()` and `getShortlist()`-style detail reads still accept raw
  IDs; ownership is checked by the API route/actions. Tightening them requires
  actor IDs from the workflow layer.
- CV object existence, seed cleanup for `@btc-e2e.test`, and storage lifecycle
  were left for the launch/platform flow; no destructive seed or live storage
  change was made.
- No other agent's report, page file, server action, proxy, validator, component,
  or test was edited. Pre-existing uncommitted work was preserved.

## Checks performed

- `npx tsc --noEmit --pretty false` — clean.
- `npx eslint lib/neon-data.ts` — clean.
- `git diff --check -- lib/neon-data.ts neon/schema.sql` — clean.
- Read-only source verification of all 30 `reports/page-fixes/*.md` database
  sections, the 30 page reports' relevant callers, `neon/schema.sql`,
  `supabase/migrations/**`, `scripts/neon-setup.mjs`,
  `scripts/neon-mirror-identities.mjs`, and the installed
  `@neondatabase/serverless` transaction typings.
- No full build, full test suite, dev server, or live database mutation was run.
