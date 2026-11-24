# Accessibility critic report — Bhutan Tech Connect

Date: 2026-11-24. Role: read-only critic (per `reports/PROTOCOL.md`). No product source was edited.
Skill applied: `better-interface` orchestration with `better-accessibility` and `better-colors` as owning skills; escalation triggers applied verbatim (any trigger is HIGH on sight).

## Scope and coverage

**Scope:** public marketing routes `/public` (home `/` redirects here), `/how-it-works`, `/for-students`, `/for-founders`, `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, plus the three role dashboards `/student`, `/founder`, `/admin` and their shared `SimpleLayout` / `WorkspaceNav`.

**Stack / conventions:** Next.js App Router, Tailwind 4 (`@theme inline`), `motion/react` with root `MotionConfig reducedMotion="user"`, GSAP scroll kit gated on `(prefers-reduced-motion: no-preference)`, canonical tokens in `lib/design-tokens.ts` mirrored in `app/globals.css`. Project docs read: `AGENTS.md` (root + repo), `RESEARCH-AND-ACCESSIBILITY.md` (via other reports), `reports/PROTOCOL.md`. No design-system ADR beyond the token module.

**Runtime:** dev server answered HTTP 200. Playwright (isolated browser context) used for rendered DOM, computed-style contrast (canvas colour resolution for Tailwind 4 `oklab()/lab()` alpha colours), 320px/375px reflow, Tab traversal, and `prefers-reduced-motion: reduce` emulation. Dashboards redirect unauthenticated requests to `/login` and seeded demo passwords are not present, so dashboard runtime is **Not verified** throughout.

| Domain | Evidence inspected | Result |
|---|---|---|
| Accessibility | Rendered names/roles/focus on `/public` + 320px; keyboard Tab traversal; live regions and error markup in source; skip links and landmarks on all routes; reduced-motion emulation on `/public`, `/about`, `/how-it-works` | 3 findings (2 HIGH, 1 MEDIUM); dashboard runtime Not verified |
| Colors | Canvas-resolved rendered contrast on `/public`, `/about`, `/for-founders`, `/how-it-works`, `/for-students`, `/contact`, `/privacy`, `/terms`; token pairs computed for cream/surface/secondary/forest/vermilion/amber | 3 HIGH findings (all contrast) |
| Layout | Rendered 320px/375px overflow scan (no offenders), landmark/heading inspection on `/public` — done without loading `better-layout` | Partial; 200% zoom Not verified |
| Writing | Not reviewed (owning skill not loaded; `reports/copy-critic.md` owns this) | Not reviewed |
| Typography | Not reviewed (owning skill not loaded; `reports/copy-critic.md` owns this) | Not reviewed |
| UI | Not reviewed (owning skill not loaded; `reports/visual-critic.md` owns this) | Not reviewed |

## Ranked findings

Triggers first. Severity is `better-interface`'s scale; each HIGH row fires an escalation trigger.

| # | Severity | Domain | Location | Before | After | Why / rendered proof |
|---|---|---|---|---|---|---|
| 1 | **HIGH** | Colors / Accessibility (WCAG 1.4.3 AA) | `components/data/live-context.tsx:125,138,192,204,214,266,286,293,341,348`; `app/for-founders/page.tsx:161,220,266,346,374`; `components/ui/status-timeline.tsx:89,107`; `components/ui/page-skeleton.tsx:25` | `text-[#18251f]/55`, `/60`, `/50`, `/45` for body and caption copy | Use the project's `text-body-secondary` (`#56645c`, 5.57:1 on paper) from `app/globals.css` / `lib/design-tokens.ts`; do not use alpha ink for text | **Escalation trigger — body text fails its required ratio.** Rendered /about: ink `/50` on `#eae5d9` = **2.99:1**, `/55` = **3.44:1** (needs 4.5). Rendered /public compact panel: `/55` on `#fffefa` = **3.67:1**. Rendered /for-founders: `/60` on paper = **4.11:1**, on surface = **4.26:1**. Cross-reference `reports/orchestrator.md` HIGH #1 — this row adds the exact per-background ratios and the still-unfixed `live-context` call sites (the applied edits only covered `/about`). |
| 2 | **HIGH** | Colors / Accessibility (WCAG 1.4.3 AA) | `components/marketing/site-footer.tsx:34,57,61`; `components/marketing/page-hero.tsx:78,135,141`; `components/marketing/section-intro.tsx:25` | `text-[#7b7266]` on `#f5f2ea` | `text-[#56645c]` (5.57:1) or the `text-body-secondary` token | **Escalation trigger — body text fails its required ratio.** Rendered on all nine public routes: tagline, copyright, photo-credit paragraph, hero eyebrows and section leads = **4.23:1** at 12–14px (needs 4.5). Cross-reference `reports/orchestrator.md` HIGH #3, which names `#7b7266` but lists no fix location; these are the exact call sites. |
| 3 | **HIGH** | Colors / Accessibility (WCAG 1.4.3 AA) | `app/public/page.tsx:201` and `:206` | Vermilion cell `bg-[#d84f37]` with `text-white/85` (12px) and `text-sm font-bold text-white` link | Keep the vermilion surface but darken it to `#b23c26` (white on `#b23c26` = 5.26:1) or change the text to full white **and** move the surface to a darker vermilion; at minimum replace `text-white/85` with solid white and raise the background until both pairs reach 4.5:1 | **Escalation trigger — body/control text fails its required ratio.** Rendered on `/public`: `Founder access is assigned by an administrator.` white/85 on `#d84f37` = **3.40:1**; the underlined `Create student account` link = **4.12:1** at 14px/700 (needs 4.5; 700 at 14px is not "large text"). Not listed in `reports/orchestrator.md` — new evidence. |
| 4 | MEDIUM | Accessibility (WCAG 2.2.2 Level A — Pause, Stop, Hide) | `components/data/live-context.tsx:97-104` (60s clock + 10-min poll), `:109-115` (`RefreshPill` is static text, not a control) | Statistics block auto-updates its visible "checked N minutes ago" label and refreshes data with no user control | Add a visible, keyboard-operable pause control for the auto-refresh (and stop the interval when paused), or remove the client-side intervals and rely on server revalidation with a manually checked timestamp | Rendered on `/public` and `/about`: the "Auto-refreshing" pill is a `<span>`, and no pause/stop control exists. Not on the escalation-trigger list, so MEDIUM despite being Level A. |

No other findings reached the reporting bar. The cap of 12 excluded nothing.

## Verified passing (rendered unless marked source-only)

- **Accessible names:** all 38 interactive elements on `/public` had a name from text/`aria-label`; the mobile menu button is a native `<button>` with `aria-label="Open menu"`, `aria-expanded`, `aria-controls` (`components/marketing/site-header.tsx:112-128`). Decorative icons use `aria-hidden="true"`.
- **Focus indicators:** 12 consecutive Tab stops on `/public` all matched `:focus-visible` with a visible ring — vermilion `#d84f37` + cream offset on cream surfaces, white + dark offset on the hero CTAs. At 320px the first four Tab stops (skip link → brand → menu → CTA) were all `:focus-visible`; menu button measured 44×44px. Root focus-offset fix noted in `reports/orchestrator.md` is present in computed styles.
- **Skip links and structure:** root skip link (`app/layout.tsx:117-122`) targets `#main-content`; that id exists on every marketing page and in `components/layout/simple-layout.tsx:104-107` for all three dashboards. Rendered home has one `h1` then `h2`s, `main`, labelled `nav` landmarks and a footer — no skipped levels observed there.
- **320px / 375px reflow:** zero horizontal overflow or out-of-viewport elements on `/public`, `/how-it-works`, `/for-students`, `/about`, `/contact`, `/privacy`, `/terms` (320px: `scrollWidth == clientWidth == 305`). Sub-24px targets found were inline links inside sentences (WCAG 2.5.8 inline exception); the sr-only skip link becomes a 179×40px visible target on focus.
- **Reduced motion:** with `prefers-reduced-motion: reduce` emulated, no infinite CSS animations were found; `Reveal` molecules reached `opacity: 1; transform: none` after scrolling into view, and GSAP components are gated to `no-preference` in source (`components/motion/_shared.ts:21-28`). Travel on the no-preference path is 18px, not large, with no parallax/loop. `reports/orchestrator.md` item #16 can be verified rather than reworked.
- **Status not by colour alone:** `StatusTimeline` renders explicit "Current / Done / Not yet" text plus "Next:" guidance (`components/ui/status-timeline.tsx:53,83-104`); status badges carry text labels. Dashboards rendered state Not verified.
- **Contrast that passes:** body ink `#18251f` on cream = 14.19:1; secondary `#56645c` on cream = 5.57:1; small-text accent `#b23c26` on cream = 5.26:1; amber `#fbbf24` on forest `#17352b` = 7.96:1 (rendered CTA); `#e7b648` on forest = 7.08:1. The `#e7b648` numeral on paper at `app/about/page.tsx:83` that `reports/orchestrator.md` called HIGH #2 is now `#17352b` and is absent from the current rendered failure list — **resolved, not a finding**.
- **Requested vermilion check refined:** `#d84f37` is **3.69:1 on cream**, so it would fail as body text, but rendered pages use it for icons/focus rings (3:1 non-text threshold — passes) while text uses `#b23c26` (5.26:1). No rendered small-text failure from this token; the real text failures are rows 1–3.
- **Form announcements:** `role="alert"`/`role="status"` plus `aria-describedby`/`aria-invalid` are wired in `components/auth/signup-form.tsx`, `login-form.tsx`, and dashboard forms (`post-project-form.tsx:62-65`, `shortlists-client.tsx:115`, `profile-form.tsx:117`). Source verified; dashboard runtime Not verified.
- **Global live region:** `id="global-status" aria-live="polite"` exists in the root layout (`app/layout.tsx:124`).

## Not verified

- Dashboard runtime rendering, keyboard traversal, forms, badges and target sizes (unauthenticated redirect to `/login`; no seeded passwords).
- 200% browser zoom at a 1440px viewport (320px reflow was verified instead).
- Physical screen-reader announcement (NVDA/VoiceOver); all screen-reader statements are DOM/ARIA based.
- Mobile-menu **activation** result (Enter/Are expanded after press) — the final probe was corrupted by a shared-browser navigation, so only its Tab reachability and focus indicator are verified.

## Cross-reference to other reports

- `reports/orchestrator.md` owns the fix plan. Rows 1 and 2 refine its HIGH #1 and #3 with exact rendered ratios and unfixed call sites; row 3 is new and should be added to its HIGH list. Its HIGH #2 (amber numeral) is verified fixed. Its item #9 (focus offset) and #16 (reduced motion) are verified passing.
- `reports/copy-critic.md` owns writing/typography. Its `app/error.tsx:37` row is copy-claim, not error recovery; no overlap. Its typography rows (weight 700, negative tracking) are not restated here.
- Expected `visual-critic.md`, `icon-fix.md`, `performance-seo.md`, `content-integrity.md`, `brand-mark.md` were not present at finalization; no overlap claimed.

## Verdict

**Block.** Three HIGH contrast findings remain (rows 1–3), each an escalation trigger under `better-interface`. Coverage is partial: Writing, Typography and UI were not reviewed, and dashboard runtime was not accessible.
