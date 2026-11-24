# Copy critic report — Bhutan Tech Connect

Date: 2026-11-24. Role: read-only critic. No product source was edited.
Written per `reports/PROTOCOL.md`.

## Scope and coverage

**Scope:** rendered copy and typography on `/public`, `/about`, `/how-it-works`, `/for-students`, `/for-founders`, `/faq`, `/contact`, `/login`, `/signup`, `/privacy`, `/terms`, `/error`, and 404. Source read across `app/**`, `components/**`, `data/landing.ts`, `config/payment.ts`, `config/app.ts`, `design/voice-guide.md`, `RESEARCH-AND-ACCESSIBILITY.md`, `proxy.ts`. Dev server responded 200; rendered DOM inspected with Playwright on all routes except `/error`.

Reference standards: `better-interface` evidence rules, `better-writing`, `better-typography`, unslop Pass 4 (Copy) and Pass 5 (Type), `design/voice-guide.md`.

| Domain | Evidence inspected | Result |
|---|---|---|
| Writing | All 13 routes' source + rendered `innerText`, error query states, legal pages | 7 findings |
| Typography | Computed `font-family`, size, weight, tracking on headings/links/buttons across rendered routes | 4 findings |
| Accessibility / Layout / Colors / UI | Not reviewed (outside requested scope) | Not reviewed |

## Ranked findings

| Severity | Domain | Location | Before | After | Why |
|---|---|---|---|---|---|
| **HIGH** | Writing | `app/for-founders/page.tsx:396-401`; `proxy.ts:24,101-103` | Public CTA `Download agreement (PDF)` → `/founder/shortlists/agreement` | Delete the CTA from the public page (the template is already offered in the founder dashboard, `app/terms/page.tsx:148-150`), or repoint it to a public route such as `/api/agreement`. Do not point a public page at `/founder/*`. | Verified: unauthenticated `fetch` of that href returns 200 HTML with title `Log in | Bhutan Tech Connect`, not a PDF. A visitor's task is blocked. |
| MEDIUM | Writing | `app/privacy/page.tsx:170`; `app/terms/page.tsx:171`; also metadata `app/privacy/page.tsx:10`, `app/terms/page.tsx:10` | `We never share shortlist contents publicly — only with the founder who paid for it.` / `The fee covers research, curation, and ranking — it is not a hiring fee.` | `We never share shortlist contents publicly. Only the founder who paid for it sees them.` / `The fee covers research, curation, and ranking. It is not a hiring fee.` Metadata: replace ` — ` with `: `. | Voice guide bans em-dashes. Both strings verified in rendered DOM. |
| MEDIUM | Writing | `app/how-it-works/page.tsx:81,144`; `app/for-founders/page.tsx:132`; `components/marketing/home/desire-chapter.tsx:22`; `components/auth/auth-shell.tsx:51` | `From brief to real project.` · `One brief. Two sides. Clear work` · `Turn a challenge into a project` · `A platform for people building here.` · `Local talent. Real projects.` | Replace with product words: `Founders post the brief. Students do the work.` (voice guide line 39); `Founders set the brief. Students apply with a CV.`; `Post a paid brief for Bhutanese students`; `Bhutanese students do paid project work.`; `Paid project work in Bhutan`. | None names students, Bhutan, a brief, a CV, or a shortlist. Any agency, job board, or marketplace could use them; the template check fails. |
| MEDIUM | Writing | `app/(auth)/login/page.tsx:19`; `app/(auth)/signup/page.tsx:16,19` | `Too many login attempts. Please wait a minute and try again.` / `Please fill every field. Password must be at least 6 characters.` | `Too many login attempts. Wait a minute and try again.` / `Fill in every field. Password must be at least 6 characters.` | `Please` in a routine instruction is cut per writing rules. Verified rendered at `/login?error=rate-limited` and `/signup?error=invalid`. |
| MEDIUM | Typography | `app/public/page.tsx:280` (18px h2, `-0.45px`); `app/contact/page.tsx:235` (20px h3, `-0.5px`); `app/faq/page.tsx:302` (20px summary, `-0.5px`); `app/for-students/page.tsx:192` (18px, `-0.02em`) | `tracking-tight` / `tracking-[-0.02em]` on text under 24px | Remove the class and use `tracking-normal` (`0`) below 24px; reserve negative tracking for display sizes. | Computed DOM check found negative letter-spacing on small text; readability rule says small text gets looser or bolder, not tighter. |
| MEDIUM | Typography | `app/public/page.tsx:88,206`; `app/for-founders/page.tsx:399`; `components/ui/submit-button.tsx:24`; `components/auth/auth-shell.tsx:22` | `font-bold` (700) on CTAs and wordmark | `font-medium` (500) on buttons; at most `font-semibold` (600) for rare emphasis | Verified computed 700 on `Create student account` and `Download agreement (PDF)`. Unslop Type caps weight at 500 with 600 as rare emphasis; hierarchy should come from size and color. |
| LOW | Writing | `app/how-it-works/page.tsx:81,100,177,197,216,237,282`; `app/for-students/page.tsx:97,116,162,229,264`; `app/contact/page.tsx:70,110,163,224`; `app/faq/page.tsx:349`; `app/not-found.tsx:27`; `app/error.tsx:34` | Short headings ending in a period: `Built for work here.`, `CVs stay private.`, `Make your profile complete.`, `Helpful pages.`, `We couldn't find that page.` | Delete the final period on each heading, subhead, and caption. Keep periods only in multi-sentence paragraphs. | Unslop Copy: headlines, labels, buttons, and captions end without a period. Confirmed in rendered DOM across all six pages. |
| LOW | Typography | `config/payment.ts:14,17,26,30` | `Nu 500 - 1,000`, `Ranked shortlist of 3-5 students`, `Nu 1,000 - 2,000`, `5-10 students` | `Nu 500–1,000`, `Ranked shortlist of 3–5 students`, `Nu 1,000–2,000`, `5–10 students` | Hyphenated ranges render as keyboard stand-ins; the voice guide's own example uses `3–5`. Verified rendered on `/for-founders`. |
| LOW | Writing | `app/error.tsx:37` | `Your account is safe.` | Delete the sentence; the page already offers `Try again` and `Back to home`. | Unverifiable reassurance in a generic error boundary — the boundary cannot know account state. **Rendered state Not verified**: `/error` requested directly returns 404; source reviewed only. |
| LOW | Writing | `app/how-it-works/page.tsx:42,48`; `app/faq/page.tsx:132-135,170-172`; `components/brand/local-bridge-differences.tsx:31` | Two sentences or three semicolon-joined clauses in one step/answer: `The founder sets the required skills, a budget range, a duration, and a deadline. The brief gives both sides a clear place to start.` / `Manually: an administrator opens the uploaded screenshot to confirm or reject the order, a confirmation requires a screenshot, and founders cannot approve their own payment.` | Shorten to one sentence each: `The founder sets the required skills, budget range, duration, and deadline.` / `An admin checks the screenshot; founders cannot approve their own payment.` | Minimal brief asks for one sentence per section. Factual attribution paragraphs (`Why two numbers?`) are excluded — their detail is required by the honesty rule. |
| LOW | Writing | `app/for-founders/page.tsx:54`; `app/faq/page.tsx:80,122-124` | Raw paths as prose: `Sign in at /login`, `then log in at /login`, `at /student/projects`, `at /student/applications` | Make them links, or shorten to verb labels: `Log in`, `See your applications`. | Links should describe their destination; a bare path is not a useful label. Source verified; not separately asserted in rendered DOM. |

