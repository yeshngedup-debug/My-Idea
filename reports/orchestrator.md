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

---

# Addendum — Neon migration, sticky headings and feature-tied components (2026-11-24)

## Scope

Three coordinated changes were made in one pass: the Neon data migration, sticky
section headings on long content, and feature-tied interactive components.
Subagents could not be spawned: the runtime returns `Subagent depth limit
reached (1)`. All work and all assigned skills were applied directly.

## Skill coverage

- Data migration: `neon`, `neon-postgres`. Supabase Auth and Storage were kept,
  so `neon-auth` was consulted only to confirm that an existing working IdP
  should not be replaced. `neon-functions`, `neon-realtime` and
  `neon-ai-gateway` were read only to document why they remain unprovisioned.
- UI: `unslop`, `apple-design`, `better-layout`, `design-taste-frontend`,
  `animate`, `emil-design-eng`.
- Accessibility and forms: `frontend-a11y`, `better-accessibility`.
- Copy: `better-writing` and `design/voice-guide`.
- Verification: `verification-loop`, `e2e-testing`, `production-audit`,
  `security-review`.

## Component research: exact sources and licences

| Site | URL checked | Licence / terms | Outcome |
| --- | --- | --- | --- |
| Motion | https://motion.dev/docs/react-layout-animations · https://motion.dev/docs/react-transitions | MIT core; free docs examples MIT, retain notice if copied | **Accepted** two documented patterns. No example source copied; implementation written against the documented API. |
| shadcn/ui | https://ui.shadcn.com/docs/components/tooltip · https://ui.shadcn.com/docs/components/progress | MIT | **Accepted** existing `Progress` primitive (already vendored). Tooltip and Separator were already present and were not re-added. A licence page URL returned 404, so the MIT status is taken from the project's published terms. |
| React Bits | https://www.reactbits.dev/ · https://www.reactbits.dev/components | MIT + Commons Clause; keep notice | **Rejected.** Its animated backgrounds and text effects are decorative; none maps to a real product action, and the Commons Clause restricts commercial use of the source as a standalone product. |
| 21st.dev | https://21st.dev/ · https://21st.dev/community/components · https://21st.dev/llms.txt | Per-author terms; free browsing, limited free copies | **Rejected.** Registry components carry author-specific terms and the catalog is marketing/hero oriented. No candidate tied to a real action. |
| Motion Primitives | https://motion-primitives.com/ · https://21st.dev/@ibelick/library/motion-primitives | MIT | **Rejected.** Its motion blocks overlap with patterns already implemented locally; adding copied source would duplicate existing Motion code. Direct licence URL returned 404. |
| Rare UI | https://rareui.com/ (HTTP 429) | MIT + Commons Clause + mandatory visible credit | **Rejected.** Mandatory visible credit is unwanted in the product chrome, and the site could not be fetched to verify a specific component. |
| anime.js | https://animejs.com/ · https://raw.githubusercontent.com/juliangarnier/anime/master/LICENSE.md | MIT © 2025 Julian Garnier | **Rejected.** Duplicate animation runtime. Licence verified; nothing installed or copied. |

## Accepted integrations

### 1. Profile completion progress — `/student/profile`

- **Feature:** student profile completion (skills, CV, availability).
- **Action improved:** filling a field now immediately changes a real
  `role="progressbar"` from 0 to 8 details, with the specific missing fields
  named in plain text. Replaces a decorative percentage with an accessible
  state indicator.
- **Proof:** Playwright signs in as the seeded student, reads `aria-valuenow`
  (100), clears Bio (88), restores Bio (100). No console errors.
- **Source:** shadcn/ui Progress, MIT, https://ui.shadcn.com/docs/components/progress.
  The component was already vendored at `components/ui/shadcn/progress.tsx`;
  this change wires it to real form state.

### 2. Shared-layout navigation hairline — public header

- **Feature:** section navigation across public pages.
- **Action improved:** clicking a nav link moves one 1px vermilion hairline to
  the new active link instead of blinking two independent spans. One transition,
  transform only, disabled under reduced motion.
- **Proof:** Playwright reads the active link and hairline x position on
  `/how-it-works` (`How it works`, x=502), clicks `For students`, and observes
  the active link and hairline move (`For students`, x=617). With
  `prefers-reduced-motion: reduce`, clicking `About` still sets `aria-current`
  correctly. No console errors.
