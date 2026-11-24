# Performance & SEO audit — bhutan-startup-platform

**Agent:** performance-seo (read-only critic)
**Date:** 2026-11-24
**Scope:** Next.js 16 App Router, local Supabase. Static source audit + live DOM/network check against `http://localhost:3000`.
**Runtime caveat:** the live server is `next dev` (Turbopack HMR chunk present in the DOM). Paint/timing numbers below are **diagnostic only**, not production Core Web Vitals. Field LCP/INP/CLS at p75, segmented mobile/desktop: **Not verified** (no RUM data, no production server exercised).

## Cross-reference

At time of writing the only file in `reports/` is `PROTOCOL.md`; no overlapping critic reports existed to cross-reference. All findings below are original to this audit. One product design document — `design/motion-library-decision.md` — **contradicts the current code** (see Finding 1).

---

## 1. Bundle risks

### Finding 1 — HIGH — GSAP and `@gsap/react` are dead weight; the motion decision doc is stale

**Evidence (source):** `package.json:15` (`@gsap/react`) and `:22` (`gsap`). `design/motion-library-decision.md:19` justifies keeping GSAP "for the two scroll chapters". But `components/marketing/home/desire-chapter.tsx:5-8` states the scroll-scrubbed scale/fade **was removed** and the chapter is static; `components/marketing/guides/pinned-step-chapter.tsx:3-6` states the scroll-triggered pin **was removed** and it is a static grid. The entire GSAP component set — `components/motion/image-scale-fade.tsx`, `scroll-pin.tsx`, `scrub-reveal.tsx`, `card-stack.tsx`, `_shared.ts` — has **zero consumers**: a repo-wide grep for `components/motion|@/components/motion` returned no matches beyond the files' own definitions and the barrel in `components/motion/index.ts`. The decision doc itself quotes GSAP at **27.29 kB minimum**.

**Evidence (compiled artifacts — see correction 2026-11-24 below):** `.next` contains **dev** output, not a production build. `ScrollTrigger` does appear in `.next/dev/static/chunks/_1yri-pfn1tr_h._.js`, but that chunk embeds an **older** `DesireChapter` implementation (comment "one GSAP scroll moment", `useGSAP`, `gsap.matchMedia`) that no longer matches current source. Compiled artifacts here are stale and were therefore discarded as bundle evidence; the zero-consumer conclusion rests on the source grep above.

**Impact:** Installed but unused animation runtime and ~27 kB of potential bundle, plus a decision record that will mislead future maintainers. Removal is a zero-behavior-change win.

**Fix:** Delete `components/motion/*` and remove `gsap`, `@gsap/react` from `package.json`; update `design/motion-library-decision.md` to record that only Motion remains. (Do not add dependencies.)

### Finding 2 — MEDIUM — Cold-cache TTFB depends on 7 external API calls with no timeout

**Evidence:** `lib/data/world-bank.ts:357-365` fires 6 World Bank indicator fetches (`:191-199`) + 1 WHO fetch (`:290-294`) via `getLiveContext()`, called by `app/public/page.tsx:36` and `app/about/page.tsx:54`. `next: { revalidate: 3600 }` caches for an hour, but there is no `AbortSignal.timeout` and no static seed fallback (`:281-287`, `:348-354` only catch errors after the fact).

**Impact:** On cache expiry, a slow/hung upstream can block SSR of the two highest-traffic marketing pages. Runtime dev TTFB was 69 ms (cache warm); cold-cache production TTFB **Not verified**.

**Fix:** Add per-request timeouts and a checked-in fallback payload so a slow API never blocks first paint.

### Finding 3 — LOW — Motion client surface is loaded on every route

**Evidence:** `app/layout.tsx:4,125` wraps all children in `MotionProvider` → `components/ui/motion-provider.tsx:1-7` (`"use client"`, imports `motion/react`). `components/marketing/site-header.tsx:1-7` is `"use client"` on every marketing page and imports `AnimatePresence`, `motion`, `useReducedMotion` plus `@phosphor-icons/react`. Static legal pages (`app/privacy/page.tsx`, `app/terms/page.tsx`) have zero Motion usage yet still hydrate the provider and header.

