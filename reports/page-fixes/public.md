# `/public` fix report

## Files changed

- `app/public/page.tsx` — only owned source file edited.
- `reports/page-fixes/public.md` — this report.

No shared file, other page file, schema, config, or report was edited. Pre-existing
user changes in this file (the `Reveal` swap and the two `min-h-6` inline-link
class additions) were preserved.

### Changes in `app/public/page.tsx`

- Removed the duplicated hero subhead at the old `:82-85`. The headline, the
  bento explanation, and the closing CTA now carry the value proposition once
  instead of three times (audit U2).
- Gave the hero photo credit a solid backing chip on the dark hero photograph:
  `inline-flex rounded-md bg-[#0d1813]/75 px-3 py-1 text-xs leading-5 text-[#f5f2ea]/90`
  at `:105`. Attribution stays visible and legible regardless of the radial
  wash beneath it (audit U3).
- Added a local `contextFactId()` helper at `:36-41` and used it for both
  `defaultValue` (`:262`) and each disclosure item `id` (`:265`). The generated
  `aria-controls` / `aria-labelledby` IDREFs no longer contain spaces or a
  slash, fixing this route's instance of the disclosure-ID defect without
  touching the shared component or data file.
- Added `open` to the native `<details>` at `:301`, with a short comment. The
  `Refresh now` and pause controls are now visible on first paint instead of
  being hidden behind the `Official statistics` summary (audit W1).

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full, `AGENTS.md`,
  `reports/page-audits/public.md`, the relevant sections of
  `reports/page-audits/CONSOLIDATED.md` (including the W4 resolution note at
  `:224-228` and `:277-279`), `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, and `app/globals.css`.
- Read the installed Next.js 16 guides before editing:
  `01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`, and
  `10-error-handling.md`. This page remains a Server Component that awaits
  server data and passes serializable props to Client Components; no new
  client boundary, action, or mutation was introduced.
- Source-verified the audit findings against the current working tree. The
  older h1-clamp, bento-CTA-cell, and footer-colour concerns are resolved in
  current source and were not re-fixed.
- `npx eslint app/public/page.tsx` — clean (no findings reported).
- Reviewed `git diff -- app/public/page.tsx` to confirm only the intended
  lines changed on top of the user's existing edits.
- Did not run `next build`, `npm test`, or a dev server, per the manifest.

## Workflow verification

- Traced all interactions in the owned file: hero/bento/closing CTAs via
  `CTA_HREFS`, external source links, native `<details>` summary, the
  `AnimatedDisclosureList`, the compact `LiveContext` panel, and shared
  header/footer/CTA/product-preview chrome.
- Confirmed there are no Server Actions, form submissions, redirects,
  `searchParams`, `params`, cookies, headers, or user input in this route.
  No state transition lives in the owned file.
- Confirmed the live-data status contract: `getLiveContext()` returns
  `ok`, `checkedAt`, `sources`, `indicators`, and optional `error`; the page
  finds the youth indicator by code and has a fallback at `:344-357` when it
  is absent. The compact panel handles `unavailable`, empty indicator lists,
  and refresh notices, with the notice announced through `role="status"`
  `aria-live="polite"` in `RefreshControls`.
- There is no route-specific `loading.tsx` or `error.tsx`; upstream failures
  degrade to the in-panel unavailable state rather than a route error. Adding
  route boundaries would be a shared design-system change and was not needed.

### Routed to the workflow owner

- `app/api/context-data/route.ts:13-22` and
  `lib/data/world-bank.ts:359-367,412-420` (LOW, audit D2). Observed: the public
  endpoint fans out to seven upstream fetches on a cache miss, with hour-long
  `revalidate` / `s-maxage` but no explicit per-client rate limit or request
  coalescing. Recommended: rely on platform WAF/rate limiting, or add a small
  in-memory coalescer keyed by hour. Do not add authentication to a public
  aggregate endpoint.
- `lib/data/world-bank.ts:360,412-420` with
  `components/data/live-context.tsx:52-66,73-76,112-113` (MED, audit W2).
  Observed: `checkedAt` is set at render time and the whole payload is cached
  for an hour, while the client seeds `now` from `checkedAt` and advances it
  only once a minute. A cached load can therefore read "checked just now"
  even when the underlying response is up to an hour old. Recommended fix on
  the workflow/data side: expose the true upstream/source time as the headline
  freshness value, or make the cache contract explicit; the client-side half
  of the fix is listed under the design-system owner below.

### Routed to the design-system owner

- `components/data/live-context.tsx:436-443` (MED, audit U1). Observed: the
  compact panel sends readers to `/about` for the two-numbers explanation
  although that explanation is already on this page at
  `app/public/page.tsx:307-369`. Recommended: change the link at `:439` to
  `href="#why-two-numbers"` with text "See the note below on this page", or
  drop the sentence. The anchor target already exists at `:310`. Not edited
  here because `components/**` is shared.
- `components/data/live-context.tsx:52-66,73-76,112-113` (MED, audit W2,
  client half). Recommended: add `useEffect(() => setNow(Date.now()), [])` so
  the relative label corrects immediately after hydration, or render only the
  absolute timestamp until a real client clock is available.
- `components/data/live-context.tsx:409-415` (MED, audit W1, residual).
  Opening `<details>` by default makes the pause control visible on first
  paint, but collapsing the disclosure still hides the control while polling
  continues. Durable fix: let `LiveContext` render or expose a pause control
  outside the native disclosure, or keep the controls mounted at page level.
- `components/marketing/site-header.tsx:130,147-157` (LOW, audit W3).
  Observed: the menu button declares `aria-controls="marketing-mobile-nav"`
  while `AnimatePresence` mounts that element only when the menu is open, so
  the closed state contains a broken IDREF. Recommended: keep the container in
  the DOM with `hidden`/`inert` toggled, or omit `aria-controls` while closed.
- `data/landing.ts:36-52` and
  `components/interactive/animated-disclosure-list.tsx:77-78,117-119`
  (cross-referenced defect owned by `reports/page-audits/about.md:39`). This
  route is now fixed locally by `contextFactId()`, but the shared root cause
  remains: `CONTEXT_FACTS` has no stable `id` and the component derives IDREFs
  from the caller-supplied `id`. Recommended: add slug `id` fields to
  `CONTEXT_FACTS` and pass `id: fact.id` on both `/public` and `/about`.

### W4 disposition

Audit W4 (`public.md:61`) is **resolved, not live**. Per
`reports/page-audits/CONSOLIDATED.md:224-228,277-279` and `home.md:68`, a clean
dev-server restart restored disclosures, pause/refresh, mobile navigation, and
scroll reveal; the earlier failure coincided with HMR WebSocket errors. No
change was made for W4 and it was not carried forward as a product defect.

## Database verification

- `app/public/page.tsx` contains no Neon/Supabase client, server action,
  mutation, cookie/header read, or caller-controlled input. It only awaits
  `getLiveContext()` and renders the result.
- `lib/data/world-bank.ts:24-27,359-367` fetches fixed World Bank and WHO URLs
  with no caller-controlled URL, so there is no SSRF surface on this route.
- `app/api/context-data/route.ts:15-22` returns aggregate public statistics
  only. No row-level data, identifier, or secret is exposed.
- `neon/schema.sql:1-4` and `lib/neon-data.ts:1-7` explicitly state that
  authorization is application-layer and there is no RLS. That is a global
  architecture finding owned elsewhere; this route adds no instance of it.
  Injection, IDOR/BOLA, mass assignment, CSRF, and RLS testing are not
  applicable to `/public`.
- No stale status values, unbounded reads, missing indexes, or ownership gaps
  were found for this route. The only DB-adjacent item is the API freshness /
  cache-contract note routed to the workflow owner above.

## Deliberately not changed

- Shared components (`live-context.tsx`, `site-header.tsx`,
  `animated-disclosure-list.tsx`, `site-footer.tsx`, `cta-band.tsx`,
  `local-bridge-differences.tsx`, `shortlist-preview.tsx`) and shared data
  (`data/landing.ts`) are outside this route's ownership. Findings are routed
  above with file:line and a recommended fix.
- The 20.6% press-release figure versus the modeled API observation is left
  intact and explicitly attributed, per `design/voice-guide.md:29-31` and
  `reports/content-integrity.md:13-26`; this pass did not alter figure copy.
- The pre-existing `Reveal` substitution and added `min-h-6` inline-link
  classes were left untouched: they are user work and the current source of
  truth.
- No loading/error boundary, dependency, gradient, violet/emoji, or wholesale
  rewrite was introduced, per the manifest and brand guidelines.
