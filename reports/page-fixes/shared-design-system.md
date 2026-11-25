# Shared design system — Phase 2 fixes

Date: 2026-11-24. Owner: shared design system.

Scope: only the editable shared files in `reports/page-fixes/MANIFEST.md`. The dirty worktree was treated as the source of truth; all pre-existing uncommitted work was preserved. Every lead from the page reports was re-read in current source before action, and stale leads were dropped. No page-owned file, server action, API route, proxy, database/schema file, validator, or other agent's report was edited.

## Files changed

- `app/error.tsx` — root error boundary is now route-aware: it reads `usePathname()` and sends `/founder`, `/student` and `/admin` failures back to that role's workspace root; public failures still go to `/public`. "Try again" is unchanged.
- `app/globals.css` — desktop sticky stacking is gated on `(min-width: 768px) and (prefers-reduced-motion: no-preference)`; the reduce block now forces `position: static; top: auto` on `[data-stacked-card]`, so reduced-motion readers get a plain ordered list.
- `components/auth/auth-shell.tsx` — the shell no longer forces a marketing `h1`. When the page already renders an `h1`, the shell's "Paid project work in Bhutan" line becomes a `p`, leaving `/login` with a single `h1` for the task.
- `components/data/live-context.tsx` — hydration-safe clock: the real clock is applied in a `requestAnimationFrame` after mount instead of a synchronous effect `setState`; refresh/pause controls are 44px high; the "two numbers" note has a stable `#why-two-numbers` id and the compact panel links to it in-page instead of sending readers to `/about`.
- `components/founder/live-order-status.tsx` — optional `onConfirmed` callback lets a host react to confirmation through the existing live query; no second realtime subscription. The status dot uses the forest/vermilion tokens and a single derived `confirmed` value.
- `components/interactive/animated-disclosure-list.tsx` — `idPart()` slug-normalizes item ids and `useId()` is sanitized, so `aria-controls`/`id` pairs stay valid when labels contain spaces or punctuation.
- `components/interactive/segmented-control.tsx` — added opt-in `selectOnArrow` (default `false` keeps arrow/Home/End focus-only); Enter/Space always select. Key navigation is now keyed by `option.value` with a guard for missing buttons.
- `components/layout/workspace-page-heading.tsx` — secondary text and eyebrow use `text-body-secondary` and the vermilion token instead of off-palette greys/browns.
- `components/layout/workspace-stats.tsx` — secondary text uses `text-body-secondary`; stat details now have a visible ` · ` separator instead of relying on margin only.
- `components/marketing/product-preview/shortlist-preview.tsx` — copy now names the full admin sequence (confirm payment → finalize and rank → release), and the "Shortlist unlocked" claim was removed; all `text-[#657069]` micro-labels became `text-body-secondary` for AA contrast on the warm-paper panel.
- `components/marketing/site-header.tsx` — `/contact` keeps founder context but hides the header CTA so it cannot self-link; mobile menu `aria-controls` is only emitted while the panel is open.
- `components/motion/stacked-cards.tsx` — removed the duplicate Tailwind `md:sticky` class; sticky behaviour is now owned solely by the media-query-gated CSS rule.
- `components/ui/badge.tsx` — outline variant uses the token-based `text-body-secondary`.
- `components/ui/shadcn/progress.tsx` — forwards `aria-describedby` to the `progressbar`, and the displayed value uses `text-body-secondary`.
- `components/ui/status-timeline.tsx` — off-path terminal stages read "Earlier stage" instead of "Not yet"; token colors replace off-palette greys; 11px micro-copy is now 12px (14px at `sm` for guidance); student and order next-step copy describes real behaviour, and "Unlocked" became "Payment confirmed" with the admin finalization step named.
- `data/landing.ts` — `CONTEXT_FACTS` has stable slug ids (`gdp-growth`, `emigration`, `agrifood`) so disclosure IDREFs no longer depend on label copy.

## Checks performed

- `npx eslint <the 16 owned .ts/.tsx files>` — exit 0, no errors and no warnings. Adding `app/globals.css` to the same command yields only the expected "file ignored because no matching configuration was supplied" warning; the CSS was reviewed by reading it.
- `npx tsc --noEmit --pretty false` — exit 0, clean.
- Each reported lead was source-verified before editing; no build, test suite, or dev server was run, per scope.

## Findings routed to the workflow owner