**Impact:** Motion core is small per the decision doc (3.12 kB), so INP risk is low, but hydration work is paid on pages that need none of it. No render-blocking CSS issue: runtime showed exactly one stylesheet link.

**Fix:** Optional — scope `MotionProvider` to routes that animate, or reduce the header to a server shell with a small client island for the mobile menu.

### Finding 4 — LOW — Two unused runtime dependencies

**Evidence:** `package.json:16` `@next/bundle-analyzer` (not wired into `next.config.ts:5-21`; belongs in devDependencies; pulls `webpack-bundle-analyzer` per `package-lock.json:1474-1480`). `package.json:21` `@tanstack/react-virtual` — no `useVirtualizer` usage anywhere in source.

**Impact:** Install/audit surface and lockfile bloat only; no client bundle impact.

**Fix:** Remove both, or move the analyzer to `devDependencies`.

---

## 2. Image performance

### Finding 5 — HIGH — LCP hero is under-resolution for its desktop display area

**Evidence (source):** `app/public/page.tsx:55-62` uses `/images/bhutanese-students.jpg` as a full-bleed `fill` hero with `sizes="100vw"`. The same asset is the hero on `/how-it-works:87`, `/for-students:103`, `/for-founders:31`, `/about:36`, `/faq:201` via `GuideHero`/`PageHero`.

**Evidence (actual bytes/dimensions):**
| File | Bytes | Dimensions |
|---|---|---|
| bhutanese-students.jpg | 130,440 (127.4 KB) | **960 × 581** |
| bhutanese-community.jpg | 228,529 (223.2 KB) | 960 × 520 |
| bhutanese-team.jpg | 183,701 (179.4 KB) | 960 × 640 |
| bhutan-valley.webp | 564,238 (551 KB) | n/a |
| thimphu-market.webp | 419,022 (409 KB) | n/a |
| punakha-dzong.webp | 280,346 (273.8 KB) | n/a |
| team-project-work.jpg | 252,852 (246.9 KB) | 1600 × 1067 |
| students-collaborating.jpg | 246,828 (241 KB) | 1600 × 1067 |
| founder-briefing.jpg | 163,348 (159.5 KB) | 1600 × 1067 |

**Evidence (runtime, `/public`):** hero `clientWidth: 1521`, `currentSrc: /_next/image?...&w=1920&q=75`, but `naturalWidth: 768` — the source is only 960 px wide, so the hero is upscaled ~1.6× at 1× DPR and ~3× on a retina display. It is the LCP candidate.

**Good news:** `priority` and correct `sizes` **are** set on all above-the-fold images (`app/public/page.tsx:59-60`; `components/marketing/guides/guide-hero.tsx:74-76`; `components/marketing/page-hero.tsx:113-115,168-170`). Next emits an image `<link rel=preload imagesrcset=…>` (verified) and a font preload (verified). Below-fold images use `loading="lazy"` (verified). Remaining in-view images are close to their display box (community 960 px source → 704 px box; team 960 px → 731 px box), so only the hero is genuinely oversized for display.

**Fix:** Supply a ≥1920 px hero asset. Two unused 1600×1067 assets already exist (`team-project-work.jpg`, `students-collaborating.jpg`); re-export one at the right crop if its photo credit can be matched, otherwise replace the source file. Do not merely change `sizes` — that would reduce sharpness further.

### Finding 6 — LOW — Six unused images ship in `/public` (~1.82 MiB)

**Evidence:** Repo-wide grep across `*.{ts,tsx,css,json}` found **zero references** to `bhutan-valley.webp`, `thimphu-market.webp`, `punakha-dzong.webp`, `students-collaborating.jpg`, `team-project-work.jpg`, `founder-briefing.jpg`. Combined size 1,906,898 bytes (~1.82 MiB); all return 200 at runtime.

