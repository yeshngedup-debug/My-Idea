# admin-payments — per-page fixes

## Files changed

- `app/admin/payments/payments-client.tsx`
  - **Viewable-proof gate (W1, client half):** Confirm is now disabled unless a usable signed URL exists (`proofReady = Boolean(o.screenshotUrl)`), instead of only checking `screenshot_path`. The previously dead `screenshotError` prop is consumed to distinguish a Storage signing failure from a missing/expired link, and `aria-describedby` points at the matching explanation.
  - **Proof recovery (U2, in-file half):** when a stored proof has no viewable link on an actionable order, show a precise message plus a **Refresh proof link** button that calls `router.refresh()` to re-run the server's signed-URL minting. Closed rows no longer show a pointless refresh control.
  - **Status filter and queue count (U1):** added the existing `SegmentedControl` (All / Awaiting proof / Verifying / Confirmed / Rejected), a polite live count (`N orders awaiting review · Showing …`), actionable-first ordering within each group, and a “No orders in this view” state with a **Show all orders** button.
  - **Status contract copy (W2):** `pending` is labelled “Awaiting proof” rather than “Awaiting payment”; added an `unknown` → “Needs review” fallback so an unrecognised status never renders as a normal awaiting state.
  - **Refresh after mutations (S2):** `update()` now calls `router.refresh()` in `finally` (success and failure), clears a stale result line on a new action, and catches a thrown server action so the failure is shown instead of escaping.
  - **Accessibility (U3/U4):** added the missing `sr-only` `h2` to the empty state; all focus rings now use the focus token `#d84f37` instead of the error/accent `#b23c26`; status icons are `aria-hidden`; error text uses `#7a2c1c`.
  - **Order identity (U5):** added a centralised fixed-UTC date/time formatter (year, hour, minute) and a short `#xxxxxxxx` order ID; long values use `break-words` instead of `truncate`.
  - **Copy (W4):** “ask the founder to upload proof” → “The founder must upload proof before this order can be confirmed.” The reject guard now says a stale order can be closed and the founder will need a new order if no proof arrives.
- `app/admin/payments/page.tsx`
  - No further edit was needed in this pass. The working-tree version already re-checks the session and Neon admin role before loading data (`page.tsx:28-33`), mints 1-hour signed URLs (`page.tsx:62-80`), and propagates `screenshotError` (`:66,76,79,88`). These pre-existing changes were verified and preserved, and are the server half of the viewable-proof gate.

The working tree already contained uncommitted user changes in both owned files. They were treated as the source of truth, preserved, and extended. No shared file was edited.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full and followed its ownership rules.
- Read `reports/page-audits/admin-payments.md`, the relevant `reports/page-audits/CONSOLIDATED.md` sections (including P0/HIGH item 13), `AGENTS.md`, and the required Next.js 16 docs: layouts/pages, server/client components, mutating data, error handling.
- Read `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`, `lib/neon-data.ts`, `neon/schema.sql`, `app/actions/shortlist-order.ts`, `proxy.ts`, `components/interactive/segmented-control.tsx`, `app/admin/projects/projects-client.tsx`, and the two relevant E2E tests before editing.
- Re-verified each audit lead against the current working-tree source rather than trusting the report's line numbers.
- `npx eslint app/admin/payments/page.tsx app/admin/payments/payments-client.tsx` — **passes with no findings**. One intermediate cascading-render lint error (a `setState` call inside an effect that cleaned up local overrides) was caught and resolved by removing that effect; the explicit refresh in `finally` covers the same concern.
- `git diff` / `git status --short` scoped to the owned files confirmed no other source file was touched by this pass.
- E2E contract preserved: the button is still named `Confirm payment`, the result line is still the page's only `role="status"`, the count uses `aria-live` instead of a second `role="status"`, and the seeded screenshot orders still get an enabled Confirm button.
- No full `next build`, `npm test`, or dev server was started, per manifest instruction. No browser/runtime assertion was attempted.

## Workflow findings routed to workflow owner

- **W1 (remaining HIGH half) — server action still confirms a non-viewable proof.**
  - `app/actions/shortlist-order.ts:173-185`: `confirmOrder` checks only `order.screenshot_path` before calling `setOrderStatus(orderId, 'confirmed', …)`. A stored path whose Storage object was deleted or whose policy denies access is enough to unlock the shortlist.
  - `app/actions/shortlist-order.ts:180` also contains the dead-end message “No payment screenshot yet. Ask the founder to upload one.” — this page exposes no contact path.
  - Recommended fix: after `requireAdmin()` and the order lookup, attempt a server-side `createSignedUrl`/`info`/`download` for `order.screenshot_path`; return an error if it fails, and only then call `setOrderStatus`. Rewrite `:180` to “The founder must upload proof before this order can be confirmed.”
  - The client half is fixed here, but a direct action call still bypasses it, so this must be fixed in the shared action.
- **U2 (server half) — no on-demand proof URL route.**
  - The **Refresh proof link** button added here calls `router.refresh()`, which re-renders the route and re-mints URLs. There is still no admin-checked `refreshPaymentProof(orderId)` action or `/admin/payments/screenshot/[orderId]` route that signs a single proof on demand.
  - Recommended fix: add such an action/route with the same `requireAdmin()` check and return a fresh short-lived URL; then point the fallback button at it instead of a full route refresh.
