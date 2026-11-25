# Page audit — `/about`

Date: 2026-11-24. Role: single read-only page critic. The only file written is this report. No product source, config, schema, test, existing report, or `reports/page-audits/INDEX.md` was edited. Uncommitted working-tree changes were treated as authoritative; `git diff -- app/about/page.tsx` was empty.

## Route

`/about` — public, unauthenticated marketing page. It is a server component that awaits `getLiveContext()` (`app/about/page.tsx:65-66`) and renders editorial copy, three credited Wikimedia photos, one uncredited local market photo, two disclosure systems, a live statistics panel, and shared public CTAs. There is no user input, form, mutation, role gate, or database query on this route.

## Files traced

- `app/about/page.tsx:1-380` — sole route under audit: metadata, hero, context figures, disclosures, photographs, verification copy, CTAs, and live-panel mount.
- `components/data/live-context.tsx:1-395` — polling, refresh/pause controls, timestamps, source links, full and compact panel rendering, status announcements.
- `lib/data/world-bank.ts:1-437` — World Bank/WHO fetch, timeout, revalidation, error collection, result assembly, `getLiveContext()` export.
- `app/api/context-data/route.ts:1-23` — client refresh endpoint and cache headers.
- `data/landing.ts:1-57` — verified national figures, World Bank source, quote, disclosure facts.
- `lib/metadata.ts:8-43`, `app/layout.tsx:15-49` — per-page metadata, `metadataBase`, title template, canonical/OG/Twitter resolution.
- `components/interactive/animated-disclosure-list.tsx:24-153` — controlled disclosure buttons, generated IDs, reduced-motion behavior.
- `components/editorial/inline-image-text.tsx:1-79`, `components/marketing/photo-feature.tsx:30-97`, `components/ui/photo-credit.tsx:1-60`, `components/marketing/nav.ts:61-80` — image alt/credit behavior and the permitted Commons registry.
- `components/marketing/scrubbed-text-reveal.tsx` equivalent (`components/motion/scrubbed-text-reveal.tsx:88-104`), `components/marketing/hero-motion.tsx:1-82`, `components/ui/motion.tsx`, `components/layout/pinned-heading-section.tsx`, `components/brand/local-bridge-differences.tsx:1-103`, `components/marketing/{site-header,site-footer,cta-band,section-intro}.tsx` — shared rendering and motion.
- Installed Next.js 16 guides read before source review: `public-static-pages.md`, `12-images.md`, `14-metadata-and-og-images.md`.
- All existing `reports/*.md` and `reports/page-audits/*.md` were read before finalizing; overlap is referenced below rather than restated.

## Skills used

Applied with the precedence in `reports/SKILL-ASSIGNMENTS.md:5-12`:

- `unslop` — AI-tell and template-repetition check.
- `better-interface`, `better-layout`, `better-ui`, `better-writing` — evidence-based UI, layout, polish, and copy findings.
- `frontend-a11y`, `better-accessibility` — WCAG 2.2 AA view, names, roles, IDREFs, and focus/control semantics.
- `webapp-testing` — live Playwright check against the running dev server where possible.
- `security-review`, `api-security-testing` — scope check for authz, RLS, validation, secrets, and API exposure. The assigned `api-security-testing` file resolved to `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md`; no top-level copy existed.

`design-taste-frontend`, `apple-design`, and `animate` were not assigned to this agent. Site-wide aesthetics, interaction physics, and motion claims remain owned by the existing critic reports listed in Notes/limitations.

## UI/UX findings

### Confirmed

- **U1 — MED — disclosure panels are referenced by invalid IDs.** `app/about/page.tsx:170-193` passes each `fact.label` as the item `id` (`app/about/page.tsx:175`). `components/interactive/animated-disclosure-list.tsx:77-78,90-93,117-119` turns that value into `button.id`, `button[aria-controls]`, and `motion.div.id`. The labels in `data/landing.ts:39,44,49` contain spaces and one apostrophe, so the generated IDs contain whitespace. `aria-controls` is a space-separated ID-reference list, and HTML `id` values must not contain ASCII whitespace; assistive technology may therefore fail to connect "Real GDP growth projected for FY25/26" and the other triggers to their panels. **Fix:** add stable `id` fields to `CONTEXT_FACTS`, for example `gdp-growth`, `emigration`, `agrifood`, and pass `id: fact.id` plus `defaultValue: CONTEXT_FACTS[0].id` at `app/about/page.tsx:172,175`.

