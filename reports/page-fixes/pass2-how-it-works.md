# Pass 2 — `/how-it-works`

Date: 2026-11-25. Owner: `/how-it-works` page copy and this report only.

Scope: second-pass feature-completeness review of every step, claim, and CTA on
the owned page. The current dirty working tree was treated as the source of
truth; all pre-existing uncommitted work was preserved. No shared file, other
page, schema, config, route, or phase-2 report was edited. No destructive git
command, build, full test suite, dev server, or browser tooling was run.

Verdict: the page copy now matches the current validators, server actions, CV
route, shortlist flow, application transitions, and CTA destinations. No
pass-2 page defect required a shared-file edit; the shared defects found are
routed below with `file:line` and a recommended fix.

## Files changed

- `app/how-it-works/page.tsx` — copy-only pass-2 corrections. No JSX
  structure, class, icon, image, palette value, dependency, or route changed.
- `reports/page-fixes/pass2-how-it-works.md` — this report.

## Pass-2 corrections in the owned page

Line numbers refer to the final state after this pass.

- **`app/how-it-works/page.tsx:24-29` (metadata)** — removed the claim that a
  student applies "with a complete profile". The description now says students
  apply to projects, matching the absence of a completeness/CV gate.
- **`app/how-it-works/page.tsx:52` (student step)** — changed "adds" to "can
  add" for skills, bio, availability, and PDF CV. The retained sentence says a
  complete profile and CV *help founders decide*; it no longer reads as a
  precondition for applying.
- **`app/how-it-works/page.tsx:85` (payment protection)** — the admin step now
  says the admin confirms the payment "before the order counts as paid". It no
  longer implies that confirmation alone releases a shortlist.
- **`app/how-it-works/page.tsx:89` (CV access)** — the sentence now names the
  real grants: admins, founders whose project received the application, and
  founders who shortlisted the student under a confirmed paid order. It also
  says "signed links", matching the 300-second Supabase signed URL.
- **`app/how-it-works/page.tsx:93` (order vs application status)** — replaced
  the stale "orders stay pending" wording with the real upload state:
  `pending -> submitted`, then admin review. Application status is explicitly
  separate: `pending`, `shortlisted`, `accepted`, `rejected`.
- **`app/how-it-works/page.tsx:105-117` (after a shortlist)** — the admin step
  is now "can prepare" rather than a guaranteed pre-share finalization. The
  founder step no longer claims automatic release: the founder reviews the
  shortlist in the workspace after an admin prepares it. The status sentence
  now names the allowed transitions and the direct pending rejection path.

The phase-1 optional-field wording at `:46`, `:69`, `:77`, `:198`, and
`:201-202`, the four `Chapter id` anchors, and the existing line endings were
preserved exactly.

## Source verification

- **Optional project fields.** `lib/validators.ts:26-48` requires title,
  description, duration, budget range, and work mode; `deadline` is optional
  and `skills` may be empty. `app/actions/projects.ts:42-83` saves that parsed
  data, and `neon/schema.sql:18-33` allows `deadline` to be null with an empty
  `required_skills` array. The page at `:46`, `:69`, and `:198-202` matches.
- **No application completeness gate.** `lib/validators.ts:50-62` requires only
  `full_name` for a student profile; college, course, year, availability,
  skills, and bio are optional. `app/actions/projects.ts:103-135` checks role,
  project openness, and duplicates only; it never reads `cv_path` or profile
  completeness before `insertApplication`. The page at `:52` and `:77` now
  presents completeness as guidance, not a gate.
- **CV access rule.** `app/api/cv/[id]/route.ts:25-41` creates a 300-second
  signed URL. `:62-77` allows admins; `:79-104` allows a founder when the
  student applied to one of that founder's projects, or when the founder has a
  confirmed order and a matching shortlist row. Other users get `403`. The
  page at `:89` matches this rule.
- **Payment order states.** `app/actions/shortlist-order.ts:143-157` uploads
  proof and moves the order to `submitted`; `:176-213` lets only an admin
  confirm it. `neon/schema.sql:88-98` defines
  `pending | submitted | confirmed | rejected`. The founder workspace unlocks
  rows only on a confirmed order (`app/founder/shortlists/page.tsx:87-105`,
  `app/founder/shortlists/shortlists-client.tsx:120`). The page at `:85` and
  `:93` matches.
- **Shortlist preparation and review.** Admin rank and verification actions
  are at `app/actions/admin-students.ts:42-80`; admin shortlist generation is
  at `:86-173`. If no rows exist, the founder UI says the ranked shortlist
  appears "as soon as the admin finalizes it"
  (`app/founder/shortlists/shortlists-client.tsx:470`). The page at
  `:107-112` now preserves that dependency without claiming an automatic
  finalization event.
