# Second-pass feature completeness — `/founder/shortlists` (founder-shortlists)

Date: 2026-11-25. Scope: the owned files in `reports/page-fixes/MANIFEST.md`
(`app/founder/shortlists/page.tsx`,
`app/founder/shortlists/shortlists-client.tsx`,
`app/founder/shortlists/agreement/route.ts`) plus this report. The dirty working
tree was treated as the source of truth. No destructive git command, dev server,
browser/Reticle tooling, full build, full test suite, install, or shared-file
edit was used. Skills applied: `verify-optimistic-update` and
`test-error-states`.

## Files changed

### `app/founder/shortlists/shortlists-client.tsx`

- **Refresh bridge now tracks confirmed order IDs, not one boolean.** The
  bridge seeds `seenConfirmed` from server-rendered confirmed IDs and refreshes
  only when live data reports a confirmation the page has not already rendered
  (`:47-112`). This also notices a later second confirmation after an earlier
  unlock.
- **Live confirmation closes the payment step without `setState` in an effect.**
  `visibleStep` is derived from `activeOrderIsConfirmed` (`:147-152`), so a
  confirmed active order cannot keep the screenshot form open. The first
  implementation used a synchronous effect and was rejected by ESLint; the
  derived-state version is clean.
- **Three secondary controls now meet the 44px target rule.** `min-h-9` became
  `min-h-11` for “Start a different order”, “Continue payment”, and “View CV”
  (`:388`, `:429`, `:498`).

### `app/founder/shortlists/page.tsx`

- Passes `confirmedOrderIds` to `LiveShortlistRefresh` instead of a boolean
  (`:165-173`), which is the server-side half of the ID-based refresh guard.

### `app/founder/shortlists/agreement/route.ts`

- Read and left unchanged. The handler already returns a locally generated
  `application/pdf` with a safe filename and `no-store` (`:54-64`).

All phase-1 changes in the two owned `.tsx` files were preserved as the source
of truth; only the deltas above were added by this pass.

## Features verified

Verification was source-based. Runtime forcing of mocked action failures,
realtime transitions, keyboard focus order, or screen-reader output was not
available under this pass's constraints; those verdicts are labelled static-only
below.