- **Source:** Motion `layoutId` and `MotionConfig` patterns, MIT,
  https://motion.dev/docs/react-layout-animations and
  https://motion.dev/docs/react-transitions. Implementation is written locally;
  no example source was copied.

### 3. Live statistics refresh and pause — public statistics panel

- **Feature:** official statistics panel on `/public` and `/about`.
- **Action improved:** a keyboard-operable `Refresh now` button performs a real
  fetch, reports busy state, and announces `Updated just now` in a polite live
  region. The existing pause control keeps `aria-pressed` and is paired with it.
- **Proof:** Playwright opens the statistics disclosure, focuses `Refresh now`,
  presses Enter, waits for the button to become enabled, and reads the status
  text `Updated just now`. It then focuses the pause button, presses Enter and
  reads `aria-pressed="true"`. No console errors.
- **Source:** no third-party source copied; uses the existing button styling
  and the shadcn/ui pattern for accessible controls (MIT,
  https://ui.shadcn.com/docs/components/button).

## Rejected candidates

Generic animated backgrounds, text scrambles, marquees, hover-glow cards and
scroll-reveal blocks from React Bits, 21st.dev and Motion Primitives all fail the
feature-tie rule. Rare UI also fails because of mandatory visible credit.
anime.js fails because Motion is already the single animation runtime.

## Neon services blocked by CLI sign-in

`neon.ts` declares auth, AI Gateway, Realtime and an empty functions map.
`neon deploy` cannot run: the CLI is not signed in and this shell cannot open a
browser. Postgres was migrated through the supplied `DATABASE_URL`; Supabase
Auth and Storage remain in place. No provisioned Neon service is claimed.

## Sticky headings

Applied only where content is long: `/for-students` profile fields and step
sequence, admin students/projects/payments, founder projects/browse/shortlists,
student projects/applications. Left alone: heroes, CTA bands, short two-column
intros, dashboard overviews, forms and short FAQ clusters. Browser check:
heading stays at `top: 96px` while its sibling content moves from `top: 100px`
to `top: -100px`; `main` keeps `overflow-x: clip`; no `overflow-x-hidden`;
horizontal overflow is 0 at 320, 375 and 1440; one `h1` per page.

## Addendum — Neon services after CLI sign-in (2026-11-24)

CLI authentication is available. `neon deploy` first reported `No changes —
branch production already matches the policy` for Postgres, Neon Auth, AI
Gateway and Realtime. After adding `platform`, it reported `+ function
platform` and pulled 11 Neon variables into `.env` with no key added, removed
or changed in either env file.

Accepted service integrations:

1. **Functions** — `functions/platform.ts` is deployed as `platform`. It queries
   Neon counts and open projects. `/api/neon` calls its public URL first and
   falls back to direct SQL. Proof: direct URL returned
   `{"ok":true,"source":"neon-function",...}` and `/api/neon` returned
   `"source":"neon-function"`.
2. **Realtime** — `lib/neon-realtime.ts` seals a founder-scoped query over
   `shortlist_orders`; `POST /api/realtime/orders` renews it after checking the
   Supabase session and founder role. `components/founder/live-order-status.tsx`
   subscribes. Proof: with a founder page open, an admin confirmed a payment in
   a second browser context; the founder badge changed from `Payment being
   checked` to `Payment confirmed. Shortlist unlocked` over a Neon WebSocket,
   with zero console errors. No RLS is involved and no user ID is accepted from
   the browser.
3. **AI Gateway** — models are listed by `/v1/models` (200), but
   `/v1/chat/completions` returns 403 `paid_plan_required`. Rejected: no
   feature was added and no token value was exposed.
4. **Neon Auth** — enabled on the branch but not adopted. Managed Better Auth
   would require replacing working Supabase sessions and user records, which
   was not requested; documented rather than wired.

Rejected unchanged: React Bits, 21st.dev, Motion Primitives, Rare UI and
anime.js, for the reasons in the component table above.

Final gates after these changes: tsc PASS; lint 0 errors (2 pre-existing
coverage warnings); unit 45/45; build 38 routes; E2E 4/4 after reseeding Neon;
browser checks at 1440 and 320 with 0 overflow, 1 `h1` per page, sticky only on
intended sections and 0 console errors. Subagent spawning remained blocked
(`Subagent depth limit reached (1)`); the audit was performed directly.
