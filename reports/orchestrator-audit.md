# Independent audit of orchestrator work — Bhutan Tech Connect

**Auditor:** orchestrator-audit (read-only). No product source edited.
**Audit window / as-of:** 2026-11-24 10:12–10:17 +06:00. The orchestrator was **editing product source during this audit** (file mtimes 10:11:53, 10:12:12, 10:13:03); all findings below reflect the state at the time stated. A later re-audit is required if further edits land.

## Scope

Verified every fix claimed in `reports/orchestrator.md` plus the HIGH findings of `accessibility-critic.md`, `copy-critic.md`, `visual-critic.md`, `performance-seo.md`; checked regressions; independently ran `tsc`, `lint`, `test`, `build`; measured **rendered** contrast in the live dev server (canvas-resolved RGB + WCAG ratio); audited the orchestrator's own verification claims. Did not run `supabase db reset` or E2E (mutate shared state).

## Ranked findings

| # | Sev | Location | Proof / impact |
|---|---|---|---|
| 1 | **HIGH (new regression)** | `app/layout.tsx:34,46` | SEO fix changed OG/Twitter image to `/og-image.png`, but **only `public/og-image.svg` exists**. Live `GET /og-image.png => 404`; rendered DOM: `og:image = https://bhutantech.bt/og-image.png` (same for Twitter). Every social share now has a broken preview image. Previously `/og-image.svg` returned 200. `metadataBase` at `layout.tsx:15` makes the URL absolute, so this is a missing-file bug, not a URL-resolution bug. |
| 2 | **HIGH (unfixed)** | `app/how-it-works/page.tsx:207`; `app/for-students/page.tsx:166`; `app/faq/page.tsx:207`; `app/contact/page.tsx:78,173` | `visual-critic.md` HIGH #1 (repeated bento) still present verbatim: `gap-px overflow-hidden rounded-[2rem] bg-[#17352b]/15`. No editorial-archetype refactor landed. |
| 3 | **HIGH (unfixed)** | `package.json:15,22` | `performance-seo.md` HIGH #1: `@gsap/react ^2.1.2` and `gsap ^3.15.1` still installed with zero source consumers. Not removed. |
| 4 | **HIGH (unfixed)** | `public/images/bhutanese-students.jpg` | `performance-seo.md` HIGH #5: measured **960×581 / 130,440 bytes**, used as full-bleed `sizes="100vw"` hero. Still ~1.6× upscaled at 1× DPR. No ≥1920px replacement shipped. |
| 5 | **HIGH (report integrity)** | `reports/orchestrator.md:3-4,18,108-124` | Report states "WAITING", "edits paused", "No verification gates have been run since those edits" (mtime 10:07:42). This is false: source was edited at 10:11–10:13+, the dev server was restarted, and gates have now been run (by me). The report records none of the fixes that actually landed and gives no command/result evidence for any gate. It is not a trustworthy coordination record. |
| 6 | MEDIUM | `app/admin/page.tsx:150`; `app/admin/students/admin-students-client.tsx:175` | Orchestrator's own HIGH #7 em-dashes remain in **rendering** strings: `` ` — Nu ${...}` `` and `'Copy failed — select the text manually.'`. Legal pages are fixed; admin is not. |
| 7 | MEDIUM | `app/for-founders/page.tsx:131`; `app/founder/page.tsx:127`; `components/auth/auth-shell.tsx:51`; `components/marketing/home/desire-chapter.tsx:22` | Generic headlines ("Turn a challenge into a project", "Local talent. Real projects.", "A platform for people building here.") still present. `/how-it-works` and public metadata were fixed; these four were not. |
| 8 | MEDIUM | `app/public/page.tsx:280`; `app/contact/page.tsx:235`; `app/faq/page.tsx:302`; `app/for-students/page.tsx:192`; +6 more | `copy-critic.md` typography finding unfixed: `text-lg` (18px) with `tracking-tight` / `tracking-[-0.02em]` — negative tracking on sub-24px text. 10 sites in `app/**`. |
| 9 | MEDIUM | `app/public/page.tsx:88` | Last remaining `font-bold` on a CTA in the public page (`text-sm font-bold` on the amber hero button). `font-bold` was removed at `:206` and in `CtaBand`/`submit-button`; this one was missed. |
| 10 | MEDIUM | `app/about/page.tsx:232`; `app/for-founders/page.tsx:154,368` | `visual-critic.md` MEDIUM #4: `font-bold` + `tracking-[0.16em]`/`[0.14em]` on step numerals and price labels — the clearest remaining anti-slop tell. |
| 11 | LOW | rendered `<title>` on `/public` | `"Bhutan Tech Connect \| Paid project work in Bhutan \| Bhutan Tech Connect"` — brand repeated. Caused by layout `title.default` already containing the brand plus `title.template` (`:16-19`). Cosmetic but index-facing. |

