# Page audit — `/admin/payments`

Date: 2026-11-24. Role: one read-only critic; no child agents were spawned. No
product source, config, schema, test, existing report, or `INDEX.md` was edited.
The working-tree versions of the target files were treated as authoritative;
`app/admin/payments/page.tsx` and `app/admin/payments/payments-client.tsx` were
already modified before this audit (`git status --short`).

## Route

`/admin/payments` — admin-only manual payment review queue. A server component
validates the Supabase session and Neon role, loads all shortlist orders plus
founder names and project titles, and mints fresh 1-hour signed URLs for stored
payment screenshots. A client component renders one card per order with
status badges, a proof link, and Confirm / Reject controls. Mutations call the
`confirmOrder` and `rejectOrder` server actions; both re-check admin role and
end in a guarded Neon `UPDATE`.

## Files traced

| File | Why it is in scope |
|---|---|
| `app/admin/payments/page.tsx:1-112` | Target server route: authz, order load, display-name batching, signed URLs, page shell. |
| `app/admin/payments/payments-client.tsx:1-258` | Target client route: queue rendering, optimistic status overrides, reject guard, focus handling. |
| `app/actions/shortlist-order.ts:28-154` | Producer path for the rows/review state: order creation and screenshot upload, including revalidation of this route. |
| `app/actions/shortlist-order.ts:156-208` | `requireAdmin`, `confirmOrder`, `rejectOrder` — the only mutations reachable from this page. |
| `lib/neon-data.ts:47-55,74-87,334-341,964-1019,1021-1031` | Role lookup, profile name batch, project batch, order lookup/status update, full order list. |
| `lib/neon.ts:12-20` | `getSql()` uses `DATABASE_URL`; Neon data path with no RLS. |
| `lib/supabase/server.ts:16-42` | Cookie-bound server client; identity JWT and Storage signed URLs use the caller's session, not a service key. |
| `proxy.ts:27-34,100-132` | `/admin/*` gate: `getUser()`, Neon role, fail-closed redirect on missing session. |
| `neon/schema.sql:1-4,8-16,75-85,92` | No RLS by design; profile shape; `shortlist_orders` constraints; existing index. |
| `supabase/premium-shortlists.sql:42-69`, `supabase/run-all.sql:774-779` | Private screenshot bucket and owner/admin Storage SELECT policy used by signed URL creation. |
| `components/layout/pinned-heading-section.tsx:9-25`, `components/layout/workspace-page-heading.tsx:6-25` | Rendered heading shell and single `h1`. |
| `components/ui/badge.tsx:1-21`, `components/ui/shadcn/alert.tsx:22-54` | Status badge and the rejection guard's `role="alert"` semantics. |
| `app/actions/shortlist-order.test.ts:1-97`, `tests/e2e/payment-flow.test.ts:54-80`, `tests/e2e/admin-flow.test.ts:61-80` | Existing expectations for order creation, admin confirmation, and the admin queue. |
| Existing reports read before finalizing | `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `design/voice-guide.md`, `design/brand-guidelines.md`, `README.md`, every existing `reports/*.md`, and every existing `reports/page-audits/*.md`. Overlaps are referenced below, not duplicated. |

## Skills used

All ten assigned skills were loaded and applied under the precedence in
`reports/SKILL-ASSIGNMENTS.md:5-13`. `unslop` governs minimal/AI-tell copy; the
`better-*` skills govern evidence-based interface findings; `security-review`
and `api-security-testing` govern the authz and data-layer trace. Items 1–4 of
the precedence list were not assigned to this role.

| Skill | Path | Applied to |
|---|---|---|
| `unslop` | `C:\Users\DELL\.config\opencode\skills\unslop\SKILL.md` | Minimal copy, dead-end guidance, empty-state wording. |
| `better-interface` | `C:\Users\DELL\.config\opencode\skills\better-interface\SKILL.md` | Evidence + severity framing for every finding. |
| `better-layout` | `C:\Users\DELL\.config\opencode\skills\better-layout\SKILL.md` | Pinned heading, unbounded list density, mobile stacking. |
| `better-ui` | `C:\Users\DELL\.config\opencode\skills\better-ui\SKILL.md` | Badge, focus ring, target size, proof-link treatment. |
| `better-writing` | `C:\Users\DELL\.config\opencode\skills\better-writing\SKILL.md` | Status labels, unavailable-proof and rejection copy. |
| `frontend-a11y` | `C:\Users\DELL\.config\opencode\skills\frontend-a11y\SKILL.md` | Heading order, `role=status` / `role=alert`, focus return, `aria-describedby`. |
| `better-accessibility` | `C:\Users\DELL\.config\opencode\skills\better-accessibility\SKILL.md` | Non-colour status, focus visibility, live-region review (static only). |
| `webapp-testing` | `C:\Users\DELL\.config\opencode\skills\webapp-testing\SKILL.md` | Runtime availability check; see Notes/limitations for why no browser pass was run. |
| `security-review` | `C:\Users\DELL\.config\opencode\skills\security-review\SKILL.md` | Proxy/page/action role checks, privilege drift, audit trail, error handling. |
| `api-security-testing` | `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md` | Mutation abuse cases, IDOR/injection surface, DB guard and RLS posture. |

## UI/UX findings

### Confirmed

**U1 — MED — No status filter or queue count; actionable orders can be buried.**
- `app/admin/payments/payments-client.tsx:112-135` renders one flat `<ul>`; `:135-255` renders every order in server order with no filter, count, or prioritisation.
- `app/admin/payments/page.tsx:35` loads all orders with `order by created_at desc` (`lib/neon-data.ts:1024-1026`), so closed rows sit above new work only by age, never by actionability.
- Why it matters: manual verification is a queue task. An admin cannot isolate "Verifying payment" or see how many orders need a decision; a submitted order can be lost among confirmed/rejected rows. This is already owned by `reports/component-relevance-audit.md:55` and `:82`; this audit adds the current source evidence only.
- Fix: add the existing `SegmentedControl` pattern from `/admin/projects` with All / Awaiting / Verifying / Confirmed / Rejected, render a polite `role=status` count (`Showing 1 verifying payment`), default to actionable statuses, and sort `submitted`/`pending` first.

**U2 — MED — The unavailable-proof message has no recovery action.**
- `app/admin/payments/page.tsx:62-80` mints signed URLs valid for 3600 seconds at page-render time; failures set `screenshotError`.
- `app/admin/payments/payments-client.tsx:177-181` shows only "Proof is stored but its link is unavailable right now. Try again later." There is no refresh button, no per-row link regeneration, and no route that mints a URL on demand.
- Why it matters: a long review session, an expired URL, or a transient Storage failure leaves the admin staring at a dead end. "Try again later" describes no control on this page; under `better-writing` it is an instruction with no available action.
- Fix: add a server action or route handler `refreshPaymentProof(orderId)` that re-checks admin role and returns a fresh signed URL, and expose a small "Refresh proof link" button in this fallback. Better still, point the link at an admin-checked `/admin/payments/screenshot/[orderId]` redirect that signs on demand, so no URL is minted for closed rows.

**U3 — LOW — Empty state skips the `h2` level.**
- `app/admin/payments/payments-client.tsx:101-109` returns `<h3>No orders yet</h3>` directly after the server-rendered `h1` at `app/admin/payments/page.tsx:98-102`.
- Why it matters: the non-empty branch supplies an `sr-only` `<h2>Payment orders</h2>` at `payments-client.tsx:133`, but the empty branch does not. Assistive-tech heading navigation jumps from level 1 to level 3.
- Fix: render the same `sr-only` `h2` in the empty branch, or make the empty-state title an `h2`.

**U4 — LOW — Focus rings reuse the error/accent colour instead of the focus token.**
- `app/admin/payments/payments-client.tsx:173` (proof link), `:190`, `:200` (action buttons), `:226`, `:236`, `:244` (guard buttons) all use `focus-visible:ring-[#b23c26]`.
- `lib/design-tokens.ts:44-48,70-71` reserves `#b23c26` for small text and `#d84f37` for focus; `reports/brand-tokens.md:5-7` records the same split.
- Why it matters: the same hue then means both "destructive/error" and "keyboard focus". The rings are still visible, so this is token drift, not a proven WCAG failure. The page's own error text also uses `#7a2c1c`/`#9d3328`, so focus is not distinguished by role.
- Fix: replace these overrides with the shared `colors.focus` token (or `focus-visible:ring-[#d84f37]`) and keep `#b23c26` only for small-text accents.

**U5 — LOW — Date label omits year, time, and order identity.**
- `app/admin/payments/payments-client.tsx:146-153` renders founder, amount, project, and `toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })`; no `year`, no time, and no order ID.
- Why it matters: "5 Apr" is ambiguous across years, and two orders on the same day with the same package are indistinguishable in the list. This mirrors the date-contract issue recorded for `/student/applications` in `reports/page-audits/student-applications.md:56-60`.
- Fix: add `year: 'numeric'` and a short time (`hour`/`minute`), plus a truncated order ID such as `#a1b2c3d4`, and centralise the locale so it can change once.

### Suspected / not proven

None in this section. All UI findings above are code facts; none depends on an unobserved rendered state.

## Workflow findings

### Confirmed

**W1 — HIGH — Confirmation can complete when the payment proof is not viewable.**
- `app/admin/payments/page.tsx:65-80` sets `screenshotUrl = null` when signing fails; `:88` passes `screenshotError` to the client.
- `app/admin/payments/payments-client.tsx:138` defines `hasProof` as `Boolean(o.screenshot_path)` only; `:187` disables Confirm solely on `!hasProof`. The `screenshotError` prop declared at `:28` is never read.
- `app/actions/shortlist-order.ts:173-182` blocks confirmation only when `order.screenshot_path` is absent; it does not verify that the Storage object exists or that a signed URL can be produced. `:184-188` then calls `setOrderStatus(..., 'confirmed')`.
- Why it matters: the action comment says "Never confirm a payment without proof", but a stored path with a dead or denied link is still enough to unlock the shortlist. This is a financial-authorization control failure, not a styling issue. It is reachable through the exact fallback UI in U2.
- Fix: gate both layers on viewable proof. In the client, disable Confirm unless `o.screenshotUrl` exists and use `screenshotError` to show a precise message. In `confirmOrder`, call Storage `info`/`download` or `createSignedUrl` for `order.screenshot_path` after the role check and return an error if it fails; only then call `setOrderStatus`.

**W2 — MED — `pending` means "Awaiting payment" in the badge but is fully actionable.**
- `app/admin/payments/payments-client.tsx:33-38` labels `pending` as "Awaiting payment"; `:137` marks both `pending` and `submitted` as actionable; `:195-203` renders Reject for both.
- `neon/schema.sql:81` defines `pending`, `submitted`, `confirmed`, and `rejected`; `lib/neon-data.ts:955` creates new orders as `pending`.
- Why it matters: the label tells the admin payment has not happened yet, while the control offers Reject, whose guard says the founder "need[s] a new order to try again" (`payments-client.tsx:230`). An order can be terminated before proof was ever expected. The count divergence this creates with `/admin` is already recorded as suspected in `reports/page-audits/admin-overview.md:70`; this finding is the receiving-page evidence.
- Fix: decide the state contract explicitly. Either hide Reject until `submitted` and relabel `pending` "Awaiting proof", or keep both actions and rewrite the guide to say a stale order may be closed. Align `app/admin/page.tsx:65` with the same definition.

**W3 — MED — Decisions have no actor, reason, or timestamp trail.**
- `app/actions/shortlist-order.ts:169-193` confirms with only `confirmed_at`; `:195-207` rejects with status only.
- `neon/schema.sql:75-85` has `confirmed_at` but no `reviewed_by`, `reviewed_at`, `rejection_reason`, or status-history table.
- Why it matters: manual payment review is an approval decision. With two admins, there is no way to answer who confirmed/rejected, when a rejection happened, or why. The founder-facing rejection copy gives no reason either (`payments-client.tsx:228-231`). This is an accountability gap, not a proven exploit.
- Fix: add `reviewed_by uuid`, `reviewed_at timestamptz`, and `review_reason text` (or a `shortlist_order_status_history` table), set them from the verified `user.id` in both actions, and surface the reason in the founder's order status. Make the write conditional in `setOrderStatus` so actor and timestamp are recorded atomically.

**W4 — MED — Copy tells the admin to ask the founder, but the page exposes no contact route.**
- `app/admin/payments/payments-client.tsx:207-214` says "ask the founder to upload proof before confirming"; `:143-154` renders only a founder name and optional project title.
- `app/admin/payments/page.tsx:74` calls `listProfilesByIds`, which selects only `id` and `full_name` (`lib/neon-data.ts:74-87`); the Neon `profiles` table has no email column (`neon/schema.sql:8-16`).
- Why it matters: the stated next step cannot be taken from this screen. Under `better-writing`, an instruction must name a real destination or action.
- Fix: add a contact path — for example mirror the founder's email into Neon and render a `mailto:` link, or use a Supabase admin-only lookup to expose email — or rewrite the copy to "The founder must upload proof before this order can be confirmed." If an admin founder-detail route exists, link to it.

### Suspected / not proven

**S1 — HIGH (inherited; suspected reachable here) — A Supabase-only demotion leaves this route's admin role active until the mirror script runs.**
- `app/admin/payments/page.tsx:32` and `app/actions/shortlist-order.ts:163` read the role through `getProfileRole`; `lib/neon-data.ts:47-54` reads Neon `profiles.role`.
- The verified identity comes from Supabase `getUser()` (`page.tsx:28-31`, `shortlist-order.ts:157-162`), but the role does not. `scripts/neon-mirror-identities.mjs:49-57` copies roles one way from local Supabase into Neon.
- Why it matters: a founder demoted only in Supabase would keep access to this queue and both mutations until `scripts/neon-mirror-identities.mjs` is re-run. This is the two-provider fail-open path already confirmed in `reports/orchestrator-audit.md:128` and documented in `reports/FINAL-AUDIT.md:57-60`; `reports/page-audits/founder-profile.md:82-88` records the same inheritance for another route. Marked suspected here because no live demotion was attempted and no bad production state was observed.
- Fix: make the identity provider's role authoritative (or make mirroring synchronous on every role change) and add a regression check covering both the payments page and `confirmOrder`/`rejectOrder`. Until then, document that role changes require the mirror script before access is revoked.

**S2 — LOW — Successful mutations do not explicitly refresh the route; local overrides can mask server truth.**
- `app/admin/payments/payments-client.tsx:84-90` writes a local `overrides` entry on success; `:97` calls `router.refresh()` only when `!ok`.
- `app/actions/shortlist-order.ts:190-191,205-206` does call `revalidatePath('/admin/payments')`, so Next may already deliver fresh props with the action response.
- Why it matters: if revalidation and the client mirror ever diverge — for example, another admin acted on the same order, or a guarded DB update normalized an unexpected state — this component keeps showing its optimistic value without a forced refetch. Not proven as a current failure because of `revalidatePath`.
- Fix: call `router.refresh()` after both success and failure (for example in `finally`), and remove `overrides` once the refreshed props report the same status.

## Database/RLS findings

### Confirmed

**D1 — MED — Global Neon reads carry no data-layer role check; this route relies entirely on page/action guards.**
- `app/admin/payments/page.tsx:35,54-56` calls `listOrders()`, `listProfilesByIds()`, and `listAllProjects()` after its own `role === 'admin'` check at `:32-33`.
- `lib/neon-data.ts:74-87,334-341,1021-1031` issue unscoped `select` statements with no role argument or ownership predicate. `lib/neon-data.ts:1-7` and `neon/schema.sql:1-4` state that Neon has no RLS.
- Why it matters: any future caller that omits the route-level guard gets platform-wide orders, names, and projects. This is the documented architecture risk in `reports/FINAL-AUDIT.md:59-60` and the same call-graph pattern recorded for `/admin` in `reports/page-audits/admin-overview.md:76`; it is not a currently exploitable IDOR because no browser-supplied order ID is read on this page.
- Fix: make admin intent explicit in the data layer — for example `listOrdersForAdmin()`, `listProfilesByIdsForAdmin()`, `listProjectsByIdsForAdmin()` — and assert `getProfileRole(verifiedUserId) === 'admin'` inside them, or enable RLS on Neon. Keep the page and action checks as defence in depth.

**D2 — LOW — The order queue has no index supporting its global sort and no pagination.**
- `lib/neon-data.ts:1024-1026` runs `select * from public.shortlist_orders order by created_at desc` for every row.
- `neon/schema.sql:92` only defines `shortlist_orders_founder_idx on (founder_id, created_at desc)`, which cannot serve a global `created_at` ordering.
- Why it matters: page load scans and sorts the whole order table; cost grows with every order and is worsened by U1's lack of filtering.
- Fix: add `create index shortlist_orders_queue_idx on public.shortlist_orders (status, created_at desc)` (or on `created_at desc`) and add a bounded `LIMIT`/cursor-based pagination to `listOrders` or an admin-only queue helper.

**D3 — LOW — Project titles are loaded by scanning every project.**
- `app/admin/payments/page.tsx:50-57` collects only the distinct `project_id`s, but calls `listAllProjects()`.
- `lib/neon-data.ts:334-341` runs `select id, title, founder_id from public.projects order by created_at desc` and maps every row; the page then keeps only the IDs present in `projectIds`.
- Why it matters: unnecessary whole-table read and allocation on every payments load. It is not an N+1 query; it is one over-broad query.
- Fix: add `listProjectsByIds(ids: string[])` using `where id = any(${ids}::uuid[])` and call it when `projectIds.length > 0`, mirroring the empty-list guard already used at `page.tsx:55-56`.

### Verified controls — no finding

- **No IDOR from this route.** No order ID, founder ID, or project ID is accepted from the URL or form on the page. Rows come from the server-side `listOrders()` (`app/admin/payments/page.tsx:35`). The two actions accept an `orderId`, but `requireAdmin()` rechecks the role before lookup (`app/actions/shortlist-order.ts:156-176`) and the write is status-guarded.
- **No SQL injection found.** Every traced Neon query is a tagged, parameterized statement, including role lookup (`lib/neon-data.ts:50`), ID batches (`:81`), order lookup (`:967`), and status update (`:1001-1012`).
- **The status transition is guarded in SQL.** `setOrderStatus` only updates `where id = ${id} and status in ('pending','submitted')` and throws when no row transitions (`lib/neon-data.ts:1001-1015`), so a stale page cannot flip an already-decided order. The schema constraint at `neon/schema.sql:81` bounds the value set.
- **Screenshots remain private.** The bucket is private (`supabase/premium-shortlists.sql:42-48`) and signed URLs are created server-side for 1 hour (`app/admin/payments/page.tsx:62-70`); the link uses `rel="noopener noreferrer"` (`payments-client.tsx:171-173`). Storage SELECT is limited to the owner or an admin (`premium-shortlists.sql:58-69`, `run-all.sql:774-779`).
- **Authentication and role checks are present at three layers.** `proxy.ts:100-131` validates the JWT and role; the page rechecks at `app/admin/payments/page.tsx:28-33`; both mutations recheck at `app/actions/shortlist-order.ts:156-171,195-197`. S1 and D1 qualify the role-source and data-layer aspects, but there is no unguarded anonymous path.
- **Accessible interaction details that work.** The rejection guard is a single focusable `role="alert"` with `aria-labelledby`, Escape-to-cancel, and focus return to the trigger (`payments-client.tsx:62-73,216-250`; `components/ui/shadcn/alert.tsx:35`). The result line is the page's only `role="status"` (`:114-131`), status is text-plus-icon and not colour-only (`:156-165`), and decorative icons are `aria-hidden`.

### Suspected / not proven

None beyond S1, which is cross-listed from Workflow because the role source is shared by the page, the mutations, and the data layer.

## Severity summary

| ID | Area | Severity | Status | Finding |
|---|---|---|---|---|
| W1 | Workflow / payment control | HIGH | Confirmed | Confirm can succeed when proof is stored but not viewable. |
| S1 | Workflow / authz | HIGH | Suspected, inherited | Supabase-only demotion leaves Neon admin role active until mirror re-run. |
| U1 | UI/UX | MED | Confirmed | No status filter or queue count; overlap `component-relevance-audit.md:55,82`. |
| U2 | UI/UX | MED | Confirmed | Unavailable proof link has no refresh/recovery action. |
| W2 | Workflow | MED | Confirmed | `pending` is labelled "Awaiting payment" but Reject is available. |
| W3 | Workflow / audit | MED | Confirmed | No reviewer identity, reason, or decision timestamp for rejection. |
| W4 | Workflow | MED | Confirmed | Copy says "ask the founder" but no contact path exists. |
| D1 | Database / RLS | MED | Confirmed | Admin-only intent is not enforced in the Neon helpers. |
| U3 | UI/UX / a11y | LOW | Confirmed | Empty state jumps from `h1` to `h3`. |
| U4 | UI/UX / tokens | LOW | Confirmed | Focus ring uses error/accent colour instead of focus token. |
| U5 | UI/UX | LOW | Confirmed | Date omits year, time, and order ID. |
| D2 | Database / perf | LOW | Confirmed | No supporting index or pagination for the global order sort. |
| D3 | Database / perf | LOW | Confirmed | All projects are fetched to resolve a handful of IDs. |
| S2 | Workflow | LOW | Suspected | Success path relies on `revalidatePath` instead of an explicit refresh. |

Totals: **1 confirmed HIGH, 1 inherited suspected HIGH, 6 MED, 5 LOW confirmed, 1 LOW suspected.** No cross-account data exposure or SQL injection was confirmed.

## Recommended fixes

1. **W1 first.** Require a viewable proof (client `screenshotUrl` and a server-side Storage check) before Confirm can run or be enabled; consume `screenshotError` instead of leaving it dead.
2. **S1.** Make the identity-provider role authoritative or mirror role changes synchronously, and add the payments page plus both mutations to the regression check.
3. **U1/W2.** Add a `SegmentedControl` with a live queue count, order actionable rows first, and resolve the `pending` vs `submitted` state contract across `/admin` and `/admin/payments`.
4. **U2.** Add on-demand signed-URL refresh via an admin-checked route/action and replace "Try again later" with a real control.
5. **W3.** Add `reviewed_by`, `reviewed_at`, and `rejection_reason` (or a status-history table) and write them atomically in `setOrderStatus`.
6. **D1/D2/D3.** Introduce admin-named, role-checked Neon helpers; select projects by ID; add a queue index and bounded pagination.
7. **W4.** Surface a founder contact path or rewrite the guidance so it matches what the page can actually do.
8. **U3/U4/U5/S2.** Fix the empty-state heading level, restore the focus token, show a complete date/order identity, and explicitly refresh after successful mutations.

## Notes/limitations

- **Static audit only.** No Next.js dev server was listening on ports 3000–3010 when probed, and no authenticated admin session was available. Playwright MCP was therefore not driven; `webapp-testing` was applied as a limitation check, not as a live pass. No rendered contrast measurement, keyboard run, or DOM assertion was captured for this route. Prior runtime evidence in `reports/component-relevance-audit.md:55,68,82` and `reports/visual-recheck.md` is cross-report context, not re-verification here.
- **No server was started and `npm run build` was not run.** Starting `next dev` would have written outside the single permitted output file; the build restriction was also respected.
- **Read-only discipline.** No child agents were spawned. No product source, config, schema, test, or existing report was edited. `reports/page-audits/INDEX.md` was left untouched; its row for `/admin/payments` should be marked `done` by the owning process.
- **Overlap discipline.** U1 references `reports/component-relevance-audit.md:55,82`; W2 references `reports/page-audits/admin-overview.md:70`; W3 extends the audit-trail concern in `reports/page-audits/student-applications.md:104-108` to payment orders; D1 references `reports/FINAL-AUDIT.md:59-60` and `reports/page-audits/admin-overview.md:76`; S1 references `reports/orchestrator-audit.md:128`, `reports/FINAL-AUDIT.md:57-60`, and `reports/page-audits/founder-profile.md:82-88`; U4 references `reports/brand-tokens.md:5-7`. None of those findings is re-scored here.
- **Confirmed vs suspected.** Confirmed means the code or schema fact was read directly in this pass. Suspected means the code path exists but depends on an unobserved runtime condition (`revalidatePath` behaviour for S2) or on an already-confirmed system-wide condition not exercised here (S1). No issue was invented from a missing screenshot or unreadable source.
