# Page fix — `/how-it-works`

Slug: `how-it-works`. Route: `/how-it-works`. Owned file:
`app/how-it-works/page.tsx`. Uncommitted working-tree changes were treated as
authoritative. No shared file, other page file, schema, config, or report was
edited. No build, test suite, or dev server was run.

## Files changed

- `app/how-it-works/page.tsx` — copy-only fixes for audit findings F1, F2, F3,
  F4, F5 and suspected item S1. No layout, class, metadata, icon, image,
  component structure, or palette value was changed.
- `reports/page-fixes/how-it-works.md` — this report.

## Key changes

- **`app/how-it-works/page.tsx:46`, `:66-69`, `:198`, `:201-202` (F1)** — the
  founder step and brief columns no longer state that skills and a deadline are
  always set. The copy now says the founder writes the scope, budget and
  duration, and *can* list skills and a deadline. Verified against
  `lib/validators.ts:25-41`, `app/actions/projects.ts:40-82`, and
  `app/founder/projects/post/post-project-form.tsx:143,258-266`, where both
  fields are optional. Enforcement is routed out below.
- **`app/how-it-works/page.tsx:52`, `:77` (F2)** — "A complete profile and CV
  help founders decide" replaces the claim that completeness is the default
  path into an application. Verified against `lib/validators.ts:43-51`,
  `app/student/profile/profile-form.tsx:79-97,129-150`, and
  `app/actions/projects.ts:103-135`, which never checks completeness or
  `cv_path` before applying.
- **`app/how-it-works/page.tsx:89` (F4)** — the CV sentence now names the real
  access paths: short-lived checked links for admins, founders connected to an
  application, and founders with a confirmed shortlist order. Verified against
  `app/api/cv/[id]/route.ts:48-92` (signed URLs last 300 seconds; application
  grant at `:59-63`; confirmed-order/shortlist path at `:65-78`).
- **`app/how-it-works/page.tsx:93` (S1)** — "Students see the same status in
  their applications" is replaced with the separate application-status set.
  `app/student/applications/applications-client.tsx:25-38` renders application
  status only, never shortlist-order status.
- **`app/how-it-works/page.tsx:112` (F5)** — the after-shortlist step now names
  the admin-finalization step before the founder reviews students, matching
  `app/founder/shortlists/shortlists-client.tsx:304-307` and the admin
  review/rank actions in `app/actions/admin-students.ts:29-80,86-161`.
- **`app/how-it-works/page.tsx:362-363` (F3)** — closing CTA changed from
  `/signup` "Create student account" to `/contact` "Ask for founder access".
  The section still invites founders to bring a brief; signup assigns the
  `student` role by design (`app/actions/auth.ts:103-112`). The new href and
  label match `app/for-founders/page.tsx:174` and the `/contact` route.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full; confirmed the only owned source
  file is `app/how-it-works/page.tsx` and that
  `reports/page-fixes/how-it-works.md` did not exist before this pass.
- Read `reports/page-audits/how-it-works.md`, the `/how-it-works` row and
  cross-route notes in `reports/page-audits/CONSOLIDATED.md` (lines 41,
  107-115, 192-194, 263-268), `AGENTS.md`, the installed Next.js 16 guides
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  and `05-server-and-client-components.md`, `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`,
  and `app/globals.css`. This route stays a static Server Component with
  `pageMetadata`, `next/image`, and shared motion/client components receiving
  serializable props. It has no mutation, `searchParams`, or error boundary, so
  the mutating-data and error-handling guides were not needed.
- Re-read the current page before editing: all five confirmed findings were
  still present (not stale against a previous fix pass). The pre-existing
  uncommitted `id` props on the four `Chapter` calls at `:192`, `:235`, `:270`
  and `:307` were left exactly as found; they are the chapter anchors verified
  by the audit.
