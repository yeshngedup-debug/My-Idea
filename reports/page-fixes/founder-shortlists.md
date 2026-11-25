# Founder shortlists page fixes

Route: `/founder/shortlists`. Slug: `founder-shortlists`. Owner: per-page fix
agent. Source of truth: the current working tree. No `git checkout`, `git
reset`, `git stash`, or `git clean` was run.

## Files changed

- `app/founder/shortlists/page.tsx`
  - Removed the duplicate page-level payment `StatusTimeline`; the per-order
    steppers in `ShortlistsClient` are now the only timelines (audit U1).
  - Added a non-blocking notice when Realtime is not configured or cannot be
    sealed: "Live updates are unavailable. Refresh to check the latest payment
    status." (audit W5). The warning remains in the server log.
  - Mounted the new owned `LiveShortlistRefresh` bridge beside the shared
    `LiveOrderStatus` pill. It refreshes the route once when live data first
    reports a confirmed order and the server props are still locked, so the
    shortlist unlocks without a manual reload (audit W1).
- `app/founder/shortlists/shortlists-client.tsx`
  - Added the exported `LiveShortlistRefresh` client component. It reuses
    `@neon/realtime/client` / `@neon/realtime-react` with the same sealed query
    and renewal endpoint as the shared pill, and guards the refresh with a ref
    so it fires at most once per confirmed transition.
  - Kept the existing uncommitted pending-order state work intact. Added an
    explicit `Order another shortlist` action after unlock and made the
    package/payment steps reachable from that action, so a confirmed general
    order no longer locks the page (audit W2).
  - Replaced the single implicit pending-order path with order management inside
    owned files: `Continue payment` on other open orders, `Start a different
    order` in the payment form, a warning when several orders are open, and a
    confirmation before creating another order (audit W3, owned portion only).
    Server-side cancel/expire is still routed to the workflow owner.
  - Added `router.refresh()` after successful order creation and screenshot
    upload so the server-loaded order list and entitlement state catch up
    immediately.
  - Gave each order timeline a unique accessible name that includes package,
    project and date (audit U3).
  - Added file-name feedback and the 5 MB rule via `aria-describedby` on the
    screenshot input (audit U4).
  - Fell back to `Student record` for a missing `full_name` and gave every CV
    link an `aria-label` that names the student (audits U2 and U5).
  - Refactored the order and student cards with local block-scoped values only;
    no shared component or data file was touched.

`app/founder/shortlists/agreement/route.ts` was read and left unchanged. The
working tree already contained user changes in `shortlists-client.tsx`; all were
preserved as the source of truth.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full, the full
  `reports/page-audits/founder-shortlists.md`, the `shortlist` sections of
  `reports/page-audits/CONSOLIDATED.md` (lines 100-292), root and Next package
  `AGENTS.md`, and Next 16 docs `01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md` (including the
  `refresh()` guidance at lines 381-421), `10-error-handling.md`,
  `15-route-handlers.md`, and `03-api-reference/04-functions/use-router.md`
  (`router.refresh()` at line 46).
- Read `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css` before
  choosing copy and colours. All new classes reuse the existing warm-paper,
  forest and vermilion palette; no new dependency, gradient, violet or emoji
  was introduced.
- Verified the page contract in source: `proxy.ts:100-132` protects `/founder/*`;
  `app/actions/shortlist-order.ts:28-102` creates orders with a founder ID from
  `getUser()`; `uploadPaymentScreenshot` checks ownership at lines 127-134;
  `lib/neon-realtime.ts:31-60` fails closed without the secret and seals a
  founder-scoped query limited to 20 rows; `app/api/realtime/orders/route.ts:8-19`
  checks user and founder role before renewal.
- Verified the status and data contract against `neon/schema.sql:65-92`:
  `shortlists` statuses and `shortlist_orders` statuses (`pending`, `submitted`,
  `confirmed`, `rejected`) match `ORDER_STEPS` and the labels used by the page;
  `lib/neon-data.ts:626-639,819-832,943-962,964-988,1033-1044` was read for the
  owner filters and `select *` overfetch described below.
- `npx eslint app/founder/shortlists/page.tsx app/founder/shortlists/shortlists-client.tsx app/founder/shortlists/agreement/route.ts` — clean, no findings.
- No build, test suite, or dev server was started (per manifest). No browser
  session was available, so realtime transitions, screen-reader output and focus
  order are source-verified, not runtime-driven; this matches the audit
  limitation.

## Workflow findings routed to the workflow owner

