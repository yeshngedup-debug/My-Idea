# `/` (home) second-pass feature-completeness report

Date: 2026-11-25. Scope: second pass on `/` after the page owners and phase-2
shared owners finished. The dirty worktree is the source of truth. No
destructive git command, full build, full test suite, dev server, or browser
tool was used.

## Files changed

- `reports/page-fixes/pass2-home.md` — this report only.

No source file was changed in this pass. `app/page.tsx` still carries the
phase-1 fix: `permanentRedirect('/public')` at `app/page.tsx:1-2`.

## Result

No confirmed defect was found in the owned file. The root route is a stable
server-only alias to `/public`; it renders no UI, owns no form, filter, link,
button, disclosure, data query, error state, or loading state. Every inherited
user-facing feature belongs to `/public` or shared components and was checked
by source only, not re-fixed here.

## Read before finalizing

- Skills: `better-interface` and `better-writing`.
- `AGENTS.md`, `node_modules/next/AGENTS.md`, and the installed Next.js 16
  guides: `01-getting-started/03-layouts-and-pages.md`,
  `03-api-reference/04-functions/redirect.md`, and
  `03-api-reference/04-functions/permanentRedirect.md`.
- `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, and `app/globals.css`.
- `reports/page-fixes/MANIFEST.md`, `reports/page-fixes/home.md`, the three
  phase-2 shared reports (`shared-workflow.md`, `shared-database.md`,
  `shared-design-system.md`), and `reports/page-audits/home.md`.

The Next.js guide confirms that `permanentRedirect` is valid in a Server
Component page, returns `never` / no value, and serves a 308 response outside a
streaming or Server Action context
(`permanentRedirect.md:9,11,44,49,53`). The root page needs no `return`, no
client directive, and no config-level redirect.

## Features verified

### Owned route: `/`

- `app/page.tsx:1-2` imports `permanentRedirect` from `next/navigation` and
  calls it during render. The redirect terminates rendering of the route.
- The destination route exists at `app/public/page.tsx:43-54` and remains a
  server-rendered public landing page.
- There are no local links, CTAs, forms, filters, disclosures, buttons, user
  input, cookies, headers, params, `searchParams`, server actions, or data
  fetches on `/`. The root has no empty/error/loading state to maintain.

### Inherited destination: `/public`

Source verification covered every interactive surface the root alias can
reach after redirect:

- **Navigation and CTAs.** Hero and closing actions use `CTA_HREFS`
  (`app/public/page.tsx:92-101,199-202,378-383`; `components/marketing/nav.ts:61-66`):
  "Create student account" -> `/signup`, "See how it works" ->
  `/how-it-works`, and the closing CTA -> `/signup`. Header/footer navigation
  uses `NAV_LINKS`, `UTILITY_LINKS`, and `LOGIN_LINK`
  (`components/marketing/nav.ts:35-50`): `/how-it-works`, `/for-students`,
  `/for-founders`, `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, and
  `/login`. All target routes exist in the current `app` tree. No label points
  to a missing local route.
- **External sources.** Source links at `app/public/page.tsx:178,284,327,336,349,360`
  come from `WORLD_BANK_SOURCE`, `LIVE_DATA_SOURCE`, and the youth-indicator
  source URL (`data/landing.ts:13-24`; `lib/data/world-bank.ts`). They are
  concrete public URLs, not caller-controlled input. No live HTTP status check
  was performed.
- **Disclosures.** The public context facts render through
  `AnimatedDisclosureList` at `app/public/page.tsx:259-270`. Each row has a
  real `<button>` with `aria-expanded`, `aria-controls`, and a toggle handler
  (`components/interactive/animated-disclosure-list.tsx:99-104`); stable slugs
  are derived at `:24-31,86-88`. The native statistics `<details>` is open by
  default (`app/public/page.tsx:301`), so its controls are visible on first
  paint.
- **Live controls and states.** `Refresh now` and pause/resume call real
  handlers (`components/data/live-context.tsx:83-110,146-184`) against
  `/api/context-data` (`app/api/context-data/route.ts:15-22`). The UI has a
  busy label (`Refreshing...`), `aria-busy`, a polite status notice, an
  unavailable note (`:230-239`), empty indicator copy (`:369-372,435-437`),
  and a checked-at label (`:356,423`). Polling is paused only when the reader
  asks; it resumes on the toggle.
- **Honest copy.** The statistics panel says the figures are annual releases
  and modeled estimates, not a real-time feed
  (`components/data/live-context.tsx:350-352,376-380,442-448`). The shortlist
  preview is labelled "Sample, using local demo data" and states the real
  admin sequence: confirm payment, finalize and rank, then release
  (`components/marketing/product-preview/shortlist-preview.tsx:16-17,37-59`).
  No "shortlist unlocked" promise remains there.
