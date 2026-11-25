# `/founder/students/[id]` (founder-student-detail) page-fix report

## Files changed

- `app/founder/students/[id]/page.tsx`
  - Added `z.uuid().safeParse(id)` validation immediately after `await params`;
    malformed IDs now call `notFound()` before cookies or any Neon query
    (audit F4).
  - Replaced the unfiltered `getShortlist` result with a local filter over
    `listFounderShortlists`: only a row with `student_id === id`,
    `source === 'founder'` and `project_id == null` counts as an existing
    general request. Admin and project-scoped rows no longer disable the
    button (audit F3).
  - Imported existing read-only Neon helpers and computed the two gates on the
    server before rendering:
    - `canRequestShortlist = hasApplied || generalUnlocked`, matching the
      `projectId = null` path in `lib/neon-data.ts:725-786`.
    - `canViewCv = hasApplied || hasShortlistWithOrder(...)`, matching
      `app/api/cv/[id]/route.ts:63-82`.
    The CV link is replaced by a short access note when `canViewCv` is false,
    and `ShortlistButton` receives `canRequest`. The API and action gates are
    unchanged (audit F2, `CONSOLIDATED.md:173-174`).
  - Removed the dead `user ?` guard; the `!user` redirect already narrows it
    (audit F8).
  - Replaced raw hex classes with theme utilities (`text-body-secondary`,
    `text-primary`, `border-border`, `bg-card`, `bg-background`,
    `text-muted-foreground`, `ring-ring`); raised the back link from `min-h-9`
    to `min-h-11`; added `motion-reduce:transition-none` to the CV link
    (audits F5, F6).
- `app/founder/students/[id]/shortlist-button.tsx`
  - Added a required `canRequest` prop. Ineligible founders see a disabled
    `Not eligible yet` button plus a short reason and a `View shortlists`
    link; the click handler also guards against ineligible clicks.
  - Kept one always-mounted `role="status" aria-live="polite" aria-atomic="true"`
    region for pending, success and error text instead of swapping role/live
    at announcement time. Added `aria-busy={pending}` and an announced pending
    message (audit P2).
  - Used `colors.smallTextAccent` from `lib/design-tokens.ts` for error text and
    theme utilities for the rest; no raw hex remains.
  - Calls `router.refresh()` after a successful request so the server-computed
    CV gate updates in place. The client state keeps the button in `Shortlisted`
    while the server payload refreshes.
  - Added `motion-reduce:transition-none` to the button transition.

No other file was edited.

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/founder-student-detail.md`, the relevant rows and the
  priority list in `reports/page-audits/CONSOLIDATED.md`,
  `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`, and the
  existing fix-report style in `reports/page-fixes/home.md`.
- Read the installed Next.js 16 guides for the APIs touched:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`, plus
  `03-api-reference/03-file-conventions/dynamic-routes.md`,
  `03-api-reference/04-functions/not-found.md` and
  `03-api-reference/04-functions/use-router.md`. The docs confirm that
  `params` is a `Promise`, that `notFound()` throws in a Server Component
  render path and narrows to `never`, and that `router.refresh()` re-renders
  Server Components without losing unrelated client state.
- Source verification only (read-only) for the shared workflow:
  `proxy.ts:100-132`, `lib/supabase/server.ts:16-41`,
  `app/actions/shortlist.ts:17-55`, `app/api/cv/[id]/route.ts:22-93`,
  `lib/neon-data.ts:47-55,492-508,614-624,725-786,788-803,819-831,885-909,1046-1059`,
  and `neon/schema.sql:35-101`. The page's new gates mirror those contracts;
  no server-side authorization was weakened.
- `npx eslint "app/founder/students/[id]/page.tsx" "app/founder/students/[id]/shortlist-button.tsx"`
  — exit code `0`, no findings.
- `git diff -- <the two owned files>` reviewed after editing; no unrelated
  file was touched. No full build, test suite, or dev server was run, per the
  manifest.

## Workflow findings routed to the workflow owner

- **F1 remains open in shared code.** `app/api/cv/[id]/route.ts:84-89` still
  returns raw JSON `{"error":"Could not generate CV link"}` with status `500`
  when Supabase Storage cannot sign the URL; the verified seeded flow in
  `reports/page-audits/founder-student-detail.md:47` hit exactly that branch.
  This page now hides the link for ineligible founders, but an eligible founder
  with a stale or missing Storage object still gets the same JSON tab.
  Recommended fix in the workflow owner's scope: log the Storage error
  server-side and return a browser-friendly error page (or redirect with a
  recoverable flag) for navigation requests. Keep the 403 relationship gate at
  `app/api/cv/[id]/route.ts:63-82` unchanged.