- **W2 — `pending` label divergence across admin surfaces.**
  - `app/admin/page.tsx:115` already treats both `submitted` and `pending` as reviewable (the actionability divergence in the audit is resolved in current source), but `app/admin/page.tsx:259-262` still labels `pending` “Awaiting payment” while this page now says “Awaiting proof”.
  - Recommended fix: align the overview badge copy with the agreed status contract, and decide explicitly whether Reject is valid before proof arrives. `neon/schema.sql:81` and `lib/neon-data.ts:990-1019` allow both states to be decided; the SQL guard is correct, the wording is not.
- **W3 — no reviewer identity, reason, or decision timestamp for rejection.**
  - `app/actions/shortlist-order.ts:169-193` writes only `confirmed_at` on confirm; `:195-207` writes status only on reject. `neon/schema.sql:75-85` has no `reviewed_by`, `reviewed_at`, or `rejection_reason`.
  - Recommended fix: add those columns (or a `shortlist_order_status_history` table) and write them atomically from the verified `user.id` inside `setOrderStatus`.
- **S1 — Supabase-only demotion leaves the Neon admin role active (inherited, suspected).**
  - `app/admin/payments/page.tsx:32` and `app/actions/shortlist-order.ts:163` read the role via `getProfileRole` → `lib/neon-data.ts:47-54` (Neon `profiles.role`), while identity comes from Supabase `getUser()`. `scripts/neon-mirror-identities.mjs:49-57` copies roles one way from local Supabase into Neon.
  - Recommended fix: make the identity provider's role authoritative or mirror role changes synchronously, and add a regression check covering this page plus `confirmOrder`/`rejectOrder`.
- **Verified control — no finding:** `setOrderStatus` (`lib/neon-data.ts:990-1019`) guards the write with `status in ('pending','submitted')` and throws when no row transitions, so a stale page cannot flip a decided order.

## Database findings routed to database owner

- **D1 — admin-only intent is not enforced in the Neon helpers.**
  - `lib/neon-data.ts:74-87` (`listProfilesByIds`), `:334-341` (`listAllProjects`), `:1021-1031` (`listOrders`) issue unscoped selects with no role argument or ownership predicate. `neon/schema.sql:1-4` and `lib/neon-data.ts:1-7` state Neon has no RLS. This route guards correctly (`page.tsx:28-35`), but any future caller that omits the guard gets platform-wide data.
  - Recommended fix: add admin-named helpers (e.g. `listOrdersForAdmin`, `listProfilesByIdsForAdmin`, `listProjectsByIdsForAdmin`) that assert the verified user's role internally, or enable RLS. Keep the page/action checks as defence in depth.
- **D2 — queue query has no supporting index and no bound.**
  - `lib/neon-data.ts:1024-1026`: `select * from public.shortlist_orders order by created_at desc` reads and sorts the whole table. `neon/schema.sql:92` only indexes `(founder_id, created_at desc)`, which cannot serve a global `created_at` sort.
  - Recommended fix: add `create index shortlist_orders_queue_idx on public.shortlist_orders (status, created_at desc)` and a bounded `LIMIT`/cursor pagination to the admin queue helper. Check the query plan before adding the index.
- **D3 — project titles are resolved by scanning every project.**
  - `app/admin/payments/page.tsx:50-57` gathers distinct `project_id`s but calls `listAllProjects()`, which selects every project (`lib/neon-data.ts:334-341`).
  - Recommended fix: add `listProjectsByIds(ids: string[])` using `where id = any(${ids}::uuid[])`, mirroring the empty-list guard at `page.tsx:55-56`, and call it when the ID list is non-empty.
- **Verified controls — no finding:** all traced Neon statements are tagged and parameterised (`lib/neon-data.ts:47-54,74-87,990-1019,1021-1027`). `neon/schema.sql:81` constrains `status` to `pending`, `submitted`, `confirmed`, `rejected`, matching the filter values used here. Screenshots stay in a private bucket with server-minted 1-hour URLs (`page.tsx:62-80`) and `rel="noopener noreferrer"` on the link.

## Shared design-system note (routed, not edited)

- `components/interactive/segmented-control.tsx:37-63` documents arrow/Home/End as focus movement only; selection happens on Enter/Space. The new filter uses the control as documented, so it is consistent with its contract. `/admin/projects` adds a wrapper that mirrors arrow focus into selection; if that behaviour becomes the standard, expose it as an explicit `selectOnArrow` prop in the shared control and adopt it here rather than duplicating the wrapper.

## Deliberate non-changes

- **No server-side Storage existence check** was added: `confirmOrder` lives in `app/actions/shortlist-order.ts`, which is owned by the workflow owner. The client gate prevents accidental clicks but is not an authorisation control.
- **No `refreshPaymentProof` action or screenshot route** was added; it needs new files outside this route's ownership. The in-file refresh control uses the server re-render already available.
- **No Neon helper, schema, index, migration, or mirror script** was edited; those are routed above to the database/workflow owners.
- **No `loading.tsx`** was added; it is not in this route's ownership list.
- **The `pending`/`submitted` storage contract was not changed.** Only user-facing labels were aligned here; the cross-page wording decision is routed to the workflow owner.
- **No shared component, `proxy.ts`, `app/actions/*`, `lib/*`, or another page's report** was edited.
- **No new dependency, gradient, violet, emoji, or wholesale rewrite** was introduced; the diff stays inside the warm-paper / forest / vermilion / amber token system.