**Impact:** No page loads them, so no direct CWV cost; deployment payload and crawlable dead assets only.

**Fix:** Delete or move out of `public/`; keep two of the 1600 px JPGs if used for Finding 5.

---

## 3. SEO

### Finding 7 — HIGH — Duplicate `<title>` and `<meta name="description">` on every route

**Evidence (source):** `app/layout.tsx:29-34` hard-codes `<title>Bhutan Tech Connect</title>` and a generic `<meta name="description">` inside a manual `<head>`. Every public page also exports `metadata` with its own title/description: `app/public/page.tsx:25-30`, `app/how-it-works/page.tsx:21-25`, `app/for-students/page.tsx:22-26`, `app/for-founders/page.tsx:24-29`, `app/about/page.tsx:22-27`, `app/faq/page.tsx:14-19`, `app/contact/page.tsx:14-19`, `app/privacy/page.tsx:7-14`, `app/terms/page.tsx:7-14`.

**Evidence (runtime, `/public`):** `titles: ['Bhutan Tech Connect | Local talent. Real projects.', 'Bhutan Tech Connect']`, `descriptions.length: 2`. Reproduced on `/`, `/how-it-works`, `/for-students` — every route has 2 `<title>` and 2 descriptions.

**Impact:** Search engines may index the generic layout title instead of the unique page title; duplicate description dilutes snippet control. This is the single most damaging SEO defect found.

**Fix:** Remove the manual `<title>` and `<meta name="description">` from `app/layout.tsx:29-34`; export `metadata` from the layout with a default `title.template` / `description` so pages inherit or override cleanly.

### Finding 8 — HIGH — Open Graph / Twitter metadata is global, static, and partly invalid

**Evidence (source):** `app/layout.tsx:64-80` defines all OG/Twitter tags once with home-page values; no page overrides them. `og:image` is the relative path `/og-image.svg` (`:72`). `twitter:card = summary_large_image` (`:75`) but there is **no `twitter:image`** anywhere.

**Evidence (runtime):** On `/how-it-works` and `/for-students`, `ogTitle: 'Bhutan Tech Connect'`, `ogUrl: 'https://bhutantech.bt/'`, `ogImage: '/og-image.svg'`, `twitterImage: undefined`. `GET /og-image.svg` → 200 `image/svg+xml` (1,358 bytes).

**Impact:** Every shared page renders the home preview (wrong title/URL). Major social crawlers (Facebook, X, LinkedIn) require an absolute image URL and generally reject SVG OG images; `summary_large_image` without `twitter:image` produces no large preview.

**Fix:** Move OG/Twitter into per-page `metadata` exports; use an absolute HTTPS URL and a PNG/JPEG OG image; add `twitter:image` with dimensions.

### Finding 9 — MEDIUM — Canonical gaps and a self-contradicting home canonical

**Evidence (source + runtime):**
- `app/how-it-works/page.tsx:21-25` and `app/for-students/page.tsx:22-26` export only `title`/`description`; runtime `canonical: []` on both.
- `app/public/page.tsx:29` canonical = `https://bhutantech.bt/`, but `app/page.tsx:2` redirects `/` → `/public`. Runtime: requesting `/` lands on `/public`.
- `app/sitemap.ts:5-17` lists **both** `/` and `/public` with `priority: 1`.

**Impact:** Two of six marketing pages have no canonical signal; home canonical points at a redirecting URL while the sitemap presents two home URLs — duplicate-content ambiguity.

**Fix:** Add `alternates.canonical` to every public route pointing to its own URL; choose one home (prefer making `/` serve the content and redirect `/public` → `/`, or set `/public` canonical and drop `/` from the sitemap).

### Finding 10 — MEDIUM — Invalid JSON-LD: broken logo URL and a search action with no search

**Evidence (source):** `app/layout.tsx:83-113` emits two JSON-LD blocks. `:93` sets `logo: "https://bhutantech.bt/logo.png"` — **no `logo.png` exists in `public/`; `GET /logo.png` returns 404** (runtime verified). `:106-110` declares a `WebSite` `SearchAction` targeting `https://bhutantech.bt/?q={search_string}`, but no route reads a `q` parameter (`app/page.tsx` only redirects; login/signup read `error`/`message`).

