# `/public` page audit

## Route

`/public` — public, unauthenticated landing page. Server component (`app/public/page.tsx:35-382`) that awaits `getLiveContext()` at `:36`, renders the hero, a four-cell bento, national-context disclosures, a compact live-statistics panel, the "Why two numbers?" note, shared brand/product sections, a closing CTA, and the site footer. Read-only audit of the current working tree; uncommitted user changes are authoritative. No product source, config, schema, test, or existing report was edited.

## Files traced

| File | Role |
|---|---|
| `app/public/page.tsx:1-382` | Sole route under audit. Working copy replaces `ScaleFadeImage` with `Reveal` at `:5,131`. |
| `components/data/live-context.tsx:1-458` | Client polling, refresh/pause controls, compact panel mounted at `app/public/page.tsx:300`. |
| `lib/data/world-bank.ts:1-437` | Server data source behind `getLiveContext()`; six World Bank series plus one WHO series. |
| `app/api/context-data/route.ts:1-23` | Public JSON refresh endpoint used by `live-context.tsx:90`. |
| `data/landing.ts:9-57` | Hard-coded press-release figure (`YOUTH_UNEMPLOYMENT`) and source constants. |
| `components/interactive/animated-disclosure-list.tsx:1-155` | Buttons and panels for `CONTEXT_FACTS` at `app/public/page.tsx:256-277`. |
| `components/marketing/site-header.tsx:1-212`, `site-footer.tsx:1-69`, `cta-band.tsx`, `nav.ts:34-92` | Shared public chrome and CTA constants. |
| `components/motion/scrubbed-text-reveal.tsx:1-104`, `components/ui/motion.tsx` | Reduced-motion branches used at `app/public/page.tsx:122-126`. |
| `components/ui/photo-credit.tsx`, `components/brand/local-bridge-differences.tsx`, `components/marketing/product-preview/shortlist-preview.tsx` | Credits, brand chapter at `:367`, product sample at `:370`. |
| `lib/metadata.ts`, `app/layout.tsx` | `metadataBase` and canonical/OG resolution. |
| `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `reports/page-audits/INDEX.md` | Reporting protocol, skill precedence, cross-reference index. |
| Installed Next.js 16 guides in `node_modules/next/dist/docs/` | Checked before source review: `12-images.md`, `14-metadata-and-og-images.md`, `public-static-pages.md`. |

## Skills used

| Skill | What it informed |
|---|---|
| `unslop` | Hero/proposition repetition (U2), disclosure/link proliferation judgment. |
| `better-interface` | Bento hierarchy, disclosure placement, CTA priority. |
| `better-layout` | 1440px and 390px grid behavior, `min-h-[88vh]` hero, compact-panel flow. |
| `better-ui` | Focus rings, source-link styling, photo-credit treatment (U3). |
| `better-writing` | Three restatements of the same value proposition (U2), "Why two numbers?" wording. |
| `frontend-a11y` | `aria-controls`/`aria-expanded` semantics (U4, W3, W4), labelled landmarks, heading order. |
| `better-accessibility` | WCAG 2.2.2 pause requirement, computed contrast, keyboard reachability. |
| `webapp-testing` | Live Playwright MCP pass at 1440×900 and 390×844; isolated browser contexts. |
| `security-review` | Boundary review of `getLiveContext()` and the public API route. |
| `api-security-testing` | `/api/context-data` input/auth/rate-limit review (D2). |

Precedence from `reports/SKILL-ASSIGNMENTS.md` was applied: taste/interface judgments lead over generic copy advice; accessibility findings are graded against WCAG, not preference.

## UI/UX findings

**Confirmed — MED — `app/public/page.tsx:296-301` and `components/data/live-context.tsx:436-443`.** The compact panel tells readers the annual figures are "separate from the press release figure" and to "See the note on the About page", while the full explanation is already on this page at `app/public/page.tsx:302-364`. Why it matters: a reader inside the disclosure is sent to another route for information two pixels below the panel, which weakens the trust story the page is built around. Fix: change the link at `live-context.tsx:439` to `href="#why-two-numbers"` with text "See the note below on this page", or drop the sentence because `app/public/page.tsx:310-362` already carries it.

**Confirmed — LOW — `app/public/page.tsx:79`, `:83-84`, `:155-158`.** The same proposition is stated three times: "Students find paid projects. Founders post the brief."; "Local students and founders, connected through focused, paid project work."; "Founders set a clear brief and budget, students apply with the right skills, and both sides learn by doing." Why it matters: the hero subhead adds no new information and pushes the first proof point down the page. Fix: replace `:82-85` with one concrete differentiator (for example, what a student receives after applying) or remove that paragraph and keep the headline plus the bento explanation.

**Confirmed — LOW — `app/public/page.tsx:102-104`.** The hero photo credit is `text-[11px]` with `text-[#f5f2ea]/75` over a photographic background whose radial wash fades to transparent at the edges (`app/public/page.tsx:64-71`). Why it matters: attribution is legally required and its contrast cannot be guaranteed across the image; this is a legibility/provenance risk, not a measured WCAG failure. Fix: add a small solid `bg-[#0d1813]/70` chip behind the credit, raise it to `text-xs`, and keep `/85` or full opacity.

**Cross-referenced, not duplicated — `app/public/page.tsx:261-262` and `components/interactive/animated-disclosure-list.tsx:77-78,90-93,117-119`.** Passing `fact.label` as the item `id` produces `aria-controls` values containing spaces (for example `_R_…_-Real GDP growth projected for FY25/26-panel`). This is the exact defect already owned by `reports/page-audits/about.md:39` (U1); it also applies here. Do not re-score it as a new `/public` finding — fix it once in the component by adding stable slug IDs to `CONTEXT_FACTS` and passing `id: fact.id`.

**Verified — no new finding.** One `h1` at `app/public/page.tsx:75-80`; labelled `section`s at `:51,110,209,302`; `main#main-content` skip target at `:42-44`. H1 computed 72px/70.56px at 1440×900 and 28px/29.12px at 390×844, matching the clamp at `:77`, so the older h1-clamp concern is resolved. Mobile `scrollW=390`, `clientW=390` — no horizontal overflow. Computed contrast passes AA for normal text: footer `#56645c` on `#f5f2ea` is 5.57:1, footer nav `#5e554a` is 6.53:1, "Why two numbers?" composite `#69716c` on `#fffefa` is 4.98:1, bento caption `#b9c2bf`-equivalent `white/70` on `#17352b` is 7.30:1. The previously reported light bento CTA cell at `:187` and footer colour at `site-footer.tsx:34,57,61` are resolved in the current source and are not re-reported.

## Workflow findings

**Confirmed — MED — `app/public/page.tsx:296-301` and `components/data/live-context.tsx:409-415`.** The `Refresh now` and pause controls are rendered only after the reader opens the native `<details>` summary "Official statistics". Why it matters: WCAG 2.2.2's keyboard-operable pause exists in source but is two interactions away from a reader who is trying to stop auto-updating content. Fix: keep the controls in the compact panel but duplicate a single visible "Pause updates" control next to the `<summary>`, or open the `<details>` by default on this route.

**Confirmed — MED — `components/data/live-context.tsx:52-66,73-76,112-113` with `app/api/context-data/route.ts:13,18-21`.** `now` is seeded from `initial.checkedAt` and only advanced by a 60-second interval, so the relative label reads "checked just now" for the first minute even when the cached response is up to an hour old (`s-maxage=3600`). Why it matters: a page whose theme is honest data freshness overstates freshness on every client refresh and on every initially cached load. Fix: add `useEffect(() => setNow(Date.now()), [])` so the relative label corrects immediately after hydration, or render only the absolute timestamp until a real client clock is available.

**Confirmed — LOW — `components/marketing/site-header.tsx:130,147-157`.** The menu button declares `aria-controls="marketing-mobile-nav"`, but `AnimatePresence` renders that element only when `open` is true. Runtime at 390×844 confirmed `targetExists=false` while the button reports `aria-expanded="false"`. Why it matters: some assistive technologies report a broken reference on the closed state. Fix: always render the container with `hidden`/`inert` toggled, or omit `aria-controls` while closed and add it only when the panel exists.

**Suspected — HIGH (requires production verification) — `components/interactive/animated-disclosure-list.tsx:57-69,89-94`, `components/data/live-context.tsx:133-136,159-175`, `components/marketing/site-header.tsx:126-143`.** In the dev-server runtime pass, no client handler changed state: the first disclosure stayed `aria-expanded="true"` after pointer click and Enter, the second stayed `"false"`, the pause button kept `aria-pressed="false"` and the text "Auto-refreshing · Pause", the mobile menu kept `aria-expanded="false"`, and `data-scrub-progress` stayed `"static"` after scrolling. Only two DOM nodes carried React fiber markers, and the HMR WebSocket failed repeatedly (`net::ERR_INVALID_HTTP_RESPONSE`). Why it matters: if this reproduces in production, all route interactivity — disclosures, pause, refresh, mobile navigation, scroll reveal — is inert. Fix: verify against a production build on a clean server; if it reproduces, capture the hydration error and fix the root cause before treating the individual controls as broken. This is **not** recorded as a confirmed product defect.

**Verified in source — no live re-drive.** The single native `<details>` opened on click in the runtime pass. Source wiring for refresh/pause is present at `live-context.tsx:159-175` and disclosure toggles at `animated-disclosure-list.tsx:57-69,94`. No duplicate "Why two numbers?" block exists in the compact panel, so the page-level note at `:302-364` is the only copy on this route.

## Database/RLS findings

**Confirmed — no DB/RLS defect on this route.** `app/public/page.tsx:1-23` contains no Neon/Supabase client, no server action, no mutation, no cookies/headers read, and no user input. `getLiveContext()` (`lib/data/world-bank.ts:359-437`) fans out to fixed public World Bank and WHO URLs (`:24-27,175-177,146-148`) with 5-second timeouts and no caller-controlled URL, so there is no SSRF surface. `app/api/context-data/route.ts:15-22` returns only aggregate public statistics with `Cache-Control: public, s-maxage=3600`; no identifiers, secrets, or row-level data are exposed. This matches the verified conclusion for the sibling route at `reports/page-audits/about.md:71` and is cross-referenced rather than restated as a new finding. Injection, IDOR/BOLA, mass assignment, CSRF, and RLS policy testing are not applicable.

**Suspected — LOW — `app/api/context-data/route.ts:13-22` and `lib/data/world-bank.ts:364-367`.** The public endpoint triggers seven upstream fetches (`INDICATORS.map(fetchWorldBankIndicator)` plus `fetchWhoLifeExpectancy`). The one-hour `revalidate` mitigates normal load, but no explicit per-client rate limit is present at the route boundary. Why it matters: cache-busting or direct origin requests can amplify outbound traffic and 5-second timeouts. Fix: rely on the platform WAF/rate limiter for this public aggregate route, or add a small in-memory request coalescer keyed by hour; do not add authentication to a public statistics endpoint.

**Verified honesty — no new finding.** The 20.6% press-release figure (`data/landing.ts:31`, rendered at `app/public/page.tsx:164`) and the modeled 17.1% / 20.609% API observations are explicitly distinguished at `app/public/page.tsx:311-338`; this is already owned by `reports/content-integrity.md:13-26` and is not duplicated here. The `youth` lookup at `app/public/page.tsx:37-39` has a safe fallback at `:339-352` when the indicator is missing.

## Severity summary

| Severity | Confirmed | Suspected | Notes |
|---|---|---|---|
| HIGH | 0 | 1 | W4 — client interactivity unresponsive in dev runtime; verify in production before accepting. |
| MED | 3 | 0 | Two workflow findings plus the self-referential About-page link. |
| LOW | 4 | 1 | Three UI findings, one header ARIA reference, one suspected endpoint rate-limit gap. |
| Cross-referenced (not counted) | 1 | 0 | Invalid `aria-controls` IDREF, owned by `reports/page-audits/about.md:39`. |

## Recommended fixes

1. **Suspected HIGH — W4:** run a production build on a separate port and re-drive disclosure, pause, refresh, and mobile-menu clicks. If they still fail, capture the hydration error and fix before any further polish.
2. **MED — U1:** point `components/data/live-context.tsx:439` at `#why-two-numbers` on the same page.
3. **MED — W1:** surface one visible pause control beside the `Official statistics` summary at `app/public/page.tsx:297`.
4. **MED — W2:** set `now = Date.now()` in a mount effect in `components/data/live-context.tsx` so "checked just now" is never shown for a stale cached payload.
5. **LOW — U2:** remove or replace the duplicated hero subhead at `app/public/page.tsx:82-85`.
6. **LOW — U3:** back the hero photo credit at `app/public/page.tsx:102-104` with a translucent dark chip and raise its size.
7. **LOW — W3:** keep `marketing-mobile-nav` in the DOM while closed, or conditionally omit `aria-controls`.
8. **LOW — D2:** confirm platform rate limiting for `/api/context-data`; add request coalescing only if origin fan-out is measurable.
9. **Shared fix (not re-scored):** add stable IDs to `CONTEXT_FACTS` and pass `id: fact.id` at `app/public/page.tsx:262`, resolving the issue owned by `reports/page-audits/about.md:39` for both routes.

## Notes/limitations

- **Working tree:** `app/public/page.tsx` is uncommitted; the working copy replaced `ScaleFadeImage` with `Reveal` at `:5,131`. That version is the source of truth and no file was changed by this audit.
- **Runtime pass:** dev server reachable at `http://127.0.0.1:3000/public` (`200`, 110,492 bytes). Playwright MCP was driven in fresh isolated `browser.newContext()` instances at 1440×900 and 390×844 because shared tabs were being moved by concurrent agents. Captured: title `Paid project work in Bhutan | Bhutan Tech Connect`, canonical `https://bhutantech.bt/public`, OG image `https://bhutantech.bt/og-image.png`, `lang=en`, viewport meta, one H1, no horizontal overflow at 390px, closed-by-default native `<details>` that opens on click, lazy fourth image that loads on scroll (`bhutanese-team.jpg&w=750&q=75`, `nw=648`, `nh=432`), and no failed HTTP requests. The only console errors were repeated dev HMR WebSocket handshake failures.
- **Not verified:** production build (explicitly not run while `next dev` was active), Core Web Vitals, physical screen reader, 200% zoom, keyboard tab order, reduced-motion emulation, and visual inspection of image contents. W4 is therefore suspected, not confirmed.
- **Cross-references:** `reports/page-audits/about.md:39,71` owns the disclosure-ID defect and the no-DB/RLS conclusion; `reports/content-integrity.md:13-26` owns figure accuracy; `reports/accessibility-critic.md` and `reports/brand-tokens.md` own site-wide contrast; `reports/performance-seo.md` owns site-wide metadata and image weight; `reports/copy-critic.md` owns site-wide copy. Conflicts where the current source contradicts older reports (h1 clamp, bento CTA cell, footer colour) are marked resolved above rather than re-raised.
