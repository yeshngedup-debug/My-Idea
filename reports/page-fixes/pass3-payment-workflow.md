# Pass 3 consolidated — payment workflow truthfulness, formatting, and proof

Date: 2026-11-25. This file replaces the earlier F-17-only note. It reconciles
the current dirty-tree source for A1–A3 payment truthfulness, F-17 formatting,
and F-21 payment-proof verification. It was written from source and existing
reports only.

This was a report-only reconciliation: no product source, config, schema, test,
or other report was changed while producing this version. No commit, stash,
reset, checkout, clean, install, build, dev server, browser drive, live database
query/mutation, or Storage mutation was performed. All runtime claims remain
unverified.

Status key follows `reports/page-fixes/pass2-consolidated.md`:

- **RESOLVED-SOURCE** — current source contains the fix; not a runtime pass.
- **PARTIAL-LATER-PASS** — a later pass added a fix, but the original finding is
  only partly closed and has no runtime proof.
- **RUNTIME-UNVERIFIED** — plausible from source, but not proven in a browser or
  against live data.
- **LIVE-DEFERRED** — source-verified limitation needing product, policy,
  config, deployment, or owner consent.

| Item | Register | Current status | Boundary |
| --- | --- | --- | --- |
| A1 — confirmation says “unlocked” | F-03 | RESOLVED-SOURCE for copy; RUNTIME-UNVERIFIED | F-31 live-order selection remains routed. |
| A2 — package promises | F-04 | PARTIAL-LATER-PASS | Known confirmed packages are enforced; legacy/no-order paths and one public FAQ heading remain routed. |
| A3 — rejected-order dead end | F-05 | RESOLVED-SOURCE for recovery path; RUNTIME-UNVERIFIED | No reopen action was added; the chosen path is create a new order. |
| A6 — formatting | F-17 | PARTIAL-LATER-PASS | In-scope founder/admin callsites fixed; global F-17 remains LIVE-DEFERRED. |
| F-21 — proof object existence | F-21 | RESOLVED-SOURCE; RUNTIME-UNVERIFIED | F-23 schema invariant remains LIVE-DEFERRED. |

## 1. A1–A3 payment truthfulness

### A1 / F-03 — confirmation and delivery copy

Current source uses one shared copy set instead of claiming immediate release:

- `lib/order-status.ts:5-14` defines `paymentConfirmed`, `awaitingReview`,
  `shortlistPending`, and rejection copy. `paymentConfirmed` says an admin will
  finalize the shortlist and does not say “unlocked”.
- `app/actions/shortlist-order.ts:235-238` returns `ORDER_COPY.paymentConfirmed`
  after `setOrderStatus`. `app/actions/shortlist-order.test.ts:145-171` asserts
  that mapping.
- `lib/order-status.test.ts:6-10` asserts that confirmation and pending copy
  name the admin finalization step and do not match `/unlock/i`.
- `app/founder/shortlists/shortlists-client.tsx:50-51` maps submitted/rejected
  timeline steps to the shared copy; `:482` shows `shortlistPending` when no
  student rows exist yet.
- `components/founder/live-order-status.tsx:19` now says “Payment confirmed.
  Admin finalization pending” instead of “Shortlist unlocked”.
- Public copy agrees: `app/for-founders/page.tsx:174` says an admin confirms,
  finalizes, ranks, and releases; `app/how-it-works/page.tsx:85,112` says
  confirmation counts as paid and the founder reviews the shortlist after an
  admin prepares it.

A1 wording is **RESOLVED-SOURCE**, not runtime-proven. The separate F-31 concern
remains: `components/founder/live-order-status.tsx:35` still selects `data?.[0]`
as “latest”, so order choice can be wrong even though the label is now truthful.
F-31 stays with Design System + Workflow.

### A2 / F-04 — package size and support promises

Known paid packages are now backed by data and an enforced generation path:

- `config/payment.ts:16-17,30-31` publishes Basic `minStudents: 3`,
  `maxStudents: 5`, Full `minStudents: 5`, and `maxStudents: 10`.