**Impact:** Structured data points to a missing image and advertises a feature that does not exist — a rich-result rejection / manual-action risk. There is also no `FAQPage` schema on the FAQ page, despite 11 Q&As (`app/faq/page.tsx:33-188`) that qualify.

**Fix:** Point `logo` to an existing absolute asset (e.g. `/icon-512.png`); remove `SearchAction` until search ships; optionally add `FAQPage` JSON-LD to `app/faq/page.tsx`.

### Finding 11 — LOW — Sitemap freshness signal and no private-route disallow

**Evidence:** `app/sitemap.ts` sets `lastModified: new Date()` for all 12 URLs (e.g. `:7,14,21`), so every deploy claims all pages changed. `app/robots.ts:4-9` is `allow: '/'` with no `disallow` for `/admin`, `/founder`, `/student`, `/api`; `/login` and `/signup` are in the sitemap (`sitemap.ts:66-77`).

**Impact:** Low — those routes are auth-gated, so indexing risk is limited; the main loss is a noisy `lastmod` signal. **Sitemap completeness is otherwise good:** all six marketing pages (`/`, `/public`, `/how-it-works`, `/for-students`, `/for-founders`, `/about`) plus `/faq`, `/contact`, `/privacy`, `/terms` are present, and `/sitemap.xml` + `/robots.txt` both render 200 at runtime.

**Fix:** Use real content modification dates; add `Disallow: /api/` and consider dropping auth pages from the sitemap.

---

## 4. Core Web Vitals risks

- **CLS — low risk.** Hero `fill` images sit in sized parents (`app/public/page.tsx:54`, `min-h-[88vh]` section), `Geist` uses `display: "swap"` with a preloaded woff2 (`app/layout.tsx:7-11`; runtime font preload verified), and all motion uses `opacity`/`transform` only (`components/ui/motion.tsx`, `hero-motion.tsx:42-47`). No layout-affecting animation found. The `legal-mount` translateY on privacy/terms headings (`app/privacy/page.tsx:16-27`; `app/terms/page.tsx:16-27`) is transform-based and respects `prefers-reduced-motion`.
- **LCP — elevated risk.** Finding 5 (under-resolution hero) plus the potential 7-call SSR dependency (Finding 2). No `fetchpriority="high"` on the priority image at runtime (`fp: null`) — Next emits the preload but no high-priority hint; minor upside available.
- **INP — low risk.** Client surface is limited to `MotionProvider`, `SiteHeader`, `Reveal`/`Stagger`, `TextReveal`, `LiveContext`. No heavy data grids on public routes. `@tanstack/react-virtual` is installed but unused. One 60 s clock interval + 10 min poll in `components/data/live-context.tsx:97-104` re-renders only the statistics panel.
- **Render-blocking — low risk.** Runtime showed a single `rel=stylesheet` (Next CSS chunk). Dev HMR script is dev-only.
- **Production CWV — Not verified.** Runtime FCP 132 ms / load 301 ms / TTFB 69 ms came from `next dev`; the LCP performance entry list was empty at measurement time. No field/RUM data exists. These numbers must not be quoted as production CWV.

---

## 5. Quick wins ranked by impact / effort

