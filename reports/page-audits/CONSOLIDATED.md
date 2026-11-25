# Consolidated per-page audit

Date: 2026-11-24. This file is a read-only consolidation of the 30 completed
per-page audits listed in `reports/page-audits/INDEX.md`. No product source,
config, schema, test, existing report, or `INDEX.md` was edited, and no finding
was fixed. `INDEX.md` is authoritative for the route → report → status mapping:
all 30 rows are `done`, and 30 source reports were read.

## Scope and method

- **Sources:** `reports/page-audits/INDEX.md` plus all 30 reports it lists.
  `CONSOLIDATED.md` is the only file written by this pass.
- **Extraction:** each report's own severity summary was used for counts. Where
  a report has no severity table (`for-students.md`, `how-it-works.md`), counts
  were taken from its confirmed/suspected body sections.
- **Counting rule:** a confirmed item is counted in the route report where it
  appears. Items explicitly marked carried-over, inherited, or cross-referenced
  are counted once in that route's row and are **referenced, not re-owned**, in
  the master list and overlap notes. A suspected item is never promoted to
  confirmed here. A suspected item already retested and resolved is not carried
  forward as a live finding.
- **Evidence rule:** every finding below keeps the exact `file:line` citation
  from its source report. Where two reports disagree, both report paths are
  cited (see "Notes on overlaps").
- **No new analysis:** source files were not re-audited; this is a synthesis of
  the 30 reports, not a 31st critic pass.

## Status table

`C` = confirmed, `S` = suspected; order `HIGH / MED / LOW`. "Top finding" is the
highest-severity item for the route with its exact source citation.