## What I independently verified as FIXED (with evidence)

- **Public agreement CTA (copy HIGH):** `app/for-founders/page.tsx:397-400` now `CtaBand primaryCta={{ href: "/contact", label: "Ask for founder access" }}`. Grep for `Download agreement` / `/founder/shortlists/agreement` in that page: **0 matches**.
- **Legal em-dashes:** `app/privacy/page.tsx:10,170` and `app/terms/page.tsx:10,171` use colons/periods; grep for `—` in both returns only the JSDoc comment on line 2.
- **Contrast — all three accessibility HIGHs now PASS in rendered DOM** (canvas-resolved, live server): footer tagline `#56645c` on `#f5f2ea` = **5.57:1** (was 4.23:1); vermilion cell solid white on `#b23c26` = **5.89:1** (was 3.40:1); remaining low-alpha text = **4.99–6.11:1**. Source grep for `#7b7266` and `text-[#18251f]/(45|50|55|60)`: **0 matches**. These were fixed *during* my audit, not before it.
- **Navy leftovers:** no navy hex in `*.tsx`/`*.json`; `signup-form.tsx:126,157,189,225` focus now `#d84f37`; manifest theme colour `#f5f2ea`. (Stale binary icons remain, per `icon-fix.md`.)
- **SEO duplicate title/description:** live `/public` HTML now has **1 `<title>` and 1 description** (was 2 each).
- **Gates run by me, current source:** `npx tsc --noEmit` exit 0 (10:12:46 and 10:16:08); `npm run lint` exit 0, 0 errors / 2 warnings in generated `coverage/`; `npm test` exit 0, **45/45 tests, 6 files**; `npm run build` exit 0 (10:13:24–10:13:40), 33 routes, **no deprecation warnings**. tsc/lint/test re-run at 10:16 after the later edits, all exit 0.

## What I could NOT verify

- **Dashboard runtime** (accessibility critic marked "Not verified"). Its stated reason — "seeded demo passwords are not present" — is **factually false**: `supabase/seeds/local-dev.sql:10,38` documents `LocalTest123!` for five seeded admin/student/founder accounts. It is a coverage gap, not an impossibility. I did not load the seed or mutate shared state.
- **E2E 4/4** — not run; the orchestrator's gate #4 requires `supabase db reset`. Needs your explicit go-ahead.
- **Production CWV / Lighthouse** — only `next dev` was available; all timings are diagnostic.
- **200% zoom, cross-browser, physical screen reader** — not exercised.

## Verdict

**NEEDS WORK — not shippable.** Real HIGH fixes did land (CTA, contrast, SEO duplicates) and all four gates I ran pass, but four critic HIGHs remain unfixed and one new HIGH regression was introduced by the SEO change. The orchestrator's report is stale and is not evidence of completion.

**Three most important corrections:**
1. Restore a valid raster OG image: generate `public/og-image.png` from `public/og-image.svg` (Chromium/Playwright is installed) or point `layout.tsx:34,46` back to the existing `og-image.svg`; re-check `GET /og-image.png === 200` and DOM meta after.
2. Land the `visual-critic.md` HIGH #1 bento refactor at the four remaining call sites, or record an explicit accepted-risk decision.
3. Update `reports/orchestrator.md` to the actual state: list every fix with file:line, record each gate's exact command/result/time (mine above are reusable), and mark E2E/dashboards as not run rather than implying completion. Then clear the remaining HIGHs (GSAP deps, 960px hero, admin em-dashes) and re-run all seven gates.

