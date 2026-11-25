# Page audit — `/for-founders`

Date: 2026-11-24. One agent performed all UI/a11y, workflow/CTA/link/metadata, and database/data-layer checks. Role: read-only critic. The only file written is this report; no product source, config, schema, test, or existing report was edited. Uncommitted working-tree changes were treated as authoritative and were left untouched. `git diff -- app/for-founders/page.tsx` was empty at audit time.

## Route

Audited route: `/for-founders`, implemented solely by `app/for-founders/page.tsx` (503 lines). The dev server at `http://localhost:3000` returned `200` for `/for-founders`, `/contact`, `/how-it-works`, and `/login`.

Runtime method: Playwright drove the running dev server in an isolated browser context. Interaction checks used `localhost`; `127.0.0.1` returned HTML but did not hydrate in this environment, so those early click results were discarded and rerun on `localhost`. Checks covered rendered headings and landmarks, focusable controls, package accordion and founder-access disclosure state, mobile navigation, metadata, internal links, image loading and alt text, console/network output, 1440px/375px/320px layout, and `prefers-reduced-motion: reduce`. No build, test suite, schema migration, server restart, or child agent was used.

## Files traced

- Route: `app/for-founders/page.tsx`.
- Shell and navigation: `app/layout.tsx`, `components/marketing/site-header.tsx`, `components/marketing/site-footer.tsx`, `components/marketing/nav.ts`.
- Marketing blocks: `components/marketing/page-hero.tsx`, `section-intro.tsx`, `cta-band.tsx`, `photo-feature.tsx`, `product-preview/shortlist-preview.tsx`, `product-preview/shortlist-row.tsx`, `product-preview/sample-shortlist-data.ts`, `components/ui/photo-credit.tsx`, `components/ui/status-timeline.tsx`.
- Interaction/motion: `components/interactive/animated-disclosure-list.tsx`, `components/interactive/accordion.tsx`, `components/motion/stacked-cards.tsx`, `components/motion/_shared.ts`, `components/layout/pinned-heading-section.tsx`, `components/ui/motion.tsx`, `components/ui/text-reveal.tsx`, `components/ui/spotlight-card.tsx`, `app/globals.css`.
- Data/config referenced by claims: `config/payment.ts`, `lib/metadata.ts`, `lib/neon-data.ts`, `app/api/cv/[id]/route.ts`, `app/founder/students/[id]/page.tsx`, `app/founder/browse-students/page.tsx`, `app/founder/browse-students/browse-client.tsx`, `app/founder/shortlists/shortlists-client.tsx`, `neon/schema.sql`.

## Skills used

Applied under `reports/SKILL-ASSIGNMENTS.md` precedence: `unslop`, `better-interface`, `better-layout`, `better-ui`, `better-writing`, `frontend-a11y`, `better-accessibility`, `webapp-testing`, and `security-review`. Sources: `~/.config/opencode/skills/<id>/SKILL.md`. `better-interface` governed severity and evidence; `better-writing` governed product-claim accuracy; `frontend-a11y` and `better-accessibility` governed semantics and WCAG review; `webapp-testing` governed the browser drive; `security-review` governed the authorization/data trace.