- `app/actions/admin-students.ts:50-65` resolves a package only from a
  `confirmed` order with a known package id, preferring a project-specific order
  and falling back to a general one.
- `app/actions/admin-students.ts:137-167` rejects generation when the selected
  row count is outside that known package’s range; `app/actions/admin-students.test.ts:91-138`
  covers Basic 2/6 and Full 11.
- `config/payment.ts:32-38` removes the untracked “availability pre-check”,
  “admin-led introduction”, and “replacement” promises. The remaining promises
  — admin-finalized ranking, availability from profiles, and founder outreach
  contact details — match source behaviour.
- `config/payment.test.ts:10-15` guards against reintroducing the removed
  promise wording.

Boundaries that keep A2 **PARTIAL-LATER-PASS**:

- `app/actions/admin-students.ts:143-144` deliberately allows legacy/admin-only
  shortlists when there is no confirmed known-package order; no size promise is
  claimed in that path. `app/actions/admin-students.test.ts:70-89,140-160`
  covers no-order and unknown-legacy-package cases.
- `app/for-founders/page.tsx:199` still has the FAQ heading “Availability,
  introductions, and a replacement”. Its answer at `:202-205` now describes the
  real Full Support features, but the stale heading remains a Content/Marketing
  residual.
- `config/payment.ts:22` still contains the static “Delivered within 2 working
  days” feature. `app/for-founders/page.tsx:212-215,425` filters it and shows a
  paused-orders notice while `PAYMENT_CONFIGURED` is false; treating the SLA as
  operational data remains A4/F-06 with Product + Operations.
- No browser/finalization run proved that generated rows always match the
  enforced count in production.

### A3 / F-05 — rejected-order recovery

The dead-end copy was replaced with a self-service path:

- `lib/order-status.ts:11-14` defines `orderRejected`, `rejectedTimeline`,
  `createNewOrder`, and `orderReviewRejected`.
- `app/actions/shortlist-order.ts:137-138` uses `ORDER_COPY.orderRejected` for
  screenshot upload to a rejected order; `:259` returns
  `ORDER_COPY.orderReviewRejected` after admin rejection.
- `app/founder/shortlists/shortlists-client.tsx:456` renders a “Create a new
  order” link for rejected rows; `app/actions/shortlist-order.test.ts:127-143,229-242`
  and `lib/order-status.test.ts:13-18` cover these messages.
- No admin reopen action was added. The chosen resolution is the permitted
  alternative: tell the founder to create a new order. Any future reopen action
  belongs to the order-lifecycle work tracked under F-30.

A3 recovery copy is **RESOLVED-SOURCE** and RUNTIME-UNVERIFIED.

## 2. F-21 — payment proof existence before confirmation

`confirmOrder` now proves the stored object exists before it writes `confirmed`:

- `app/actions/shortlist-order.ts:177-179` requires admin and keeps the Supabase
  client for Storage access; `:184-192` rejects non-reviewable states and orders
  without a screenshot path.
- `:194-207` calls `supabase.storage.from('payment-screenshots').exists(order.screenshot_path)`.
  Lookup errors and thrown errors are logged and treated as “not proven”.
- `:209-214` fails closed with “Payment proof is unavailable. Ask the founder to
  upload it again.” when `exists` is not `true`.
- Only after existence is proven does `:216-225` mint the 60-second signed URL
  and `:227-231` call `setOrderStatus(..., 'confirmed', ...)`.
- Regression test `app/actions/shortlist-order.test.ts:173-197` mocks
  `exists → { data: false, error: NoSuchKey }` while a signed URL would succeed.
  It asserts `ok: false`, the friendly unavailable-proof message, no
  `createSignedUrl` call, and no `setOrderStatus` call. The success path at
  `:145-171` mocks `exists → true`.

F-21 is **RESOLVED-SOURCE** and RUNTIME-UNVERIFIED. It was not tested against
live Supabase Storage, RLS/`select` policy, or a real deleted object. The
database-level gap remains F-23: `neon/schema.sql:88-98` can still store
`confirmed` with a null `screenshot_path`, and this action is only one writer.