| Area | Current source evidence | Result |
|---|---|---|
| Route and identity | `proxy.ts:117-138` protects `/founder/*` and distinguishes failed role lookups from unknown roles. `app/founder/shortlists/page.tsx:27-30` re-reads the verified user before any data query. | Pass. No client-supplied identity is trusted. |
| Shortlist entitlement / selection | `page.tsx:87-130` unlocks all rows for a confirmed general order and only matching `project_id` rows for project-specific orders. `listFounderShortlists()` is founder-scoped (`lib/neon-data.ts:892-905`), profile IDs are deduplicated, and missing profiles are skipped. | Pass for access scope. Display order/rank is routed below. |
| Package and amount entry | `shortlists-client.tsx:254-327` uses `aria-pressed` cards, an optional project select, and a numeric amount. `app/actions/shortlist-order.ts:54-85` revalidates package and price range server-side. | Pass. Client affordance and server validation agree. |
| Payment configuration | `config/payment.ts:40-62` treats blank bank/mBoB values as not configured; the UI blocks ordering and shows an explicit alert at `shortlists-client.tsx:242-246`. | Pass. Founders cannot pay to blank destinations. |
| Proof upload | `shortlists-client.tsx:368-391` accepts PNG/JPG/WEBP, names the selected file, and states the 5 MB cap. `shortlist-order.ts:116-157` checks file type/size, order ownership, and payable status before writing. | Pass in source; upload rejection was not runtime-forced. The action-body-size limit is routed below. |
| No unviewable proof confirmable | `confirmOrder()` rejects non-reviewable orders and missing `screenshot_path` (`shortlist-order.ts:176-191`), then requires a Storage signed URL before writing `confirmed` (`:193-206`). `setOrderStatus()` repeats the pending/submitted guard in SQL (`lib/neon-data.ts:1084-1113`). | Pass in source. Storage/SignedURL failure was not simulated. |
| CV / proof viewing | Each CV link goes through `/api/cv/[id]` (`shortlists-client.tsx:492-502`); the route validates UUID, signs in, checks role and founder relationship, then redirects to a 300-second signed URL (`app/api/cv/[id]/route.ts:22-104`). | Pass in source. Each link has a unique student/rank accessible name. |
| Order state machine | `ORDER_STEPS` (`components/ui/status-timeline.tsx:172-195`) matches the schema values (`neon/schema.sql:88-98`). Upload is blocked after confirmed/rejected (`shortlist-order.ts:133-138`, `lib/neon-data.ts:1064-1082`); rejected is terminal in the timeline. | Pass for the implemented four states. Cancel/expire is absent and routed below. |
| Local optimistic state / rollback | `shortlists-client.tsx:129-163,165-220` keeps a local pending order only after a successful create, announces results through an always-mounted `role="status"`/`role="alert"` region (`:224-240`), and calls `router.refresh()` after successful create/upload. Failures log server-side and set an alert without mutating the server-derived `orders` or granting entitlement. | Static pass: no optimistic entitlement is granted and failure leaves prior state visible. Mocked rejections were not driven in a browser, so runtime rollback is **unknown**, not claimed as verified. |
| Refresh bridge | `page.tsx:157-174` mounts the owned bridge beside the shared pill. `shortlists-client.tsx:47-112` seeds known confirmed IDs and refreshes only for newly confirmed live rows; the query fingerprint key avoids stale subscriptions. | Pass in source. Live transition timing was not runtime-driven. |
| Realtime fallback | `page.tsx:40,60-85,147-155` sets `liveUnavailable` when the URL is absent or sealing throws and shows a non-blocking notice telling the founder to refresh. | Pass in source; no live outage was simulated. |
| Empty / loading / error states | No students → explicit “will appear here as soon as the admin finalizes it” (`shortlists-client.tsx:461-464`). No orders → package step. Multiple open orders → count and `Continue payment` controls (`:336-341`, `:420-433`). Pending actions show “Creating order...” / “Submitting...”. Server errors bubble to the route-aware root boundary. | Pass in source. These branches were not runtime-forced. |
| Copy honesty | Confirmed step says admin finalization follows (`status-timeline.tsx:185-187`); the empty shortlist repeats it. Payment details come from config; the agreement PDF says it is a template and not legal advice (`agreement/route.ts:9-11`). | Pass in owned copy. Shared “unlocked” copy is routed below. |
| Accessibility | Unique order timeline labels include package, project and date (`:434-439`); CV links name the student and rank (`:495`); file input is described by its help text (`:370-384`); fallback `Student record` avoids empty headings (`:468`); focus rings and 44px secondary targets are present. | Pass in source. Tab order and screen-reader output were not exercised. |

## Checks performed

- `npx eslint app/founder/shortlists/page.tsx app/founder/shortlists/shortlists-client.tsx app/founder/shortlists/agreement/route.ts` — clean, no findings.
- `npx tsc --noEmit --pretty false` — clean, no findings. An earlier run reported transient errors in `app/student/projects/*`; those files are not owned by this pass, and the final run was clean.
- `git diff -- app/founder/shortlists/page.tsx app/founder/shortlists/shortlists-client.tsx app/founder/shortlists/agreement/route.ts` — reviewed; only the pass-2 deltas above were added by this pass.
- Read the Next 16 docs relevant to client refresh and error handling (`07-mutating-data.md`, `10-error-handling.md`, `forms.md`), `app/globals.css`, `lib/design-tokens.ts`, `design/brand-system.md`, `design/voice-guide.md`, `design/brand-guidelines.md`, the audit, phase-1 report, three phase-2 shared reports, current owned files, and the shared action/data/route/status components cited above.
- Not run by design: `next build`, `npm test`, dev server, browser/Reticle verification, installs, and live database or Storage mutation.

## Workflow findings routed

These files are outside this slug's ownership and were not edited.

- **Confirmation copy still promises an unlock before finalization (MED).**
  `app/actions/shortlist-order.ts:213` returns “Payment confirmed. Shortlist
  unlocked.” after only setting the order status (`:205-206`); no shortlist rows
  are created there. Admin generation persists rows later
  (`app/actions/admin-students.ts:163-166`). The same promise is in
  `components/founder/live-order-status.tsx:19`. The timeline and page empty
  state are already honest. **Recommended (workflow/design owner):** change the
  shared action/label copy to “Payment confirmed. An admin finalizes and ranks
  the shortlist before release.”, or create and rank rows before confirming.
