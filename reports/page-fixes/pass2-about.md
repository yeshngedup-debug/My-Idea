# `/about` second-pass page-fix report

## Scope

Second-pass feature-completeness review of the current, dirty working tree.
Only `app/about/page.tsx` and this report were edited. All earlier uncommitted
work was treated as source of truth. No `git checkout`, `git reset`, `git
stash`, `git clean`, build, test suite, dev server, or browser tooling was run.

## Features verified

- **Page structure and metadata.** `/about` is still an async Server Component.
  It calls `getLiveContext()` and renders hero, national context, live
  statistics, local-bridge explanation, manual verification copy, photo
  section, and shared CTA. `pageMetadata()` at `app/about/page.tsx:29-34` still
  supplies the `/about` canonical and social metadata path.
- **Internal links.** All page-owned destinations resolve to route files:
  `/public` (`app/about/page.tsx:99,385`), `/how-it-works` (`:102,285`), `/faq`
  (`:288`) and `/contact` (`:347`).
- **External links.** The World Bank source at `app/about/page.tsx:236-242` is
  reachable and uses `target="_blank"` with `rel="noopener noreferrer"`.
  `PhotoCredit` credit and licence links are opened the same way in
  `components/ui/photo-credit.tsx:41-56`.
- **Disclosure ARIA.** `contextFactId()` at `app/about/page.tsx:60-70` produces
  `gdp-growth`, `emigration` and `agrifood` from the shared labels. Those values
  are used for `defaultValue` and each item id at `:184,187`. The shared
  component sanitizes `useId()` and item ids again before building
  `aria-controls` (`components/interactive/animated-disclosure-list.tsx:24-31,86-88,99-103,127-129`), so each IDREF is a single valid token.
  Reduced-motion disclosure behavior is unchanged.
- **Inline image accessibility.** The `accessibleLabel` at
  `app/about/page.tsx:269` includes the supplied `imageAlt`, so the heading
  announces "A practical local bridge: Bhutanese students working together"
  while the decorative image stays `alt=""` as required by
  `components/editorial/inline-image-text.tsx:27-30,46-50,64-70`.
- **Live panel disclosure.** The native `<details>/<summary>` pair at
  `app/about/page.tsx:250-255` still wraps `LiveContext`.
- **Photographs and credits.** All referenced local image files exist. The
  Commons API confirms the registered authors and licences: `Bhutanese_youth.jpg`
  is Doctor 17 / CC BY-SA 4.0, `Boys_in_Bhutan_national_dress.jpg` is Keith
  Mason / CC BY-SA 3.0, and `Bhutanese_Girls_in_National_Dress.jpg` is
  Christopher J. Fynn / CC BY-SA 3.0. The downloaded youth original is a close
  perceptual-hash match for `bhutanese-students.jpg`; the other two local
  assets have aspect ratios matching their Commons originals. No author or
  licence was guessed for the unregistered market photograph.
- **Factual claims.** The current World Bank press release verifies 7.1% GDP
  growth for FY25/26, 6.4% for FY26/27, 20.6% youth unemployment, about 9%
  emigration as of 2025, 55% agrifood employment including 71% of rural
  workers, and the Xavier Furtado quote used in `data/landing.ts:30-61`. The
  page labels each figure as a national indicator, not a platform result.
- **Verification copy.** "How we verify students" at
  `app/about/page.tsx:306-354` matches the manual admin process described in
  `app/faq/page.tsx:109-129` and `app/how-it-works/page.tsx:108-112`. The
  underlying fields exist in `neon/schema.sql:69-74`, and manual rank/verified
  actions exist in `app/actions/admin-students.ts:42-79`. No database-enforced
  claim was made.
- **Security surface.** `/about` has no form, user input, mutation, redirect,
  role gate, or Neon query. Its only data call is `getLiveContext()`.

## Fixes made