## 3. F-17 — formatting convention and changed callsites

F-17 is only partly closed. The shared formatter set and the two payment
surfaces in this pass use the convention below; other routes remain routed
residuals.

| Value | Convention | Example |
| --- | --- | --- |
| Locale | `en-GB` | — |
| Number grouping | `Intl.NumberFormat('en-GB')` | `1,500`, `1,500.5` |
| Currency | `Nu ` prefix, defined on first founder-flow use | `Nu 1,500` |
| Calendar date | `en-GB` day/month/year, fixed `timeZone: 'UTC'`, suffix ` UTC` | `25 Nov 2026 UTC` |
| Timestamp | Same date fields plus 24-hour `HH:mm`, fixed UTC, suffix ` UTC` | `25 Nov 2026, 14:30 UTC` |
| Missing amount | `Amount not set` | `Amount not set` |
| Missing/invalid date | `Date not set` | `Date not set` |

Rationale: these are Client Components that are also prerendered on the server.
Host-local `toLocaleDateString` can render a different date before hydration;
fixing the zone to UTC and printing `UTC` keeps markup stable and the reader
informed.

Changed callsites and tests:

- `lib/format.ts:9-55` — canonical `formatNuAmount`,
  `formatEnGbUtcDate`, and `formatEnGbUtcDateTime`.
- `lib/format.test.ts:8-42` — grouping, currency label, UTC output, host-zone
  independence, and invalid-input fallbacks.
- `app/admin/payments/payments-client.tsx:15,212,215` — queue amounts use
  `formatNuAmount`; timestamps use `formatEnGbUtcDateTime`.
- `app/founder/shortlists/shortlists-client.tsx:11,257,322,346,417,427` — imports
  the shared formatters; shows the first-use “All amounts are in Bhutanese
  ngultrum (Nu).” note; corrects `Amount you will pay (Nu.)` to `(Nu)`; formats
  pay heading amount, order amounts, and order dates.

Prettier’s default quote style differs from the two owned client files;
reformatting them would have rewritten many unrelated pre-existing lines, so it
was not done.

## 4. F-17 residuals outside this pass

None of the following was edited here. They remain LIVE-DEFERRED for the named
owners or global F-17 closeout.

### `en-IN` number grouping still used for `Nu` amounts

| File:line | Residual |
| --- | --- |
| `app/admin/page.tsx:238` | Admin overview uses `Nu ${order.amount.toLocaleString("en-IN")}`. |
| `app/founder/browse-projects/browse-projects-client.tsx:83,85` | Project budget ranges use `en-IN`. |
| `app/founder/projects/[id]/project-detail-client.tsx:180-181` | Project detail budgets use `en-IN`. |
| `app/student/projects/projects-client.tsx:126` | Project card budget range uses `en-IN`. |
| `app/student/projects/[id]/page.tsx:241` | Project detail budget range uses `en-IN`. |

These should adopt `formatNuAmount` when their page owners take the global part
of F-17.

### Zone-less or host-local dates

| File:line | Residual |
| --- | --- |
| `app/actions/admin-students.ts:189` | Generated shortlist text uses `toLocaleDateString('en-GB', ...)` with the server-local zone. |
| `app/admin/page.tsx:242` | Admin overview order date uses host-local `en-GB`. |
| `app/admin/projects/projects-client.tsx:99` | Admin project date uses host-local `en-GB`. |
| `app/admin/admin-charts.tsx:316` | Chart month label uses `timeZone: 'UTC'` but has no visible UTC label. |
| `app/founder/browse-projects/browse-projects-client.tsx:73` | Host-local `en-GB` date. |
| `app/founder/page.tsx:19,23,31` | Host-local `en-GB` chart date/year formatters. |
| `app/founder/profile/page.tsx:43` | Account-created date uses host-local `en-GB`. |
| `app/founder/projects/projects-client.tsx:73` | Host-local `en-GB` date. |
| `app/founder/projects/[id]/project-detail-client.tsx:283` | “Applied” date uses host-local `en-GB`. |
| `app/student/page.tsx:85,92` | Host-local `en-GB` chart date/year formatters. |
| `app/student/applications/applications-client.tsx:163` | Host-local `en-GB` application date. |
| `app/student/projects/page.tsx:32` | Host-local `en-GB` date. |
| `app/student/projects/projects-client.tsx:95` | Host-local `en-GB` date. |
| `app/student/projects/[id]/page.tsx:100` | Host-local `en-GB` date. |

