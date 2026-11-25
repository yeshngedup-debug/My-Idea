# Pass 2 — `/faq`

Date: 2026-11-25. Owner: `/faq` page copy and this report only.

Scope: second-pass feature-completeness review of all 11 Q&As, the FAQPage
JSON-LD, internal links, disclosures, and every behavioural claim on the owned
page. The current dirty working tree was treated as the source of truth; all
pre-existing uncommitted work was preserved. No shared file, other page,
schema, config, route, other report, `MANIFEST.md`, or phase-2 report was
edited. No destructive git command, build, full test suite, dev server, or
browser tooling was run.

Verdict: five answers were corrected where they overstated or stale-described
the current code. The JSON-LD, internal links, disclosures, and the remaining
six answers matched the source and were left intact. Shared defects are routed
below with `file:line` and a recommended fix.

## Files changed

- `app/faq/page.tsx` — copy-only pass-2 corrections. No JSX structure, class,
  icon, image, palette value, dependency, or route changed. Because the JSON-LD
  is generated from the same `clusters` array, every copy edit below is
  mirrored into the structured data automatically.
- `reports/page-fixes/pass2-faq.md` — this report.

## Pass-2 corrections in the owned page

Line numbers refer to the final state after this pass.

- **`app/faq/page.tsx:112-114` (profile visibility)** — removed "a CV" from the
  list of fields shown in the founder directory. `listBrowseableStudents()`
  requires `cv_path is not null` but does not select or display a CV field. The
  answer now says a name, college and skills are shown, every listed student has
  an uploaded CV, and a bio and availability only help founders judge fit. It
  also drops the unsupported "admins verify" verb in favour of the two real
  manual values: rank and verified badge.
- **`app/faq/page.tsx:122-124` (verification)** — removed the claim that an
  admin checks identity and institution details and reviews the uploaded CV.
  Only `setStudentRank()` and `setStudentVerified()` exist; neither performs an
  identity, institution, or CV check. The answer now states the manual
  rank/badge actions and that the platform does not calculate either value.
- **`app/faq/page.tsx:156-161` (CV and contact privacy)** — kept the real
  founder grants and added the two grants the old copy omitted: admins can open
  any CV, and contact details appear in a confirmed shortlist.
- **`app/faq/page.tsx:181-184` (payment flow)** — added the current
  `PAYMENT_CONFIGURED` gate: new orders pause until the bank and mBoB details
  are published. The transfer, screenshot, and admin-review steps were kept.
- **`app/faq/page.tsx:192-194` (shortlist availability)** — removed the
  unconditional "ranked shortlist then becomes available with links to each
  student's CV". The answer now states that the shortlist appears once an admin
  finalizes it and carries CV links for students who uploaded one.

The phase-1 edits (JSON-LD generator, nonce, inline `Link` elements,
`INLINE_LINK_CLASS`, `min-h-[100dvh]`, removed topic nav, `div` in place of the
heading `Reveal`, darker photo gradient, and all link `min-height` classes) are
preserved exactly. No line ending or formatting convention was changed.

## Features verified

All 11 questions were checked against current source. No audit lead was
accepted without reading the current file.

- **Question count and structure.** Three clusters, 11 questions total: 3 in
  "The basics" (`:46-101`), 4 in "Profiles and projects" (`:102-166`), 4 in
  "Shortlists, payments and launch" (`:167-220`). The final state of each answer
  is listed above or was left unchanged.
- **Student signup is free and student-only.** `app/actions/auth.ts:7-12`
  documents that role is never accepted from client FormData and every new user
  is created as `student`; `:149-156` sets `role: 'student'` and ignores a
  client-supplied role. `components/auth/signup-form.tsx` has no role control
  (its `role=` matches are ARIA attributes). This supports `:67-76` and the
  "assigned by an admin, not through public signup" wording at `:84-85`.
- **Founder access is admin-assigned.** Same signup evidence above; the contact
  CTA at `:86-91` is the real request path confirmed by
  `app/contact/page.tsx:29-34`. The `/login` link at `:93-95` resolves to
  `app/(auth)/login/page.tsx`.