| # | Fix | Impact | Effort | Exact location |
|---|---|---|---|---|
| 1 | Delete manual `<title>` + `<meta description>`; move defaults to layout `metadata` | HIGH | 15 min | `app/layout.tsx:29-34` |
| 2 | Replace broken JSON-LD logo URL; remove `SearchAction` | MEDIUM | 10 min | `app/layout.tsx:93`, `:106-110` |
| 3 | Add canonical to `/how-it-works` and `/for-students`; decide single home canonical | MEDIUM | 15 min | `app/how-it-works/page.tsx:21-25`, `app/for-students/page.tsx:22-26`, `app/public/page.tsx:29`, `app/sitemap.ts:5-17` |
| 4 | Move OG/Twitter tags into per-page metadata; absolute URL + raster image + `twitter:image` | HIGH | 30-45 min (incl. PNG) | `app/layout.tsx:64-80` |
| 5 | Remove unused GSAP deps and `components/motion/*`; update decision doc | MEDIUM | 20 min | `package.json:15,22`, `components/motion/*`, `design/motion-library-decision.md:19` |
| 6 | Ship/reuse a ≥1920 px hero image | HIGH (visual + LCP) | 30 min | `app/public/page.tsx:55-62`, `public/images/bhutanese-students.jpg` |
| 7 | Add fetch timeouts + static fallback for live statistics | MEDIUM | 30 min | `lib/data/world-bank.ts:191-199,290-294,357-365` |
| 8 | Delete six unreferenced images from `public/images` | LOW | 5 min | `public/images/*` (see Finding 6) |
| 9 | Remove unused deps `@next/bundle-analyzer`, `@tanstack/react-virtual` | LOW | 5 min | `package.json:16,21` |
| 10 | Add `fetchPriority="high"` to the priority hero | LOW | 5 min | `app/public/page.tsx:55-62`, `guide-hero.tsx:71-78`, `page-hero.tsx:110-117` |

---

## Verdict

**FAILS international-standard SEO; performance is plausibly sound but unverified in production.**

Three high-severity concrete defects: duplicate title/description tags on every route, global/static social metadata with an invalid OG image and missing `twitter:image`, and an unused GSAP runtime that contradicts the project's own decision record. Two of six marketing pages lack canonical URLs, and the JSON-LD advertises a missing logo and a non-existent search endpoint. Image handling is otherwise disciplined (`priority`, `sizes`, lazy below-fold, font preload, single stylesheet), but the desktop LCP hero is a 960 px source stretched to ~1520 px. Field CWV and production bundle sizes are **Not verified** because only the dev server was available.

### Three highest-impact fixes
1. **Remove the duplicate manual `<title>`/description in `app/layout.tsx:29-34`** and centralise metadata in the Metadata API — fixes snippet/title quality on all 10 public routes at once.
2. **Replace the invalid OG/Twitter block in `app/layout.tsx:64-80`** with per-page metadata, an absolute raster `og:image`, and a real `twitter:image` — unlocks correct social sharing for every page.
3. **Remove the dead GSAP runtime** (`package.json:15,22`, `components/motion/*`) and correct `design/motion-library-decision.md` — a zero-behavior-change bundle and maintenance win — then address the under-resolution hero asset.

---

## Correction — 2026-11-24 (appended)

A follow-up scan of `.next` invalidated one piece of supporting evidence and confirmed the runtime caveat:

- The chunk head of `.next/static/chunks/3jn_x8ihwq16e.js` begins `(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push([...])`, and the DOM loads `/_next/static/chunks/[turbopack]_browser_dev_hmr-client_…js`. **`.next` is a dev build; there is no production build to measure.** Finding 1's original claim that "no gsap/ScrollTrigger markers were found in production chunks" was wrong and has been removed above.
- `ScrollTrigger` appears in 15 files under `.next/dev`, including `.next/dev/static/chunks/_1yri-pfn1tr_h._.js:636-664`. That chunk contains an **older** `DesireChapter` with `useGSAP`, `gsap.matchMedia()` and a scrollTrigger timeline — code that does **not** exist in the current `components/marketing/home/desire-chapter.tsx`, which is static. The compiled output is stale. This reinforces, rather than weakens, Finding 1: current source has zero GSAP consumers, and the running dev server may be serving stale component code.
- Consequence: **all runtime numbers remain diagnostic only** (already marked Not verified for production CWV). The DOM-level SEO evidence is unaffected — duplicate titles/descriptions, missing canonicals, static OG tags, and the `/logo.png` 404 were all read from the served HTML and independently match current source lines.
- No severity, verdict, or top-three ranking changes.