- **W1 — shared pill, partial owned fix.** `components/founder/live-order-status.tsx:31-47`
  still only updates its own label from live data; it does not expose state to
  the page. The owned bridge at
  `app/founder/shortlists/shortlists-client.tsx:52-108` now calls
  `router.refresh()` once on a live confirmed transition. Recommended shared
  follow-up: let the live query be the single source of truth for entitlement,
  or expose a `confirmed` signal from the shared component so pages do not need
  a second subscription.
- **W3 — cancel/expire still missing.** `app/actions/shortlist-order.ts` has no
  action to cancel or expire an abandoned order, and
  `lib/neon-data.ts:974-988` sets `status = 'submitted'` unconditionally. The
  owned UI now offers `Continue` and `Start a different order`, but the old row
  remains open. Recommended fix: add an owner-checked `cancelShortlistOrder`
  action that only allows `pending` orders to move to a terminal `rejected` or
  `expired` state, and a matching status value in `neon/schema.sql:81` if a new
  state is introduced.
- **W4 — rejected order can be resubmitted.** `app/actions/shortlist-order.ts:132-134`
  blocks only `confirmed`, while `lib/neon-data.ts:980-984` moves any other
  status to `submitted`. The owned UI no longer offers `Continue payment` for a
  rejected order, but a crafted action can still revive it. Recommended fix:
  reject uploads when `order.status === 'rejected'`, or add a recorded appeal
  action and change the terminal copy in `components/ui/status-timeline.tsx`.
- **Realtime API.** `app/api/realtime/orders/route.ts:8-19` correctly checks the
  user and founder role before sealing; no auth defect was found. The duplicate
  subscription added by the owned bridge is bounded by the single-refresh guard
  and is the trade-off for not editing the shared pill.

## Database findings routed to the database owner

- **D1, MED — application-only authorization.** `neon/schema.sql:1-4` creates no
  RLS. `lib/neon-data.ts:626-635` (`listStudentProfiles`) accepts arbitrary IDs
  with no owner predicate; the page currently passes only IDs from
  founder-scoped shortlist rows (`app/founder/shortlists/page.tsx:98-126`), so no
  active IDOR was found. Recommended fix: keep these helpers server-only, add
  cross-founder negative tests, and add DB-level predicates/views or a
  documented service-role trust boundary.
- **D2, LOW — unscoped order helpers.** `lib/neon-data.ts:964-988` (`getOrder`,
  `setOrderScreenshot`) filter on `id` only. The action owns the check
  (`app/actions/shortlist-order.ts:127-131`). Recommended fix: require
  `founderId` and use `where id = $1 and founder_id = $2` in both helpers.
- **D3, LOW — `projectId` ownership not checked at write time.**
  `app/actions/shortlist-order.ts:88-93` passes the client value to
  `insertOrder`; `neon/schema.sql:78` only enforces that the project exists.
  Recommended fix: verify `projectId` against the founder's projects before
  insert, or add an `exists` predicate in the shared helper.
- **D4, LOW — unbounded reads and `select *`.**
  `lib/neon-data.ts:633,824,967,1036` use `select *`; `listFounderOrders` has no
  `LIMIT`, while `lib/neon-realtime.ts:45-54` caps live rows at 20. The page maps
  all orders and renders a stepper for each. Indexes exist at
  `neon/schema.sql:87-92`. Recommended fix: select only mapped columns and add
  a server-side limit or pagination aligned with the realtime cap.
- **Status contract pass.** `neon/schema.sql:69,81` status values match the
  labels used by `components/ui/status-timeline.tsx` and
  `components/founder/live-order-status.tsx:14-19`. No stale status string was
  found on this route.

## Deliberately not changed

- `components/founder/live-order-status.tsx`,
  `components/ui/status-timeline.tsx`, `app/actions/shortlist-order.ts`,
  `lib/neon-data.ts`, `lib/neon-realtime.ts`, `app/api/**`, `proxy.ts`,
  `neon/schema.sql`, and all shared layouts: outside this route's ownership.
  Fixes are routed above instead.
- `app/founder/shortlists/agreement/route.ts`: no defect confirmed. `proxy.ts`
  protects `/founder/*`, the handler already generates a local PDF, and the
  in-app CTA is correct. The public `/for-founders` CTA overlap remains owned by
  the copy critic and was not duplicated here.
- The suspected sticky-heading width (audit S1, `lg:grid-cols-[0.2fr_0.8fr]`)
  was left as-is: it is unverified without a browser, and changing the shared
  split without evidence would be speculative.
- No server-side cancel/expire or appeal action was added: those state
  transitions belong to the workflow owner, not this page.
- No full build, tests, dev server, or other agent's report was touched.
