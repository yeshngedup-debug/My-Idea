# Similar-site review, workability and accessibility

Review date: 2026-11-24. Sources: live pages fetched with browser/web tools, plus read-only code and browser audits of this repository. No files were changed by the research agents; the fixes listed at the end were applied afterwards.

## 1. Sites reviewed and what they do

| Platform | Workflow signal | Notable limitation |
|---|---|---|
| [Upwork](https://support.upwork.com/hc/en-us/articles/211063748-How-Fixed-Price-Payment-Protection-works-for-freelancers-on-Upwork) | Funded milestones, "submit work for payment" with a 14-day release window, dispute path, in-platform messaging required for protection | Connects/credits to apply, paid verification, boosted proposals, opaque ranking |
| [Contra](https://help.contra.com/en/articles/9322763-paid-projects) | 0% commission positioning, structured contracts with e-signature, milestones held until approval, project workspace | Per-payment fees on the free tier, card-centric |
| [Toptal](https://www.toptal.com/top-3-percent) | Five-stage screening, 3–8 weeks, under 3% accepted; selectivity is the trust signal | Supply economics useless for a small local student market |
| [Riipen](https://help.riipen.com/en/articles/7321556-how-employers-use-riipen) | Institution-led cohorts, employer posts through an educator, company-validated skills ratings after the project, badges and academic credit | Access depends on an institution partnership |
| [Parker Dewey](https://www.parkerdewey.com/pricing) | Four-step micro-internship flow, 14+ structured performance data points, employer of record handles payroll/IP | $200–$600 per project, high legal/ops complexity |
| [Internshala](https://internshala.com/blog/what-is-internshala/) | Student/employer registration, location and stipend filters, pre-screen questions on apply, employer ATS with chat and instant messaging | Scale-driven, generic, no local payment rails |
| [DziSeldra](https://dziseldra.com/jobs) (Bhutan) | Nu.-denominated salary filters, sector and internship filters | Filters are paywalled; sponsored listings; no employer verification or review system |

## 2. Patterns worth pulling into our site

1. **Explicit paid-step states.** DziSeldra hides filters behind a subscription; our premium shortlist should instead show every manual step. We now gate new orders when payment details are unconfigured, show the submitted/confirmed states, and mint signed receipt URLs for admins.
2. **Funded-milestone status timeline (adapted).** We cannot hold funds, so we use honest "payment confirmation" language: order created → screenshot uploaded → admin confirming → unlocked. The same status explanation is surfaced in the student application list.
3. **Structured brief + pre-screen questions.** Our project form already captures required skills, budget, duration and deadline. Adding fixed questions is a future improvement, not an MVP blocker.
4. **Human-curated trust as a visible product surface.** Our admins already verify and rank students. The FAQ and About pages now state the verification rubric in plain language instead of showing an opaque score.
5. **Post-project verified feedback (future).** Riipen and Parker Dewey both collect structured feedback only after a completed engagement. We should not add public star ratings on people at launch; admin-verified structured feedback is the honest equivalent.

## 3. Limitations we can overcome

High pay-to-compete costs, credits gamification, algorithmic ranking and boosted proposals, paywalled filters and contact details, slow verification, card-first payments, desktop-first layouts, sponsored/unverifiable reviews, and no wrap-up after a project ends. Our answers: free baseline browsing, Nu.-denominated bank/mBoB transfers with admin confirmation, an admin-curated shortlist that can be explained, mobile-first layouts, and neutral icon-based visual panels.

Bad fits for this MVP: real escrow, Toptal-style screening, credits, paywalled filters, employer-of-record/payroll automation, public rating economies, and algorithmic matching.

## 4. Workability review — what was actually broken

A read-only flow analysis found the following. Note: route protection already exists in `proxy.ts` (Next 16's replacement for middleware); the audit predated that rename.

- **Apply feedback was discarded.** `app/student/projects/projects-client.tsx` cast a `void` result to an object, so students saw no confirmation. Fixed: parent now owns applied state, returns the action result, and renders `role="status"`/`role="alert"`.
- **Shortlist failures were silent.** `app/founder/students/[id]/shortlist-button.tsx` ignored `res.message`. Fixed: the detailed reason is now shown under the button.
- **Founder onboarding was a dead end.** Added an "Ask for founder access" link on `/signup` pointing to the real `/contact` page.
- **Payment gate had no alternative.** With empty bank details the CTA was only disabled. Details can now be supplied via `NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER` / `NEXT_PUBLIC_PAYMENT_MBOB_NUMBER`; local Docker setup injects clearly-labelled test values.
- **No error/404 boundaries.** Added `app/error.tsx` (with `reset()`) and `app/not-found.tsx` with a real `<main id="main-content">`, h1, and navigation out.
- **Missing status guidance.** Added a global polite live region in `app/layout.tsx`; status explanations are now part of the applications and payment flows.

Remaining nice-to-haves from the review: per-row "Saved" indicators for admin rank edits, debounced rank saves, an in-app "what's new since your last visit" card, and matching the profile-completion meter with the actual founder filter rule.

## 5. WCAG 2.2 AA audit — serious findings

Full audit was run with browser DOM/accessibility-tree inspection, keyboard traversal, 320px reflow and computed contrast on `/` (formerly `/public`), `/login`, `/signup`, `/privacy`, `/terms` and a 404. No physical screen reader was available, so announcements are inferred from the accessibility tree.

- **Validation errors not announced** (3.3.1, 4.1.3): native bubbles only. Now mitigated by the global `role="status"` live region; field-level `aria-invalid`/`aria-describedby` is still to do.
- **404 had no main landmark and a broken skip-link target** (2.4.1, 1.3.1): fixed by the new `app/not-found.tsx`.
- **320px reflow failure on the header CTA** (1.4.10): addressed by the shared `MinimalSiteHeader` mobile collapse. Re-verified at 390×844 in the final design pass: the menu button is named `Open menu`, focuses the first mobile-nav link, makes `<main>` inert, and restores focus on Escape.
- **Contrast** (1.4.3): historical `#d84f37` / `#b44532` accents are retired. The active palette uses `#1D1D1F` body text, `#6E6E73` secondary text and `#0B5C5C` for focus and the primary action.
- **Target size** (2.5.8) and **focus appearance on text links** (2.4.11): controls keep at least a 44px minimum target and use a visible deep-teal focus outline.

Verified passing: `lang="en"`, unique titles, one h1 per page with no skipped levels, landmarks on `/`, working skip link on five pages, full keyboard reachability, visible deep-teal focus treatment, real labels and autocomplete on auth forms, neutral icon panels in place of website photography, and reduced motion throughout.

The newly added marketing pages (`/how-it-works`, `/for-students`, `/for-founders`, `/about`, `/faq`, `/contact`) were still being built during the audit and need a dedicated re-audit, ideally with a real screen reader.

---

## 6. Apple-style interface craft and auto-refreshing official statistics

**Marketing site:** six public pages now share one header/footer/nav system (`components/marketing/**`). The header is a translucent material layer (blur + saturate) with a scroll-edge fade instead of a hard border, and a spring mobile menu that opens from the toggle. Motion follows the Apple/animation skills: pointer-down press feedback at 100ms, critically damped springs (bounce 0), enter/exit along the same path, transform/opacity only, strong ease-out curves, 60ms hero stagger. No loops, no parallax, no scroll hijack. Every transform-based motion has a reduced-motion counterpart that keeps only an opacity fade; reduced transparency falls back to a solid header; higher contrast adds a defined border. The active-link underline is deliberately instant: it is a state change, not a moment to celebrate.

**Trusted data sources.** Verified live on 24 Nov 2026:
- **World Bank API** (World Development Indicators), one indicator per request. Codes used: `SL.UEM.1524.ZS`, `SL.TLF.ACTI.1524.ZS`, `NY.GDP.MKTP.KD.ZG`, `SI.POV.DDAY`, `SP.POP.TOTL`, `SE.ADT.LITR.ZS`. Envelope `lastupdated` was `2026-11-11`.
- **WHO Global Health Observatory OData**, `WHOSIS_000001` (life expectancy), latest verified Bhutan value 75.3 for 2023. WHO has no youth-employment series, so it is used only for life expectancy.
- **UNDP HDR 2025 CSV** is a valid keyless source but was omitted to avoid bloating the module.

Bhutan national sources (NSB, RMA, data.gov.bt, MoLHR) were checked and **do not expose a verified public JSON/CSV API**. No real-time claim is made for them.

**Honesty about "real-time":** these are annual releases, not live feeds. The panel is labelled **"Auto-refreshing official statistics"**. `lib/data/world-bank.ts` fetches with `next: { revalidate: 3600 }`; `GET /api/context-data` adds `s-maxage=3600, stale-while-revalidate=86400`; the client polls every 10 minutes and shows both the source's own timestamp and a "checked at" timestamp. On upstream failure it keeps the last good snapshot and says so.

**The 20.6% versus 17.1% discrepancy is shown, not hidden.** The About page keeps the April 2026 press-release figure with its own citation and adds a "Why two numbers?" note: the API returns 17.1% for 2025 as an *ILO-modeled estimate* (its 2021 value is 20.609%), while the press release quotes a different figure. The note does not assert the reason for the difference.

**Verified:** all seven marketing routes return 200 with one h1 and a `#main-content` landmark; `/api/context-data` returns 200 with `ok: true` and real source data; browser checks confirm the "Auto-refreshing official statistics", "Why two numbers?", both figures, WHO attribution and "Checked at" text render. No current console errors. At 375px there is no horizontal scroll and the mobile menu opens with `aria-expanded="true"` and seven links.
