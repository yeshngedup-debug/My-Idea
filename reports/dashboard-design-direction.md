# Dashboard design direction — Bhutan Tech Connect

**Agent:** frontend developer (UI redesign wave). **Date:** 2026-11-24.
**Scope:** the three authenticated workspace families (admin, founder, student) and
the shared workspace shell. Research first, then implementation. No product data,
server action, authorization or dependency was changed.

Design read: *redesign, preserve — three role-based workspaces for a local paid-project
bridge in Bhutan, with a quiet editorial language, leaning toward the existing
cream/paper + forest + single amber/terracotta system, Tailwind 4 and Motion only.*
Dials: variance 5 (calm, hierarchy from space and type), motion 2 (feedback only),
density 5 (dense but quiet). Skills applied: `unslop`, `design-taste-frontend`,
`better-layout`, `better-typography`, `better-colors`, `apple-design`,
`emil-design-eng`, `frontend-a11y`. Precedence from `reports/SKILL-ASSIGNMENTS.md`
was respected; `design-taste-frontend` is authoritative for aesthetics but its
dashboard-exclusion and "premium consumer beige + brass" default were overridden by
the repo's real brand tokens in `design/brand-system.md` (a real brand wins).

## (a) References

Published design documentation and product conventions were studied; no assets,
code, logos or proprietary icon sets were copied.

| Product | URL | What was studied |
|---|---|---|
| Linear | `https://linear.app/method` | Building practice: set direction, scope down, generate momentum. How a calm tool states purpose before work. |
| Vercel (Geist) | `https://vercel.com/geist`, `https://vercel.com/geist/colors`, `https://vercel.com/geist/typography`, `https://vercel.com/geist/grid` | Step-to-role colour ramp, two background levels, draw-each-border-once, Label vs Copy type roles, tabular label numbers, plain n-column grids. |
| Stripe | `https://stripe.com/blog` (product conventions of the Dashboard) | Financial tables: exact figures, one number format, tabular numerals, hairline dividers, quiet status pills. |
| Attio | `https://www.attio.com/llms.txt`, `https://www.attio.com/` | List/table as the primary work surface, inline status editing, short human status labels, dense but organised rows. |
| Notion | `https://www.notion.com/llms.txt`, `https://www.notion.com/` | Content-first detail pages, clear field grids, progressive disclosure, navigation that names its contents. |
| PostHog | `https://posthog.com/handbook/brand/foundations`, `https://posthog.com/handbook/brand/overview` | Taste over polish; specificity over benefits language; care about the exact wording of errors and empty states. |
| Raycast | `https://www.raycast.com/` | Keyboard-first behaviour: no animation on repeated keyboard actions, instant press feedback, flat surfaces. |

## (b) Borrowed patterns and why they fit

| Source | Concrete pattern borrowed | Why it fits this product |
|---|---|---|
| Linear | A workspace page opens with **role context + one purpose line**, then the work area. No "Welcome back" greeting. | Students, founders and admins arrive with a job to do. A greeting is filler; a purpose line is wayfinding. It also gives each page a real `h1`. |
| Vercel Geist | One neutral ramp mapped to roles: page `#f5f2ea`, surface `#fffefa`, border `#ded8cb`, secondary text `#657069`, ink `#17352b`; one accent (`#d84f37`) reserved for status/active and one amber for the focal action. Borders drawn once, never doubled. | The repo already declares these tokens. Using them by *role* instead of by eye removes the mixed greys and competing pills without repainting the brand. |
| Vercel Geist | **Label vs Copy type roles**: single-line labels and numbers get tabular figures and tight leading; paragraphs get 1.5–1.6 leading and a capped measure. | Tables and ledgers need aligned digits; descriptions need to breathe. One rule for both fixes the current mixed `font-bold`/tracked treatments. |
| Stripe | Numeric columns use `tabular-nums` and one format; row states are recognizable by label, shape and hairline, not colour alone; hover/focus are a surface step, not a glow. | Payments and applications carry money and stage. Ambiguous status costs real trust here. |
| Attio | The **table is the work surface**, not a decorative card grid. Status is a short text label in a quiet tinted cell; editing happens in place. | Admin and founder queues are review workflows. Keeping rows scannable beats equal-width cards. |
| Notion | Detail pages read like a document: title, short meta line, then a hairline field grid; navigation names its contents ("Students", "Payments", not "Home"). | Project and profile detail pages are read-and-decide screens; a document rhythm suits them. |
| PostHog | Copy says what happened ("No students match. Adjust the search or filters."), never a benefits slogan; empty and error states get the same care as happy states. | The product already uses plain, specific language. This keeps the redesign honest and free of hype. |
| Raycast | Keyboard controls get no entrance animation; press feedback is instant; focus stays visible. | The preserved `SegmentedControl` arrow keys and filters are high-frequency actions. Motion there would feel slow and disconnected. |

## (c) Target direction by dashboard family

