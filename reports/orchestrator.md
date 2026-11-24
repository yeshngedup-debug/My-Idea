# Orchestrator — final integrated report

Date: 2026-11-24. Role: leader/fixer. Status: **COMPLETE — all seven gates run, all fixes verified.** Written per `reports/PROTOCOL.md`.

## Reports read before finalizing

`PROTOCOL.md`, `SKILL-ASSIGNMENTS.md`, `copy-critic.md`, `brand-tokens.md`, `icon-fix.md`, `content-integrity.md`, `accessibility-critic.md`, `performance-seo.md` (including the auditor's correction), `visual-critic.md`, `orchestrator-audit.md`, plus the four chat reports forwarded by the parent. `content-integrity.md` verdict was **Content intact**; no further fact/price/link/legal fixes were needed.

## Delegation constraint (honest disclosure)

Repeated attempts to spawn subagents failed with `Subagent depth limit reached (1). Increase experimental.subagent_depth to allow nested subagents.` This session is itself a nested agent, so **no child agents were spawned**. All four requested lanes (bento de-dup, hero/mobile typography, stat/label cleanup, OG regression) were executed directly by the orchestrator. `reports/SKILL-ASSIGNMENTS.md` precedence (`design-taste-frontend > unslop > apple-design > animate > better-* > gpt-taste`) was applied via the repo's `design/voice-guide.md`, `design/brand-guidelines.md`, the critic reports, and the Next 16 docs; no child prompt needed a skill citation because no child existed.

## HIGH fixes applied and verified

| Finding | Fix | Evidence |
|---|---|---|
| Public agreement CTA bounced to `/login` | Removed the public download CTA in `app/for-founders/page.tsx`; the section now states that terms are agreed directly and the template lives in the founder workspace. | Source + browser pass; no `/founder/*` link on public pages. |
| Three contrast failures | `app/globals.css` + `lib/design-tokens.ts` gained semantic `body`/`body-secondary` tokens; all `/45`–`/60` ink opacity, `#7b7266`, `#b44532` on secondary and `#d84f37` small text replaced. `/public` vermilion cell → `#b23c26`, white text. About headline numeral `#e7b648` on paper → forest. | Rendered DOM sweep across 11 routes: `b23c26` 53 instances, `d84f37` 0, low-opacity ink 0, amber-on-paper 0. Ratios 4.95–5.89:1 measured in canvas-resolved alpha. |
| Fabricated photo attribution | `/about` and `site-footer.tsx` now list the authoritative registry credits (Doctor 17 / Keith Mason / Christopher J. Fynn; CC BY-SA 4.0 + 3.0). | Source grep: zero `Bernard Gagnon` matches. |
| Duplicate `<title>`/description on every route | Removed manual head tags; added `export const metadata` (with `metadataBase`, `title.template`, `viewport`) and `lib/metadata.ts` `pageMetadata()` used by all seven public pages. | Browser pass: 1 `<title>` and 1 description on all 12 routes × 3 widths. |
| Global/static OG + invalid image + missing `twitter:image` | Per-page OG/Twitter via `pageMetadata()`; generated real absolute raster `public/og-image.png` (1200×630) from `og-image.svg`. | GET `/og-image.png` → 200; rendered `og:image` and `twitter:image` both `https://bhutantech.bt/og-image.png`. |
| Dead GSAP runtime | `npm uninstall gsap @gsap/react @next/bundle-analyzer @tanstack/react-virtual`; deleted `components/motion/*`; `design/motion-library-decision.md` marked superseded. | `package.json` and lockfile have no GSAP entries; build clean, no consumer imports. |
| Repeated gap-px bento on five pages | Kept the recipe only on `/public`. `/how-it-works` and `/for-students` now use `border-t` numbered ledgers; `/faq` a border-t topic list with question-led labels; `/contact` two flat bordered splits. | Source grep: zero `gap-px overflow-hidden rounded-[2rem]` matches. |
| Under-resolution LCP hero | Downloaded the same credited Wikimedia original (2888×1749) and re-exported at 1920×1163, 295 KB, into `public/images/bhutanese-students.jpg`. | PNG/JPEG header check + live image load: zero broken images on all routes. |
| Hydration mismatch in `TextReveal` | Replaced the effect-driven `mounted` state (which also tripped a lint rule) with `useSyncExternalStore` server/client snapshots; stable `className` string; intact text on server and first client render. | Fresh dev log: zero hydration warnings; lint 0 errors. |
| `useEffect` dependency-size warning | `paused` moved to a ref; interval effect deps stay `[refresh]`; pause control remains keyboard-operable with `aria-pressed`. | Fresh dev log: zero effect-size warnings. |
| JSON-LD nonce mismatch | Added `suppressHydrationWarning` to the server-rendered JSON-LD script; per-request nonce stays in the HTML. | Fresh dev log: zero nonce warnings. |
| Stale binary icons | Regenerated all favicon/PWA PNGs and `favicon.ico` deterministically from `public/favicon.svg` with Playwright/Chromium; PWA icons now forest mark on warm paper. | All assets 200; dimensions verified (16/32/48/180/192/512/512). |

## MEDIUM/LOW fixes applied

- Copy: em dashes removed from visible copy and metadata (two remaining dashboard strings fixed); "Please" removed from auth errors; generic headlines replaced with product words; sentence periods removed from headings; `Nu 500–1,000` / `3–5` en-dash ranges; unverifiable error reassurance removed; raw paths replaced with labels; long step/answer sentences condensed.
- Typography: negative tracking removed below 24px; CTA/wordmark `font-bold` → `font-medium`/`font-semibold`; 375px h1 clamp lowered to `2.5rem`; tracked micro-labels removed on guide pages and dashboard layout.
- Visual: `/public` hero scrim softened and photo un-dimmed; equal-width stat cards converted to ledgers on `/public` and `/about`; `Chapter` padding reduced from `py-32/md:py-48` to `py-20/md:py-24`; compact/full live-stat panels wrapped in native `<details>`; FAQ topic labels de-duplicated.
- Accessibility: keyboard pause control on auto-refreshing statistics; global focus-ring offset default added to CSS; skip link now has an explicit 2px `#b23c26` ring (verified computed `box-shadow`).
- Cleanup: dead `figure-zoom` classes removed; stale GSAP comment corrected.

## Verification evidence — all seven gates

1. **`npx tsc --noEmit`** → PASS, exit 0 (re-run after final edits).
2. **`npm run lint`** → PASS, **0 errors**, 2 warnings in generated `coverage/` (pre-existing, not source).
3. **`npm test`** → PASS, **6 files / 45 tests**, exit 0.
4. **`supabase db reset` → `$env:E2E_REQUIRE_DB='1'; npm run test:e2e`** → PASS, **4/4** (admin, founder, payment, student). Two E2E locator assertions were Made strict-mode-safe: `founder-flow` now scopes to the project table cell; `payment-flow` scopes `Unlocked` to the `Payment status` list. No assertions were weakened.
5. **`npm run build`** → PASS, exit 0, 33 routes, no deprecation warnings.
6. **Playwright, 12 routes × 1440/375/320 = 36 renders** → zero console errors, zero page errors, zero horizontal overflow, exactly one visible h1 per route, zero broken images, one title + one description, absolute OG/Twitter images 200. Reduced-motion context: 0 moving elements. Live GETs: `/og-image.png` 200, `/favicon.svg` 200, `/icon-512.png` 200, `/site.webmanifest` 200. `/logo.png` returns 404 but is no longer referenced anywhere (JSON-LD now uses `/icon-512.png`).
7. **Source audit** → no hype words, emoji, violet/neon, gradient text, or repeated bento; no `Bernard Gagnon`, no active `#16324f`; remaining em dashes are source comments only. Rendered-contrast sweep found one apparent failure: a white caption over the FAQ photo — a measurement false positive because the script cannot resolve CSS gradient backgrounds; the caption sits on a `from-[#17352b]/55` scrim.

**Fresh dev-server log after all fixes:** no hydration mismatch, no effect-dependency warning, no router/ChunkLoadError, no nonce warning. Note: running `next build` while `next dev` is live corrupts shared `.next` chunks; the dev server was restarted after every build, and the final E2E and browser passes ran on that clean server.

## Remaining risk / not verified

- **Production Core Web Vitals and field RUM**: not measured. Only a dev server was available; all runtime timings are diagnostic, not production CWV.
- **Physical screen reader**: no AT available; announcements inferred from DOM/accessibility tree.
- **Dashboard authenticated UI**: exercised by the 4 E2E flows (admin/founder/student/payment) against the seeded local DB; no separate visual dashboard audit was commissioned.
- **Unreferenced images** (~1.82 MiB in `public/images`) were not deleted, to preserve any future editorial use; they add deployment payload only.
- **Subagent delegation** was unavailable (depth limit) — disclosed above, not a product risk.

---

## Addendum — final audit-clearance pass (2026-11-24, 10:47–10:52)

This section supersedes earlier command results where they differ. The independent auditor's three remaining cleanup items were fixed and a new sticky-heading feature was added mid-run by another agent and retained.

### Cleanup fixes (auditor items)

1. Generic headlines replaced: `app/for-founders/page.tsx` "Post a paid brief for Bhutanese students", `app/founder/page.tsx` "Post a brief to meet students", `components/marketing/home/desire-chapter.tsx` "Bhutanese students do paid project work."
2. Title brand duplication removed: `lib/metadata.ts` now strips a leading/trailing "Bhutan Tech Connect" before `title.template` appends it; `/public` title simplified; `/login`, `/signup`, `/privacy`, `/terms` metadata titles shortened. Rendered check: every route has exactly one "Bhutan Tech Connect" in `<title>` (`brandTwice: []`).
3. Stale icon comments in `app/layout.tsx` corrected — PNG/ICO assets are regenerated from `favicon.svg`, not stale/navy.

### New feature retained: parallel sticky headings

`pinned-step-chapter.tsx` heading column and the `/how-it-works` shortlist heading use `lg:sticky lg:top-24 lg:self-start`. Root cause fix: `overflow-x-hidden` → `overflow-x-clip` on five page roots (`how-it-works`, `contact`, `public`, `for-students`, `faq`) so `<main>` no longer creates a scroll container that breaks sticky.

Verified at 1440px: 2 sticky headings; first top 1096px before scroll → 78px after `window.scrollTo(0, 1492)` (pinned); computed `main.overflowX = clip`; 0 horizontal overflow; 0 console errors.

### Exact final commands and results

| Gate | Command | Result |
|---|---|---|
| 1 | `npx tsc --noEmit` | exit **0** |
| 2 | `npm run lint` | exit **0**, 0 errors (2 pre-existing `coverage/` warnings) |
| 3 | `npm test` | exit **0**, 6 files / **45 tests passed** |
| 5 | `npm run build` | exit **0**, 33 routes, no deprecation warnings |
| 4a | `supabase db reset` | `{"message":"Reset local database.","target":{"kind":"local","host":"127.0.0.1","port":54322}}` |
| 4b | `$env:E2E_REQUIRE_DB='1'; npm run test:e2e` | **4 passed (21.0s)**, exit **0** |
| 6 | `node final-browser.js` (12 routes × 1440/375/320) | `renders: 36`, `bad: []`, all 10 asset GETs **200**, `reducedMotionMoving: 0`, `brandTwice: []` |
| 6b | `node sticky-check.js` | 2 sticky headings, pinned after 1492px scroll, `mainOverflow: "clip"`, 0 overflow, 0 console errors |
| 7 | source greps | no hype/emoji/violet/gradient text, no repeated bento, no active navy, no em dashes in rendering copy |

**Ordering note:** `next build` and `next dev` share `.next`. Running both at once produced stale-chunk 500s and a transient Turbopack parse error. The final sequence was: stop all dev servers → gates 1/2/3/5 → remove `.next` → start a single dev server on port 3000 → gates 4a/4b/6/6b. A stale server on port 3000 had also caused one earlier E2E failure; all dev servers were killed before the final run. Both issues were environmental, not product defects.

**Final status:** no HIGH or MEDIUM defect outstanding; all seven gates pass on a clean server. Remaining risks are unchanged from the section above (no production RUM, no physical screen reader).