`api-security-testing` was read from `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md` but is not listed as used: no API endpoint, server action, query, or mutation originates from this route. Reference docs read: `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `reports/page-audits/INDEX.md`, every existing `reports/*.md`, and every existing `reports/page-audits/*.md`. No Next.js API was written, so no source-changing Next.js guidance was needed.

## UI/UX findings

**Confirmed — MED — Reduced-motion payment cards still stick and cover earlier steps.**  
- **Where:** `app/for-founders/page.tsx:467-476`; `components/motion/stacked-cards.tsx:19-20`, `:111`, `:113`; `app/globals.css:141-145`, `:148-163`.
- **Evidence:** with `prefers-reduced-motion: reduce` at 1440×900, all three `li[data-stacked-card]` elements computed `position: sticky` and `top: 96px / 108px / 120px`. After scrolling 400px into the section, viewport tops were `96`, `108`, and `160`; hit-testing the first two card midpoints resolved to other cards' articles, so earlier text was covered. The component comment at `stacked-cards.tsx:19-20` promises a plain, fully visible ordered list under reduced motion, and the CSS fallback at `app/globals.css:160-163` only resets opacity/transform, not sticky positioning.
- **Why it matters:** readers who opt out of motion still receive scroll pinning, and overlapping cards obscure the payment instructions. This is a route-level reading defect, not the already-reviewed opacity/GSAP behavior at `reports/accessibility-critic.md:42`.
- **Fix:** scope the sticky rule to no-preference only: `@media (min-width: 768px) and (prefers-reduced-motion: no-preference) { [data-stacked-card] { position: sticky; top: var(--stack-top); } }`; under `prefers-reduced-motion: reduce`, set `[data-stacked-card] { position: static; top: auto; }`. Keep the existing opacity/transform fallback.

**Confirmed — MED — Sample shortlist micro-labels fail WCAG AA contrast.**  
- **Where:** `components/marketing/product-preview/shortlist-preview.tsx:48-49` and `:76`, mounted by `app/for-founders/page.tsx:440`.
- **Evidence:** rendered 12px text uses `rgb(101, 112, 105)` (`#657069`) on `rgb(234, 229, 217)` (`#eae5d9`) = **4.1:1**, below the 4.5:1 AA minimum. The same class at `shortlist-preview.tsx:37` sits on `#f5f2ea` and measured 4.61:1, so only the two panel instances fail.
- **Why it matters:** "Payment confirmation" and the demo-data disclaimer are small but meaningful parts of the product preview; the disclaimer is the honest-labelling safeguard for sample data. This is a distinct literal-hex occurrence from the alpha-ink issue owned at `reports/accessibility-critic.md:29`.
- **Fix:** replace `text-[#657069]` at `shortlist-preview.tsx:48` and `:76` with `text-body-secondary` (`#56645c`, measured 4.95:1 on `#eae5d9`), or darken the literal to an AA-passing token. Do not change the sample data or remove the disclaimer.

**Confirmed carry-over — LOW — Mobile-Safari height wrapper remains.**  
- **Where:** `app/for-founders/page.tsx:167` (`min-h-screen`). Already owned at `reports/cold-eyes.md:25`; not counted as a new finding.
- **Why it matters:** the wrapper can jump when the mobile address bar hides.
- **Fix:** change to `min-h-[100dvh]` when that owner fix is applied.

**Confirmed carry-over — LOW — Payment section keeps the repeated three-column prose-row pattern.**  
- **Where:** `app/for-founders/page.tsx:442-476`. Already recorded as R1 at `reports/visual-recheck.md:119`; not counted as a new finding.
- **Why it matters:** the pattern repeats across several public pages and weakens page-specific character.
- **Fix:** follow the owning report's direction: vary the payment treatment while keeping the three real payment steps and their order.

**Verified, no new finding:** one `h1`, nine `h2`, six `h3`; one `<title>` and one description meta; no horizontal overflow at 1440px, 375px, or 320px (`scrollWidth === clientWidth`); all three images loaded with descriptive alt text and working credit links; package `<details>` elements start closed and open independently; the founder-access disclosure and mobile menu changed `aria-expanded` correctly on click/keyboard after hydration; focus rings are visible. `reports/component-relevance-audit.md:32` remains correct: `SpotlightCard`, `TextReveal`, and `ShortlistPreview` carry real content and should not be removed.

## Workflow findings

**Confirmed — MED — CV privacy claim is narrower than the actual access rule.**  
- **Where:** `app/for-founders/page.tsx:97` ("Open a CV when a shortlist order has been confirmed") and `:317-318` ("CVs stay private until a shortlist order is confirmed"); `app/api/cv/[id]/route.ts:59-63`, `:65-78`; `app/founder/students/[id]/page.tsx:91`.
- **Evidence:** the API grants founders access when the student applied to one of their projects (`:59-63`) before it checks confirmed orders and shortlist rows (`:65-78`). The founder detail page also renders the `/api/cv/[id]` link whenever `cv_path` exists.
- **Why it matters:** a visitor is told a confirmed paid order is the only founder path to a CV. Access is still checked and signed, so this is a privacy-description defect, not an authorization bypass. `better-writing` treats the promise as a product-fact mismatch.
- **Fix:** rewrite both page lines to match the route, e.g. "CVs open through short-lived checked links for admins, founders connected to an application, or founders with a confirmed shortlist order." If confirmed-order-only access is intended, remove or gate `hasApplicationToFounderProject` in `route.ts:59-63` and add a test. Underlying route behavior is owned at `reports/page-audits/how-it-works.md:52-57`; `reports/content-integrity.md:44` is stale for this route's copy.

**Confirmed — MED — Shortlist copy skips the admin-finalization step after payment.**  
- **Where:** `app/for-founders/page.tsx:125`; `components/marketing/product-preview/shortlist-preview.tsx:42-45`; `app/founder/shortlists/shortlists-client.tsx:304-307`.
- **Evidence:** the page says an admin confirms payment and releases the shortlist, and the preview says the founder view appears after payment is confirmed. The real unlocked founder UI says, "Payment confirmed. Your ranked shortlist will appear here as soon as the admin finalizes it."
- **Why it matters:** a founder who pays expects immediate release; the product adds admin ranking/finalization after confirmation. This is the same class as `reports/page-audits/how-it-works.md:59-64`, recorded here because this route makes the promise in its own copy and preview.
- **Fix:** change `page.tsx:125` to "An admin confirms payment, finalizes and ranks the shortlist, then releases it; founders cannot confirm their own orders." Change `shortlist-preview.tsx:43-45` to say the view appears after admin finalization. Do not restate the live unlock-badge defect owned at `reports/page-audits/founder-shortlists.md:70`.

**Confirmed carry-over — LOW — Raw `/login` path remains in visible prose.**  
- **Where:** `app/for-founders/page.tsx:61`. Already owned at `reports/copy-critic.md:32` (older line number 54); not counted as a new finding.
- **Why it matters:** a bare path is not a useful link label, and visitors cannot act on it directly.
- **Fix:** make "Log in" a `Link href="/login"` or shorten the sentence to "Log in and describe the work…".

**Verified accurate / no new finding:** the three main-content CTAs resolve to `/contact` or `/how-it-works`, and both returned 200; mobile navigation links also resolve. The header founder CTA mismatch is resolved at `components/marketing/site-header.tsx:28-34`. The stale public agreement-download CTA at `reports/content-integrity.md:55` and `reports/copy-critic.md:22` is absent; current copy at `app/for-founders/page.tsx:481-492` says the template is inside the founder workspace. Runtime metadata: title `For founders | Bhutan Tech Connect`, canonical `https://bhutantech.bt/for-founders`, OG/Twitter title `For founders`, and OG/Twitter image `https://bhutantech.bt/og-image.png`; `public/og-image.png` exists and renders. The earlier SEO regression at `reports/performance-seo.md:99-107` (and `:207-209`) is resolved. Package names, ranges, and all nine features come from `config/payment.ts:10-36`; the "Completed profiles" claim is supported by `lib/neon-data.ts:641-651`.

## Database/RLS findings

**Confirmed — no route-level data layer exists.**  
- **Where:** `app/for-founders/` contains only `page.tsx`. Static search across the route found no `use server`, `fetch(`, `supabase`, `createClient`, `prisma`, `neon`, `postgres`, `` sql` ``, `/api/`, `revalidatePath`, or `redirect(`. There are no server actions, database queries, mutations, or API calls originating from `/for-founders`.
- **Evidence:** `ShortlistPreview` uses `SAMPLE_STUDENTS` from `components/marketing/product-preview/sample-shortlist-data.ts`, and packages come from static `config/payment.ts`. Scoped runtime network captured only `GET http://localhost:3000/for-founders` (`document`), with no XHR/fetch/API request and no failed requests. Console output contained only the dev HMR WebSocket error, not an application error.
- **Why it matters:** no route-owned RLS, authorization, or mutation surface needs to be audited here. CV access and shortlist-finalization behavior are referenced only because this page makes claims about them.
- **Fix:** none for this route. Keep the data-layer findings with their owning routes.

**Referenced, not duplicated:** `neon/schema.sql:3-4` has no RLS and the app-only authorization pattern is owned at `reports/page-audits/founder-shortlists.md:92`; CV API authorization is owned at `reports/page-audits/how-it-works.md:52-57`; the live shortlist unlock badge is owned at `reports/page-audits/founder-shortlists.md:70`. No new database/RLS finding originates from this page.

## Severity summary

| Severity | Status | Count | Items |
|---|---|---:|---|
| HIGH | Confirmed | 0 | None. No blocked core task, security bypass, or inaccessible primary content. |
| MED | Confirmed new | 4 | Reduced-motion sticky overlap; sample-label contrast; CV privacy copy; shortlist-finalization copy. |
| LOW | Confirmed carry-over, not new | 3 | `min-h-screen`; repeated payment prose-row pattern; raw `/login` prose. |
| LOW | Suspected only | 0 | None. Every finding above is confirmed by current source and/or runtime evidence. |

## Recommended fixes

1. Gate `[data-stacked-card]` sticky positioning on `prefers-reduced-motion: no-preference` and reset it to `position: static` under reduce (`app/globals.css:141-163`).
2. Replace `text-[#657069]` with `text-body-secondary` at `components/marketing/product-preview/shortlist-preview.tsx:48` and `:76`.
3. Rewrite the CV claim at `app/for-founders/page.tsx:97` and `:317-318` to include the application-based access path, or tighten `app/api/cv/[id]/route.ts:59-63` if that path is unintended.
4. Add admin finalization/ranking to `app/for-founders/page.tsx:125` and `components/marketing/product-preview/shortlist-preview.tsx:42-45`.
5. Apply the already-owned LOW fixes when their owners schedule them: `min-h-[100dvh]` at `page.tsx:167`, a real `/login` link at `:61`, and a less repetitive payment treatment at `:442-476`.
6. Do not change the founder header CTA, OG image/metadata, agreement copy, or the relevant `SpotlightCard`/`TextReveal`/`ShortlistPreview` components; those are verified correct or explicitly owned as relevant.

## Notes/limitations

- Overlap references per `reports/PROTOCOL.md`: `reports/cold-eyes.md:25` owns `min-h-screen`; `reports/cold-eyes.md:19` owns the founder-header CTA mismatch, now resolved in `components/marketing/site-header.tsx:28-34`; `reports/visual-recheck.md:119` and `:151` own the repeated prose-row pattern and mobile reflow; `reports/component-relevance-audit.md:32` owns component relevance; `reports/copy-critic.md:32` owns raw-path prose; `reports/accessibility-critic.md:29` owns the earlier alpha-ink contrast; `reports/content-integrity.md:55` and `reports/copy-critic.md:22` own the stale agreement CTA, now resolved; `reports/performance-seo.md:207-209` records the resolved SEO fixes; `reports/page-audits/how-it-works.md:52-64` owns the CV-access and admin-finalization mismatches on another route; `reports/page-audits/founder-shortlists.md:70,92` owns unlock-badge and no-RLS issues.
- Playwright MCP `execute` calls repeatedly failed with `SyntaxError: Unterminated string constant`; equivalent scoped browser checks were completed with local scripts under `C:\Users\DELL\AppData\Local\Temp\opencode\`. No build was run while `next dev` was running.
- Production environment values for payment destinations were not available, and no production Core Web Vitals run was performed. Authenticated founder states were traced in source, not driven in a browser session; the public unauthenticated `/for-founders` page was driven end to end.
- Alt text was checked in the rendered DOM and image loads, not against photo semantics by a human. Physical screen-reader testing and 200% zoom were not performed.
- Uncommitted user changes elsewhere in the repo were treated as authoritative and were not reverted, overwritten, staged, or committed.