- **Profile visibility.** `lib/neon-data.ts:698-723` selects
  `id, full_name, college, course, year, skills, bio, availability` and filters
  on `cv_path is not null`, `full_name is not null`, `college is not null`, and
  `cardinality(skills) > 0`. `BrowseStudentRow` at `:597-601` deliberately
  excludes CV/PII. The corrected answer at `:112-114` matches this exactly.
- **Applications and status.** `app/actions/projects.ts:103-135` checks role,
  project openness, and duplicates only, then calls `insertApplication`; there
  is no completeness or CV gate. Allowed transitions are
  `pending -> shortlisted | rejected` and `shortlisted -> accepted | rejected`
  (`:138-145`, enforced at `:183-221`). The answer at `:139-148` names the real
  routes and the founder status-update ability.
- **CV access.** `app/api/cv/[id]/route.ts:44-104` returns `403` for anyone
  without `founder` or `admin` (`:62-66`), lets admins open any CV (`:74-77`),
  and lets a founder open one when the student applied to one of their projects
  (`:79-83`) or when they hold a confirmed order plus a shortlist row
  (`:85-98`). Signed URLs are created in `redirectToSignedCv()`; files are not
  publicly listed. The corrected answer at `:156-161` matches this rule.
- **Shortlist unlock and ranked list.** `app/founder/shortlists/page.tsx:87-131`
  unlocks rows only on confirmed orders;
  `app/founder/shortlists/shortlists-client.tsx:436-499` renders the ranked list
  with CV links and the "as soon as the admin finalizes it" empty state. This
  supports the corrected answer at `:192-194`.
- **Payment confirmation.** `app/actions/shortlist-order.ts:176-213` requires an
  admin (`:177`), a reviewable status (`:183-185`), a screenshot path (`:186-191`),
  and a resolvable storage object (`:193-203`) before setting `confirmed`.
  `neon/schema.sql:88-98` defines
  `pending | submitted | confirmed | rejected`. The answers at `:181-184` and
  `:202-204` match.
- **Manual rank and verification.** `app/actions/admin-students.ts:42-61` and
  `:63-80` are the only rank/verified writers; both are admin-gated and do no
  document review. The corrected answer at `:122-124` matches.
- **Demo accounts.** `supabase/migrations/20261024020000_seed_test_users.sql:26-31`
  seeds `@btc-test.com` users, removed by
  `supabase/migrations/20261122000000_security_hardening.sql:4`. Current E2E
  seeds use `@btc-e2e.test` (`scripts/neon-setup.mjs:26-46`,
  `tests/e2e/demo-users.ts`). The answer at `:212-214` names both.
- **JSON-LD validity and visible-copy parity.** `plainText()` at `:222-229`
  flattens strings, arrays, and element children; `faqJsonLd` at `:231-244`
  builds one `Question` per entry with `name` and `acceptedAnswer.text` from
  that same answer node, so the 11 structured questions cannot drift from the
  visible copy. The script at `:251-258` sets `type="application/ld+json"`,
  uses the request nonce from `:247`, and escapes `<` to `\\u003c` before
  stringify output. Shape, count, and escaping are correct.
- **Accessible disclosures.** `:327-342` uses native `<details>/<summary>` with
  a visible focus ring on the summary, `aria-hidden` on the decorative plus
  icon, and a `group-open` rotation. No JS disclosure state, no keyboard
  handler, and no ARIA override that could break native semantics.