---

## FINAL RE-AUDIT — 2026-11-24 10:38 +06:00 (after orchestrator declared done)

**Verdict: NEEDS WORK** (one short cleanup cycle; no HIGH product defect remains).

### Previously flagged HIGH items — independently verified FIXED

| Prior finding | Proof I gathered |
|---|---|
| `/og-image.png` 404 regression | `public/og-image.png` = **1200×630, 53,506 b**; parent's GET 200 `image/png` confirmed; `lib/metadata.ts:27,34` uses it for OG + Twitter. |
| Repeated gap-px bento | Grep `gap-px overflow-hidden rounded-[2rem]` across `app/**/*.tsx` → **0 matches**. |
| Dead GSAP runtime | `package.json` → **0 matches** for `gsap`/`@gsap/react`/`bundle-analyzer`/`react-virtual`; `package-lock.json` → **0**; `components/motion/` → **no files**. |
| 960 px LCP hero | `public/images/bhutanese-students.jpg` = **1920×1163, 294,704 b**; credit preserved (`public/page.tsx:112` → `PHOTO_CREDITS.valley` → `nav.ts:70` Bhutanese_youth.jpg / Doctor 17). |
| Three contrast HIGHs | Source grep for `/45`–`/60` ink, `#7b7266`: **0 matches**; my earlier rendered canvas measurement 4.99–5.89:1. |
| Public agreement CTA | Still `/contact` "Ask for founder access"; no `/founder/*` CTA. |
| Legal + admin em-dashes | `privacy`/`terms` clean; `app/admin/**` grep shows `—` **only in JSDoc/comments**, no rendering strings. |
| Navy icons | `icon-512` center pixel **RGB(23,53,43)** forest; `apple-touch-icon` and `favicon-32` same; no navy hex in source. |
| Duplicate `<title>`/description | `app/layout.tsx:14-48` uses Metadata API; `lib/metadata.ts` used by all 7 public pages; parent confirmed 1 title / 1 description, absolute OG URL. |
| TextReveal hydration | `components/ui/text-reveal.tsx:3,31-35` `useSyncExternalStore(getSnapshot=true, getServerSnapshot=false)` + stable class. |
| JSON-LD nonce / logo | `layout.tsx:118` `suppressHydrationWarning`, `:126` logo → `/icon-512.png` (exists). |
| Pause control / details | `live-context.tsx:138` `aria-pressed={paused}`; `<details>` at `public/page.tsx:277`, `about/page.tsx:150`. |

### Gates re-run by me at 10:38 (current source)

`npx tsc --noEmit` **exit 0**; `npm run lint` **exit 0** (0 errors, 2 warnings in generated `coverage/`); `npm test` **exit 0**, 6 files / **45 tests**; `npm run build` **exit 0**, 33 routes, **no deprecation warnings**. I did **not** run E2E (needs `supabase db reset`, mutates shared state). I read all four E2E specs: the changed assertions (`founder-flow:61` scoped cell, `payment-flow:86-88` scoped "Unlocked" list) remain behavioral and are not weakened — but the claimed 4/4 pass is the orchestrator's evidence, not mine.

### Top three remaining issues

1. **MEDIUM — generic headlines remain, contradicting the report.** `app/for-founders/page.tsx:132` "Turn a challenge into a project"; `app/founder/page.tsx:127` same; `components/marketing/home/desire-chapter.tsx:22` "A platform for people building here." `orchestrator.md:33` claims all generic headlines were replaced with product words. They were not.
2. **MEDIUM — duplicated brand in the rendered title.** `lib/metadata.ts:18` page title `"Bhutan Tech Connect | Paid project work in Bhutan"` combined with `layout.tsx` `title.template: "%s | Bhutan Tech Connect"` yields `Bhutan Tech Connect | Paid project work in Bhutan | Bhutan Tech Connect`. The duplicate tags were fixed; the brand string was not.
3. **LOW/MEDIUM — stale source comments after icon regeneration.** `app/layout.tsx:78-83,103-106` still say the binary icons are "STALE", carry the "old navy mark", and "must be regenerated … before ship". Pixel sampling proves they are forest and correctly sized. The comment will mislead the next maintainer and directly contradicts `orchestrator.md:28`.