- **Seed/CV object mismatch (P1).** `supabase/seeds/local-dev.sql` writes
  `cv_path` values without a matching object in the `cvs` bucket, which is the
  likely cause of the observed 500. Fix in the seed/DB tooling, not here.
- **Shared action error copy.** `app/actions/shortlist.ts:49` still returns
  raw database error detail on unexpected failures. This route reaches that
  branch, but the finding is already owned by
  `reports/page-audits/founder-browse-students.md:86-89`; no duplicate fix was
  made here.
- **Detail-path revalidation.** `app/actions/shortlist.ts:52-53` revalidates
  `/founder/browse-students` and `/founder/shortlists` but not the detail
  route. The owned client component now calls `router.refresh()` on success,
  which is enough for this page. The workflow owner may still add an explicit
  detail-path revalidation for non-browser callers.
- **CV route ID validation.** The page now rejects malformed UUIDs, but a
  direct `GET /api/cv/not-a-uuid` still reaches `getStudentProfile(id)` at
  `app/api/cv/[id]/route.ts:42` with a raw path segment. Recommend the same
  UUID guard there.
- The auth chain itself is sound: `proxy.ts` validates the Supabase JWT and
  role, `page.tsx:37-51` rechecks identity and role, and the CV route/action
  recheck independently. No auth change was needed.

## Database findings routed to the database owner

- **Unfiltered shortlist lookup.** `lib/neon-data.ts:788-803`
  (`getShortlist`) selects any founder/student row with no `source`,
  `project_id` or `status` filter, so an admin or project-scoped row could
  disable the general request. This page no longer calls it and filters
  `listFounderShortlists` locally, but the shared helper remains a trap for
  other callers. Recommend a scoped `getGeneralFounderShortlist(founderId,
  studentId)` that filters `source = 'founder' and project_id is null`, then
  use it here and on `/founder/browse-students`. The existing partial unique
  index `shortlists_one_per_founder_student_general`
  (`neon/schema.sql:96-98`) already supports that predicate.
- **Unbounded read introduced as a local workaround.** `listFounderShortlists`
  at `lib/neon-data.ts:819-831` reads every row for the founder. Filtering in
  the page fixes the wrong UI state without editing shared code, but a
  server-side scoped query is the durable fix and avoids scaling the read with
  the founder's shortlist size.
- **`select *` over-fetch (F7).** `lib/neon-data.ts:614-624` still selects all
  `student_profiles` columns for a page that consumes only profile copy and
  `cv_path`. Left unchanged; recommend a detail-specific projection.
- **`cv_path` has no object-existence guarantee.** `neon/schema.sql:57`
  stores a plain `text` path. Nothing in the schema, seed or migration proves
  that a matching Storage object exists, which is the P1/F1 root cause.
  Recommend a seed smoke check that calls the CV route for each seeded
  student, or only setting `cv_path` from a verified upload.
- Current schema values are consistent with this page: `student_profiles`
  availability and year checks (`neon/schema.sql:49,52-55`) match
  `AVAILABILITY_LABEL` and the profile copy; `shortlists.status`
  (`neon/schema.sql:69`) is not rendered here; confirmed order filtering uses
  `status = 'confirmed'` at `lib/neon-data.ts:1046-1059`, matching
  `neon/schema.sql:81`. No stale-status copy was found on this route.

## Deliberately not changed

- `app/api/cv/[id]/route.ts`, `app/actions/shortlist.ts`, `lib/neon-data.ts`,
  `neon/schema.sql`, `supabase/**`, `proxy.ts`, `app/globals.css` and
  `lib/design-tokens.ts` — shared files, outside this route's ownership table.
- A route-scoped `error.tsx` or `not-found.tsx` for this segment (audit F4)
  — not in the owned file list; the malformed-ID case is now handled in the
  page and unexpected errors still reach the shared boundary.
- The CV 500 fallback and seed fixture (F1/P1) — shared workflow/DB fixes,
  routed above. The page only avoids offering the link to ineligible founders.
- No new dependency was added: `zod` is already in `package.json:35`. No
  gradients, violet, emoji, wholesale rewrite, or broad copy edits were
  introduced.
- No full build, test suite, or dev server was run; runtime behaviour was not
  re-verified by this agent. The changes are grounded in local Next.js 16 docs
  and source verification.
