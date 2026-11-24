# Content integrity verification — Bhutan Tech Connect

Date: 2026-11-24. Role: read-only critic. No product source was edited. Written per `reports/PROTOCOL.md`.

## Scope

Cross-checked the named sources of truth (`data/landing.ts`, `config/payment.ts`, `config/app.ts`, `RESEARCH-AND-ACCESSIBILITY.md`, `README.md`, `design/voice-guide.md`, `app/faq/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/contact/page.tsx`, `components/data/live-context.tsx`) against the current pages: `/public`, `/about`, `/how-it-works`, `/for-students`, `/for-founders`, `/faq`, `/contact`, `/login`, `/signup`, `/privacy`, `/terms`, `error.tsx`, `not-found.tsx`. Also checked `components/marketing/nav.ts`, `components/ui/photo-credit.tsx`, `proxy.ts`, `app/founder/shortlists/shortlists-client.tsx`, `app/founder/shortlists/agreement/route.ts`, and all internal `href`s.

## Verification table — item | source of truth | where it should appear | present? | exact line

| Item | Source of truth | Where it should appear | Present? | Exact line |
|---|---|---|---|---|
| 20.6% youth unemployment | `data/landing.ts:31` | `/public`, `/about`, live panel note | Yes | `app/public/page.tsx:169,287,315`; `app/about/page.tsx:84`; `live-context.tsx:205` |
| 7.1% real GDP FY25/26 | `data/landing.ts:38` | `/public`, `/about` | Yes | `public/page.tsx:244` (CONTEXT_FACTS); `about/page.tsx:103,109` |
| 6.4% FY26/27 note | `data/landing.ts:40` | `/public`, `/about` | Yes | CONTEXT_FACTS note rendered at `public/page.tsx:253`; `about/page.tsx:115` |
| ~9% emigrated (2025) | `data/landing.ts:43` | `/public`, `/about` | Yes | `public/page.tsx:244`; `about/page.tsx:103` |
| 55% agrifood employment | `data/landing.ts:48` | `/public`, `/about` | Yes | `public/page.tsx:244`; `about/page.tsx:103` |
| 71% of rural workers note | `data/landing.ts:50` | `/public`, `/about` | Yes | CONTEXT_FACTS note at `public/page.tsx:253`; `about/page.tsx:115` |
| Quote text | `data/landing.ts:55` | `/about` | Yes | `about/page.tsx:123` |
| Quote author (Xavier Furtado) | `data/landing.ts:56` | `/about` | Yes | `about/page.tsx:126` |
| World Bank press-release URL | `data/landing.ts:15` | `/public`, `/about`, live note | Yes | `public/page.tsx:180,261,296,318`; `about/page.tsx:134`; `live-context.tsx:216` |
| World Bank API URL (LIVE_DATA_SOURCE) | `data/landing.ts:25` | `/public` "Why two numbers?" | Yes | `public/page.tsx:329` |
| "Auto-refreshing official statistics" label | `data/landing.ts:24`; `RESEARCH:71` | live panel on `/public`, `/about` | Yes | `live-context.tsx:262,325` |
| "Why two numbers?" + 20.6 vs 17.1, reasons not established | `voice-guide:29-31`; `RESEARCH:73` | `/public`, `/about` (live panel) | Yes | `public/page.tsx:282-336`; `live-context.tsx:200-235,291`; `about/page.tsx:147` |
| 17.1% ILO-modeled estimate | `voice-guide:31`; `RESEARCH:73` | rendered from API on `/public`, `/about` | Yes | `public/page.tsx:288`; `live-context.tsx:206` (youth.displayValue) |
| "National indicator, not a platform result" | `data/landing.ts:33`; `voice-guide:22` | `/public`, `/about`, live panel | Yes | `public/page.tsx:176,268,296`; `about/page.tsx:141`; `live-context.tsx:296` |
| Basic Nu 500 - 1,000 | `config/payment.ts:14` | `/for-founders`, founder shortlists | Yes | `for-founders/page.tsx:297` (PACKAGES.basic.priceRange) |
| Basic default 750 | `config/payment.ts:15` | payment screen | Yes | `shortlists-client.tsx:77,136` |
| Basic 4 features | `config/payment.ts:16-21` | `/for-founders` | Yes | `for-founders/page.tsx:300-313` (features.map) |
| Full Nu 1,000 - 2,000 | `config/payment.ts:26` | `/for-founders`, founder shortlists | Yes | `for-founders/page.tsx:324` |
| Full default 1500 | `config/payment.ts:27` | payment screen | Yes | `shortlists-client.tsx:77` |
| Full 5 features | `config/payment.ts:28-34` | `/for-founders` | Yes | `for-founders/page.tsx:328-341` |
| Bank fields (Bank of Bhutan, Thimphu, account name/number) | `config/payment.ts:41-46` | founder shortlists | Yes | `shortlists-client.tsx:213-216` |
| mBoB fields (label, name, number) | `config/payment.ts:47-51` | founder shortlists | Yes | `shortlists-client.tsx:222-226` |
| "Upload screenshot, then an admin confirms" | `config/payment.ts:52` | `/faq`, founder shortlists | Yes | `faq/page.tsx:150-152`; `shortlists-client.tsx:239` |
| PAYMENT_CONFIGURED gate | `config/payment.ts:60-62` | founder shortlists | Yes | `shortlists-client.tsx:114-121,239` |
| "Prices are advertised ranges" | grounded in `config/payment.ts:14,26` | `/for-founders` | Yes | `for-founders/page.tsx:348-349` |
| "Founders cannot confirm their own orders" | `voice-guide:17` | `/for-founders`, `/how-it-works`, `/faq` | Yes (exact at for-founders) | `for-founders/page.tsx:118`; variants `how-it-works:257`, `faq:160-161` |
| "A manual check, never an algorithm" | `voice-guide:18`; `RESEARCH:22` | `/about` | Yes | `about/page.tsx:208` |
| "Bank transfer or mBoB" | `voice-guide:7`; `README:6,128` | `/for-founders`, `/how-it-works`, `/faq` | Yes | `for-founders:108`; `how-it-works:219-220`; `faq:150-151` |
| Founder access assigned by admin | `README:125`; `RESEARCH:37` | `/for-founders`, `/public`, `/faq` | Yes | `for-founders:134,172`; `public:202`; `faq:71-74` |
| Founder-access → `/contact` link on `/signup` | `RESEARCH:37` | `/signup` | Yes | `signup/page.tsx:41` |
| Demo accounts removed before launch (@btc-test.com) | `README:162-165` | `/faq` | Yes | `faq/page.tsx:180-182` |
| CVs private / admin-confirmed order to open | `README:82,166`; `RESEARCH:20` | `/faq`, `/how-it-works`, `/for-founders` | Yes | `faq:132-135`; `how-it-works:239-242`; `for-founders:90` |
| Statuses pending → shortlisted/accepted/rejected | `supabase/schema.sql:88` (grounding) | `/how-it-works`, `/for-students` | Yes | `how-it-works:68,299`; `for-students:85` |
| Three Wikimedia Commons credit URLs (youth / boys / girls) | `README:140`; `photo-credit.tsx:7-21` | all photo-bearing pages | Yes | `nav.ts:70-73`; `about:33,40,47`; `for-founders:35,42`; `for-students:29,105`; `faq:31,203`; `contact:27,60`; `how-it-works:28,89`; `public/page.tsx:111,152` (via nav); registry `photo-credit.tsx:7-21` |
| Privacy 5 sections + "Last updated: October 2026" | privacy page itself | `/privacy` | Yes | `privacy/page.tsx:29-35,75` |
| Terms 5 sections + "Last updated: October 2026" | terms page itself | `/terms` | Yes | `terms/page.tsx:29-35,75` |
| Contact email + mailto | `config/app.ts:5` | `/privacy`, `/terms`, `/contact` | Yes | `privacy:191`; `terms:220`; `contact:21-24,94` |
| Back-to-home link on legal pages | legal pages | `/privacy`, `/terms` | Yes | `privacy:45`; `terms:45` (→ `/`, which redirects to `/public` via `app/page.tsx:2`) |
| Nav links → real routes | `nav.ts:35-50` | all public pages | Yes | `/how-it-works`, `/for-students`, `/for-founders`, `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, `/login` all exist as `app/**/page.tsx` |

## Findings (missing / altered / contradicted / broken paths)

**F1 — HIGH, functional path (public agreement CTA resolves to login).** `app/for-founders/page.tsx:396-401` exposes a public `Download agreement (PDF)` CTA pointing to `/founder/shortlists/agreement`. The route handler itself exists and is correct (`app/founder/shortlists/agreement/route.ts:1-65`, returns `application/pdf`), and the in-app founder link at `shortlists-client.tsx:325` works for an authenticated founder. But `proxy.ts:24,101-103` treats `/founder/*` as protected and redirects an unauthenticated request to `/login`, so the public CTA never delivers the PDF. This is a route/functional issue, not a content loss. Already owned at HIGH in `reports/copy-critic.md:22`; this report adds the confirming evidence (`proxy.ts:24,101-103`) per protocol rule 2.

**F2 — LOW, wording variation (not a loss).** The canonical phrase "Founders cannot confirm their own orders" (`design/voice-guide.md:17`) appears verbatim at `app/for-founders/page.tsx:118`. Two pages paraphrase it: `app/faq/page.tsx:160-161` uses singular "founders cannot confirm their own order", and `app/how-it-works/page.tsx:257` uses "Founders cannot confirm their own payments." Semantically equivalent to the source; no fact, actor, or meaning was lost. Recorded for completeness only.

## Explicitly checked and clear

- **No missing verified facts.** All six World Bank/WHO figures, the quote + author, both URLs, the LIVE_DATA_SOURCE label/URL, and the "Why two numbers?" honesty rule are present. The 20.6% and 17.1% figures remain separately sourced; neither is called a platform result.
- **No lost or altered prices/features.** Both ranges, both defaults, and all nine package features are present and still sourced from `config/payment.ts` (not hardcoded copies). Bank/mBoB fields and PAYMENT_CONFIGURED wiring are intact.
- **No lost legal text.** Both legal pages retain all five sections, effective date (October 2026), mailto contact, and home link.
- **"Manual check, never an algorithm"** intact at `about/page.tsx:208`; "bank transfer / mBoB" intact on all three expected pages; "founder access /contact link" intact at `signup:41`, `for-founders:134,172`, `faq:74`.
- **All Wikimedia credit URLs intact** — only the three valid Commons file URLs are used; `photo-credit.tsx` registry has correct author/licence for each. The previously flagged fabricated "Bernard Gagnon" credit (`reports/orchestrator.md:30`) is gone; `about/page.tsx:277-278` now carries the authoritative Doctor 17 / Keith Mason / Christopher J. Fynn attribution.
- **All internal links resolve to real routes** except F1. `#anchor` targets on FAQ and legal pages match their section ids. The "real change" claim flagged in `reports/orchestrator.md:59` is not present anywhere in current product source (grep found it only in that report).
- **No new unverifiable claim found** in the scoped pages. Minor product descriptions (e.g. `for-founders:108` "details shared with your founder account", `for-students:193` "100% complete") are consistent with `README:119,128` and `config/payment.ts`, and the applicant statuses are grounded in `supabase/schema.sql:88`.

## Cross-reference to other reports

- `reports/copy-critic.md` — owns F1 (its HIGH row). I add `proxy.ts` confirmation; no duplicate fix proposed. Its em-dash/heading-period/typography rows are style, excluded here per "do not propose style changes".
- `reports/orchestrator.md` — its "fabricated attribution" and "real change" items are verified resolved in current source; its "100% complete" open question is answered: consistent with `README:119` and grounded in the founder-completeness rule, with no contradictory wording in the scoped pages.
- At first pass only `PROTOCOL.md`, `copy-critic.md`, `orchestrator.md`, `brand-tokens.md` existed. Re-checked before finalizing: `SKILL-ASSIGNMENTS.md` and `icon-fix.md` also landed. Both were read; neither overlaps content integrity (`icon-fix.md` covers favicon/PWA binaries; `SKILL-ASSIGNMENTS.md` is the delegation matrix, which assigns this role `documentation-engineer` + `better-writing`). No change to the findings above.

## Verdict

**Content intact.** Verified facts, prices, source links, legal wording, the founder-access links, Wikimedia credits, and all key phrases are preserved. One functional-path defect remains outside content loss: the public agreement-download CTA (F1), already owned by `reports/copy-critic.md`. No NEW unverifiable claim was found.