### Not independently verified by me

E2E 4/4, the 36 rendered screenshots / 0-console-error claim, production CWV/RUM, physical screen reader, 200% zoom. The dismissed FAQ caption (`faq/page.tsx:308-314`) sits bottom-aligned over `from-[#17352b]/55`, so the orchestrator's "gradient false positive" explanation is structurally plausible, but I did not pixel-measure it. Caveat: I ran `next build` at 10:38 while `next dev` was live, which can disturb shared `.next` chunks; I therefore used no post-build DOM as evidence.

**Bottom line:** every formerly HIGH product defect is fixed with file/byte/DOM proof and all four gates I can run are green. Approve only after the three residual items above are cleaned and the E2E/36-render evidence is either re-run or reviewed directly by the parent; otherwise treat as NEEDS WORK.

---

## FINAL VERIFICATION of the three cleanup items + sticky feature — 2026-11-24 10:51 +06:00

**Final verdict: APPROVE** (scope: source, rendered HTML/DOM and the four gates I ran; contingent on the parent's independently running E2E, which I did not run per instruction).

Every item from the previous section is now verified fixed:

1. **Generic headlines — verified.** `app/for-founders/page.tsx:132` = `"Post a paid brief for Bhutanese students"`; `app/founder/page.tsx:127` = `"Post a brief to meet students"`; `components/marketing/home/desire-chapter.tsx:22` = `"Bhutanese students do paid project work."`. Repo-wide grep for the three old generic strings: **0 matches**.
2. **Title brand duplication — verified in source and rendered HTML.** `lib/metadata.ts:19-21` strips a leading/trailing brand via two case-insensitive regexes before the layout template appends it once. Rendered `<title>` on 8 routes: `/public` = `Paid project work in Bhutan | Bhutan Tech Connect`, `/about` = `About | Bhutan Tech Connect`, `/for-founders` = `For founders | Bhutan Tech Connect`, `/how-it-works` = `How it works | Bhutan Tech Connect`, `/faq` = `Frequently asked questions | Bhutan Tech Connect`, `/contact` = `Contact us | Bhutan Tech Connect`, `/privacy` = `Privacy Policy | Bhutan Tech Connect`, `/terms` = `Terms of Use | Bhutan Tech Connect` — **exactly one** "Bhutan Tech Connect" on each.
3. **Stale icon comments — verified corrected.** `app/layout.tsx:78-80` now says the PNG/ICO fallbacks "were regenerated deterministically from /favicon.svg in the canonical forest + amber palette"; `:100-101` says the 180px apple-touch-icon "was regenerated from /favicon.svg with the canonical forest + amber mark". No `STALE`/`navy`/`must be regenerated` claim remains. This matches the pixel evidence (forest RGB 23,53,43).
4. **Sticky feature — verified in rendered DOM.** `/how-it-works` at 1440px: **2 sticky section headings** (`top: 96px`: "Three steps, one clear brief", "What happens after a shortlist") plus the sticky site header. Source: `components/marketing/guides/pinned-step-chapter.tsx:18` `lg:sticky lg:top-24` and `app/how-it-works/page.tsx:253` — desktop-only by design; at 375/320px only the header is sticky, which is intentional responsive behavior, not a defect. `main` computed `overflowX: clip` at 1440/375/320; `scrollWidth === clientWidth` at all three (0 px horizontal overflow).

**Gates re-run on this final source at 10:51:** `npx tsc --noEmit` exit 0; `npm run lint` exit 0 (0 errors, 2 warnings in generated `coverage/`); `npm test` exit 0, 45/45; `npm run build` exit 0, 33 routes, no deprecation warnings.

**Explicitly outside my verdict:** E2E 4/4 (parent running independently), production Core Web Vitals / field RUM, physical screen-reader testing, 200% zoom. Caveat unchanged: I ran `next build` while dev was live, so I used no post-build DOM as evidence — all DOM checks above were done before the final build.