- **U2 — LOW — inline-image `alt` text is dead because the accessible-label override discards it.** `app/about/page.tsx:251-259` passes both `imageAlt="Bhutanese students working together"` and `accessibleLabel="A practical local bridge"`. `components/editorial/inline-image-text.tsx:46-50` uses `accessibleLabel` instead of the composed `lead + imageAlt + tail`, and `components/editorial/inline-image-text.tsx:64-70` renders the image with `alt=""`. The description is therefore never announced and contradicts the component contract at `components/editorial/inline-image-text.tsx:10,27-30`. **Fix:** remove the unused `imageAlt` prop if the circular photo is decorative, or set `accessibleLabel` to `"A practical local bridge: Bhutanese students working together"` if the photo should be described in the heading.

### Suspected

- **S1 — MED — suspected attribution/provenance gap for `/images/thimphu-market.webp`.** `app/about/page.tsx:196-209` gives the figure only a caption at `:206-208`; unlike the route's other local photographs (`:110-113`, `:282-287`, `:354-359`), it has no visible `PhotoCredit`. The asset is not in the only permitted Commons registry (`components/marketing/nav.ts:68-74`; `components/ui/photo-credit.tsx:7-23`), and repo-wide search found no source URL or licence for it. `reports/performance-seo.md:65,79` records the 419,022-byte asset and a stale note that it had zero references. The page later says "Each photo credit links to the original file" at `app/about/page.tsx:363-365`, so a reader could reasonably expect provenance for every photograph. This is a suspected licence/attribution risk, not proof of infringement: the source could not be established from the repository. **Fix:** verify the asset's source and licence, then add a visible `PhotoCredit` with a new registry entry, or replace the image with one of the three registered Commons files.

No HIGH UI/UX finding was confirmed on this route. The duplicated heading text from `SectionIntro` is not a defect: `components/motion/scrubbed-text-reveal.tsx:98-101` emits one `sr-only` copy and one `aria-hidden` visual copy. Reusing `bhutanese-community.jpg` at `app/about/page.tsx:254-256` is also not a defect by itself: it uses the same registered Commons file URL already used at `app/about/page.tsx:36-40` and `components/ui/photo-credit.tsx:13-16`.

## Workflow findings

### Confirmed

No route-specific workflow defect was confirmed.

- Internal destinations resolve: `/public` (`app/about/page.tsx:87,373`), `/how-it-works` (`:90,273`), `/faq` (`:276`), `/contact` (`:335`), plus shared header/footer links. Existing route files were checked for every destination.
- External links are safe: the World Bank source at `app/about/page.tsx:223-230` and all credit/licence links in `components/ui/photo-credit.tsx:41-56` use `target="_blank"` with `rel="noopener noreferrer"`.
- Metadata is correct at runtime: `app/about/page.tsx:29-34` calls `pageMetadata`; `lib/metadata.ts:23-41` sets canonical, OG, and Twitter fields; `app/layout.tsx:16` makes them absolute. Live DOM showed title `About | Bhutan Tech Connect`, canonical `https://bhutantech.bt/about`, `og:title = About`, and `og:image = https://bhutantech.bt/og-image.png`. Site-wide social-copy conventions remain owned by `reports/performance-seo.md:99-107`; this route now has per-page metadata and a valid raster image, so no duplicate finding is raised.
- Controls are wired in source: the native `<details>/<summary>` at `app/about/page.tsx:238-243` exposes the live panel; disclosure buttons call `toggle()` at `components/interactive/animated-disclosure-list.tsx:89-94`; `Refresh now` and pause/resume call the handlers at `components/data/live-context.tsx:159-175`. Actual click behavior was not re-driven after the dev server stopped (see Notes/limitations).
- Content honesty is intact: `20.6%` and the context figures are explicitly national indicators, not platform results (`data/landing.ts:9-10,30-34`; `app/about/page.tsx:136-141,221-232`). This is already verified in `reports/content-integrity.md:13-26,61` and is not restated as a new finding.

### Suspected

None route-specific. The same stock-classroom alt text used at `app/about/page.tsx:43-48,282-287` carries the suspected image-description mismatch already owned by `reports/page-audits/for-students.md:27`; it is not re-scored here.

## Database/RLS findings

### Confirmed

- **D1 — MED — partial upstream failures are collected then silently dropped.** `lib/data/world-bank.ts:369-381` pushes each failed indicator/WHO fetch into `errors`, but the successful result at `:412-421` returns `ok: true` with no error list or partial flag. `components/data/live-context.tsx:70,94-100` derives `unavailable` only from `ok`, and `components/data/live-context.tsx:354-366` renders every returned indicator with no warning that some series failed. If, for example, WHO succeeds but several World Bank indicators fail, `/about` shows a shorter panel that looks complete. Why it matters: the section is labelled "Official statistics" and includes a "Why two numbers?" comparison, so a silently missing series can mislead readers about national conditions. **Fix:** add `partial` and `missing`/`errors` to `LiveContextResult`, populate them from `errors` at `lib/data/world-bank.ts:376,381`, and render an `UnavailableNote`-style warning at `components/data/live-context.tsx:354` naming the unavailable source(s) while retaining last good values.