**Shared shell (`simple-layout`, `workspace-nav`, `workspace-hero`, `pinned-heading-section`).**
Keep the sticky cream header and the active nav hairline. Introduce one `h1` per
page (the overview hero title becomes the `h1`; sub-pages promote their pinned
`h2` to `h1`). The hero becomes a shorter editorial band: small role line, a
specific title, one purpose sentence, at most one primary action. The existing
gho/kira photograph stays and stays credited, but reads as a quiet backdrop, not
a dark wallpaper. Pinned headings and their desktop-only behaviour are untouched.

**Overviews (`/admin`, `/founder`, `/student`).**
Replace the four-equal-row statistics block with a two-part rhythm: one leading
figure set large in a calm panel (with its meaning beside it), followed by the
remaining figures as a compact hairline ledger. Below, a genuine two-column work
area: the primary queue (orders / projects / applications) on the wide side,
secondary navigation on the narrow side. The single focal moment is that leading
figure or the one amber primary action. No icon cards, no arrow glyphs.

**Work queues (admin students/projects/payments, founder projects/browse/shortlists,
student projects/applications).**
A short page header carries `h1`, purpose and live count. Filters sit directly
above the list. Tables use sentence-case headers, `tabular-nums` figures,
single hairline dividers, a subtle hover/focus surface step, and a consistent
status vocabulary: `Open / In progress / In review / Completed` for projects;
`Awaiting payment / Verifying payment / Confirmed / Rejected` for orders;
`Pending / Shortlisted / Accepted / Rejected` for applications;
`Verified / Not verified` for students. Status is a labelled pill with a small
dot or icon, never colour alone. Empty states state the fact and offer one plain
next action. Mobile keeps the stacked card list, with the same status labels.

**Detail and form pages (project detail, student profile detail, post form, profile
form).**
Document rhythm: `h1`, one meta line, hairline field grid, primary action in a
stable place. The 5-field post progress and 8-field profile progress stay bound
to real form state. Back links are plain text with hover colour.

## Additional input — Synapse Folio reference (`references.zip`)