| Route | Report | Status | C H/M/L | S H/M/L | Top finding (file:line) |
|---|---|---|---|---|---|
| `/` | `home.md` | done | 0 / 0 / 1 | 0 / 0 / 0 | Temporary 307 alias — `app/page.tsx:1-2`; live `/` → 307, `/public` → 200 |
| `/login` | `login.md` | done | 1 / 1 / 1 | 0 / 2 / 0 | WF-1 no password-recovery/reset path — `components/auth/login-form.tsx:140-170`; `app/(auth)/login/page.tsx:50-58`; `app/actions/auth.ts:31-143` |
| `/signup` | `signup.md` | done | 1 / 7 / 2 | 0 / 0 / 0 | U1 empty submit discards input — `components/auth/signup-form.tsx:50-83`; `app/(auth)/signup/page.tsx:15-20,38-40` |
| `/about` | `about.md` | done | 0 / 2 / 1 | 0 / 1 / 0 | U1 invalid disclosure IDREFs — `app/about/page.tsx:170-193`; `components/interactive/animated-disclosure-list.tsx:77-78,90-93,117-119` |
| `/contact` | `contact.md` | done | 1 / 3 / 1 | 0 / 0 / 1 | **Carried HIGH** header CTA mislabels founders — `components/marketing/site-header.tsx:29-34`; `components/marketing/nav.ts:52-55`; owner `reports/cold-eyes.md:19` |
| `/faq` | `faq.md` | done | 0 / 1 / 4 | 0 / 0 / 0 | WF-1 protected paths are plain text, not links — `app/faq/page.tsx:107,150-151,179` |
| `/how-it-works` | `how-it-works.md` | done | 0 / 5 / 0 | 0 / 0 / 2 | F1–F5 copy/claim mismatches, e.g. CV access — `app/how-it-works/page.tsx:88-89`; `app/api/cv/[id]/route.ts:48-82` |
| `/privacy` | `privacy.md` | done | 1 / 1 / 0 | 0 / 0 / 1 | HIGH "Only the founder who paid for it sees them" is false — `app/privacy/page.tsx:157`; `app/actions/admin-students.ts:130-147`; `app/admin/students/admin-students-client.tsx:201-225` |
| `/terms` | `terms.md` | done | 0 / 0 / 0 | 0 / 0 / 0 | No finding; page in good shape for MVP legal page |
| `/public` | `public.md` | done | 0 / 3 / 4 | 1 / 0 / 1 | Suspected HIGH W4 interactivity inert in dev — See "Verification gaps"; MED pause hidden in `<details>` — `app/public/page.tsx:296-301`; `components/data/live-context.tsx:409-415` |
| `/for-founders` | `for-founders.md` | done | 0 / 4 / 3 | 0 / 0 / 0 | Reduced-motion sticky cards overlap steps — `app/for-founders/page.tsx:467-476`; `components/motion/stacked-cards.tsx:19-20,111,113` |
| `/for-students` | `for-students.md` | done | 0 / 1 / 0 | 0 / 0 / 2 | F1 "Complete before you apply" unenforced — `app/for-students/page.tsx:86,169,184`; `app/actions/projects.ts:103-135` |
| `/founder` | `founder-overview.md` | done | 0 / 1 / 4 | 0 / 0 / 0 | W1 role-lookup failure misroutes founder — `proxy.ts:28-34,117-126`; `app/founder/page.tsx:24`; `lib/neon-data.ts:47-54`; `app/error.tsx:33-49` |
| `/founder/browse-projects` | `founder-browse-projects.md` | done | 1 / 4 / 4 | 0 / 0 / 1 | U1 only filter is a runtime no-op — `app/founder/browse-projects/browse-projects-client.tsx:71-75,82-110,115-131`; `components/interactive/segmented-control.tsx:37-98` |
| `/founder/browse-students` | `founder-browse-students.md` | done | 1 / 3 / 5 | 0 / 0 / 1 | W1 primary CTA fails for most students — `app/founder/browse-students/browse-client.tsx:207-224`; `app/actions/shortlist.ts:36-44`; `lib/neon-data.ts:732-749` |
| `/founder/profile` | `founder-profile.md` | done | 0 / 2 / 2 | 1 / 0 / 2 | Suspected HIGH W1 stale Neon role after Supabase demotion — `app/founder/profile/page.tsx:30-31`; `app/founder/profile/actions.ts:30-31`; owner `reports/orchestrator-audit.md:128` |
| `/founder/projects` | `founder-projects.md` | done | 0 / 3 / 5 | 0 / 0 / 2 | W1 filter did not change list/pressed state/count — `app/founder/projects/projects-client.tsx:157-164,97-103,148-151,175-190,183-189`; `components/interactive/segmented-control.tsx:37-63` |
| `/founder/projects/post` | `founder-projects-post.md` | done | 0 / 5 / 2 | 0 / 0 / 1 | U1 global errors, not field-level — `app/founder/projects/post/post-project-form.tsx:59-65,88-93,113-122,130-139,185-196,203-228` |
| `/founder/projects/[id]` | `founder-project-detail.md` | done | 1 / 2 / 1 | 0 / 0 / 0 | U1 malformed UUID leaves loading state and leaks dev error — `app/founder/projects/[id]/page.tsx:27,36`; `lib/neon-data.ts:242-250`; `app/founder/projects/[id]/loading.tsx:6-14`; `app/founder/projects/[id]/error.tsx:7-48` |
| `/founder/shortlists` | `founder-shortlists.md` | done | 1 / 5 / 8 | 0 / 1 / 0 | W1 "unlocked" pill before server UI unlocks — `components/founder/live-order-status.tsx:31-47`; `app/founder/shortlists/page.tsx:154-163`; `app/founder/shortlists/shortlists-client.tsx:52,299` |
| `/founder/students/[id]` | `founder-student-detail.md` | done | 2 / 1 / 5 | 0 / 1 / 1 | F1 CV link opens a JSON 500 — `app/founder/students/[id]/page.tsx:89-93`; `app/api/cv/[id]/route.ts:84-89`. F2 actions render with no relationship check — `app/founder/students/[id]/page.tsx:43-52,96-98` |
| `/student` | `student-overview.md` | done | 0 / 3 / 3 | 0 / 0 / 1 | U1 non-student sees zeroed student dashboard — `app/student/page.tsx:86-97,71-82,54-58,99-192`; `lib/neon-data.ts:50-51`; `proxy.ts:117-126`. W1 rows link to one list — `app/student/page.tsx:133-135` |
| `/student/applications` | `student-applications.md` | done | 0 / 5 / 3 | 0 / 0 / 0 | W2 founder can regress any status — `app/founder/projects/[id]/project-detail-client.tsx:216-222`; `app/actions/projects.ts:188-204`; `lib/neon-data.ts:412-422`. D2 returns `"undefined"` — `lib/neon-data.ts:356-377,429-436` |
| `/student/profile` | `student-profile.md` | done | 0 / 6 / 1 | 0 / 1 / 1 | W5/D1 raw driver error text to browser — `app/actions/student-profile.ts:69-71`; `lib/neon-data.ts:23-27` |
| `/student/projects` | `student-projects.md` | done | 1 / 2 / 3 | 0 / 1 / 2 | **Carried HIGH** W1 apply decision cannot complete on detail — `app/student/projects/[id]/page.tsx:94-149`; owner `reports/component-relevance-audit.md:42,81-82` |
| `/student/projects/[id]` | `student-project-detail.md` | done | 1 / 1 / 1 | 0 / 0 / 0 | **Carried HIGH** W1 same owner as above — `app/student/projects/[id]/page.tsx:94-149`; `reports/component-relevance-audit.md:42,81-82` |
| `/admin` | `admin-overview.md` | done | 0 / 2 / 10 | 0 / 1 / 0 | W1 "reviewable payment" definition diverges from `/admin/payments` — `app/admin/page.tsx:65,139-155`; `neon/schema.sql:81` |
| `/admin/payments` | `admin-payments.md` | done | 1 / 6 / 5 | 1 / 0 / 1 | W1 Confirm can succeed with a non-viewable proof — `app/admin/payments/page.tsx:65-80,88`; `app/admin/payments/payments-client.tsx:28,138,187`; `app/actions/shortlist-order.ts:173-188` |
| `/admin/projects` | `admin-projects.md` | done | 0 / 4 / 3 | 0 / 0 / 1 | W3 transient role failure sends admin to student area — `proxy.ts:27-34,123-131` |
| `/admin/students` | `admin-students.md` | done | 0 / 5 / 4 | 0 / 0 / 1 | W1 shortlist generation skips founder-role/ownership check — `app/actions/admin-students.ts:94-95,116-117,154`; `lib/neon-data.ts:74-83,242-250,847-878` |