- **Verified — no authz/RLS/injection surface on this route.** `app/about/page.tsx:65-66` only calls `getLiveContext()`. `lib/data/world-bank.ts:191-199,291-295` fetches public World Bank/WHO data; `app/api/context-data/route.ts:13-22` is a public aggregate endpoint with a 1-hour cache and no user identifiers, cookies, database client, mutation, or secrets. There is no user input to validate, no IDOR/BOLA target, no RLS policy to test, and no CSRF or rate-limit concern for this route. `security-review` and `api-security-testing` therefore add no defect here.

### Suspected

None.

## Severity summary

| Severity | Confirmed | Suspected | Items |
|---|---:|---:|---|
| HIGH | 0 | 0 | None on `/about`; prior site-wide HIGH contrast findings remain with `reports/accessibility-critic.md:29-31` and are not re-scored here. |
| MED | 2 | 1 | U1 invalid disclosure IDREFs; D1 silent partial upstream failure; S1 suspected market-photo provenance gap. |
| LOW | 1 | 0 | U2 dead `imageAlt` override. |
| Authz / RLS / injection | 0 | 0 | Public aggregate data only; no database or user-data surface. |

## Recommended fixes

1. **MED — U1:** give `CONTEXT_FACTS` stable identifier fields and pass those instead of labels at `app/about/page.tsx:172,175`; keep `components/interactive/animated-disclosure-list.tsx:77-78,90-93,117-119` unchanged so `aria-controls` becomes a single valid token.
2. **MED — D1:** propagate `errors` from `lib/data/world-bank.ts:369-381` into the success result at `:412-421`, then render a partial-data warning in `components/data/live-context.tsx:354-366`.
3. **MED — S1:** verify `/images/thimphu-market.webp` provenance; add a visible `PhotoCredit` backed by `components/ui/photo-credit.tsx:7-23` or replace the image with a registered Commons file. Do not guess an author or licence.
4. **LOW — U2:** remove the unused `imageAlt` at `app/about/page.tsx:255`, or include it in `accessibleLabel` at `:257`.
5. Leave the national-indicator wording, the verified source links, and the reduced-motion disclosure/pause behavior intact; no route-specific SEO, auth, or mutation change is needed.

## Notes/limitations

- **Live pass:** one Playwright pass succeeded at 1440×900 against `http://127.0.0.1:3000/about`. The page returned HTTP 200. Captured DOM: one `<title>` = `About | Bhutan Tech Connect`; canonical = `https://bhutantech.bt/about`; `og:title` = `About`; `og:image` = `https://bhutantech.bt/og-image.png`; `html lang="en"`; `main#main-content`; one `h1`; no duplicate `id` attributes; `body.scrollWidth === body.clientWidth === 1425`. The accessibility tree showed `banner`, `main`, `contentinfo`, labelled navigation regions, photo credits, a native "Official statistics" summary, disclosure buttons with `aria-expanded`/`aria-controls`, and `Refresh now` / `Auto-refreshing · Pause` controls. Console contained one dev-only HMR WebSocket handshake error, not a product defect.
- **Blocked after capture:** the dev server later became unreachable (`ERR_CONNECTION_REFUSED` on a new Playwright tab). Therefore `Refresh now`, pause/resume, disclosure expand/collapse, mobile 375×812 layout/overflow, and reduced-motion emulation were not re-driven in this audit. Those behaviors are assessed from source only; the completed live DOM evidence above is retained.
- **Static audit limits:** no physical screen reader, no 200% zoom run, no formal rendered contrast measurement, and no production Core Web Vitals. Image files were not visually inspected, so S1 remains a provenance gap rather than a licence finding, and the inherited `for-students.md:27` alt concern remains suspected.
- **Overlap references:** `reports/accessibility-critic.md:8,16,29-32,41,44` owns site-wide WCAG/contrast/motion; `reports/copy-critic.md:8,36` owns rendered copy and typography; `reports/content-integrity.md:13-26,39,61,65` owns verified facts, links, and credits; `reports/visual-recheck.md:48-49,104-105,119,125` owns the former `/about` bridge void, verification-row polish, and repeated-block residuals; `reports/performance-seo.md:28,65,79,99-107,231` owns site-wide metadata, image weight, and the now-resolved timeout concern; `reports/component-relevance-audit.md:28-29,63` owns component-necessity judgments; `reports/page-audits/for-students.md:27` owns the shared stock-photo alt question. `reports/orchestrator-audit.md:14,61,99` records the older OG-image and title issues that the current `lib/metadata.ts` plus existing `public/og-image.png` have corrected.
- **`webapp-testing` result:** used for the completed 1440×900 pass; later interaction steps are reported as not verified rather than passed.