Extracted read-only to `C:\Users\DELL\AppData\Local\Temp\opencode\references`.
Files read: `README.md`, `LICENSE`, and
`src/components/ui/synapse-folio-template.tsx` (targeted reads: clock, nav,
board, ledger/chips and CSS). Live demo:
`https://kedhar-components.pages.dev/#synapse-folio-template`.
License: MIT. Author: **Kedhareswer Naidu** (https://kedhar.pages.dev).
Copyright (c) 2026 Kedhareswer Naidu. No substantial code, images, fonts or
icon assets were copied; the patterns below were re-expressed in this repo's
own Tailwind and brand tokens, so the MIT notice is recorded here rather than
embedded in product files.

**Ideas taken and where they landed**

| Idea from the reference | Where it landed | Why it helps here |
|---|---|---|
| Live local-time readout in the nav | `components/layout/workspace-clock.tsx`, mounted in `simple-layout.tsx` | A quiet, specific Bhutan context marker in the header. Read-only, no animation; stable placeholder avoids hydration mismatch. |
| Blueprint/dot paper as a quiet structural motif | `.workspace-paper` in `app/globals.css`, applied to the "Go to" panels on all three overviews and the loading hero | Gives the secondary column a work-surface texture without a card. Drawn in forest at 5% opacity, never animated. |
| Mono file-label / status chips with a dashed outline while loading | `components/layout/workspace-loading.tsx` (`workspace.tsx`, `queue.tsx`) | Loading now names the shape it is waiting for, like the reference's `hand.webp` chips, but in plain Geist Mono and brand ink. |
| Precise selection frame for the active control | `components/interactive/segmented-control.tsx` selected segment | The active filter gets a hairline frame and offset, so selection reads by shape and not by colour alone. |
| Compact ledger with explicit columns | Refined `AdminProjects` and `MyProjects` tables: sentence-case headers, tabular dates, single hairlines | The reference's `name / work / year` rows are the same idea; our `Project / Founder / Status / Posted` columns now scan the same way. |
| Mono metadata for titles versus body | Mono chips above; body keeps Geist | Keeps metadata quiet and aligned without importing the reference's fonts. |

**Ideas rejected, and why**

- **GSAP assembly timeline, agent cursors, drag/sway, pointer wire, globe spin,
  scroll marquees, selection W x H tween badges, `⌘V` paste chips and infinite
  loops.** GSAP was deliberately removed from this repo; Motion is the only
  runtime and reduced-motion/touch rules are strict. These effects are also the
  opposite of a quiet work dashboard.
- **Blueprint-blue palette and the dark-mode theme switch.** The brand's warm
  cream/paper base and one amber/terracotta accent are canonical. A restrained
  ink tone is used only for hairlines and text, never as a second accent.
- **Editorial serif display face and embedded/font subsets.** The repo's type
  system is Geist; adding a serif or packaging fonts would break the type lock
  and add payload. The reference's serif pairing was not transferred.
- **The 85 KB component itself, its ChatGPT-generated images and its icon
  treatment.** Deriving the patterns in our own code keeps the bundle unchanged
  and avoids copying third-party assets. Where Phosphor icons are used, they
  stay one family at 16px and only inside client components (server components
  cannot import Phosphor in this Next.js version).

## Additional input — Mosaic Lite (`cruip/tailwind-dashboard-template`)

Cloned read-only to
`C:\Users\DELL\AppData\Local\Temp\opencode\mosaic-lite`. Files studied: `README.md`,
`src/App.jsx`, `src/pages/Dashboard.jsx`, `src/partials/Sidebar.jsx`,
`src/partials/dashboard/DashboardCard01.jsx`, `DashboardCard07.jsx` and
`src/css/style.css`. Reference URL: `https://github.com/cruip/tailwind-dashboard-template`;
live demo `https://mosaic.cruip.com/`.
**Licence: GPL-3.0, Copyright 2020 Cruip.** It permits personal/commercial use
but not republishing, redistribution or resale; attribution is not required.
No source code was copied into this repository. Only layout ideas were derived
and re-expressed in this project's own Tailwind and brand tokens, so this
project's licence is unchanged.

**Ideas taken**

| Idea from Mosaic | Where it landed | Why it helps here |
|---|---|---|
| 12-column content grid with asymmetric spans (`col-span-12 lg:col-span-8 / 4`) and one gutter scale | `WorkspaceStats`, `WorkspaceLoading`, and the two-column work areas on all three overviews | Gives a clear 8/4 work split that collapses to one column on mobile, without manual pixel fractions. |
| Page header with the title on the leading edge and actions trailing | Pinned `WorkspacePageHeading` on the left, controls and actions on the right in each client work area | Mirrors the familiar dashboard title/action rhythm while keeping the verified sticky heading. |
| Explicit numeric table columns and a capped content width with one padding scale | Admin/founder project tables: tabular dates, sentence-case headers, single hairlines | Numeric scanning improves; the existing `max-w-7xl` + `px-4/6/10` already matches the reference's discipline. |
| Type scale with unitless leading and slight negative tracking above 24px | Leading workspace figures and page headings | Consistent hierarchy from size and colour, not extra weights. |

**Ideas rejected, and why**

- **Left collapsible sidebar.** It would fight the already-verified sticky top
  navigation and desktop-only pinned headings, and would add a second shell
  state at 320px. The two-column work area gives the same grouping benefit.
- **Equal-width chart/widget cards with shadows and a 12-card grid.** This is
  precisely the AI-slop recipe `unslop` bans, and the data here is queues and
  ledgers, not time series. No chart was added.
- **Chart.js 3 and Nucleo icons.** No new dependency; Phosphor remains the one
  icon family and any data mark stays plain CSS/SVG from repo tokens.
- **Violet/indigo accents, green/red number colouring and the light/dark token
  swap.** The brand uses one amber/terracotta focal accent and semantic status
  is carried by label plus shape, not value colour.

## Final refinement pass

`impeccable` was loaded and its mechanical detector ran once over the changed
overview and shell files (`[]`, no findings). Its craft floor bans a kicker or
eyebrow above a heading, so the role line was folded into the purpose sentence
(`Founder workspace · Post a brief...`) instead of sitting above the `h1`. The
brand's amber is still present, now as the leading words of that sentence. The
same pass removed the 2px coloured left border on the admin review banner and
kept one primary action per screen.

The "one leading figure plus compact ledger" rhythm was kept deliberately: each
overview genuinely has one primary number and the rest are secondary counts, so
this is a decision, not the default equal-card hero-metric template.

`verification-loop`, `e2e-testing`, `production-audit` and `security-review`
were available as authority but the parent session owns tests, build, E2E and
final browser gates; this pass ran `tsc`, `lint`, the detector, and live browser
interaction probes only. A review subagent was attempted and could not start
(harness subagent depth limit), so the equivalent source checks were run inline.

## (d) Explicit non-goals

- No new dependency, package, animation runtime, image, logo or icon family.
- No dark SaaS conversion, violet, gradient text, glow, blur-as-decoration,
  marquee, parallax, `scale(0)`, `transition: all`, emoji, em-dash or hype copy.
- No new decorative arrows, equal icon cards, sparklines or mini charts.
- No change to data helpers, Neon SQL, Supabase Auth/Storage, server actions,
  role/ownership checks or app-layer authorization.
- No behaviour change to the preserved interactions: student applications filter
  and live region; admin projects status filter with keyboard arrows; founder post
  form 5-field progress; admin payments inline rejection confirm; admin students
  verification feedback and CopyButton; founder Weekends filter; admin Verified
  filter; pinned headings; founder live Realtime order badge.
- No change to strings that existing tests assert (for example "Applied
  successfully!" and the `role="status"` count wording).
- No commit or push. The parent owns tests, build, E2E and final browser checks.