## Totals

Sums of the 30 per-route severity tables (carried items counted once in the
route row; suspected items not promoted):

| Class | HIGH | MED | LOW | Total |
|---|---:|---:|---:|---:|
| Confirmed | 13 | 88 | 86 | 187 |
| Suspected | 3 | 8 | 22 | 33 |
| **All recorded** | **16** | **96** | **108** | **220** |

Notes on the totals:

- Of the 13 confirmed HIGH items, **3 are carried** from earlier reports and
  are not new per-route discoveries: `/contact` (`reports/cold-eyes.md:19`),
  `/student/projects` and `/student/projects/[id]` (both
  `reports/component-relevance-audit.md:42,81-82`). The remaining **10** are
  route-specific confirmed HIGH findings.
- Of the 3 suspected HIGH items, **1 is resolved** (`/public` W4, see
  "Verification gaps") and **2 are the same systemic role-mirror fail-open**
  (`/admin/payments` S1 and `/founder/profile` W1), both inherited from
  `reports/orchestrator-audit.md:128` and `reports/FINAL-AUDIT.md:57-60`.
- `founder-profile.md`'s "pass recorded" item (D2) is not counted as a finding.
- `founder-student-detail.md` P1 is a suspected item scoped LOW–MED; it is
  recorded above at the MED upper bound, and P2 at LOW.

## Cross-cutting themes