## Verification

**Passed (rendered):** one font family only (`-apple-system` stack) on all inspected routes; no italic headings; no exclamation marks, emoji, `SECTION 01` tags, hype words, or uppercase tracked labels in the scoped rendered pages; no greeting headline. Prices `Nu 500 - 1,000` / `Nu 1,000 - 2,000` and all nine package features render intact; `Prices are advertised ranges` note renders. `20.6%`, `17.1%`, World Bank source label, `Xavier Furtado` quote, WHO attribution, `Checked at`, and both "Why two numbers?" notes render. All 11 FAQ `<details>` blocks render. `TextReveal`'s doubled `innerText` on `/about` is the intentional `sr-only` plus `aria-hidden` word spans, not a duplicate headline.

**Not verified:** `/error` rendered copy (direct request returns 404); the low-severity raw-path finding was source-checked only; no physical screen-reader pass (Accessibility out of scope).

## Cross-reference to other reports

At finalization only `reports/PROTOCOL.md` existed; no other `reports/*.md` was present to compare. To prevent duplication when the expected reports land:

- **`reports/content-integrity.md`** owns lost facts, prices, links, and legal text. My HIGH row concerns the *public CTA path*, not content loss; I verified prices, all nine package features, World Bank/WHO attributions, the `20.6%`/`17.1%` pair, and legal text are intact, so I raise **no loss finding**. That agent should own any further link-route audit beyond the single agreement CTA.
- **`reports/visual-critic.md`** owns visual/rendered design judgment. My MEDIUM Typography rows are rule violations measured on computed values (weight 700, negative tracking below 24px), not visual taste; do not restate them as visual findings.
- **`reports/accessibility-critic.md`** owns WCAG/motion. My `app/error.tsx:37` row is a copy-claim issue, not an error-recovery or announcement issue; my scope excluded Accessibility entirely.
- **`reports/performance-seo.md`** owns metadata/SEO. The em-dash row mentions two `metadata.description` strings only as copy punctuation; any SEO-content assessment belongs to that report.
- **`reports/icon-fix.md`** and **`reports/brand-mark.md`** have no overlap with this report.
- **`reports/orchestrator.md`** should treat the HIGH agreement-download CTA as a source fix owned by a fixer, not by this critic.

## Verdict

**Block.** One HIGH finding remains: the public agreement download resolves to the login page. Fix or remove that CTA, then clear the MEDIUM copy and typography rows before shipping. Accessibility, Layout, Colors, and UI were not reviewed.