### Intentional or non-payment exceptions

- `components/layout/workspace-clock.tsx:11-20` intentionally formats Thimphu
  time with `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Thimphu' })` after
  mount. It starts from a placeholder, so it does not have the same SSR/local
  hydration mismatch; its visible label is “Local time”. Design System owns any
  change there.
- `lib/data/world-bank.ts:202-206` already uses `en-GB` number formatting. No
  change is needed; the Data owner retains it.
- `config/payment.ts:14,28` still contains `Nu`-prefixed price ranges. Public
  pages that render `PACKAGES` outside the founder flow still need a
  product/content decision for first-use `Nu` labelling.
- `tests/e2e/payment-flow.test.ts:66-71` still filters the admin order by
  `1,500`; the shared `en-GB` formatter keeps that contract intact.

F-17 remains LIVE-DEFERRED globally until the routed owners adopt the same
convention in the files above.

## 5. Verification ledger

The following checks were reported by the earlier focused passes; they were not
rerun by this report-only reconciliation:

- `npx vitest run lib/format.test.ts` — 1 file, 6 tests passed.
- `npx vitest run lib/format.test.ts app/actions/shortlist-order.test.ts config/payment.test.ts`
  — 3 files, 22 tests passed.
- `npx vitest run app/actions/shortlist-order.test.ts app/actions/admin-students.test.ts config/payment.test.ts lib/order-status.test.ts lib/format.test.ts --reporter=dot`
  — 5 files, 31 tests passed after the F-21 fix.
- Scoped ESLint over the payment workflow and formatting files — no findings.
  The F-17 run was
  `npx eslint app/admin/payments/payments-client.tsx app/founder/shortlists/shortlists-client.tsx lib/format.ts lib/format.test.ts`.
- `npx prettier --write lib/format.ts lib/format.test.ts` — both new files
  formatted.
- `git diff --check` — no whitespace errors; only CRLF-normalisation warnings
  from the dirty worktree.
- `npx tsc --noEmit` during the F-17 pass failed at
  `app/actions/admin-students.ts(63,18)` and `app/auth/callback/route.ts(26,32)`,
  neither in the F-17-owned files. This was not rerun here and is not a current
  clean TypeScript claim.

Not run: full `npm test`, production `next build`, dev server, browser or Reticle
drive, live database query, live Storage check, real-time confirmation drive,
and rendered date/currency verification. Rendered output, hydration stability,
admin review behaviour, and real proof availability are therefore
source-verified and unit-tested, not runtime-proven.

## 6. Other routed payment residuals

| ID | Residual | Owner / status |
| --- | --- | --- |
| F-23 | Schema can store `confirmed` with null `screenshot_path`; only one writer enforces proof. | Database + Workflow; LIVE-DEFERRED. |
| F-24 | Review writes status and `confirmed_at` only; no reviewer identity, decision time, or rejection reason. | Workflow + Database; source-verified residual. |
| F-25 | Neon `profiles.role` is mirrored from Supabase; demotions can leave stale admin authority. | Workflow + Identity; LIVE-DEFERRED. |
| F-26/F-27 | Admin payment queue still scans/sorts projects and orders without a scoped queue contract. | Database + Frontend; source-verified residuals. |
| F-28 | Schema has no explicit shortlist finalization/release or stored rank. | Database + Product; LIVE-DEFERRED. |
| F-30/F-38 | No owner-checked cancel/expire transition and no status CHECK constraint. | Workflow + Product + Database; LIVE-DEFERRED. |
| F-31 | Live pill selects `data?.[0]`; a non-latest order can drive the label. | Design System + Workflow; source-verified residual. |

These are recorded so the current fixes are not mistaken for global closure of
the payment workflow.
