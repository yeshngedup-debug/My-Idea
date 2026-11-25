# Second-pass feature completeness — `/privacy`

Date: 2026-11-25. Role: second-pass page agent (feature completeness). Scope: the
`privacy` row in `reports/page-fixes/MANIFEST.md`, which owns only
`app/privacy/page.tsx`, plus this new report. Phase 1 and the three phase-2 shared
owners are complete. The dirty worktree was treated as the source of truth. No
shared file, other page, other report, schema, or config was edited. No install,
Reticle wiring, dev server, build, test suite, or browser tool was used. All
pre-existing uncommitted work was preserved.

## Files changed

- `app/privacy/page.tsx` — one copy-only addition at `:102`. No layout, class,
  metadata, component structure, or link changed.
- `reports/page-fixes/pass2-privacy.md` — this report (new).

## Fix made in this pass

- **`app/privacy/page.tsx:102`** — added `year` to the collected student profile
  details: "(college, course, year, skills, bio, availability)". Verified as a
  collected and stored field in `app/student/profile/profile-form.tsx:43,433-442`,
  `app/actions/student-profile.ts:39,57`, and `neon/schema.sql:62`. The old list
  was not false but omitted a field the disclosure should name.

## Features verified against current code and schema

Every claim below was re-read in current source; the phase-1 copy edits are still
accurate after the phase-2 shared passes.

- **What we collect (`:101-104`).** Name and role live in `profiles`
  (`neon/schema.sql:8-16`); the email address comes from the authenticated user
  and is stored as `student_profiles.contact_email`
  (`app/actions/student-profile.ts:61`, `neon/schema.sql:75`). Student fields
  match the form and schema (`:102`); founder posting fields are collected by
  `app/founder/projects/post/post-project-form.tsx:164-171` (`:103`); screenshot
  and order fields exist at `neon/schema.sql:88-98` (`:104`). No uncollected
  category is promised.
- **How we use it (`:120-122`).** Matching and directory reads are implemented in
  `app/founder/browse-students/page.tsx:34-70`; shortlist preparation is
  `app/actions/admin-students.ts:86-173`; verification is
  `app/actions/admin-students.ts:63-80`. No automated matching algorithm is
  claimed, which matches the voice guide's "manual check, never an algorithm".
- **Founder profile browse (`:138`).** `listBrowseableStudents()`
  (`lib/neon-data.ts:698-719`) selects only eight directory fields and requires a
  CV, name, college and at least one skill. CV path and contact email are
  deliberately excluded, so "browse completed student profiles" is accurate.
- **CV access (`:138`).** `app/api/cv/[id]/route.ts:44-104` requires a founder or
  admin role; admins may open any CV, and founders are granted on an application
  to their project (`:79-83`) or on a shortlist row backed by a confirmed paid
  order (`:85-98`). "Application to one of their projects or a confirmed paid
  shortlist" matches the code. Signed URLs are short-lived (300 s, `:29-31`).
- **Contact email visibility (`:138`).** Shown to a founder for applicants at
  `app/founder/projects/[id]/project-detail-client.tsx:227-231` and for shortlist
  rows at `app/founder/shortlists/shortlists-client.tsx:476-480`. The shortlist
  list only loads when an order is confirmed (`app/founder/shortlists/page.tsx:87-111`).
  Accurately summarized.
- **Admin visibility (`:139`).** `app/admin/students/page.tsx:42-73` re-checks the
  admin role and loads every student profile; admins verify and build shortlists
  via `app/actions/admin-students.ts:43-173`. Accurate.
- **Payment screenshot visibility (`:140`).** Private bucket and owner-or-admin
  read policy are at `supabase/premium-shortlists.sql:42-69`; admins receive
  one-hour signed URLs at `app/admin/payments/page.tsx:62-89`. "Only to you and
  our admins" is accurate.
- **Never sell / never publish (`:156-157`).** No sale, export, or public
  shortlist route exists. Paying founders see delivered rows behind the founder
  gate (`app/founder/shortlists/page.tsx:32-111`); admins generate and prepare
  them (`app/actions/admin-students.ts:86-173`). The public shortlist on the
  marketing preview uses fictional `@btc-e2e.test` sample data, not user data.
- **Deletion and retention (`:173`).** No account/profile/CV deletion action,
  request screen, identity check, or retention timer exists in `app/**` (a grep
  over `.ts` and `.tsx` found only UI selection bookkeeping). The page therefore
  describes a manual email request, hedges removal with "where we can", and
  allows order records to be kept after payment. It does not promise an in-app
  deletion flow, a fixed response time, or account suspension. Accurate for the
  shipped capability.
- **Links and disclosures (`:7-14`, `:44-49`, `:69-85`, `:175-183`).** The only
  action is the `mailto:` built from `config/app.ts:4-6`; anchor targets match
  the five section ids at `:89,108,126,144,161`; canonical and metadata remain
  correct. All links resolve in owned or shared config code.
