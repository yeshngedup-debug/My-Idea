# Page fix — `/privacy`

Slug: `privacy`. Route: `/privacy`. Owned file: `app/privacy/page.tsx`.
Uncommitted working-tree changes were treated as authoritative. No shared file,
other page file, schema, or config was edited. No build, test suite, or dev
server was run.

## Files changed

- `app/privacy/page.tsx` — three copy-only fixes. No layout, class, metadata, or
  component structure changed.

## Key changes

- **`app/privacy/page.tsx:138` (audit MED, "Who can see your data")** — replaced
  the overbroad "Founders can see completed student profiles and CVs (including
  contact email)" with three precise sentences: founders browse completed
  profiles; CV access needs an application to one of their projects or a
  confirmed paid shortlist; contact email appears for project applicants and
  paid shortlists. Verified against `app/founder/browse-students/page.tsx:32-52`,
  `app/api/cv/[id]/route.ts:59-82`, `app/founder/projects/[id]/project-detail-client.tsx:205-209`,
  and `app/founder/shortlists/shortlists-client.tsx:327-336`.
- **`app/privacy/page.tsx:157` (audit HIGH, "What we never do")** — removed the
  false "Only the founder who paid for it sees them" claim. The line now says the
  paying founder sees the delivered shortlist and admins can access profile data
  to verify and prepare it, while keeping "never share shortlist contents
  publicly". Verified against `app/actions/admin-students.ts:86-161`,
  `app/admin/students/admin-students-client.tsx:201-225`, and
  `lib/neon-data.ts:658-668`.
- **`app/privacy/page.tsx:173` (audit LOW, "Deleting your data")** — replaced the
  bare "We will remove it on request" with a concrete manual process: email from
  the address on the account, state what to delete, identity is confirmed from
  the sending address, profile/CV/related data are removed where possible, a
  reply confirms, and order records may be kept after payment. The existing
  mailto at `:178-182` remains the single action.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full; confirmed only `app/privacy/page.tsx`
  is owned for this slug and that `reports/page-fixes/privacy.md` did not exist
  before this pass.