1. **Identity and authorization split across two providers.** Supabase
   `getUser()` verifies identity while `getProfileRole()` reads Neon
   `profiles.role`; `scripts/neon-mirror-identities.mjs:49-57` copies roles one
   way. A Supabase-only demotion leaves Neon access live until the mirror runs.
   Owned by `reports/orchestrator-audit.md:128` and
   `reports/FINAL-AUDIT.md:57-60`; carried into `/admin/payments` S1 and
   `/founder/profile` W1.
2. **No database RLS; authorization is application-layer only.**
   `lib/neon-data.ts:1-7` and `neon/schema.sql:1-4` say so explicitly. Many
   helpers accept a caller-supplied ID with no role/ownership predicate. Owned
   globally by `reports/FINAL-AUDIT.md:31,59,80` and
   `reports/orchestrator-audit.md:116-117`; route reports cite instances and do
   not re-own the architecture finding.
3. **Marketing copy promises backend rules the code does not enforce.**
   The same claim cluster recurs on `/for-founders`, `/how-it-works`,
   `/for-students`, and `/privacy`: CV access is described as "confirmed order
   only" although `app/api/cv/[id]/route.ts:59-63` also grants founders with an
   application to their project; the ranked shortlist is described as
   immediately available although `app/founder/shortlists/shortlists-client.tsx:304-307`
   says an admin finalizes it; "complete before you apply" has no server-side
   check in `app/actions/projects.ts:103-135`. These are writing/workflow
   mismatches, not authorization bypasses.
4. **Interactive filters and controls that look wired but do not change state.**
   `/founder/browse-projects` U1 (runtime no-op, suspected hydration root
   cause), `/founder/projects` W1, `/student/applications` W3 (URL
   preselection), and the `/public` W4 dev-runtime observation share a pattern;
   each is reported on its own route, and the root causes are not proven in all
   cases.
5. **Validation and error boundaries at the client/server seam.**
   `/signup` U1/W1/D2, `/login` WF-1, `/student/profile` W1–W6,
   `/founder/projects/post` U1/W2/D1, `/admin/payments` W1, and
   `/founder/projects/[id]` U1 all involve the browser accepting input or
   showing success/failure that the server does not gate or explain correctly.
   Raw Neon/Postgres text reaches the browser in `founder-student-detail` D3,
   `founder-project-detail` U1, and `student-profile` W5/D1.
6. **Accessible names, group labels, and live-region feedback.** Repeated
   identical button names (`founder-browse-students` U1, `founder-projects` U1),
   nullable names rendered as `null` (`admin-students` A11y-A1), ungrouped
   status buttons (`founder-project-detail` U2), and role-changing live regions
   (`founder-student-detail` P2, `admin-students` A11y-A2) recur across
   workspaces.
7. **Unbounded reads and missing indexes.** `admin-payments` D2/D3,
   `admin-overview` D2, `admin-projects` D1, `founder-overview` D1/D2,
   `founder-projects` D1, `founder-browse-students` D2, `student-overview` D1,
   `student-projects` D1, and `admin-students` U2 repeated whole-table fetches
   where a projected/paginated query would do. Most are scale-dependent and
   marked suspected when no row count was measured.

## Confirmed HIGH master list

Exactly 13 confirmed HIGH items, with the exact source citations. Carried items
name their owning report; they are not new findings from these 30 audits.

