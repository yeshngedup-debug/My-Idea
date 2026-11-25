# Page fixes — `/founder/browse-projects` (founder-browse-projects)

Per `reports/page-fixes/MANIFEST.md`. Only `app/founder/browse-projects/page.tsx`
and `app/founder/browse-projects/browse-projects-client.tsx` were changed. The
dirty working tree was treated as source of truth; no git checkout/reset/stash/
clean was run, and no shared, database, workflow, or report file outside this
slug was edited.

## Files changed

### `app/founder/browse-projects/page.tsx`

- **Line 19 — duplicate brand in the document title (U2).** Changed
  `title: 'Browse Projects | Bhutan Tech Connect'` to `title: 'Browse Projects'`.
  `app/layout.tsx:17-20` already applies the `%s | Bhutan Tech Connect`
  template, so the old value rendered the brand twice. The root template now
  appends it once.

### `app/founder/browse-projects/browse-projects-client.tsx`

- **Lines 7-19, 100-168 — filter stays local and keyboard-complete (U1).**
  Preserved the pre-existing user work that wrapped `SegmentedControl` and
  added `handleFilterKeys`. Made it position-based, added focus movement and
  `preventDefault()` for Arrow/Home/End, and added a local `onClick` handler
  that maps the clicked button to the same `status` state. This keeps
  `aria-pressed`, the live count, and the rendered rows driven by one local
  state value even while the shared control's suspected hydration/CSP problem
  is investigated. The shared `onChange` prop is still passed; both paths set
  the same value.
- **Lines 53-59, 212-218 — status dot now encodes status (U4).** Replaced the
  single `bg-amber-300` dot with a map over the four schema statuses using
  existing vermilion, forest, amber, and success tokens. Unknown values fall
  back to the muted ink token. The dot remains `aria-hidden`; the text label
  is still the accessible status.
- **Lines 61-62, 94, 221-280 — brief details are reachable (U3).** Added an
  `expandedId` disclosure per card. The description and skills are wrapped in
  region identified by `aria-controls`. When more than six skills exist, the former
  bare `+N` badge is now a real button with an explicit `aria-label` and
  `aria-expanded`; it reveals all skills and removes the description clamp.
  Cards with at most six skills get a `View full brief` / `Show less` button
  when a description exists. Controls use the existing 44 px target, focus
  ring, warm-paper border, and small-text palette.
- **Lines 13-19, 298-306 — work-mode icon corrected (U5).** Replaced
  `CurrencyCircleDollar` with `MapPin` for `onsite` and `Globe` for remote,
  matching the visible `On-site` / `Remote` value.
- **Lines 64-78 — date-only deadlines no longer shift by timezone (U6).**
  `formatDate` now parses a bare `YYYY-MM-DD` value from local calendar parts
  before formatting, while leaving `timestamptz` values such as `createdAt` on
  the normal `Date` path. This preserves the stored deadline date for viewers
  outside Bhutan.

No new dependency, gradient, violet, emoji, invented data, or wholesale
rewrite was introduced. `app/founder/browse-projects/loading.tsx` was reviewed
and left unchanged.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full, `reports/page-audits/founder-browse-projects.md`,
  and the relevant `/founder/browse-projects` rows and cross-reference notes in
  `reports/page-audits/CONSOLIDATED.md` (lines 48, 116-121, 153, 175-178, 248-249).
- Read `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css` before
  choosing colours and control styling.