- Read `reports/page-audits/privacy.md`, the `/privacy` rows and cross-route notes
  in `reports/page-audits/CONSOLIDATED.md` (lines 42, 107-115, 152, 163-194,
  263-268), `AGENTS.md`, the Next 16 guides for layouts/pages, server/client
  components, and metadata/OG images under `node_modules/next/dist/docs/01-app/`,
  `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, and `app/globals.css`.
- Re-read the current `app/privacy/page.tsx` before editing; all three audit
  findings were still present in source, so none were stale.
- Source-verified every copy claim against the implementation files listed above
  plus `supabase/premium-shortlists.sql:42-69` (private screenshot bucket,
  owner/admin select only), `app/admin/payments/page.tsx:62-89` (short-lived admin
  signed URLs), and `supabase/migrations/20261124000000_close_security_bypasses.sql:155-181`
  (CV storage policy).
- `git diff -- app/privacy/page.tsx` reviewed: only the three intended copy lines
  are mine; the pre-existing `inline-flex min-h-6 items-center` change on the
  mailto link at `:179` is user work and was preserved untouched.
- `npx eslint app/privacy/page.tsx` — clean, no findings.

## Workflow findings routed to the workflow owner

- **No deletion or deletion-request flow exists (audit LOW).** Observed: a grep
  over `app/**/*.ts*` found no account/profile/CV deletion action, request
  screen, identity check, or retention rule; the only `delete` calls are UI
  selection bookkeeping in `app/student/projects/projects-client.tsx:227` and
  `app/admin/students/admin-students-client.tsx:125,135,163,194`. The page's
  sole action is `mailto:${APP_CONTACT.email}` at `app/privacy/page.tsx:178-182`
  (`config/app.ts:4-6`). I made the copy honest and concrete, but a manual
  promise cannot become an enforceable one from this file. Recommended fix for
  the shared workflow owner: add an authenticated deletion/request path covering
  `student_profiles`, the `cvs` storage objects, and related rows, with identity
  verification, an explicit scope, and a defined response window; or, if the
  process stays manual, publish a real SLA rather than leaving it undefined.
  I did **not** invent a numeric response time in the copy because no such
  policy exists in the repo and that is a product decision.
- **CV-access rule is phrased differently across routes (consolidated P1 item
  2).** My line at `app/privacy/page.tsx:138` now matches the implementation:
  `app/api/cv/[id]/route.ts:59-63` grants access on an application to the
  founder's project as well as on a confirmed paid order. The same claim is
  still worded as "confirmed order only" on `/for-founders`, `/how-it-works`,
  and `/for-students` (see `reports/page-audits/CONSOLIDATED.md:107-115,263-268`).
  If product intends confirmed-order-only access, remove the application grant
  in `app/api/cv/[id]/route.ts:59-63` (and the matching storage policy at
  `supabase/migrations/20261124000000_close_security_bypasses.sql:163-169`) and
  update those three pages. I did not change the route or another page's file.
- **Admin shortlist access is by design, not a bug.** `app/actions/admin-students.ts:86-161`
  builds a shortlist with names, ranks, contact emails, and CV links for admins
  to download, which matches the voice guide's "admins curate shortlists". This
  is why the privacy copy now names admins; no workflow fix is requested.

## Database findings routed to the database owner

- **No deletion/retention enforcement behind the privacy promise.** `neon/schema.sql`
  cascades row deletion from `public.profiles` to `student_profiles`,
  `applications`, `shortlists`, and `shortlist_orders` (`:8-85`), but there is no
  action, trigger, or storage lifecycle that initiates it, and CV objects live in
  Supabase Storage rather than Neon. See the workflow item above; the data-layer
  half belongs to the database owner once a flow is defined.
- **Stale/absent status values for a deletion state:** `neon/schema.sql:9-10` and
  `:44-85` define no deletion-request or tombstone state on `profiles`,
  `student_profiles`, or `shortlist_orders`. If a request queue is added, define
  it explicitly rather than overloading `shortlist_orders.status`.
- **Unbounded reads used by the visibility claims:** `lib/neon-data.ts:641-655`
  (`listBrowseableStudents`) and `:658-668` (`listAdminStudents`) run `select *`
  with no `limit` or projection. `:614-624` (`getStudentProfile`) also selects
  `*` by caller-supplied id; ownership is checked in `app/api/cv/[id]/route.ts`,
  not in the query. These are scale/least-privilege risks for the database
  owner, not defects introduced or fixable on this static page.
- **Global no-RLS posture noted, not re-owned:** `lib/neon-data.ts:1-7` and
  `neon/schema.sql:1-4` state that authorization is application-layer only. This
  remains owned by the shared database/architecture reports.
- **Verified accurate, no finding:** `supabase/premium-shortlists.sql:42-69`
  keeps payment screenshots in a private bucket readable only by the owner or an
  admin; `app/admin/payments/page.tsx:62-89` exposes them to admins via one-hour
  signed URLs. The page's "visible only to you and our admins" line at
  `app/privacy/page.tsx:140` matches that. `app/privacy/page.tsx` itself performs
  no query, mutation, or storage call.

## Deliberately not changed

- **Metadata at `app/privacy/page.tsx:7-14`** — title, description, and canonical
  already render correctly and use a colon, not an em-dash. Missing route-level OG
  values are owned by `reports/performance-seo.md:233` and by the design-system
  owner; the audit explicitly says not to change them in this pass. The
  description's "how to request deletion" remains accurate after the copy fix.
- **`legal-mount` fade and reduced-motion rule at `:16-27`**, the anchor nav at
  `:29-35,69-85`, section ids and `aria-labelledby` at `:89-184`, skip-link target
  `main#main-content` at `:39`, and the mailto classes at `:179` — the audit found
  no new UI issue and the existing contrast/reflow coverage belongs to
  `reports/accessibility-critic.md:17,41`. I preserved the user's uncommitted
  mailto target-size change rather than touching it.
- **Contact email source `config/app.ts:4-6`** — shared config, outside ownership.
- **No new dependencies, gradients, violet, emoji, or wholesale rewrite** were
  introduced; all edits stay inside the warm-paper/forest/vermilion copy set.