- Source-verified each rewritten claim against the files cited in "Key
  changes", plus `config/payment.ts:40-62`, `components/marketing/nav.ts:52-59`,
  `components/marketing/cta-band.tsx:6-58`,
  `app/student/applications/page.tsx:26-31`, and
  `app/privacy/page.tsx:138`.
- `git diff -- app/how-it-works/page.tsx` reviewed: only the intended copy is
  mine; the user's `Chapter id` edits are preserved untouched.
- `npx eslint app/how-it-works/page.tsx` — clean, no findings.

## Workflow findings routed to the workflow owner

- **F1 enforcement gap (server validator + founder form).** Observed:
  `lib/validators.ts:25-37` accepts an empty skill list and an optional
  `deadline`; `app/founder/projects/post/post-project-form.tsx:143,258-266`
  labels skills without a required marker and the deadline "Optional". A
  founder can publish a brief with neither. I made the page honest instead of
  false. Recommended fix if the product wants the original promise: add
  `skills.min(1)` and a required future `deadline` to `createProjectSchema`,
  mark both controls required, add them to the form checklist at
  `post-project-form.tsx:43-55`, and add a regression test. Do not edit those
  shared files from this route.
- **F2 apply-completeness gap.** Observed: `app/actions/projects.ts:103-135`
  checks role, project openness and duplicate applications only;
  `lib/neon-data.ts:380-389` inserts the application with no profile/CV lookup.
  Students can apply with no `bio`, `skills`, or `cv_path`. Copy on this page now
  presents completeness as guidance. Recommended fix if applying should require
  a complete profile: load the student row in `applyToProject` before
  `insertApplication`, require the fields listed at
  `app/student/profile/profile-form.tsx:81-88` plus a non-null `cv_path`, and
  return a clear message. This is the same root gap owned for `/for-students`
  at `reports/page-audits/for-students.md:16-21`.
- **F4 CV access rule.** Observed: `app/api/cv/[id]/route.ts:59-63` grants a
  founder CV access when the student applied to one of their projects, without
  a confirmed order; admins have unrestricted access at `:48-57`. The page copy
  now states that. If the intended rule really is "confirmed order only", the
  workflow owner should remove/gate the application grant at `:59-63`, align
  the matching storage policy in
  `supabase/migrations/20261124000000_close_security_bypasses.sql:163-169`, and
  add a test. I did not change the route; the current access is checked and
  signed, so this is a privacy-description fix, not an authorization bypass.
- **F5 shortlist release.** Observed:
  `app/founder/shortlists/shortlists-client.tsx:304-307` tells an unlocked
  founder the shortlist appears "as soon as the admin finalizes it", while the
  old page copy implied immediate release. This page now names that step. The
  separate live unlock-badge defect (W1,
  `components/founder/live-order-status.tsx:31-47`) stays with
  `reports/page-audits/founder-shortlists.md:70`; I did not touch shared
  components.
- **S1 student-visible order status.** Observed:
  `app/student/applications/page.tsx:26-31` maps application rows and
  `app/student/applications/applications-client.tsx:25-38` filters/labels only
  `pending`, `shortlisted`, `accepted`, `rejected`; no shortlist-order or
  payment-confirmation status is rendered. I clarified the copy rather than
  inventing a feature. If students should see order status, the workflow owner
  should add it to that view from the order table.
- **F3 signup role is by design, not a bug.** `app/actions/auth.ts:103-112`
  assigns every signup the `student` role and ignores client role fields. The
  closing CTA now sends founders to `/contact`. The separate header CTA
  mislabel is owned by `reports/cold-eyes.md:19` and was not edited here.
- **Cross-route copy consistency (consolidated P1 item 2).**
  `reports/page-audits/CONSOLIDATED.md:192-194,263-268` asks for one wording of
  the CV-access and shortlist-finalization promises across `/for-founders`,
  `/how-it-works`, `/for-students`, and `/privacy`. This route is now accurate.
  `app/privacy/page.tsx:138` was fixed in parallel
  (`reports/page-fixes/privacy.md:15-29`), but `app/for-founders/page.tsx:97,317-318`
  and `app/for-students/page.tsx:86` still use the old "confirmed order only" /
  "with your CV" phrasings. The workflow owner should unify them in phase 2.

