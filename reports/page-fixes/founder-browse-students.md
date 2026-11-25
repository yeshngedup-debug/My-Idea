# Page fixes — `/founder/browse-students` (founder-browse-students)

Per `reports/page-fixes/MANIFEST.md`. Only the two owned source files and this
report were edited. The dirty working tree was treated as source of truth; no
`git checkout`, `reset`, `stash`, `clean`, or shared-file edit was performed.

## Files changed

### `app/founder/browse-students/page.tsx`

- **Lines 28-32 — auth before data (D1/D4).** `if (!user) redirect('/login')`
  now runs before any directory read, `getProfileRole(user.id)` is awaited on
  its own, and `role !== 'founder'` redirects to `/student` before the
  shortlist/student/project queries. The proxy remains the first line of
  defence; the page no longer fails open when the user is null or renders
  founder data for a signed-in non-founder.
- **Lines 34-39 — scoped data reads.** Replaced the unscoped
  `listShortlistedStudentIds` call with `listFounderShortlists(user.id)` and
  added `listProjectsByFounder` plus `listConfirmedOrderProjectIds`. All reads
  stay behind the role guard.
- **Lines 41-45 — correct general shortlist state (W2, page-level).** The
  shortlisted set now contains only rows where `source === 'founder'` and
  `project_id == null`, matching the action's idempotency check at
  `lib/neon-data.ts:751-760`. Admin rows and project-scoped rows no longer
  disable a card's general request button.
- **Lines 47-54 — server-side eligibility (W1).** Mirrors the action gate at
  `lib/neon-data.ts:732-749`: a student is eligible when they applied to any
  project owned by this founder, or when a general shortlist order
  (`project_id is null`) is confirmed. `StudentCard.canRequestShortlist` is
  computed once on the server and sent to the client; no client-side guesswork.
- **Lines 56-70 — card props.** Maps the eight existing profile fields plus the
  new eligibility flag. The existing profile-quality filter is unchanged.

### `app/founder/browse-students/browse-client.tsx`

- **Line 8 / lines 123-129 — named, 44px availability control (U2).** Replaced
  the unnamed `div` of `min-h-9` buttons with the shared `SegmentedControl`,
  passing `ariaLabel="Availability"`. This also brings arrow/Home/End focus
  navigation without editing the shared component.
- **Lines 19-20 / 211-243 — no predictably failing CTA (W1).** Ineligible
  students now get `View shortlist options` linking to `/founder/shortlists`
  instead of a `Request shortlist` button that the server action rejects.
  Eligible students keep the existing button and visible label.
- **Lines 216-220 / 236-242 — per-control accessible names (U1).** Added
  student-specific `aria-label`s to both the request button and the fallback
  link while leaving the visible text unchanged.
- **Lines 51-53 / 68-96 / 245-251 — nearby action feedback (W3).** Status is
  keyed by student ID, cleared on a new request, shown immediately under the
  clicked card, and a `try/catch/finally` prevents a rejected/thrown action
  from leaving the card stuck on `Sending...`. The existing mounted live region
  at lines 137-154 is retained for assistive-tech announcements.
- **Lines 77-82 — safe error copy (D3, client side).** Generic failures no
  longer print the action's raw driver detail; only the explicit, user-safe
  relationship guidance is passed through verbatim.
- **Line 178 — token normalization (U3).** Dropped raw
  `border-amber-200 bg-amber-50`; the availability badge now uses
  `<Badge variant="outline">` with the existing amber text token
  `text-[#8a5a00]`.

### `reports/page-fixes/founder-browse-students.md`

- Created this report.

No new dependencies, gradients, violet, emoji, or wholesale UI rewrite were
introduced. The warm-paper / forest / vermilion / amber palette and existing
focus-ring utilities are unchanged.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full, the audit at
  `reports/page-audits/founder-browse-students.md`, the relevant
  `reports/page-audits/CONSOLIDATED.md` sections, `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, and `app/globals.css`.
- Read the relevant Next 16 guides before editing:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`, and
  `10-error-handling.md`. Applied the guidance that Server Components redirect
  before data reads, interactive state belongs behind the client boundary, and
  Server Action results must be handled as expected outcomes with explicit
  error states.
- Source-verified every acted-on lead against current code, including
  `app/actions/shortlist.ts:17-54`, `lib/neon-data.ts:492-508,641-656,725-832,1046-1059`,
  `components/interactive/segmented-control.tsx:26-98`, `components/ui/badge.tsx:1-20`,
  `neon/schema.sql:35-101`, and `proxy.ts:25-32,110-126`.
- `npx eslint app/founder/browse-students/page.tsx app/founder/browse-students/browse-client.tsx`
  — clean (`ESLINT_OK`).
- Reviewed `git diff --stat -- app/founder/browse-students/...`: the diff also
  contains pre-existing user work in both owned files. That work was preserved.