- **Earlier CV-wording lead is stale.** `reports/page-fixes/privacy.md:76-85`
  said `/for-founders`, `/how-it-works` and `/for-students` still used
  "confirmed order only". Current source does not: `app/for-founders/page.tsx:107,324-325`
  and `app/how-it-works/page.tsx:89` already describe application OR confirmed
  order, and `app/for-students/page.tsx` makes no conflicting claim. Nothing to
  route.

## Checks performed

- `npx eslint app/privacy/page.tsx` — clean, no findings.
- `npx tsc --noEmit --pretty false` — clean, exit 0.
- `git diff -- app/privacy/page.tsx` reviewed after the edit: my only addition is
  the `year` token at `:102`. The three phase-1 copy edits and the user's
  uncommitted `inline-flex min-h-6 items-center` change on the mailto link at
  `:179` remain untouched.
- Read-only source verification of the files cited above, plus
  `reports/page-fixes/MANIFEST.md`, `reports/page-fixes/privacy.md`, the three
  phase-2 shared reports, `AGENTS.md`, `design/brand-system.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`. All
  copy stays on the warm-paper / forest / vermilion palette with no new classes.
- Not run by design: full `next build`, `npm test`, dev server, browser tooling.

## Routed findings

### Workflow owner

- **No deletion-request flow and no response window (HIGH capability gap).**
  Observed: no deletion action, request screen, identity check, or reply SLA
  exists in `app/**`; the sole path is `mailto:` at `app/privacy/page.tsx:178-182`
  using `config/app.ts:4-6`. Recommendation: add an authenticated request action
  that records the requester and scope, verifies identity beyond the sending
  address, and exposes a review queue; then publish a real response window in
  the copy at `:173`. If the process stays manual, publish a defined SLA. No
  numeric time was invented here because none exists in the repo.
- **Suspension is promised on `/terms` with no capability behind it (MED).**
  `app/terms/page.tsx:189` says "We may suspend accounts that abuse the
  platform", but no `active`/`suspended` profile state or suspension action
  exists (grep over `app/**/*.ts*` and `neon/schema.sql:8-16`). This is outside
  the `privacy` ownership, so it was not edited. Recommendation for the `/terms`
  page owner and workflow owner: either implement a suspension state with an
  admin action and re-enable path, or soften the line to describe only the
  moderation that actually exists. `/privacy` itself makes no suspension claim.

### Database owner

- **Cascade deletion conflicts with the retention disclosure (HIGH if a delete
  action is added).** `neon/schema.sql:22,37-38,50,58,80-81,90-91` cascades from
  `profiles` to projects, applications, history, student profiles, shortlists
  and `shortlist_orders`. A literal `delete from profiles` would erase paid
  order records, contradicting "We may need to keep order records after a
  payment" at `app/privacy/page.tsx:173`. Recommendation: define retention first,
  then use a soft-delete/tombstone on `profiles` (already routed at
  `reports/page-fixes/shared-database.md:101-103`) or detach/anonymize order rows
  before removing the profile row.
- **No deletion request state or CV object lifecycle.** `neon/schema.sql:8-16`
  and `:57-76` define no deletion-request or tombstone field, and CV objects are
  written at `app/actions/student-profile.ts:107` with no lifecycle or cleanup
  found. Recommendation: add an explicit request state, a storage cleanup step
  for `cvs/{user_id}/cv.pdf`, and an audit of who acted, as part of the workflow
  item above.
- **Verified accurate, no new finding:** the read helpers behind the visibility
  claims use explicit projections and no longer fetch CV/contact fields for the
  browse list (`lib/neon-data.ts:597-601,698-719`), so the disclosure does not
  overstate directory exposure.

## Deliberately not changed

- **Phase-1 copy at `:138`, `:157`, `:173`** — re-verified accurate; no rewrite.
- **User's uncommitted mailto class change at `:179`** — preserved untouched.
- **Metadata at `:7-14`, fade/reduced-motion at `:16-27`, header at `:42-54`,
  anchor nav at `:69-85`, section structure and aria labels at `:89-184`** — no
  feature or accessibility defect found in this pass; no on-palette or layout
  change was needed.
- **"Founders: project postings (title, description, budget, skills)" at `:103`** —
  the form also collects duration, work mode and deadline, but this is a
  summary, not a false statement. Left alone to keep the diff small; the field
  list is visible on the posting form itself.
- **Contact email not repeated in the collection list** — already covered by
  "email address" at `:101` and named in the access section at `:138`.
- **No in-app deletion or suspension flow, no numeric SLA, no product policy
  text** was invented: these need owner decisions and live outside this file.
- **No change to `config/app.ts`, schema, shared components, other pages,
  `MANIFEST.md`, phase-1 or phase-2 reports.** No new dependencies, gradients,
  violet, emoji, or wholesale rewrite.
