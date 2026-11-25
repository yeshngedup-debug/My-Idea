# `/faq` page audit

Date: 2026-11-24. Role: read-only page critic under `reports/PROTOCOL.md:3,10-19`. Only this report file was written. Uncommitted working-tree changes were treated as authoritative; no product source, config, schema, test, existing report, or `reports/page-audits/INDEX.md` entry was edited.

## Route

`/faq` — public, static FAQ page. `app/faq/page.tsx:21-26` sets canonical/OG/Twitter metadata through `lib/metadata.ts:8-42`. The page renders one hero, a topic anchor index, three topic chapters with 11 native `<details>` disclosures, a photo with attribution, and a closing contact CTA (`app/faq/page.tsx:219-379`). No route-level fetch, server action, API call, form, mutation, dynamic param, Supabase/Neon query, or RLS decision was found.

## Files traced

- `app/faq/page.tsx:1-379` — sole route under audit: metadata, topic data, 11 Q&As, anchors, CTAs, image, and imports.
- `lib/metadata.ts:8-42` — `pageMetadata` builder used at `app/faq/page.tsx:21-26`.
- `app/layout.tsx:108-139` — root metadata icons, static Organization JSON-LD at `:110-125`, skip link at `:128-134`, `MotionProvider` at `:137`.
- `components/marketing/site-header.tsx:95-139`; `components/marketing/site-footer.tsx:11-56`; `components/marketing/nav.ts:34-66` — shared public chrome and link constants rendered by the route.
- `components/marketing/cta-band.tsx:22-60` — closing CTA rendered at `app/faq/page.tsx:366-371`.
- `components/marketing/guides/primitives.tsx:13-45` — `Chapter` section wrapper used at `app/faq/page.tsx:284-337`.
- `components/layout/pinned-heading-section.tsx:9-25` — sticky-on-lg heading column used at `app/faq/page.tsx:290-335`.
- `components/ui/motion.tsx:42-142`; `components/marketing/hero-motion.tsx:27-74` — reveal/stagger and hero entrance behavior used at `app/faq/page.tsx:15-16,228,313-332`; both have explicit reduced-motion static branches.
- `components/ui/photo-credit.tsx:25-59` — external Wikimedia/licence links used at `app/faq/page.tsx:358`.
- `proxy.ts:19-25,39-59,100-134` — CSP and auth/role gate; `/faq` is not in `PROTECTED_PREFIXES`.
- `public/og-image.png` — exists (53,506 bytes), so no missing-OG-image finding is repeated.
- `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `reports/page-audits/INDEX.md`, every existing `reports/*.md`, and every existing `reports/page-audits/*.md` were read before finalizing for overlap handling.

## Skills used

All ten assigned skills were loaded before analysis and applied under `reports/SKILL-ASSIGNMENTS.md:5,11` precedence:

| Skill | How it was used here |
|---|---|
| `unslop` | Checked for AI tells and filler; no new widget, badge, glow, marquee, or hype copy is recommended. Raw route strings and duplicated nav copy are the only minimal-copy issues confirmed. |
| `better-interface` | Assessed the native `<details>` disclosures, anchors, CTA hierarchy, and the real reading task on this route. |
| `better-layout` | Assessed the hero/topic-index grid, duplicate topic headings, sticky chapter headings, and wrapper height. |
| `better-ui` | Checked inline link styling, focus rings, disclosure caret, photo credit, and closing band details. |
| `better-writing` | Checked raw paths as prose, semicolon-heavy answers, and repeated contact intent. Overlaps with `reports/copy-critic.md:31-32` are cited rather than re-owned. |
| `frontend-a11y` | Checked one `h1`, section `h2`s, `<summary>` labels, skip target, anchor targets, link purpose, and focus-visible rings. |
| `better-accessibility` | Checked keyboard-operable disclosures, 44px-ish summary targets, reduced-motion branches, contrast-relevant colors, and source-level mobile sizing. |
| `webapp-testing` | Drove the running app with Playwright: title/DOM, disclosure click, anchor targets, plain-vs-linked paths, console messages, and network requests. |
| `security-review` | Reviewed no-secret/no-user-input boundary, static metadata sink, external `rel="noopener noreferrer"` credits, and CSP context. |
| `api-security-testing` | Confirmed no API route, action, query, mutation, or identifier is reachable from `/faq`; therefore no API-specific test applies to this route. |

## UI/UX findings

### Confirmed

| ID | Severity | Evidence | Why it matters | Concrete fix / overlap |
|---|---|---|---|---|
| UI-1 | LOW | `app/faq/page.tsx:41-56` defines topic titles “The basics”, “Profiles and projects”, and “Shortlists, payments and launch”; the same strings are the section `<h2>`s at `:62`, `:115`, and `:171`. The rendered index is at `:252-276`. `reports/visual-recheck.md:29` marks this fixed, but current source still contradicts that claim; `reports/cold-eyes.md:26` already owns the nav-duplication issue. | The index restates the three headings immediately below it and adds `text-xs` descriptions at `:269` without helping a user pick a unique answer. It also makes the page look like two competing tables of contents. | Prefer deleting the `nav aria-label="Question topics"` block at `:252-276`; the three `Chapter` headings at `:284-337` already index the page. If an index must stay, rename topic labels to distinct outcome labels and drop the descriptions. Treat this as the still-present instance of the two owning reports, not a new work item. |
| UI-2 | LOW | `app/faq/page.tsx:221` uses `min-h-screen`; same class owned at `reports/cold-eyes.md:25`. | Mobile Safari shows/jumps the address bar as `100vh` changes, so the page background/footer can shift during scroll. | Change to `min-h-[100dvh]`. No other layout change. |
| UI-3 | LOW | Eleven questions are defined at `app/faq/page.tsx:65-216` and rendered as native `<details>` at `:314-332`; route source contains no search input or filter. Live check confirmed 11 closed disclosures. Already identified at `reports/component-relevance-audit.md:33`. | Native disclosure is the correct zero-JS affordance, but finding one answer among 11 still requires linear scanning. | If this gap is in scope, use the existing `Input` + shared `Accordion` approach proposed by the owning report, with a visible `role="status"` count (`Showing 2 of 11 questions`). Otherwise record the 11-item scan as an accepted tradeoff; do not add a bespoke search widget. |

### Suspected

None. No suspected UI/UX issue was found that could not be tied to current source or the live DOM.

## Workflow findings

### Confirmed

| ID | Severity | Evidence | Why it matters | Concrete fix / overlap |
|---|---|---|---|---|
| WF-1 | MED | `app/faq/page.tsx:107` renders `/login` as text; `:150-151` renders `/student/projects` and `/student/applications` as text; `:179` renders `/founder/shortlists` as text. Expanded-DOM Playwright check found `hrefCount: 0` for the three student/founder paths, and the `/login` answer text is not linked even though other page links point to `/login`. Same issue class at `reports/copy-critic.md:32`; this audit adds `/founder/shortlists` and rendered DOM proof. | Users must retype protected URLs instead of continuing the flow. This is inconsistent with the linked `/signup` at `:82-87` and `/contact` at `:100-105`, and the destinations are role-gated by `proxy.ts:25,111-112,124-130`, so the link is the only safe next step. | Link descriptive words, not bare paths: `Log in` → `/login`; `your projects` → `/student/projects`; `your applications` → `/student/applications`; `the shortlist page` → `/founder/shortlists`. Keep a visible path only if it is deliberately being documented as a URL. |
| WF-2 | LOW | `app/faq/page.tsx:21-26` only calls `pageMetadata`; 11 Q&As are defined at `:65-216` and rendered at `:314-332`. `app/layout.tsx:110-125` emits only an `Organization` JSON-LD block; live check found JSON-LD types `["Organization"]`. Already flagged at `reports/performance-seo.md:124,126,233`. | The page has 11 eligible static Q&A pairs but exposes no `FAQPage` structured-data signal to search engines. | Add one `FAQPage` JSON-LD block with the exact 11 question/answer texts, stripping markup from answers, and keep it in sync with `clusters`. Validate with a rich-result checker. Do not re-add the stale missing-logo or `SearchAction` claims: root JSON-LD now uses `/icon-512.png` and declares no `SearchAction` (`app/layout.tsx:118-123`). |

### Suspected

None.

## Database/RLS findings

### Confirmed

No route-level database, RLS, or API-security finding exists for `/faq`; no severity row is assigned because there is no finding.

- `app/faq/page.tsx:1-379` is static: no `fetch`, server action, API route call, Supabase/Neon client, form, mutation, dynamic parameter, or cookie/session read appears in the route or traced imports.
- `proxy.ts:100-103` calls `supabase.auth.getUser()` for requests, but `PROTECTED_PREFIXES` at `:25` is only `/student`, `/founder`, and `/admin`. `safeRole()` is called only for auth pages or protected areas at `:116-125`; `/faq` receives the plain `response` at `:134`.
- `app/layout.tsx:110-125` serializes a fixed object into JSON-LD with a nonce; there is no user-controlled input in that sink.
- No secret, API key, password, or token appears in the audited route. External photo-credit links use `target="_blank"` with `rel="noopener noreferrer"` (`components/ui/photo-credit.tsx:41-55`), and CSP is set at `proxy.ts:39-59`.

### Suspected

None. The answers about CV privacy (`app/faq/page.tsx:157-164`) and manual payment confirmation (`:176-201`) describe backend behavior but do not query or enforce it on this route. Whether those claims still match the current backend is outside this static route audit and is not reported as a finding here.

## Severity summary

| Status | HIGH | MED | LOW | Finding IDs |
|---|---:|---:|---:|---|
| Confirmed | 0 | 1 | 4 | WF-1; UI-1, UI-2, UI-3, WF-2 |
| Suspected | 0 | 0 | 0 | None |

UI-1, UI-2, UI-3, and WF-2 are still-present instances owned by earlier reports; they are listed so the `/faq` status is explicit, not as duplicate owners. Severity labels follow the requested `HIGH` / `MED` / `LOW` scale; owning reports that say `MEDIUM` are not re-ranked here.

## Recommended fixes

1. `app/faq/page.tsx:107,150-151,179` — replace the four protected raw paths with descriptive `Link` elements as specified in WF-1; extend `reports/copy-critic.md:32` with `/founder/shortlists` if that report is updated.
2. `app/faq/page.tsx:41-57,252-276` — remove the redundant topic index, or give it labels distinct from the section `<h2>`s at `:62`, `:115`, and `:171`; reconcile the stale `FIXED` claim at `reports/visual-recheck.md:29`.
3. `app/faq/page.tsx:221` — change `min-h-screen` to `min-h-[100dvh]`.
4. `app/faq/page.tsx:281-338` — decide explicitly whether 11 native disclosures are enough; if not, implement the existing `Input` + `Accordion` + `role="status"` plan from `reports/component-relevance-audit.md:33`.
5. `app/faq/page.tsx:21-26` — add `FAQPage` JSON-LD only if the 11 Q&As remain static; validate after adding, and do not revive the stale logo/`SearchAction` findings already fixed in `app/layout.tsx:110-125`.

## Notes/limitations

- Read-only pass: no product source, config, schema, test, existing report, or index was edited. `npm run build` was not run while `next dev` was active, and no child agents were spawned.
- Live Playwright run against the running dev server at `http://localhost:3000/faq` confirmed title `Frequently asked questions | Bhutan Tech Connect`, one `h1`, four section `h2`s, 11 `details`/`summary` pairs all initially closed, first summary click opens its answer, all in-page anchor targets exist, and `main#main-content` exists for the skip link.
- Live console check reported 0 errors and 0 warnings (only React DevTools/HMR info). Network check reported no dynamic requests; 31 static requests were not shown.
- Shared-browser tab races affected later tab-index and resize probes; those results were discarded. The earlier isolated `/faq` DOM checks cited above were retained.
- Not verified here: a production build, mobile-device layout or Safari behavior, screen-reader output, rich-result eligibility, or backend truth of the CV/payment/demo-account claims.
- Overlaps were checked against all existing reports. Not repeated: missing `og-image.png` (the asset exists and `lib/metadata.ts:32-40` references it); missing `logo.png`/`SearchAction` (`app/layout.tsx:118-123` now uses `/icon-512.png` and no `SearchAction`); stale FAQ anchor mismatch (`content-integrity.md:66` still matches `app/faq/page.tsx:43,48,53` to ids at `:61,114,170`); and negative tracking on a small FAQ summary (`copy-critic.md:26`; current `app/faq/page.tsx:318` has no tracking class, while `:303` negative tracking is on a 4xl–6xl `h2`).