- **Internal links.** All eight destinations resolve to a page file in the
  current tree: `/signup`, `/login`, `/contact`, `/how-it-works`,
  `/student/projects`, `/student/applications`, `/founder/shortlists`, and the
  CTA band `/contact`. Inline links carry `INLINE_LINK_CLASS` with a focus ring
  and a `min-h-6` tap target; the hero CTAs use existing `min-h-12`/`min-h-11`
  classes.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md`, the phase-1 `/faq` report, the shared
  workflow, database, and design-system reports, the brand/voice and token
  references, the installed Next.js 16 app-router guides
  (`json-ld.md`, `scripts.md`, `content-security-policy.md`,
  `05-server-and-client-components.md`, `03-layouts-and-pages.md`,
  `headers.md`), and the current owned page before and after editing.
- Re-read every claim against current source; no audit lead was accepted as
  truth without checking the current file.
- Reviewed `git diff -- app/faq/page.tsx`. Only the five copy edits listed above
  are from this pass; the user's pre-existing uncommitted FAQ work is intact.
- `npx eslint app/faq/page.tsx` — no findings, exit `0`.
- `npx tsc --noEmit --pretty false` — one pre-existing error in a shared file,
  unrelated to `/faq` (routed below). No error in `app/faq/page.tsx`.
- No build, `npm test`, dev server, browser tool, or live database call was
  used. No `git checkout`, `reset`, `stash`, or `clean` was run.

## Routed findings — not edited

- **Type error in the student-projects page owner's files.**
  `app/student/projects/page.tsx:111-112` passes `initialQuery` and `initialMode`
  to `ProjectsClient`, but `ProjectsClient` at
  `app/student/projects/projects-client.tsx:278-284` declares only `projects`
  and `appliedIds`. `npx tsc --noEmit --pretty false` fails with TS2322 on this
  mismatch. Recommended fix: either add the two props to `ProjectsClient` and
  use them for its initial filter state, or stop passing them from the page.
  This route is not owned here and was left unchanged.
- **Stale admin success message (workflow owner).**
  `app/actions/shortlist-order.ts:213` returns "Payment confirmed. Shortlist
  unlocked." even though shortlist rows appear only after an admin prepares
  them. The FAQ at `:192-194` now states the real finalization dependency; the
  action message should match. Recommended fix: return "Payment confirmed. The
  shortlist is available once an admin finalizes it." and update the action
  test expectation.
- **Confirmed orders are not DB-guaranteed to carry proof (database owner).**
  `neon/schema.sql:88-98` allows `status = 'confirmed'` with a null
  `screenshot_path`. The "Orders without a screenshot cannot be confirmed"
  claim at `:183-184` holds through the only writer,
  `app/actions/shortlist-order.ts:176-213`, but no check constraint enforces it.
  Recommended fix: add a trigger or constraint that rejects `confirmed` without
  a non-null, resolvable screenshot path across every write path.
- **CV enforcement is backend-dependent (database owner).**
  On Supabase, storage RLS in
  `supabase/migrations/20261124000000_close_security_bypasses.sql:155-178`
  enforces the application-or-confirmed-order rule. On Neon,
  `neon/schema.sql:1-4` states authorization stays in the application layer, so
  `app/api/cv/[id]/route.ts` is the only gate. The FAQ wording "private bucket
  served through role-checked links" is accurate for the public access path but
  relies on app-layer discipline on Neon. Recommended fix: add an equivalent
  Neon-side constraint or document the app-layer dependency in the database
  report.
- **Demo-user guard is never called (workflow owner).**
  `lib/env.ts:67-77` defines `assertNoDemoUsers()` to warn in production, but a
  repo-wide search finds no production call site. The FAQ at `:212-214` states
  the seed users must be removed before launch, which remains correct, but the
  built guard gives no runtime warning. Recommended fix: call it from an
  allowed production startup path with the known seed emails, or remove the
  dead helper.
- **Unbounded browse read (database owner).**
  `lib/neon-data.ts:698-723` has no default limit or pagination. Adding a cap
  inside this query would silently truncate the directory, so no page copy was
  changed to promise a fixed count. Recommended fix: define a pagination
  contract with the founder-browse-students owner before capping.

## Deliberate non-changes

- **Kept the native disclosure markup.** `<details>/<summary>` already provides
  keyboard access and correct semantics; no disclosure component or JS state
  was introduced.
- **Kept the JSON-LD generator as-is.** It already derives from the visible
  answers and escapes `<`; no second hand-maintained copy of the answers was
  added.
- **Kept "Premium Shortlist" naming and package/payment flow.** `config/payment.ts:10-35`
  defines Basic and Full Support packages and
  `config/payment.ts:40-62` gates new orders on `PAYMENT_CONFIGURED`; the FAQ
  now mentions the gate instead of advertising fixed account details.
- **Kept the verified-badge claim but narrowed it.** The badge and rank are
  real manual admin fields; the copy no longer implies a background check that
  no code performs.
- **No visual, motion, or structural edits.** Palette, spacing, headings,
  chapter anchors, photo credit, focus rings, and responsive layout are
  unchanged from the reviewed page.