- **Role-lookup failure has no explicit recovery state (MED).** `proxy.ts:28-34` collapses every Neon role error to `{ role: null, ok: false }`; `proxy.ts:121-126` and `proxy.ts:130-132` then return the response silently on failure. Recommended: represent infrastructure failure separately from an unknown role and return a retryable error state (or resolve the role from the verified Supabase profile first, with Neon as a mirror). Older reports claiming a failed lookup defaults the user to `/student` are stale — current `proxy.ts:124,136` redirects unknown roles to `/`. The root boundary now offers a role-aware recovery link (`app/error.tsx`), but the proxy still needs the explicit failure state.
- **Founder can regress an application status (MED).** `app/founder/projects/[id]/project-detail-client.tsx:216-222` offers all four statuses for every applicant; `app/actions/projects.ts:176-212` only whitelists the target string and checks project ownership; `lib/neon-data.ts:439-462` guards only with `status is distinct from`. A `rejected` row can return to `pending`. Recommended: enforce a server-side transition map (`pending -> shortlisted|rejected`, `shortlisted -> accepted|rejected`, terminal states immutable unless an explicit reopen action exists), mirror it in the founder buttons, and record actor/time in the history table that now exists at `neon/schema.sql:48-55`.
- **Payment confirmation reports an unlock before admin finalization (MED).** `app/actions/shortlist-order.ts:173-210` sets `confirmed` and returns "Payment confirmed. Shortlist unlocked." at `:210` without creating or ranking any `shortlists` rows. Recommended: create and rank the rows before returning success, or change the success message to say the admin will finalize and rank the shortlist, plus a regression check for the confirmed-but-empty state. The shared preview and status timeline now describe the real sequence; the action message is workflow-owned.
- **Realtime failure is hidden from the founder (LOW).** `app/founder/shortlists/page.tsx:74-80` only `console.warn`s when `sealFounderOrders` fails; the UI silently falls back to server-loaded rows. Recommended: render a small non-blocking notice such as "Live updates unavailable. Refresh for the latest payment status." Owner: the `app/founder/shortlists` page owner (page-owned file, not edited here).

## Findings routed to the database owner

- **Finalization is not representable in the shortlist data model (MED).** `neon/schema.sql:78-86` has no `finalized_at`, `released_at` or released status on `public.shortlists`; the only `rank` column is on `student_profiles` (`:73`), so it cannot express a per-founder, per-project ranking. `app/actions/shortlist-order.ts:202-210` confirms payment without writing shortlist rows. Recommended: add a release/finalization timestamp and a per-shortlist rank (with a unique `(founder_id, project_id, rank)` constraint), enforce release only after finalization, and add a regression check. This is the data-side counterpart to the shared copy corrected here.
- **Unbounded shared reads (LOW, scale).** `lib/neon-data.ts:359-375` (`listAllProjects`) selects every project with no `limit`, and `lib/neon-data.ts:979-985` (`listConfirmedOrderProjectIds`) expands an unbounded id array into `= any(...)`. Recommended: provide bounded/paginated variants with explicit limits and tests, and have callers opt into a cursor.
- **Verified resolved — not re-routed.** Earlier reports said application ids became `"undefined"` (`lib/neon-data.ts:356-377`) and that no status history existed (`neon/schema.sql:35-42`). Current source selects and maps `student_id`, `project_id` and `project.id` at `lib/neon-data.ts:381-405,467-486`, and `updated_at` plus `application_status_history` exist at `neon/schema.sql:35-55` and `lib/neon-data.ts:445-461`. No further action needed from this pass.

## Deliberately not changed

- `components/auth/login-form.tsx` and `components/auth/signup-form.tsx` — explicitly excluded from this role; the duplicate-heading issue was fixed in the shared `AuthShell` instead. `/login` owns its `h1` and `/signup` owns its `h2`, so no page file needed editing.
- `app/about/page.tsx:60-70` and `app/public/page.tsx:35-41` — local `contextFactId()` helpers are page-owned workarounds that duplicate the new shared `idPart()` and stable `CONTEXT_FACTS` ids. They are harmless and may be removed by those page owners as a follow-up.
- Local `SegmentedControl` arrow-key wrappers in founder browse pages — page-owned and still functional; those pages can now pass `selectOnArrow` instead. No page file was touched.
- `app/founder/shortlists/shortlists-client.tsx:304-307` — the live "after admin finalization" line is already honest and page-owned.
- `/images/thimphu-market.webp` — no registered `PhotoCredit` or author/licence metadata was found. Provenance was not guessed; the gap is left for the content owner to resolve.
- `lib/design-tokens.ts` and `app/layout.tsx` — no change was needed; every fix uses existing palette/spacing tokens, and no shell-level issue was confirmed.
- New tests/stories — none added: no component-test pattern exists under `components/**`, and this pass was limited to eslint and typecheck. The two routed behavior gaps above need tests owned with their workflow/database fixes.
- Page-owned error, loading and not-found boundaries — left to their page agents; only the shared root `app/error.tsx` was edited.
- `proxy.ts`, `app/actions/**`, `app/api/**`, `lib/neon-data.ts`, `neon/schema.sql`, `lib/data/world-bank.ts`, validators and other agents' reports — read-only per the manifest; findings are routed above rather than partially patched in shared wrappers.