- No full `next build`, `npm test`, or dev server was run, per the manifest.
  Runtime verification was therefore not repeated; the audit's earlier
  `NO_SERVER` observation still stands.

## Workflow findings routed to the workflow owner

These require shared files and are **not** fixed here.

- **Generic shortlist failure still leaks internal detail — `app/actions/shortlist.ts:38-49`.**
  Observed: any database error that is neither `No relationship` nor a `23505`
  unique violation is returned as `Shortlist request failed: ${detail}`. The
  client now refuses to render that raw detail, but the action contract still
  exposes it to any caller. **Recommended fix:** log `detail` server-side and
  return `Shortlist request failed. Please try again.`; keep the explicit
  relationship guidance at lines 40-45, which is user-safe.
- **Missing rejection-branch regression coverage — `tests/e2e/founder-flow.test.ts:90-99`.**
  Observed: the existing founder test only proves the seeded happy path. The
  new ineligible-card behaviour and the action's `No relationship` branch have
  no test. **Recommended fix:** add a founder with no application and no
  confirmed order, assert the card shows `View shortlist options` and no
  request button, and assert a direct action call returns the guidance message
  without creating a `shortlists` row.
- **Central eligibility rule is still duplicated.** The page now mirrors the
  gate at `lib/neon-data.ts:732-749` using existing helpers, but the rule lives
  in two places. **Recommended fix (workflow + database owners):** introduce one
  server-side helper that returns the eligible student IDs for a founder, and
  have both the action and the page consume it. See the database section below
  for the query-shape recommendation.

No other workflow blocker was found in the owned files. The action's role and
target-role checks remain the authoritative server-side authorization.

## Database findings routed to the database owner

All traced SQL in `lib/neon-data.ts` is parameterized. `neon/schema.sql:35-101`
confirms the fields, status values, unique indexes and the absence of Neon RLS.
The global RLS/application-authorization risk is already owned elsewhere and is
not repeated here.

- **D2 (LOW) — unbounded, over-broad directory read — `lib/neon-data.ts:641-656`.**
  Observed: `listBrowseableStudents()` uses `select *` with no `limit` and maps
  fields such as `contact_email`, `cv_path`, `cv_url`, `rank`, `verified`, and
  timestamps that this route never serializes. Only eight fields reach the
  browser, so this is a server-side over-fetch/scalability issue, not a PII
  leak. **Recommended fix:** project only
  `id, full_name, college, course, year, skills, bio, availability` for this
  helper (or add a dedicated browse helper) and add cursor pagination ordered
  by `updated_at desc, id desc` before the directory grows. Leave detail/CV
  reads to `getStudentProfile` and `app/api/cv/[id]/route.ts`.
- **W2 (MED) — unscoped shortlist ID helper — `lib/neon-data.ts:805-817`.**
  Observed: `listShortlistedStudentIds()` returns every `student_id` for the
  founder with no `source`, `project_id`, or `status` filter. This page no
  longer calls it, but other consumers can still mark a general card as
  `Shortlisted` because of an unrelated admin or project row.
  **Recommended fix:** add a narrowly scoped helper with
  `source = 'founder' and project_id is null` for browse-style general
  requests; keep the unfiltered set only for `/founder/shortlists`, which
  legitimately needs admin and project rows.
- **Eligibility check is query-per-project — `page.tsx:51-54` against `lib/neon-data.ts:457-482,725-749`.**
  Observed: the page calls `listProjectApplicants` once per founder project to
  build the eligible ID set. This matches the action's join semantics (no
  application-status filter), but scales with the number of projects.
  **Recommended fix:** add one batched helper using `exists` against
  `applications join projects` plus a confirmed general order check, e.g.
  `listShortlistEligibleStudentIds(founderId)`, and use it from both the page
  and the action. Indexes at `neon/schema.sql:87-89` support the join, but a
  single query removes the N+1 round trips.

## Deliberately not changed

- Shared files: `app/actions/shortlist.ts`, `lib/neon-data.ts`, `neon/schema.sql`,
  `proxy.ts`, `components/interactive/segmented-control.tsx`,
  `components/ui/badge.tsx`, and all tests. Findings are routed above instead.
- Did not add a loading or error boundary for this route; neither file is owned
  by this slug and the manifest assigns shared boundaries to another owner.
- Did not change `listBrowseableStudents` projection/pagination or add an
  eligibility helper in `lib/neon-data.ts`; those are database-owned.
- Did not add E2E coverage here; `tests/**` is outside this slug's ownership.
- Did not reword the search/empty-state copy or change palette tokens beyond
  removing the raw `amber-*` badge classes. The existing voice-guide check
  found no invented metric, unearned social proof, or banned phrase.
- Pre-existing user work in both owned source files was left intact.