- Read the relevant Next 16 guides before editing:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`, and `02-guides/content-security-policy.md`. The CSP
  guide was checked because U1's suspected cause involves nonce handling.
- Source-verified every audit lead against the current files. U2-U6 were
  confirmed and fixed above. U1's runtime symptom was confirmed in the audit,
  but its root cause was explicitly left unproven; the local mitigation above
  is source-level only and was not runtime-driven here.
- Verified Phosphor icon availability for `Globe` and `MapPin` in
  `node_modules/@phosphor-icons/react/dist/csr/`.
- `node_modules/.bin/eslint.cmd app/founder/browse-projects/page.tsx app/founder/browse-projects/browse-projects-client.tsx app/founder/browse-projects/loading.tsx`
  — clean, no findings.
- Checked `git diff -- app/founder/browse-projects/...`: the pre-existing user
  change to `browse-projects-client.tsx` (keyboard handler wrapper) was kept and
  extended rather than discarded.
- No full `next build`, `npm test`, or dev server was run, per the manifest.
  No migration, schema, seed, config, or shared source was changed.

## Workflow findings routed out

These need shared files and are **not** fixed here.

- **U1 (HIGH symptom; root cause unproven) — shared filter/hydration path.**
  `components/interactive/segmented-control.tsx:37-98` owns the button click,
  `aria-pressed`, and arrow-key focus behaviour. The audit observed a click
  and arrow focus move with no state change, and CSP diagnostics suggested a
  possible nonce/hydration problem: `proxy.ts:37-59` generates the nonce and
  CSP header, while `app/layout.tsx:62,111-114` consumes `x-nonce` manually for
  JSON-LD. Next 16's CSP guide says Next applies nonces automatically during
  dynamic rendering (`content-security-policy.md:179-193`). **Recommended fix
  (design-system + workflow owners):** confirm whether framework scripts
  receive the request nonce, force dynamic rendering only if the docs require
  it, then re-drive click, Arrow/Home/End, and assert `aria-pressed`, count
  text, and rows change together. This route now has local click/arrow state
  handling, but that is mitigation, not proof that the shared cause is fixed.
- **W1 (MED) — role-lookup failure misroutes a founder.** `proxy.ts:28-33`
  collapses any `getProfileRole` error to `null`; `proxy.ts:117-126` maps
  `null` to `ROLE_HOME.student` (`/student`). `lib/neon-data.ts:47-54` rethrows
  real database errors, so this is a fail-open navigation fallback rather than
  a data-exposure path. **Recommended fix (workflow owner):** distinguish
  "no role" from "lookup failed" and return a retryable error state on
  infrastructure failure instead of defaulting to the student dashboard.
  This is inherited from `reports/page-audits/admin-overview.md:64`,
  `admin-projects.md:82-86`, `student-overview.md:156-171`, and
  `founder-overview.md:167`.
- **W2 (LOW) — the ledger is intentionally a dead end.** The copy at
  `browse-projects-client.tsx:322-324` says these are read-only briefs and the
  poster manages applicants; card titles are plain `h2` text, and the adjacent
  `/founder/projects/[id]` route rejects non-owners. **Recommended fix
  (product/workflow owner):** either accept and document this as an inspiration
  ledger, or add a separately authorized read-only detail/intro action. No
  next step was invented here because no safe route exists yet.

## Database findings routed out

Fields/queries verified read-only:

- `app/founder/browse-projects/page.tsx:22-35` uses Supabase `getUser()` and a
  Neon role lookup, then filters the signed-in founder's rows in memory before
  batch-loading names. No browser-supplied founder or project ID reaches SQL,
  and `lib/neon-data.ts:74-87` uses `id = any(${ids}::uuid[])` for names, so
  there is no N+1 or IDOR path on this route.
- The displayed fields exist on `public.projects`: `title`, `description`,
  `founder_id`, `required_skills`, `budget_min`, `budget_max`, `duration`,
  `work_mode`, `deadline`, `status`, and `created_at`
  (`neon/schema.sql:18-33`; mapped at `lib/neon-data.ts:191-208`). `status`
  has a check constraint for `open`, `in_progress`, `review`, `completed`
  (`neon/schema.sql:25`), matching `FILTERS` and `STATUS_LABEL` exactly.
  `deadline` is a `date` (`neon/schema.sql:32`), which is why U6 needed the
  local-calendar parse fix.

Findings for the database owner:

- **D1 (MED) — platform-wide read relies only on page-level authorization.**
  `neon/schema.sql:1-4` and `lib/neon-data.ts:1-7` state that Neon has no RLS.
  `lib/neon-data.ts:322-332` exposes `listAllProjectsWithDetails()` as an
  unscoped helper, and `page.tsx:32-35` narrows the rows only after fetching.
  **Recommended fix:** add an explicit role-aware, read-only helper such as
  `listProjectsExceptFounder(founderId)` for this route, and/or add a shared
  server-side role assertion plus database defence in depth for aggregate
  project reads. This extends `reports/page-audits/admin-overview.md:76` and
  `reports/FINAL-AUDIT.md:59-60`; it is not a new RLS defect unique to this
  route.
- **D2 (LOW) — full-table fetch and in-memory narrowing.**
  `lib/neon-data.ts:325-328` runs `select * from public.projects order by
  created_at desc` with no limit, then `mapProject` materializes unused fields
  such as `student_id` and legacy `budget` (`:191-208`). `neon/schema.sql:87`
  indexes `(founder_id, created_at desc)`, not bare `created_at`.
  **Recommended fix:** add a bounded projection with
  `where founder_id <> ${user.id}`, select only displayed columns, and add an
  index only if a measured query plan justifies it.
- **D3 (LOW, new source note) — `work_mode` has no DB constraint.**
  `neon/schema.sql:31` declares `work_mode text not null default 'remote'`
  with no check. The UI maps only `onsite` to `On-site` and treats every other
  value as `Remote` (`browse-projects-client.tsx:300-309`). **Recommended fix:**
  add a check constraint matching the product's allowed modes if that contract
  should be enforced at the database boundary.

## Deliberately not changed

- **Shared `SegmentedControl`, `Badge`, layouts, `app/layout.tsx`, `proxy.ts`,
  `lib/neon-data.ts`, and `neon/schema.sql`** — owned by the design-system,
  workflow, or database agents. U1's suspected root cause and W1/D1-D3 are
  routed above instead of being partially patched here.
- **`app/founder/browse-projects/loading.tsx`** — already renders the shared
  `WorkspaceLoading` with sensible ledger/list row counts; no audit finding
  applies and no change was needed.
- **No read-only detail route or new card action for W2** — that requires a
  separate authorized route and product decision, not a local copy tweak.
- **No regression test was added** — the manifest prohibits running the full
  test suite and this pass had no owned test file. The U6 fix is source-level
  and should be covered by the database/QA owner's date regression test.
- **No runtime browser re-drive** — the manifest forbids starting a dev server.
  U1's local mitigation therefore remains unverified at runtime and is flagged
  above for the shared owner.
- **Pre-existing dirty user work** — the keyboard-wrapper approach in
  `browse-projects-client.tsx` was preserved and refined, not reverted.