- `app/about/page.tsx:374-378`: narrowed the attribution paragraph from
  "Photographs by..." to "The credited Wikimedia Commons photographs are by...".
  The old wording read as a page-wide attribution and could be taken to cover
  `/images/thimphu-market.webp`, which has no verified credit. The new wording
  names only the three photographs that actually carry `PhotoCredit` links.
  This is a small copy-only honesty fix. No colour, layout, dependency, or
  route changed.

Earlier phase-1 changes in the same file, including `contextFactId()` and the
expanded inline-image `accessibleLabel`, were preserved. No other source file
was edited.

## Checks performed

- Read the current `app/about/page.tsx`, `reports/page-fixes/MANIFEST.md`,
  `reports/page-fixes/about.md`, `reports/page-audits/about.md`, and the
  relevant shared reports before editing.
- Read `AGENTS.md`, the installed Next.js 16 guides for layouts/pages, Server
  Components, linking, and images, `design/brand-system.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts` and `app/globals.css`.
- Source-verified shared components and data named above, plus route files for
  every internal destination and the current World Bank/Commons external
  sources.
- `npx eslint app/about/page.tsx`: passed, no findings.
- `npx tsc --noEmit --pretty false`: passed, no findings.
- `git diff -- app/about/page.tsx`: reviewed. It contains only the earlier
  phase-1 fixes plus the one attribution copy change in this pass.

Runtime interaction, rendered contrast, mobile overflow, and screen-reader
output were not verified in this pass because browser tooling and a dev server
were out of scope.

## Workflow findings routed to the workflow owner

- No page-owned workflow defect was found. The live panel is the only
  interactive data surface and its controls live in
  `components/data/live-context.tsx`.
- **D1, UI half still open.** The data layer now exposes `partial`, `missing`
  and `errors` (`lib/data/world-bank.ts:64-66,416-446`), but the shared UI does
  not consume them: `components/data/live-context.tsx:70` seeds `unavailable`
  only from `!initial.ok`, `:94-100` derives it only from `next.ok`, and
  `:230-238,360` renders one generic unavailable note. Under a partial upstream
  outage the panel can still look complete while omitting a series.
  Recommended fix for the design-system owner: at
  `components/data/live-context.tsx:68-105,355-372`, mark `partial` data as
  unavailable or show a warning naming `data.missing` / `data.errors` while
  keeping the last good values. No shared file was edited.

## Database findings routed to the database owner

- `/about` issues no database query. `getLiveContext()` fetches public World
  Bank/WHO data, and the shared refresh endpoint is a public aggregate GET.
- The manual verification copy is grounded in `neon/schema.sql:59-74` and the
  admin actions at `app/actions/admin-students.ts:42-79`. It does not promise
  that the database enforces verification.
- The data-layer half of D1 is now resolved at
  `lib/data/world-bank.ts:64-66,416-446`; only the shared UI half above remains.

## Shared image findings routed out

- **S1 remains open.** `/images/thimphu-market.webp` at
  `app/about/page.tsx:208-221` still has a caption but no verified source,
  author, licence, `PhotoCredit`, or registry entry. Repo search and the
  current Commons registry (`components/marketing/nav.ts:68-74`,
  `components/ui/photo-credit.tsx:7-23`) do not establish provenance. The copy
  fix above removes the false page-wide implication, but it does not replace
  proper attribution. Recommended fix for the design-system/content owner:
  verify the asset and add a registry-backed `PhotoCredit`, or replace it with
  a registered Commons file. Do not guess an author or licence.
- The suspected "working together at computers" alt text is inherited from
  `reports/page-audits/for-students.md:27` and was not re-scored here.

## Deliberately not changed

- `contextFactId()` was left in place. Shared stable ids and the shared
  `idPart()` sanitizer now also solve the IDREF concern, but the local helper
  is harmless and removing it would add no user-visible benefit.
- Shared files, other pages, other reports, `MANIFEST.md`, and phase-2 reports
  were not edited.
- National figures, their source label, the "Why two numbers?" honesty rule,
  and the "not platform results" wording were left intact.
- The market photograph was not removed or credited with a guessed author,
  because its provenance is unresolved.
- No new dependency, route, gradient, emoji, off-palette colour, or wholesale
  rewrite was introduced.