| # | Route | Finding and evidence | Owner / status |
|---|---|---|---|
| 1 | `/login` | **WF-1 — no password-recovery/reset flow.** `components/auth/login-form.tsx:140-170`, `app/(auth)/login/page.tsx:50-58`, `app/actions/auth.ts:31-143`; no forgot-password link or reset route found. | `login.md` — route-specific |
| 2 | `/signup` | **U1 — empty submit navigates to `/signup?error=invalid`, clears input, and drops focus.** `components/auth/signup-form.tsx:50-83`, `app/(auth)/signup/page.tsx:15-20,38-40`. | `signup.md` — route-specific |
| 3 | `/contact` | **Header primary CTA stays "Create student account" on a page that says founder accounts are admin-arranged.** `components/marketing/site-header.tsx:29-34`, `components/marketing/nav.ts:52-55`, rendered via `app/contact/page.tsx:51`. | Carried: `reports/cold-eyes.md:19`; fix in shared header, not page |
| 4 | `/privacy` | **"Only the founder who paid for it sees them" is false.** `app/privacy/page.tsx:157`, contradicted by `:139`, `app/actions/admin-students.ts:130-147`, `app/admin/students/admin-students-client.tsx:201-225`, `lib/neon-data.ts:658-668`. | `privacy.md` — route-specific |
| 5 | `/founder/browse-projects` | **U1 — the route's only filter is a runtime no-op; `aria-pressed` stays on "All" and the count never changes.** `app/founder/browse-projects/browse-projects-client.tsx:71-75,82-110,115-131`, `components/interactive/segmented-control.tsx:37-98`. Root cause suspected hydration, not proven. | `founder-browse-projects.md` — route-specific |
| 6 | `/founder/browse-students` | **W1 — "Request shortlist" is enabled on students with no application to the founder's project and no confirmed order, so the primary action predictably fails.** `app/founder/browse-students/browse-client.tsx:207-224`, `app/actions/shortlist.ts:36-44`, `lib/neon-data.ts:732-749`. | `founder-browse-students.md` — route-specific |
| 7 | `/founder/projects/[id]` | **U1 — malformed UUID leaves "Loading applicants…" and leaks a dev `NeonDataError` stack instead of showing the error boundary.** `app/founder/projects/[id]/page.tsx:27,36`, `lib/neon-data.ts:242-250`, `loading.tsx:6-14`, `error.tsx:7-48`. Production masking not verified. | `founder-project-detail.md` — route-specific |
| 8 | `/founder/shortlists` | **W1 — live "unlocked" pill claims access before the server-rendered shortlist UI actually unlocks.** `components/founder/live-order-status.tsx:31-47`, `app/founder/shortlists/page.tsx:154-163`, `app/founder/shortlists/shortlists-client.tsx:52,299`. | `founder-shortlists.md` — route-specific |
| 9 | `/founder/students/[id]` | **F1 — CV link opens a JSON 500 in the verified local flow.** `app/founder/students/[id]/page.tsx:89-93`, `app/api/cv/[id]/route.ts:84-89`. | `founder-student-detail.md` — route-specific |
| 10 | `/founder/students/[id]` | **F2 — CV link and shortlist button render with no relationship check.** `app/founder/students/[id]/page.tsx:43-52,89-93,96-98`, `app/api/cv/[id]/route.ts:63-82`, `app/actions/shortlist.ts:36-48`, `lib/neon-data.ts:732-749`. | `founder-student-detail.md` — route-specific |
| 11 | `/student/projects` | **W1 — Apply decision cannot be completed on the detail route.** `app/student/projects/[id]/page.tsx:94-149`. | Carried: `reports/component-relevance-audit.md:42,81-82` |
| 12 | `/student/projects/[id]` | **W1 — same carried Apply gap on the detail route.** `app/student/projects/[id]/page.tsx:94-149`. | Carried: `reports/component-relevance-audit.md:42,81-82`; do not file a second owner |
| 13 | `/admin/payments` | **W1 — Confirm can succeed when the payment proof is stored but not viewable.** `app/admin/payments/page.tsx:65-80,88`, `app/admin/payments/payments-client.tsx:28,138,187`, `app/actions/shortlist-order.ts:173-188`. | `admin-payments.md` — route-specific |

## Prioritized plan

### P0 — fix or verify first (blocked task, money, data, or wrong access)

1. `/admin/payments` W1 — require a viewable proof in both client and
   `confirmOrder` before status becomes `confirmed` (`app/actions/shortlist-order.ts:173-188`).