- **Application status language.** Allowed transitions are
  `pending -> shortlisted | rejected` and `shortlisted -> accepted | rejected`
  (`app/actions/projects.ts:138-145`, enforced at `:183-221`). The student view
  filters and labels only those four values
  (`app/student/applications/applications-client.tsx:27-42`), and
  `components/ui/status-timeline.tsx:122-141` uses the same vocabulary. The
  page at `:93` and `:115-116` matches.
- **Schema status values.** `neon/schema.sql:35-42` stores the four application
  values; `:78-86` stores shortlist rows with `requested | contacted | hired |
  rejected`; `:88-98` stores the four order values. No stale status name was
  found on the page.

## CTA destinations

All six destinations resolve to page files in the current tree.

| Page location | CTA label | Destination | Verification |
|---|---|---|---|
| `:133` hero primary | Create student account | `/signup` | Route exists at `app/(auth)/signup/page.tsx`; signup assigns the `student` role by design (`app/actions/auth.ts:103-112`). |
| `:134` hero secondary | Explore the student guide | `/for-students` | Route exists; matches the canonical nav target at `components/marketing/nav.ts:36-40`. |
| `:263` body link | See the student path | `/for-students` | Same verified student-guide route. |
| `:353` keep-reading | Read the FAQ | `/faq` | Route exists at `app/faq/page.tsx`; matches nav. |
| `:354` keep-reading | For founders | `/for-founders` | Route exists at `app/for-founders/page.tsx`; matches nav. |
| `:362-363` closing band | Ask for founder access | `/contact` | Route exists; same founder-intent CTA as `app/for-founders/page.tsx:181`, and `app/contact/page.tsx:29-34` supplies a founder-access request link. `/signup` would be wrong here because it only creates students. |

## Checks performed

- Read `reports/page-fixes/MANIFEST.md`, the phase-1 `/how-it-works` report,
  the shared workflow, database, and design-system reports, the installed
  Next.js 16 app-router guides, the brand/voice guides, and the current owned
  page before and after editing.
- Re-read every claim against current source; no audit lead was accepted as
  truth without checking the current file.
- Reviewed `git diff -- app/how-it-works/page.tsx`. Only the copy listed above
  is from this pass; the user's pre-existing `Chapter id` edits remain intact.
- `npx eslint app/how-it-works/page.tsx` — no findings, exit `0`.
- `npx tsc --noEmit --pretty false` — no findings, exit `0`.
- No build, `npm test`, dev server, browser tool, or live database call was
  used. No `git checkout`, `reset`, `stash`, or `clean` was run.

## Routed findings — not edited

- **Stale admin success message (workflow owner).**
  `app/actions/shortlist-order.ts:213` still returns "Payment confirmed.
  Shortlist unlocked." That overstates the state because shortlist rows appear
  only after an admin has prepared them. Recommended fix: return "Payment
  confirmed. An admin can now prepare the shortlist." or "Payment confirmed.
  The shortlist is available once an admin prepares it." Add a test for the
  message with the same action test file.
- **Finalization is not fully represented (database owner).**
  `neon/schema.sql:78-98` has no `finalized_at`, `released_at`, or
  per-shortlist rank; `student_profiles.rank` at `:73` is global. The UI can
  say an admin prepares the shortlist, but the schema cannot record who
  finalized a specific founder shortlist or when. Recommended fix: add
  explicit finalization/release columns and a per-shortlist rank if auditability
  is required, with a migration and backfill.
- **Cross-route copy drift (page owners).**
  `app/for-students/page.tsx:128` still says "just a complete profile," while
  `app/actions/projects.ts:103-135` does not require one. Recommended fix:
  soften to "a profile that shows your skills and CV helps founders decide,"
  matching `app/how-it-works/page.tsx:52` and `app/for-students/page.tsx:86,169`.
  This route is not owned here and was left unchanged.

## Deliberate non-changes

- **Payment details remain environment-dependent.** `config/payment.ts:40-62`
  defaults the bank and mBoB numbers to empty and gates new orders with
  `PAYMENT_CONFIGURED`, but production can supply real values through env
  vars. The public guide keeps the intended transfer-and-screenshot flow; no
  warning was added.
- **Password recovery remains a HIGH login-owner item.** `/how-it-works` makes
  no password-recovery claim, so no copy change was made here.
- **No visual or structural changes** were needed. Palette, spacing, motion,
  headings, focus behavior, chapter anchors, photo credits, and responsive
  layout are unchanged from the reviewed page.