- **No fake surface.** The root and destination have no form, search input,
  filter, sort control, or disabled-looking action that would need a backend.
  The only inputs are the disclosure buttons, live refresh/pause controls,
  native `<details>`, and navigation links.

## Workflow findings routed to the workflow owner

No workflow finding lives in `app/page.tsx`. The phase-1 307-to-308 fix is the
only owned workflow change and is already present. These destination/shared
findings were re-checked in current source and are left to their owners:

- **LOW — public `/api/context-data` has no explicit rate limit or request
  coalescer.** `app/api/context-data/route.ts:13-22` returns cached aggregate
  JSON; a cache miss fans out through `lib/data/world-bank.ts`. Observed:
  hourly `revalidate` / `s-maxage` limits normal load, but direct cache-busting
  requests can still amplify upstream fetches. Recommended: rely on platform
  WAF/rate limiting, or add a small in-memory coalescer keyed by hour. Do not
  add authentication to a public statistics endpoint. Also recorded in
  `reports/page-fixes/shared-workflow.md:155-166`.
- **MED — partial live-data outages are still rendered as fully healthy.**
  `lib/data/world-bank.ts` now returns `partial`, `missing`, and `errors`, but
  `components/data/live-context.tsx:70,94-101,230-239,360,426` still treats any
  `ok: true` payload as healthy. Observed: a partial result keeps all available
  figures but shows no warning that some sources failed. Recommended: when
  `partial === true`, show a non-blocking warning naming `missing` / `errors`
  and keep the available figures visible; reserve `UnavailableNote` for
  `ok: false`. Routed in `reports/page-fixes/shared-workflow.md:136-141`.

## Workflow findings routed to the design-system owner

- **MED — pause control can be hidden while polling continues.**
  `app/public/page.tsx:301` opens `<details>` by default, but the refresh and
  pause controls remain inside the compact panel mounted at `:305`, rendered
  at `components/data/live-context.tsx:415-421`. Observed: collapsing the
  summary hides the only pause control while the 10-minute poll continues.
  Recommended: render or expose one pause control outside the native
  disclosure, or keep the controls mounted at page level. Residual item from
  `reports/page-fixes/public.md:103-107`.
- **LOW — closed disclosure rows reference an unmounted panel.**
  `components/interactive/animated-disclosure-list.tsx:99-104` always sets
  `aria-controls`, but `:124-129` mounts the referenced panel only while open.
  Observed: the closed state contains an ARIA IDREF with no target element.
  Recommended: keep the panel mounted with `hidden` / `inert` toggled, or omit
  `aria-controls` while the row is closed. This is separate from the already
  fixed invalid-character IDREF issue.
- **Verified fixed; do not re-raise.** The earlier `/about` self-link for
  "two numbers" now points to `#why-two-numbers`
  (`components/data/live-context.tsx:442-448`), the hydration clock is
  rAF-safe (`:71-76,112-116`), mobile `aria-controls` is conditional in
  `components/marketing/site-header.tsx`, and disclosure IDREF characters are
  slug-normalized (`components/interactive/animated-disclosure-list.tsx:24-31,86-88`).
  These match `reports/page-fixes/shared-design-system.md:12,14,19`.

## Database findings routed to the database owner

- **None for `/`.** `app/page.tsx` issues no query, reads no field, and passes
  no identifier. Nothing in the owned file needs checking against
  `neon/schema.sql` or `lib/neon-data.ts`.
- Cross-referenced only: `/public` reads aggregate World Bank / WHO data
  through `getLiveContext()` and exposes it through a public cached JSON route.
  No user row, identifier, secret, or RLS-gated data is rendered on the route
  reached from `/`. Database-owner items in
  `reports/page-fixes/shared-database.md` are not home findings and were not
  re-routed here.

## Deliberately not changed

- No edit to `app/page.tsx`: the existing `permanentRedirect('/public')`
  already satisfies the route's only confirmed workflow requirement.
- No `next.config.ts` redirect: it would duplicate the owned-file fix and
  touch shared config.
- No destination UI, copy, component, API, proxy, layout, or database edit:
  every such file is outside `home` ownership (`reports/page-fixes/MANIFEST.md:53-103`).
- No change to root-layout metadata or `SITE.homeHref`. The root canonical at
  `app/layout.tsx:24` is not emitted on `/` because the redirect terminates
  rendering; `/public` supplies its own canonical `/public` at
  `app/public/page.tsx:25-30` through `lib/metadata.ts:23-31`. `SITE.homeHref`
  remains `/public` (`components/marketing/nav.ts:8-12`).
- No build, `npm test`, dev server, browser tool, or live HTTP verification,
  per the pass constraints.

## Checks performed

- `npx eslint app/page.tsx` — clean, no findings.
- `npx tsc --noEmit --pretty false` — clean, no findings.
- Source verification of the redirect API, destination feature inventory,
  shared phase-2 reports, and cited files listed above.
- `git status --short` reviewed; all pre-existing dirty work was left intact.
