# Page audit — `/founder/shortlists`

## Route

- **Primary route:** `/founder/shortlists` (authenticated founder workspace).
- **Traced sub-route:** `GET /founder/shortlists/agreement` (PDF template download).
- **Traced supporting endpoints:** `POST /api/realtime/orders`, `GET /api/cv/[id]`.
- **Audit mode:** read-only static audit. No browser verification was possible (no dev server on `localhost:3000`; `Test-NetConnection localhost -Port 3000` returned `False`). No product source was edited.

## Files traced

- `app/founder/shortlists/page.tsx`
- `app/founder/shortlists/shortlists-client.tsx` — **uncommitted user changes treated as authoritative**; line numbers below are from the working tree.
- `app/founder/shortlists/agreement/route.ts`
- `app/actions/shortlist-order.ts`
- `app/api/realtime/orders/route.ts`
- `app/api/cv/[id]/route.ts`
- `components/founder/live-order-status.tsx`
- `components/ui/status-timeline.tsx`
- `components/layout/pinned-heading-section.tsx`
- `components/layout/workspace-page-heading.tsx`
- `lib/neon-data.ts`
- `lib/neon-realtime.ts`
- `lib/validators.ts`
- `lib/rate-limit.ts`
- `lib/pdf.ts`
- `lib/supabase/server.ts`
- `config/payment.ts`
- `proxy.ts`
- `neon/schema.sql`
- `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, and all existing `reports/*.md` / `reports/page-audits/*.md` files were read before finalizing.

## Skills used

All ten assigned skills were loaded from `C:\Users\DELL\.config\opencode\skills\` and cited here by role, with precedence from `reports/SKILL-ASSIGNMENTS.md`:

- `unslop/SKILL.md` — restrained copy and no unnecessary label/badge noise.
- `better-interface/SKILL.md` — evidence bar and severity language for interface findings.
- `better-layout/SKILL.md` — sticky/split heading and content-column structure.
- `better-ui/SKILL.md` — package cards, file control, status chips, agreement CTA.
- `better-writing/SKILL.md` — payment/status/agreement wording.
- `frontend-a11y/SKILL.md` — accessible names, live regions, focus and repeated links.
- `better-accessibility/SKILL.md` — WCAG-oriented confirmation for names and status.
- `webapp-testing/SKILL.md` — Playwright verification plan; not executed because no server was listening.
- `security-review/SKILL.md` — authz, upload validation, secret handling, error leaks.
- `api-security-testing/SKILL.md` — route/action authz, IDOR and entitlement checks on the agreement, realtime and CV endpoints.

## UI/UX findings

### Confirmed

- **U1 — LOW — Duplicate payment timelines.** `app/founder/shortlists/page.tsx:143-151` renders a page-level `StatusTimeline` for `orders[0]`; `app/founder/shortlists/shortlists-client.tsx:287-292` renders a `StatusTimeline` inside every order card. **Why:** with several orders the same information appears twice, and the top strip describes only the newest order while the list below describes all of them. **Fix:** keep the per-order timeline in the list and remove the page-level strip, or keep only the latest-order strip and remove the per-card stepper.

- **U2 — MED — Repeated CV links have no distinguishable accessible name.** `app/founder/shortlists/shortlists-client.tsx:332-335` renders every CV link as `View CV`. **Why:** a screen-reader links list with 5–10 identical `View CV` entries does not say which student each file belongs to (WCAG link purpose). **Fix:** add `aria-label={`View ${s.full_name ?? 'student'}'s CV`}` and keep the visible text short.

- **U3 — LOW — Order-card timelines are ambiguous when packages repeat.** `app/founder/shortlists/shortlists-client.tsx:287-291` labels every timeline `Payment status for Basic shortlist` or `Payment status for Full Support shortlist`; multiple orders of the same package produce identical labels. **Why:** assistive-tech users cannot tell which dated order a stepper belongs to. **Fix:** include project title and/or order date in the `label`, e.g. `Payment status for Basic shortlist — ${projectTitle} — ${date}`.

- **U4 — LOW — File picker hides filename and size limit.** `app/founder/shortlists/shortlists-client.tsx:257-262` shows only `Choose image (PNG / JPG / WEBP)`; the 5 MB rule exists only in `app/actions/shortlist-order.ts:122-124`. **Why:** founders cannot confirm what they selected or anticipate the rejection before submitting. **Fix:** show the selected file name and add `Max 5 MB` to the label/help text.

- **U5 — LOW — Student card can render an empty heading.** `app/founder/shortlists/shortlists-client.tsx:25` types `full_name` as `string | null`, and `:316` renders it directly in an `<h3>`. **Why:** an incomplete profile produces a blank heading and an unusable card. **Fix:** fall back to `Student record` (or hide the card until a name exists) and add a data-quality warning for admins.

### Suspected (not rendered-verified)

- **S1 — MED — Sticky heading column is too narrow at `lg`.** `app/founder/shortlists/page.tsx:133-142` uses `lg:grid-cols-[0.2fr_0.8fr]`; `components/layout/workspace-page-heading.tsx:17-23` sets a 1.5–2.125rem `<h1>` and a max-width paragraph; `components/layout/pinned-heading-section.tsx:21-23` makes that narrow column sticky. **Why:** at 1024–1279 px the heading column is roughly 180–230 px before gaps, so “Premium Shortlist” and its purpose line are likely to wrap awkwardly while pinned. **Fix:** render at 1024/1280 and, if confirmed, use `lg:grid-cols-[0.3fr_0.7fr]` or let the heading span full width above the work area.

## Workflow findings

### Confirmed

- **W1 — HIGH — Live “unlocked” status does not unlock the server-rendered UI.** `components/founder/live-order-status.tsx:31-47` updates the live status pill from the sealed query, but `app/founder/shortlists/page.tsx:154-163` passes only that pill; `app/founder/shortlists/shortlists-client.tsx:52` and `:299` still derive `isUnlocked` and the shortlist section from the original `orders` prop. **Why:** when an admin confirms payment while the founder is on the page, the badge can say `Payment confirmed. Shortlist unlocked` while `Get Shortlist` stays hidden and `Your shortlist` stays locked until a manual reload. That is a false task completion signal. **Fix:** when live data first reports `confirmed`, call `router.refresh()` once (guard with a ref) or derive the locked state from the live data and show an explicit `Refresh to view shortlist` action until server props catch up.

- **W2 — MED — No way to buy another shortlist after one confirmed order.** `app/founder/shortlists/shortlists-client.tsx:52` sets `isUnlocked` when *any* order is confirmed; `:61-63` then forces `step` to `closed`, and `:142-148` hides the CTA whenever `!generalUnlocked && step === 'closed'`. **Why:** the data layer permits multiple orders (`lib/neon-data.ts:943-958`), but the UI locks a founder into a single purchase even when they want a second project-specific shortlist. **Fix:** keep a visible secondary `Order another shortlist` button after unlock, and let the founder choose a new package/project explicitly.

- **W3 — MED — A stale pending order blocks a different new order.** `app/founder/shortlists/shortlists-client.tsx:58-63` seeds `pendingOrder` from the first `pending`/`submitted` row and jumps straight to `pay`; `:224-266` offers only `Change package`, which returns to package selection but keeps the same `activeOrderId` unless a new order is created. **Why:** a founder with an abandoned pending order cannot resume a *different* package cleanly; clicking through creates another order (`app/actions/shortlist-order.ts:88-101`) without cancelling the old one. **Fix:** show all open orders with `Continue`, `Replace` and `Cancel/expire` controls, and require confirmation before creating a second pending order.

- **W4 — MED — A rejected payment can be silently resubmitted.** `components/ui/status-timeline.tsx:191-195` marks `rejected` terminal, but `app/actions/shortlist-order.ts:132-134` blocks only `confirmed`; `lib/neon-data.ts:980-984` then unconditionally sets `status = 'submitted'` on upload. **Why:** a founder can re-upload after rejection and move a terminal status back into review without any explanation or admin-facing appeal record, contradicting the visible timeline. **Fix:** reject uploads when `order.status === 'rejected'`, or add an explicit `Request review again` action that records an appeal and updates the timeline copy.

- **W5 — LOW — Realtime failure is hidden from the user.** `app/founder/shortlists/page.tsx:74-80` says “never hide the failure” but only `console.warn`s when `sealFounderOrders` fails. **Why:** the page silently falls back to server-loaded rows while the user may assume status is live. **Fix:** render a small non-blocking notice such as `Live updates unavailable. Refresh for the latest payment status.`

### Suspected

- No additional suspected workflow defects found.

### Cross-reference, not re-scored

- The public `Download agreement (PDF)` CTA on `/for-founders` resolving to `/login` is already owned as HIGH by `reports/copy-critic.md:22`, with confirming evidence in `reports/content-integrity.md:55`. The in-app founder link at `app/founder/shortlists/shortlists-client.tsx:345-349` is correct; its line number has drifted from the line cited in `content-integrity.md`. No duplicate finding is raised here.

## Database/RLS findings

### Confirmed

- **D1 — MED — Neon authorization is application-only; no DB-level owner predicate.** `neon/schema.sql:3-4` explicitly creates no RLS policies. The page relies on parameterised application filters: `app/founder/shortlists/page.tsx:43-46,94-106`, and `lib/neon-data.ts:626-635,819-827,964-988,1033-1044`. **Why:** `listStudentProfiles(ids)` (`lib/neon-data.ts:632-634`) has no owner/relationship predicate; today the IDs come only from the founder-scoped shortlist rows at `page.tsx:94-106`, so **no active IDOR was found**, but any future caller with arbitrary IDs could read any student's contact/CV data. The CV proxy compensates separately at `app/api/cv/[id]/route.ts:63-82`. **Fix:** keep these raw-SQL functions private to server-only wrappers, add regression tests that assert founder A cannot pass founder B's IDs, and consider DB-level predicates/views (or documented service-role trust boundaries) for `student_profiles`, `shortlists` and `shortlist_orders`.

- **D2 — LOW — Order mutation helpers are not owner-scoped at the data layer.** `lib/neon-data.ts:964-988` defines `getOrder(id)` and `setOrderScreenshot(id, path)` with `where id = $1` only. **Why:** authorization currently lives in `app/actions/shortlist-order.ts:127-131`, which correctly compares `order.founder_id !== user.id`; the data helper itself would permit any order ID if reused elsewhere. **Fix:** add a required `founderId` parameter and enforce `where id = ${id} and founder_id = ${founderId}` in both queries.

- **D3 — LOW — `projectId` is inserted without an ownership check.** `app/actions/shortlist-order.ts:88-93` passes the client-supplied `projectId` straight to `lib/neon-data.ts:951-956`; `neon/schema.sql:78` enforces only that the project exists, not that it belongs to the founder. **Why:** a crafted action can attach a founder's paid order to another founder's project. No data leak was confirmed on this page because shortlist rows are still filtered by `founder_id` at `app/founder/shortlists/page.tsx:94-101`, but admin order labelling and project-scoped entitlement data become misleading. **Fix:** verify `projectId` against `listProjectsByFounder(user.id)` (or a SQL `exists` check) before `insertOrder`.

- **D4 — LOW — Unbounded order history and `SELECT *` overfetch.** `app/founder/shortlists/page.tsx:43-46,95,105` loads all orders, all founder shortlists and a batch of student profiles; `lib/neon-realtime.ts:45-54` caps live rows at 20, but `lib/neon-data.ts:633,824,967,1036` use `select *`; `app/founder/shortlists/shortlists-client.tsx:275-294` renders every order with a timeline. **Why:** long-lived founders accumulate DOM and payload cost. **No N+1 was found** — student profiles are fetched in one batched query at `page.tsx:105`. **Fix:** paginate/collapse old orders, select only the columns the page maps, and align the server order limit with the realtime `LIMIT 20`.

### Suspected

- No suspected data-layer defects found beyond the defence-in-depth gaps above.

## Severity summary

| Class | HIGH | MED | LOW | IDs |
|---|---:|---:|---:|---|
| Confirmed | 1 | 5 | 8 | W1; U2, W2, W3, W4, D1; U1, U3, U4, U5, W5, D2, D3, D4 |
| Suspected | 0 | 1 | 0 | S1 |

No confirmed active cross-founder data exposure or IDOR was found in this route. The main user-visible defect is **W1**; the main structural risk is **D1**.

## Recommended fixes

1. **W1:** on live `confirmed`, trigger one `router.refresh()` or expose an explicit refresh action; do not let the badge claim an unlock the page has not applied.
2. **W2 / W3:** add order management (`Order another`, `Continue`, `Cancel/expire`) instead of a single implicit `pendingOrder`; confirm before duplicate creation.
3. **W4:** block upload on `rejected`, or implement a recorded appeal flow and change the terminal timeline copy.
4. **U2 / U3:** give CV links and order timelines unique accessible names.
5. **D1 / D2 / D3:** parameterise owner IDs into the Neon helper queries, validate project ownership, and add negative cross-founder tests around `listStudentProfiles`, `getOrder`, `setOrderScreenshot` and `createShortlistOrder`.
6. **U1 / U4 / U5 / W5 / D4:** remove the duplicate timeline, show filename and 5 MB guidance, guard empty student names, surface the realtime fallback, and paginate/select columns explicitly.
7. **S1:** verify at 1024 px and 1280 px; widen or stack the sticky heading if “Premium Shortlist” wraps badly.

## Notes/limitations

- Static audit only. Playwright MCP was available but not used because no dev server was reachable; no rendered contrast, focus order, sticky-layout or live-realtime behaviour was verified.
- No `npm run build`, tests, dev server, or child agents were run.
- The working tree is dirty; `app/founder/shortlists/shortlists-client.tsx` contains uncommitted changes. Those changes were treated as the source of truth and were not modified.
- All existing `reports/*.md` and `reports/page-audits/*.md` files were read. The only direct overlap is the agreement CTA already owned by `reports/copy-critic.md:22` and confirmed by `reports/content-integrity.md:55`; it is referenced above, not duplicated.
- `GET /founder/shortlists/agreement` has no handler-level auth (`app/founder/shortlists/agreement/route.ts:54-65`), but `proxy.ts:105-113,123-132` protects `/founder/*`; `POST /api/realtime/orders` explicitly checks user and founder role at `app/api/realtime/orders/route.ts:8-19`. No auth finding is raised for those routes.
