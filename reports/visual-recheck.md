# Visual re-check — post-redesign wave (read-only)

**Date:** 2026-11-24, final capture **11:07–11:10 +06:00**. **Role:** read-only visual re-check. **No product source was edited.**

**Method and timing caveat.** No server was listening on `localhost:3000` at the start, so I started a temporary `next dev --port 3000` (generated `.next` only). A first capture was taken, then I found that all seven page files had been rewritten at **11:02 +06:00** while I was working (a transient `ReferenceError: GuideHero is not defined` appears in that dev log). I restarted the dev server and re-captured everything against the current source; **all findings below use the 11:07+ captures, not the stale first set.** Verified `GET /public => 200`.

Playwright via Code Mode, viewport **1440 × 900**, full-page screenshots after a scroll pass to resolve `whileInView` reveals:

- `.playwright-mcp/recheck2-public-1440.png`, `recheck2-about-1440.png`, `recheck2-how-it-works-1440.png`, `recheck2-for-students-1440.png`, `recheck2-for-founders-1440.png`, `recheck2-faq-1440.png`, `recheck2-contact-1440.png`
- Detail clips: `.playwright-mcp/recheck2-detail-public-hero.png`, `recheck2-detail-public-bento.png`, `recheck2-detail-about-bridge.png`, `recheck2-detail-about-verify.png`, `recheck2-detail-how-it-works-steps.png`, `recheck2-detail-contact-hero.png`
- 375 × 812 check for the old mobile-heading finding; rendered DOM (h1/h2 text, computed size, overflow); console **0 errors** on final states. All seven routes answered 200; no horizontal overflow at 1440px.

**Standard applied.** `unslop/SKILL.md` checklist (one focal moment, quiet chrome, text on calm space, 4px rhythm, one accent, no gradient text/glow/violet, no uppercase tracked labels, no decorative filler, no equal-width stat cards, template check) and `reports/orchestrator-audit.md` as the agreed bar. Compared finding-by-finding with `reports/visual-critic.md`.

---

## 1. Status of the earlier `visual-critic.md` findings

| # | Earlier finding | Status | Evidence (current source + 11:07 renders) |
|---|---|---|---|
| 1 | HIGH — same gap-px bento on 5 pages | **FIXED** | Repo grep for `gap-px overflow-hidden rounded-[2rem]` → **0 matches**. `/public` keeps one bento but as `gap-3 … lg:gap-4` rounded cards (`app/public/page.tsx:117-218`); the other four pages render ledgers/splits. |
| 2 | MEDIUM — three filled accents on `/public` (amber numeral + red cell + amber CTA) | **REMAIN → M4** | `app/public/page.tsx:89` amber CTA, `:169` amber `20.6%`, `:197` `bg-[#b23c26]` cell. `recheck2-detail-public-bento.png`. |
| 3 | MEDIUM — equal-width stat cards on `/public` and `/about` | **FIXED** | `/public` figures are hairline ledger rows (`app/public/page.tsx:223+`); `/about` "The context behind the work" is a 3-row ledger. `recheck2-public-1440.png`, `recheck2-about-1440.png`. |
| 4 | MEDIUM — `font-bold` + `tracking-[0.16em]` numerals / prices | **FIXED** | Grep for `tracking-[0.` / `font-bold` across the seven public pages → **0 matches**. Rendered "How we verify students" 01/02/03 and Basic/Full Support prices are plain. `recheck2-detail-about-verify.png`, `recheck2-for-founders-1440.png`. |
| 5 | MEDIUM — identical left-heading / right-numbered-list section on four pages | **REMAIN → M1** | `app/about/page.tsx:257-264`, `app/how-it-works/page.tsx:292-308` (plus pinned step chapter `:129`), `app/for-founders/page.tsx:146-155`; `/for-students` now uses heading-above-list (`app/for-students/page.tsx:246-259`) — a small improvement. New instances: FAQ hero topic nav (`app/faq/page.tsx:242-268`) and founders "Payment is manual" three-column numerals. `recheck2-detail-about-verify.png` and `recheck2-detail-how-it-works-steps.png` remain near-identical. |
| 6 | MEDIUM — uniform 128/192px chapter padding, dead bands | **PARTLY FIXED → L1** | `components/marketing/guides/primitives.tsx:37` is now `py-20 md:py-24`; the earlier 250px guide-page gaps are gone. `/public` still uses `lg:py-48` / `lg:py-44` (`app/public/page.tsx:121,226`). |
| 7 | MEDIUM — dense compact statistics strip | **FIXED** | `<details>` at `app/public/page.tsx:277` and `app/about/page.tsx:195-200`; rendered "Official statistics" collapsed. |
| 8 | MEDIUM — 48px mobile h1, 4 lines | **FIXED** | `app/public/page.tsx:73` uses `clamp(2.5rem,…)`; rendered 40px on `/public` and `/how-it-works` at 375px, `/how-it-works` h1 = 3 line boxes, `scrollWidth - innerWidth = -15`, no clipping. `/public` still fragments into 5 range rects across its two-line headline, but no overflow. |
| 9 | MEDIUM — FAQ topic labels repeated as section headings | **FIXED** | Topic list "Who this is for / How profiles work / Payments and launch" vs headings "The basics / Profiles and projects / Shortlists, payments and launch" (`app/faq/page.tsx:34-50,55,+`). `recheck2-faq-1440.png`. |
| 10 | MEDIUM — `/public` hero photo dimmed to wallpaper | **FIXED (composition caveat → M2)** | Scrim `/20 → transparent → /55` (`app/public/page.tsx:66`), `object-[50%_38%]` (`:62`). The students photo now reads as content in `recheck2-detail-public-hero.png`. |