- **Shared live pill describes only the newest order (MED).**
  `components/founder/live-order-status.tsx:35-37,57` derives its label and
  `confirmed` flag from `data?.[0]`; the sealed query orders all rows by
  `created_at DESC` (`lib/neon-realtime.ts:45-54`). With several orders, an older
  confirmed order can unlock the page while the pill still says “Awaiting
  payment” for a newer pending order. **Recommended (design/workflow owner):**
  derive confirmation from `data?.some(...)`, choose a representative latest row
  for the label, and expose confirmed IDs through `onConfirmed` so hosts do not
  need a second subscription.
- **No owner-checked cancel/expire transition (MED).**
  `app/actions/shortlist-order.ts:176-235` only confirms or rejects; abandoned
  `pending`/`submitted` rows stay open and are counted by the owned UI.
  **Recommended (workflow owner):** add a founder-owned cancel action that only
  moves `pending` rows to a terminal state, with a schema migration if `expired`
  is introduced. The owned page already offers “Start a different order” and a
  duplicate-order confirmation.
- **5 MB upload cap exceeds the Next action body default (MED).**
  `app/actions/shortlist-order.ts:123-124` accepts up to 5 MB, but
  `next.config.ts:6` has no `serverActions.bodySizeLimit`; Next's installed guide
  states a 1 MB default (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:83`).
  **Recommended (config/workflow owner):** set `serverActions.bodySizeLimit` to
  at least `'6mb'`, or lower the action and UI caps together.

## Database findings routed

- **Displayed rank is not stored per shortlist (MED).**
  `lib/neon-data.ts:892-905` orders rows only by `created_at asc`;
  `replaceAdminShortlist()` inserts the intended order through `unnest` without
  persisting an ordinal (`:909-957`). `neon/schema.sql:78-86` has no per-shortlist
  rank; `rank` exists only on `student_profiles` (`:73`). The owned UI numbers
  cards by render index (`shortlists-client.tsx:467-476`). **Recommended
  (database owner):** add a per-founder/per-project rank or position with a
  unique constraint, persist it from `WITH ORDINALITY`, and order reads by it.
- **Order helpers still take a raw ID (LOW, defence in depth).**
  `lib/neon-data.ts:1050-1082` scopes `getOrder()` and `setOrderScreenshot()` by
  ID only; ownership is checked at `app/actions/shortlist-order.ts:127-131`, so
  no active bypass was found. **Recommended (database/workflow owner):** require
  `founderId` and add `founder_id = $2` to both queries.
- **Unbounded order history (LOW).**
  `listFounderOrders()` has no limit (`lib/neon-data.ts:1129-1142`) while the
  realtime query caps at 20 (`lib/neon-realtime.ts:45-54`). **Recommended
  (database owner):** add a paginated/bounded variant and align the server cap
  before long-lived accounts accumulate large DOM/payload cost.

## Deliberately not changed

- Shared files named above, `next.config.ts`, `proxy.ts`, `neon/schema.sql`,
  `app/api/**`, shared layouts, and all other agents' reports.
- `app/founder/shortlists/agreement/route.ts`: no defect confirmed; the public
  `/for-founders` CTA overlap remains with the copy owner.
- No new server action, route, dependency, schema migration, Storage lifecycle
  change, cancel/appeal flow, or broad token refactor.
- The suspected sticky-heading width remains unchanged: it is unverified
  without a browser and no owned defect was confirmed.
- Mocked failure, realtime confirmation, focus-order, and screen-reader
  verification were skipped because the pass forbids dev servers and browser
  tooling; no runtime pass is claimed for them.

## Final summary

Pass 2 fixed three owned-file defects: the refresh bridge now tracks confirmed
order IDs instead of a one-shot boolean, a live confirmation derives the closed
pay step without a synchronous effect, and three secondary controls meet the
44px target size. Entitlement, proof upload/viewing, the four-state order flow,
fallback states, copy, and ARIA are complete in source. ESLint and TypeScript are
clean; remaining gaps are routed to the workflow, config, and database owners,
and runtime-only verdicts are explicitly unknown.