2. `/login` WF-1 — add a real forgot-password/reset path or remove the dead end.
3. `/signup` U1 — make the client validation actually stop the submit and keep
   entered values; check React 19 form-action/`onSubmit` ordering before
   assigning a root cause.
4. `/founder/students/[id]` F1 + F2 — fix the CV 500 and compute eligibility on
   the server before rendering either primary action.
5. `/founder/browse-projects` U1, `/founder/browse-students` W1,
   `/founder/shortlists` W1 — restore interactive state and stop offering
   actions that cannot succeed; verify each with a driven click/refresh, not a
   source read.
6. `/founder/projects/[id]` U1 — validate the route ID as a UUID, call
   `notFound()` for malformed values, and route unexpected errors to
   `error.tsx`.
7. `/privacy` HIGH — correct the shortlist-access sentence at
   `app/privacy/page.tsx:157`.
8. Track the 3 carried HIGH items with their owners (header CTA, Apply gap) —
   do not open duplicate route issues.

### P1 — correctness and trust boundaries next

1. Resolve the **two suspected HIGH** role-mirror paths together: make the
   identity provider's role authoritative or mirror synchronously on every role
   change; add a regression check for `/admin/payments` and `/founder/profile`.
2. Unify the CV-access and shortlist-finalization copy across `/for-founders`,
   `/how-it-works`, `/for-students`, and `/privacy`; cite both reports where
   they phrase the same claim differently.
3. Fix server-side invariants: `/for-students` F1 (profile/CV completeness),
   `/admin/students` W1 + D1 (founder/project ownership check and transactional
   shortlist replacement), `/student/applications` W2 + D2 + D3,
   `/founder/projects/post` D1, `/student-profile` W1–W6, `/signup` W1 + D2,
   `/student/projects/[id]` D1.
4. Align the `pending` status contract between `/admin` W1 (`app/admin/page.tsx:65`)
   and `/admin/payments` W2 (`payments-client.tsx:33-38,137,195-203`);
   `reports/page-audits/admin-overview.md:70` and `admin-payments.md:109`
   disagree on which page owns the divergence — cite both.
5. Remove raw driver text from client-facing errors (`founder-student-detail` D3,
   `student-profile` W5/D1, `founder-project-detail` U1).

### P2 — polish, accessibility, and scale

1. Accessible names and grouping: `founder-browse-students` U1,
   `founder-projects` U1, `admin-students` A11y-A1/A11y-A2,
   `founder-project-detail` U2, `founder-student-detail` P2.
2. Repeatable low-cost cleanups: date year/locale (`home`/`student-overview`/
   `founder-overview`/`admin-payments` U5), duplicate brand suffix
   (`admin-overview` U1, `student-projects` U2), `min-h-screen` → `min-h-[100dvh]`
   (`for-founders`, `contact`, `faq`), focus/error token split
   (`founder-profile` U3, `admin-payments` U4).
3. Project and paginate the whole-table reads listed in cross-cutting theme 7;
   add the missing `shortlist_orders` queue index (`admin-payments` D2).
4. Structured data and metadata: `/faq` WF-2 `FAQPage` JSON-LD; resolve the
   `/faq` UI-1 duplication disagreement noted below.

## Verification gaps

- **`/public` W4 (suspected HIGH) is resolved, not live.** `public.md:61`
  recorded all interactivity inert in a dev runtime with HMR WebSocket errors;
  `home.md:68` records that a clean dev-server restart restored refresh, pause,
  disclosures, and mobile navigation. Both paths are cited; do not carry W4
  forward as a confirmed or live finding.
- **Repeated `net::ERR_CONNECTION_REFUSED`.** Several reports captured runtime
  state, then a later recheck (notably the 320px `/login` check) could not reach
  the dev server. Untracked screenshots from those failed runs
  (`auth-login-320.png`) are not authoritative.
- **Static-only audits.** `admin-payments.md:207` and `founder-shortlists.md:8`
  found no dev server and no authenticated session; their findings are source
  evidence, not runtime-driven. Other reports explicitly say "runtime not
  re-verified" for accessibility details.