**Score: 7 fixed, 2 partly fixed/remain (#2, #6), 1 remains (#5).** No HIGH from the earlier report survives. The 11:02 wave also added product-specific moments (a real shortlist row on `/public`, a shortlist preview on `/for-founders`) and changed several headlines; none of these introduced a HIGH visual defect.

---

## 2. Remaining and new findings (ranked)

**HIGH: none.** The systemic HIGH (repeated bento) is gone in source and in all seven current renders.

### MEDIUM

**M1 — Repeated left-heading / right-numbered-ledger archetype across four pages.** *(earlier #5, remains)*
`app/about/page.tsx:257-264`; `app/how-it-works/page.tsx:129` (pinned step chapter) and `:292-308`; `app/for-founders/page.tsx:146-155`; plus the FAQ hero topic nav `app/faq/page.tsx:242-268` and founders "Payment is manual" three-col numerals. All use a forest h2 + short lead with a vermilion `01/02/03` column and hairline rows. `recheck2-detail-about-verify.png` and `recheck2-detail-how-it-works-steps.png` differ only in nouns; both are echoed in the full-page renders. Impact: pages read as one template with swapped nouns — the central unslop template-check failure. Fix: keep the ledger on `/how-it-works`; convert `/about` verification to prose, `/for-founders` access steps to a single-column sequence, and vary the FAQ topic nav (plain anchor list, no numerals).

**M2 — `/public` headline and lead sit on busy photographic space, not calm space.** *(new, consequence of the #10 fix)*
`app/public/page.tsx:64-84`: the scrim is `/20` at the top and transparent through the middle, while the centred h1 and `text-white/80` lead sit over a bright window, yellow curtain, chairs and people. `recheck2-detail-public-hero.png`: the first h1 line crosses the pale window; the 16–18px lead crosses the crowd with little separation. The photo now carries content (good), but no quiet pocket was made for the text. Fix: keep the photo undimmed at the edges and add a *neutral* local veil behind the text block only, or move the block to the uniform curtain side; do not restore a full-bleed dark wallpaper. Contrast ratios remain with the accessibility report; this is composition.

**M3 — Dead empty band in `/about` "A practical local bridge".** *(new)*
`app/about/page.tsx:212-247`: `grid items-center … lg:grid-cols-[1.1fr_0.9fr]` centres a ~100px left block against a tall `PhotoFeature` (`sm:aspect-[0.95]`, `:245`). `recheck2-detail-about-bridge.png` shows ~300px of empty cream between the lead and the single paragraph/links at the bottom of the left column. Fix: `items-start`, move the paragraph directly under the lead, and/or shorten the photo aspect.

**M4 — Three filled accents compete on `/public`.** *(earlier #2, remains)*
`app/public/page.tsx:89` amber CTA, `:169` amber `20.6%` numeral, `:197` solid vermilion cell, plus `:187`/`:210` arrows. `recheck2-detail-public-bento.png` shows the amber figure and red cell pulling equal weight with the amber CTA, so the screen has no single focal moment. Fix: change the cell at `:197` to a light surface with forest text; keep amber for one primary action and one figure.

**M5 — Decorative arrow icons on internal links.** *(new; contradicts the project's own shared convention)*
`app/about/page.tsx:222,231` (`ArrowUpRight` on "See how it works" and "Read the FAQ"), `app/public/page.tsx:92` (`ArrowRight`), `:103` (`ArrowDownRight`), `:187`, `:210`, `app/for-founders/page.tsx:175`. Rendered: `recheck2-detail-about-bridge.png` ("See how it works ↗", "Read the FAQ ↗"), `recheck2-detail-public-hero.png` (→ and ↘), `recheck2-detail-public-bento.png` (↗ and →). `components/marketing/guides/primitives.tsx:53` says "Quiet inline link; no pill, no badge, no arrow" — these call sites break the rule. Explicit AI tell in the brief. Fix: remove the icons; keep underline-on-hover text links.

**M6 — `/contact` repeats the same email address twice in adjacent sections.** *(new after the 11:02 wave)*
`app/contact/page.tsx:66-82` renders `APP_CONTACT.email` at up to 72px in the hero under "Write to this address", then `:125-146` renders the same address again at large size under "One email address for every question." `recheck2-contact-1440.png` shows `hello@bhutantech.bt` twice within one viewport of each other, with two "Email the team" / "Write to us" actions. This duplicates the focal moment and makes the next chapter feel like a re-run of the hero. Fix: keep the large address in one place only; let the hero point to it with a quiet link, or make the second section about what to include in the note (its existing "Tell us what you need" column) without repeating the address.

### LOW

**L1 — `/public` still uses oversized section padding.** `app/public/page.tsx:121` `lg:py-48`, `:226` `lg:py-44`. `recheck2-public-1440.png` shows ~190px of blank cream above "From a brief to work you can show". Fix: `py-20 md:py-24` to match `Chapter`, reserving large padding for the deliberate photo chapter.

**L2 — Identical brand-differentiation block on two pages.** `components/brand/local-bridge-differences.tsx:15-47` (same headline and six labels), mounted at `app/about/page.tsx:251` and `app/public/page.tsx:348` (`compact`). Product-specific copy and the vermilion hairline make it a legitimate signature, but the repeated headline and list on two pages reduce differentiation. Fix: keep the hairline; vary the `/public` heading or show only two or three items there.

**L3 — Control radius inconsistent.** `/public` hero CTAs are `rounded-full` pills (`app/public/page.tsx:89,100`), while guide actions are `rounded-lg` (`components/marketing/guides/primitives.tsx:98`). Minor, but "not everything is a pill" is on the checklist. Fix: `rounded-lg` on the two hero buttons.

**L4 — Closing CTA band is identical across all seven pages.** Visible in every `recheck2-*-1440.png`. The earlier critic judged it correctly subordinate (one headline, one action, no badge or gradient) and I agree; recorded because the brief asks about repeated CTAs. No change recommended.

---

## 3. What is genuinely good now

1. **Real Bhutanese photography carries content.** Gho/kira, classroom and stone-wall scenes are legible and credited on `/public`, `/about`, `/how-it-works`, `/for-students`, `/for-founders` and `/contact`. The 11:02 wave moved the FAQ hero to a text + topic nav layout and kept its photograph as a full-width band below — still product-world imagery, just not in the hero.
2. **Quiet chrome.** No gradient text, glow, coloured shadow, violet, emoji, uppercase tracked label, badge or `font-bold` on any of the seven scoped routes. Nav is small and calm; one forest or amber action per view.
3. **Forest + vermilion + amber are tied to meaning**, not decoration: vermilion for numerals, hairlines and inline links, amber for one primary action and one verified figure. Hierarchy does not rely on weight alone.
4. **Sections are product-specific.** Ngultrum prices, World Bank Bhutan figures, manual bank-transfer/mBoB confirmation, administrator shortlisting and hand-curated shortlist previews, gho/kira photo credits. With the brand name swapped these pages would still describe a very specific Bhutanese paid-project bridge. The generic feeling that remains is structural (M1), not factual.
5. **Rhythm improved on the guide pages.** `Chapter` is now `py-20 md:py-24`; no 250px empty bands remain on `/how-it-works` or `/contact`.
6. **New product previews are real, not placeholder.** "One row from the shortlist" on `/public` and the shortlist/payment-confirmation view on `/for-founders` use plausible names, ranks and CV links.
7. **No horizontal overflow at 1440px** on any route; no console errors on final states.

---

## 4. Verdict

**NEEDS WORK.**

No HIGH defect survives the redesign wave: the repeated bento is gone, the dimmed hero photo is fixed, stat cards, tracked labels, the compact data strip, FAQ duplication and mobile heading size are fixed, and new product previews add real content. What prevents approval is a cluster of MEDIUM composition/template issues, not broken UI: the same numbered-ledger section repeated across four pages (M1), text placed on busy photography on `/public` (M2), a ~300px void on `/about` (M3), competing accents on `/public` (M4), decorative arrows that contradict the project's own link convention (M5), and the duplicated email focal point on `/contact` (M6). These are localised edits — no new direction or section re-ordering is needed.

**Top three to clear first:** M1 (vary the numbered-ledger chapters), M2 (give the `/public` headline calm space without dimming the photo), M3 (remove the `/about` bridge void). M4, M5 and M6 are small follow-ups.

**Scope / not verified here:** no product source edited; the dev server was started temporarily for capture and stopped afterwards; 320px, 200% zoom, interaction/focus states, physical screen reader, contrast ratios and production Core Web Vitals were not re-tested — those remain with their owning reports. A transient `GuideHero is not defined` compile error was observed during the earlier concurrent edit window; the final 11:07+ renders and file grep show no such error. Screenshot artifacts are in `.playwright-mcp/recheck2-*.png`.

---

# Second pass — after the three fix agents

**Date:** 2026-11-24, capture **11:17–11:21 +06:00**. **Read-only; no product source edited.** The six scoped page files were rewritten at 11:13–11:15 +06:00. I started a fresh temporary `next dev --port 3000`, confirmed `GET /public => 200`, re-captured all seven routes at **1440 × 900** with a scroll pass, and stopped the server afterwards. Fresh evidence: `.playwright-mcp/recheck3-<route>-1440.png` and `.playwright-mcp/recheck3-detail-<route>-<section>.png`.

## 1. Verification of the three fix briefs

| Claimed fix | Verdict | Evidence |
|---|---|---|
| **`/public`:** locally constrained scrim behind text, one bright accent, vermilion cell quieted, arrows removed | **ALL FIXED** | `app/public/page.tsx:68` adds `rounded-2xl bg-[#0d1813]/75` behind the copy only; photo stays undimmed at the edges. Amber CTA `:87` and the single amber `20.6%` figure `:158` are the only bright accent; the former red cell is now `border … bg-[#fffefa] text-[#17352b]` at `:182`. Grep for `ArrowUpRight`/`ArrowRight`/`ArrowDownRight` in the seven public pages → **0 matches**. `recheck3-detail-public-hero.png`, `recheck3-detail-public-bento.png`. |
| **`/about`:** bridge dead band removed, verification row horizontal; **`/contact`:** duplicate email reduced to quiet link | **ALL FIXED** | Bridge grid is `items-start` with `sm:aspect-[16/10]` photo (`app/about/page.tsx:211,232`) — `recheck3-detail-about-bridge.png` shows no void. Verification is `mt-10 grid … sm:grid-cols-3` (`:250`) with no numerals — `recheck3-detail-about-verify.png`. `/contact` second address is quiet small text at `:143-149` while the hero keeps the large address at `:77-80` — `recheck3-detail-contact-hero.png`, `recheck3-detail-contact-email.png`. |
| **`/how-it-works`, `/for-founders`, `/faq`:** repeated ledgers replaced; pinned 3-step ledger kept as the single numbered ledger | **FIXED with one caveat** | Founders access is now a typographic pull statement (`app/for-founders/page.tsx:151`) with prose lines, no numerals. FAQ hero is a plain anchor strip (`app/faq/page.tsx:242-266`, no numerals). HIW keeps the pinned numbered 3-step ledger (`app/how-it-works/page.tsx:145`; sticky at `top:96px`). Caveat: horizontal `01/02/03` rows still exist in HIW "The details that protect both sides" (`:267,277`) and founders "Payment is manual" (`:366`) — they are no longer the repeated left-heading/right-ledger archetype, so M1 is cleared, but the site is not literally down to one numbered sequence. |

## 2. Targeted checks requested

- **Hero text contrast against the new scrim:** rendered pass. The copy sits on a 75%-opaque forest panel (`app/public/page.tsx:68`); the h1 is `#f5f2ea` and the lead `white/80` (`:71,79`). In `recheck3-detail-public-hero.png` both read cleanly over the panel while the gho/kira photo remains visible at the edges. This is a visual judgment, not a formal WCAG ratio — contrast measurement stays with the accessibility report.
- **Sticky headings still pinned:** rendered DOM at 1440px on `/how-it-works` shows header `position:sticky, top:0px`, plus "Three steps, one clear brief" and "What happens after a shortlist" at `top:96px`. No regression.
- **No decorative arrows anywhere:** rendered DOM scan of all seven pages found **0** arrow/caret glyphs in text nodes and **0** `ArrowUpRight`/`ArrowRight`/`ArrowDownRight` icons. One residual: `CaretRight` still appears twice on `/contact` (`app/contact/page.tsx:173,293`) as list markers — see R3. No gradient text, violet, uppercase tracked labels or em-dashes in any scoped page; all gradients are neutral dark photo scrims.
- **No dead bands:** the ~300px `/about` bridge void is gone; no comparable empty band on the other six pages. `/public` still uses intentionally large section padding — R2.
- **New template repetition:** the old left-heading/right-numbered-ledger archetype is gone from `/about`, `/for-founders` and `/faq`; only the deliberate pinned HIW version remains. A milder new sameness has appeared — R1.
- **Page-specific identity:** unchanged and strong — Ngultrum pricing, bank transfer/mBoB, World Bank Bhutan figures, administrator shortlisting and Bhutanese photography. Swapping the product name would not make these pages fit a generic product.

## 3. Remaining issues (all LOW, non-blocking)

**R1 — New three-column prose-row archetype now repeats four times.** `app/about/page.tsx:250` ("How we verify students"), `app/how-it-works/page.tsx:267` ("The details that protect both sides") and `:308` ("What happens after a shortlist"), `app/for-founders/page.tsx:366` ("Payment is manual"). Evidence: `recheck3-detail-about-verify.png`, `recheck3-detail-how-it-works-shortlist.png`, `recheck3-detail-for-founders-payment.png`. The treatments differ (numerals on two, vertical hairlines on one), and it is a clear improvement over the previous repeated vertical ledger; it is recorded only because the brief asked specifically about new template repetition.

**R2 — `/public` still has oversized padding and two pill buttons.** `app/public/page.tsx:121` `lg:py-48`, `:226` `lg:py-44`; hero CTAs remain `rounded-full` at `:87,93` while guide actions use `rounded-lg`. Evidence: `recheck3-public-1440.png`, `recheck3-detail-public-hero.png`. Unchanged from the first pass (L1/L3).

**R3 — Two decorative `CaretRight` chevrons remain on `/contact`.** `app/contact/page.tsx:173` ("Tell us what you need") and `:293` ("Helpful pages"). Evidence: `recheck3-detail-contact-email.png`, `recheck3-contact-1440.png`. The large `ArrowUpRight`/`ArrowRight`/`ArrowDownRight` icons — the actual M5 finding — are gone; these are small list markers, so LOW.

Also unchanged from the first pass: **L2** — the identical "A local bridge, checked by people" block still appears on `/public` (`app/public/page.tsx:348`) and `/about` (`:251`). It is product-specific and deliberate; not a blocker.

## 4. Second-pass verdict

**APPROVE.**

Every MEDIUM finding from the first pass (M1–M6) is fixed in source and in fresh renders: the repeated ledgers, the busy hero text, the `/about` void, competing accents, arrow icons and duplicated contact email. Sticky behaviour and page-specific identity are intact; no HIGH or MEDIUM regression was introduced. The three residuals above are LOW polish items and do not block ship.

**Top three remaining (non-blocking):** R1 (three-column prose row repeated four times), R2 (`/public` oversized padding + pill hero CTAs), R3 (two `CaretRight` chevrons on `/contact`).

**Not re-tested in this pass:** 320px, 200% zoom, keyboard/focus behaviour, physical screen reader, formal contrast ratios, production CWV; no E2E was run. Fresh screenshot artifacts are in `.playwright-mcp/recheck3-*.png`.

---

# Final pass — Neon final state (orchestrator done)

**Date:** 2026-11-24, capture **15:20–15:35 +06:00**. **Read-only; no product source was edited.** The pre-existing dev server at `localhost:3000` answered 200 (one transient connection refusal during capture; retried successfully). Source mtimes: 13:15–15:08. Fresh evidence: `.playwright-mcp/final-<route>-1440.png`, `final-<route>-320.png`, `final-<route>-375.png` for the seven public routes; `.playwright-mcp/final-dash-<role>-<path>-1440.png` and `final-dash-<role>-320.png` for authenticated student/founder/admin views (seeded `*.test` accounts, no data mutations during visual capture).

## 1. What I verified

| Requested check | Result | Evidence |
|---|---|---|
| **Sticky parallel-scroll headings, pinned while siblings scroll, only suitable sections** | **PASS** | Rendered DOM at 1440px: exactly four section headings are sticky — `/how-it-works` "Three steps, one clear brief" and "What happens after a shortlist"; `/for-students` "Make your profile complete" and "Browse, apply, and track" — all `top:96px` via `components/layout/pinned-heading-section.tsx:22`. Measured viewport tops while scrolling: e.g. "Three steps" 120px → 96px (pinned) → −47px (released at section end). `/public`, `/about`, `/for-founders`, `/faq`, `/contact` have only the site header sticky. At 320px and 375px, **0** sticky section headings — the behavior is desktop-only as documented. |
| **Feature-tied interactive components improve actions** | **PASS** | Founder availability filter: status changed `2 students` → `1 student available weekends` after clicking "Weekends" (`founder/browse-students`). Admin verification filter: "Not verified" yields `No students match / Adjust the search or filters` instead of a silent state. Student projects show 1 `Apply` and 3 `Applied` states. FAQ accordion and the `/public` "Official statistics" disclosure both toggle open. Founder shortlists shows `role="status"` text **"Payment confirmed. Shortlist unlocked"** with a status dot; source `components/founder/live-order-status.tsx:4-5,31,36-47` uses `@neon/realtime` `useLiveQuery` with a refresh path. I did not mutate order state to observe a live transition — that remains the E2E's evidence. |
| **AI-slop regressions on public pages** | **PASS** | Computed-style scan of all seven public routes: 0 gradient text, 0 coloured glows, 0 violet, 0 uppercase tracked labels, 0 arrow glyphs, 0 marquee/pulse/shimmer animations. The only `backdrop-filter: blur` is on `site-chrome` (the sticky header); it renders as a flat cream bar, not decorative glass. Markdown/dashboard findings below. |
| **One focal moment per screen; gho/kira photography carries content** | **PASS on public pages** | `final-public-1440.png` keeps the local dark veil behind the headline while the classroom photo stays legible at the edges; one amber CTA plus one amber verified figure, vermilion only for hairlines/links. Real credited Bhutanese photography is content on `/public`, `/about`, `/how-it-works`, `/for-students`, `/for-founders`, `/contact` and in each dashboard hero band. |
| **Mobile reflow** | **PASS on seven public routes; FAIL on `/admin`** | 320px and 375px: all seven public pages have `scrollWidth - innerWidth` of 0 or −15, no out-of-viewport elements, h1 40px, reading-order stacking. Student and founder dashboards: 0 overflow at 320px. **`/admin` overflows by 19px at 320px** — see F1. Empty bands in the first dashboard 320 capture were a reveal-animation capture artifact; after a scroll pass (`final-dash-admin-320-scrolled.png`) the order cards and Quick links render fully. |
| **Comparison with the two earlier reports** | **No regression** | The HIGH repeated bento, dimmed hero photo, `/about` void, competing accents, decorative `Arrow*` icons, duplicated contact email and repeated ledgers remain fixed. The final pass introduces no new public-page issue; all new findings are in the authenticated dashboards, which the previous visual passes did not render. |

## 2. New findings in the final state (ranked)

**F1 — MEDIUM — `/admin` horizontal overflow at 320px.** `app/admin/page.tsx:125-160`: the "Recent payment orders" grid children have no `min-w-0`; the `shrink-0` status badges at `:153` force the cards to 339px wide inside a 320px viewport (`scrollWidth - innerWidth = 19`). Rendered evidence: `.playwright-mcp/final-dash-admin-320.png` / `final-dash-admin-320-scrolled.png` — order cards and the "Confirmed" badges are clipped at the right edge, and the mobile workspace nav's last item is off-screen. Not a capture artifact; measured after full scroll and DOM inspection. Fix: add `min-w-0` to both grid children and allow the badge to wrap or shrink; check the nav container at 320px.

**F2 — MEDIUM — dashboard stat cards are the equal-width, icon-filled AI tell the checklist bans.** `app/admin/page.tsx:82-99` (`sm:grid-cols-2 xl:grid-cols-4`, four cards each with a decorative icon), `app/founder/page.tsx:78` and `app/student/page.tsx:87` (`sm:grid-cols-3`, three cards each with an icon). Rendered: `final-dash-admin-admin-1440.png`, `final-dash-founder-founder-1440.png`, `final-dash-student-student-1440.png`. `unslop` section 7 says stat cards are numbers, with "no sparklines, tallies, mini bars or icons added to fill them", and "vary the sizes". Here every card is the same width with the same label/figure/detail/icon recipe. Also the `WorkspaceHero` eyebrow is a pill with a coloured dot (`components/layout/workspace-hero.tsx:32-33`). Fix: drop the icons, give one leading figure visual weight and let the remaining figures read as a compact ledger.

**F3 — MEDIUM — decorative arrows with hover motion remain in dashboards.** `app/admin/page.tsx:116,185` (`ArrowRight` with `group-hover:translate-x-0.5 group-hover:scale-[1.01]`), `app/student/page.tsx:76,121,146`, `app/founder/page.tsx:112,138`, `app/founder/projects/page.tsx:102,159` (literal `→`). Rendered: "View all →" on student/founder overviews and red arrows on admin Quick links. The public marketing pages are clean, but the brief asked for no decorative arrows anywhere; these are the same tell M5 removed on the marketing routes. Fix: remove them; keep plain text links with the existing hover colour change.

**Carried-over LOW items (not introduced now):** R1 three-column prose row on four sections; R2 `/public` oversized padding and two pill hero CTAs; R3 two `CaretRight` chevrons on `/contact`; site-header `backdrop-blur-xl` on all surfaces (`components/layout/simple-layout.tsx:61`), visually flat and functional.

## 3. Final verdict

**NEEDS WORK.**

The marketing site is in good shape and all earlier findings are closed: sticky headings behave correctly and only where the sibling column is long, interactive components demonstrably change state, public pages show no AI-slop regressions, and mobile reflow is clean at 320/375. The dashboard surfaces — rendered for the first time in this visual pass — introduce three MEDIUM issues: a real 19px horizontal overflow on `/admin` at 320px (F1), the equal-width icon-filled stat-card recipe on all three overviews (F2), and decorative hover-arrows in dashboard links (F3). None is a HIGH defect or a broken flow, so this is not a BLOCK; they are small, localised fixes before ship.

**Top three remaining issues:** F1 (`/admin` 320px overflow), F2 (equal-width icon stat cards on three dashboards), F3 (decorative arrows in dashboard links).

**Scope / not verified here:** I did not mutate order/payment data to prove a Realtime transition, run E2E again, or retest 200% zoom, keyboard/screen-reader behaviour, formal WCAG contrast and production CWV. Founder pages produced one transient console error in the first automated pass and none on a focused re-run; it was not reproducible. Fresh artifacts: `.playwright-mcp/final-*.png`.