## Database findings routed to the database owner

- **Project fields are optional in the schema.**
  `neon/schema.sql:27` declares `required_skills text[] not null default '{}'`
  and `:32` declares `deadline date` (nullable); there is no CHECK requiring a
  non-empty skill list or a deadline. This matches the current optional form
  and the rewritten "when added" copy. If the product wants them mandatory,
  add constraints in `neon/schema.sql` together with the validator change above
  and backfill existing rows.
- **Application insert has no completeness invariant.**
  `neon/schema.sql:35-42` stores only `student_id`, `project_id`, `status`, and
  `created_at`; `lib/neon-data.ts:380-389` inserts with no join to
  `student_profiles`. `neon/schema.sql:44-63` allows empty `skills`, null `bio`
  and null `cv_path`, so no DB rule makes a "complete profile + CV" application
  true. The enforcement decision belongs to the workflow/database owners; this
  page now describes the real behavior.
- **Status values checked and accurate.** `neon/schema.sql:25` project status
  (`open`, `in_progress`, `review`, `completed`), `:39` application status
  (`pending`, `shortlisted`, `accepted`, `rejected`), and `:81` shortlist-order
  status (`pending`, `submitted`, `confirmed`, `rejected`) all match the app's
  constants and the new copy at `:93` and `:112`. `rank` and `verified` at
  `neon/schema.sql:60-61` support the admin-finalization sentence. No stale
  status value was found.
- **Unbounded read and missing status index.** `lib/neon-data.ts:1021-1027`
  (`listOrders`) runs `select * from public.shortlist_orders order by created_at
  desc` with no `limit`; it backs the admin payments view, not this page.
  `lib/neon-data.ts:1046-1055` filters `status = 'confirmed'` by founder but
  `neon/schema.sql:92` only indexes `(founder_id, created_at desc)`. Consider a
  composite `(founder_id, status)` index and a bounded/paginated admin read.
- **Authorisation is application-layer only.** `neon/schema.sql:1-4` states
  there is no RLS; `app/api/cv/[id]/route.ts:36-82` performs the role and
  relationship checks in code. This global posture is owned by
  `reports/FINAL-AUDIT.md` and `reports/orchestrator-audit.md` and is cited, not
  re-owned, here. `/how-it-works` itself issues no query, mutation, or storage
  call.

## Deliberately not changed

- **S2 payment instructions (`:85`)** — still say founders pay by bank or mBoB
  transfer, upload a screenshot, and an admin confirms. `config/payment.ts:40-62`
  defaults both destinations to empty and `PAYMENT_CONFIGURED` is false until
  they are set, but production may supply them through environment variables.
  The audit marks this SUSPECTED/LOW and environment-dependent, not confirmed.
  Adding "when payment details are configured" to a public guide would read as
  a broken product, and importing the shared flag into this static page would
  expand scope. Left for the workflow owner to decide or gate centrally.
- **UI/accessibility shell** — the audit found no new defect in headings,
  chapter anchors, focus rings, reduced motion, reflow at 375/1440px, metadata,
  internal links, or photo credits. Contrast/reflow, credit typography, and the
  repeated left-heading pattern remain with `reports/accessibility-critic.md:17,41`,
  `reports/cold-eyes.md:22`, and `reports/visual-recheck.md:25`.
- **User's pre-existing uncommitted edits** — the four `Chapter id` props at
  `:192`, `:235`, `:270`, `:307` and the file's existing line endings were
  preserved. No `git checkout`, `reset`, `stash`, or `clean` was run.
- **No new dependencies, gradients, violet, emoji, or wholesale rewrite** were
  introduced. All edits stay inside the warm-paper / forest / vermilion palette
  and the plain, local, human voice guide.