- **Development-only error leakage.** The `founder-project-detail` U1 stack and
  the `/founder/students/[id]` CV 500 were observed in dev; production masking
  was not verified.
- **Not attempted because it mutates shared state:** a live Supabase-only
  demotion for the role-mirror path; a shortlist action click in
  `founder-student-detail.md`; and any mutation of seeded data.
- **Not verified in this consolidation:** screen-reader runtime behavior, 200%
  zoom, formal contrast measurement, image file contents/provenance (the
  `for-students` S1 / `about` S1 alt-text and licence questions remain
  suspected), and production environment values (`PAYMENT_CONFIGURED`,
  `NEXT_PUBLIC_APP_URL`).
- **Root causes unproven:** `/signup` U1 and `/founder/browse-projects` U1 both
  suspect hydration or form-action ordering but label that suspicion explicitly.

## Notes on overlaps

- **Carried HIGH items are referenced, not duplicated.** `/contact` HIGH is
  owned by `reports/cold-eyes.md:19` (fix in `components/marketing/site-header.tsx`).
  Both `/student/projects` and `/student/projects/[id]` carry the same Apply
  gap owned by `reports/component-relevance-audit.md:42,81-82`; one fix closes
  both route rows.
- **Global architecture findings are not re-owned.** Neon's lack of RLS is
  owned by `reports/FINAL-AUDIT.md:31,59,80` and
  `reports/orchestrator-audit.md:116-117`. The role-mirror fail-open is owned by
  `reports/orchestrator-audit.md:128` and `reports/FINAL-AUDIT.md:57-60`. Route
  reports add call sites only.
- **Shared copy claims across routes.** The "confirmed order = CV access" and
  "shortlist appears immediately after payment" claims appear in
  `for-founders.md:53-61`, `how-it-works.md:19-24,54-64`, `for-students.md:16-21`,
  and `privacy.md:60-62`. These are separate route instances of one product
  promise; cite the relevant report pair before deciding whether to change copy
  or enforce the rule in `app/api/cv/[id]/route.ts:59-82`.
- **Reported disagreement — FAQ index.** `faq.md:47` says the topic index is
  still present and contradicts `reports/visual-recheck.md:29`, which marked it
  fixed; `faq.md:47` also notes `reports/cold-eyes.md:26` owns the nav-duplication
  issue. Both paths are cited; no single owner was reassigned here.
- **Reported disagreement — payment status.** `admin-overview.md:70` counts
  only `submitted` as reviewable while `admin-payments.md:109` shows `pending`
  is fully actionable; each report treats the other's page as the receiving
  side of the divergence. Both are cited in P1 item 4.
- **`home.md` vs `public.md` on interactivity.** `public.md:61` is the original
  suspected-HIGH record; `home.md:68` is the resolving retest. The resolved state
  governs; the suspected-HIGH row for `/public` remains only as source history.
- **Other overlaps recorded but not re-scored:** `component-relevance-audit.md:55,82`
  owns the `/admin/payments` status filter (`admin-payments.md` U1);
  `component-relevance-audit.md:48` owns browse-students arrow-key navigation
  (`founder-browse-students.md` U2); `component-relevance-audit.md:38` owns the
  password-reveal gap (`signup.md` U3); `cold-eyes.md:20` owns duplicate contact
  mailto/FAQ links (`contact.md`); `cold-eyes.md:25` owns `min-h-screen`
  (`contact.md`, `for-founders.md`, `faq.md`); `copy-critic.md:22` and
  `content-integrity.md:55` own the `/for-founders` "Download agreement" HIGH
  (`founder-shortlists.md:86`). `about.md:63` cites `for-students.md:27` for the
  stock-classroom alt-text question and does not re-score it.
- **Items explicitly not carried forward:** `home.md:68` (public interactivity),
  `faq.md:90` (owning reports using `MEDIUM` are not re-ranked), and the
  already-fixed older visual issues listed in `contact.md:39`.
