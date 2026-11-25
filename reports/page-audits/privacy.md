# Page audit — `/privacy`

Date: 2026-11-24. Role: read-only critic under `reports/PROTOCOL.md`. The only file written is this report. No product source, config, schema, test, or existing report was edited. Uncommitted working-tree changes were treated as authoritative.

## Route

`/privacy` — `app/privacy/page.tsx:1-191`. Public, static legal page. It renders a five-section policy, a chapter anchor nav, a mailto data-request link, and a mount fade. The page performs no server action, database query, mutation, or API call of its own.

## Files traced

- `app/privacy/page.tsx:1-191` — audited route: metadata, mount animation, chapter nav, policy copy, mailto link.
- `config/app.ts:4-6` — `APP_CONTACT.email` source and `CONTACT_EMAIL` fallback used at `app/privacy/page.tsx:178-182`.
- `app/layout.tsx:15-49,127-137` — inherited metadata/title template, skip link target, global `MotionProvider`.
- `app/globals.css:3-27`, `lib/design-tokens.ts:18-47`, `design/brand-guidelines.md:3-15` — canonical palette and focus/body styles.
- `lib/neon-data.ts:1-7` — authorization posture: all Neon access is server-side application code; no Neon RLS.
- `lib/neon-data.ts:492-507,614-639,641-655,725-748,805-831,885-910,964-971` — relationship, profile, browse, shortlist, and order helpers behind the policy claims.
- `app/api/cv/[id]/route.ts:22-93` — founder/admin CV download proxy.
- `app/actions/shortlist.ts:17-54` — founder shortlist request path.
- `app/actions/admin-students.ts:86-161`, `app/admin/students/admin-students-client.tsx:201-225` — admin shortlist generation, contact email and CV link exposure.
- `app/founder/browse-students/page.tsx:19-53`, `app/founder/browse-students/browse-client.tsx:203-224`, `app/founder/students/[id]/page.tsx:47-98` — what founders can browse and open.
- `app/founder/shortlists/page.tsx:83-127`, `app/founder/shortlists/shortlists-client.tsx:299-343` — paid shortlist unlock and contact/CV display.
- `app/founder/projects/[id]/page.tsx:33-52`, `app/founder/projects/[id]/project-detail-client.tsx:196-208` — applicant contact/CV display.
- `app/admin/payments/page.tsx:62-85` — admin payment-screenshot signed URLs.
- `supabase/premium-shortlists.sql:42-69` — private payment-screenshot bucket and owner/admin select policy.
- `supabase/migrations/20261124000000_close_security_bypasses.sql:17-30,138-181` — order ownership, shortlist RPC, and CV storage policies.
- `AUDIT.md:18` — older remediation note; see the current-code caveat in `Notes/limitations`.
- `.playwright-mcp/page-2026-11-24T16-37-38-858Z.yml` and `.playwright-mcp/console-2026-11-24T16-37-38-532Z.log` — one successful page snapshot and subsequent console record.
- `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, all existing `reports/*.md`, all existing `reports/page-audits/*.md`, and `reports/page-audits/INDEX.md` were read before finalizing.

## Skills used

Loaded from `~/.config/opencode/skills/<id>/SKILL.md`; `api-security-testing` was loaded from `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md`. Applied under the precedence in `reports/SKILL-ASSIGNMENTS.md:5-13`:

- `unslop` and `better-writing` — minimal legal copy, no em-dash/hype tells; informed D1 and D2.
- `better-interface`, `better-layout`, and `better-ui` — reading flow, chapter grouping, focus states, and target sizing; no new defect found.
- `frontend-a11y` and `better-accessibility` — headings, anchor labels, skip target, reduced motion, and inline-link target exception; existing ownership is referenced below.
- `webapp-testing` — one successful Playwright navigation and snapshot; detailed runtime checks were blocked as recorded below.
- `security-review` and `api-security-testing` — authorization, storage, and data-layer trace behind D1, D2, and D3.

## UI/UX findings

No new confirmed UI/UX finding. The current source shows a coherent static reading page: `main#main-content` at `app/privacy/page.tsx:39` matches the global skip link at `app/layout.tsx:129-134`; the five anchors at `app/privacy/page.tsx:29-35,69-85` match the five section ids at `:89,108,126,144,161`; the mailto at `:178-182` now includes `inline-flex min-h-6 items-center` at `:179`, giving a 24px minimum target inside an inline sentence.

Existing coverage is not duplicated here:

- **HIGH — overlap, owned by `reports/accessibility-critic.md:17,41`:** rendered contrast and 320px/375px reflow on `/privacy` were already covered there, including the muted legal text classes used at `app/privacy/page.tsx:61,78,100,119,137,155,175`.
- **LOW — overlap, owned by `reports/component-relevance-audit.md:35`:** anchors, reading action, mailto, and `legal-mount` relevance were already judged "Yes / None".
- **LOW — overlap, owned by `reports/performance-seo.md:36,140,233`:** global `MotionProvider` hydration, transform-only `legal-mount` with reduced-motion support at `app/privacy/page.tsx:16-27`, and missing route-specific OG values from `pageMetadata()`.
- **Fixed overlap — `reports/copy-critic.md:23`, `reports/orchestrator-audit.md:29,99`:** the em-dash and title-brand issues are absent from current source; metadata at `app/privacy/page.tsx:7-14` uses a colon and renders `Privacy Policy | Bhutan Tech Connect`.
- **Verified content — `reports/content-integrity.md:47-51`:** five sections, "Last updated", contact email, and back-home link still match their sources.

## Workflow findings

**Suspected — LOW — `app/privacy/page.tsx:173-182`.** The page promises "We will remove it on request" and gives only `mailto:${APP_CONTACT.email}` as the path. Why it matters: there is no deletion action, deletion request screen, identity-verification step, scope statement, or response-time statement anywhere in the traced app; the grep for account/profile/CV deletion found only shortlist row deletion in `lib/neon-data.ts:858,874`. This does not prove the manual promise is false, but a user cannot tell what will be deleted or when. Fix: either add a documented, authenticated deletion/request flow that removes `student_profiles`, `cvs` objects, and related rows, or expand `:173` into a concrete manual-process sentence that states what to send, how identity is verified, what is deleted, and the expected response window.

No other interactive workflow exists on this route. The data-request mailto is the sole action and it resolves through `config/app.ts:5`.

## Database/RLS findings

**Confirmed — HIGH — `app/privacy/page.tsx:157`.** "Only the founder who paid for it sees them" is contradicted by both the same page at `:139` and the implementation. `app/actions/admin-students.ts:130-147` builds a shortlist text including student names, ranks, contact emails, and CV links; `app/admin/students/admin-students-client.tsx:201-225` exposes that generated shortlist to admins for download. `lib/neon-data.ts:658-668` also lets admins list every profile. Why it matters: a privacy notice that denies admin access to shortlist contents understates who can see personal data. Fix: replace the second sentence with "The paying founder sees the delivered shortlist; admins can access profile data to verify and prepare it. Shortlists are not public."

**Confirmed — MED — `app/privacy/page.tsx:138`.** "Founders can see completed student profiles and CVs (including contact email)" is overbroad and merges three different access levels. Any authenticated founder can browse completed profiles (`app/founder/browse-students/page.tsx:32-52`, `lib/neon-data.ts:641-651`), but the browse/detail views do not expose `contact_email` (`app/founder/browse-students/page.tsx:39-49`, `app/founder/students/[id]/page.tsx:62-93`). CV download is gated by an application to the founder's project or a confirmed paid order (`app/api/cv/[id]/route.ts:59-82`, `lib/neon-data.ts:492-507,885-910`, `supabase/migrations/20261124000000_close_security_bypasses.sql:155-181`). Contact email appears for project applicants (`app/founder/projects/[id]/project-detail-client.tsx:205-207`) and paid shortlists (`app/founder/shortlists/shortlists-client.tsx:327-335`). Why it matters: the notice should describe the real conditions instead of implying unrestricted founder access to CVs and contact emails. Fix: split the line into "Founders can browse completed profiles. CV access requires an application to their project or a confirmed shortlist. Contact email is shown for project applicants and paid shortlists."

**Verified accurate — no finding — `app/privacy/page.tsx:139-140`.** Admin visibility matches `lib/neon-data.ts:658-668` and `app/actions/admin-students.ts:86-161`. The payment-screenshot claim matches the private bucket and owner/admin-only select policy at `supabase/premium-shortlists.sql:42-69`, with admin access exercised through short-lived signed URLs at `app/admin/payments/page.tsx:62-85`. No public read policy was found.

**Verified no direct data path — no finding — `app/privacy/page.tsx:1-191`.** The route contains no `'use server'`, query helper, storage call, fetch, or mutation. All database statements above are downstream evidence for the written claims, not behavior triggered by this page.

## Severity summary

| Status | HIGH | MED | LOW |
|---|---:|---:|---:|
| Confirmed findings | 1 (`app/privacy/page.tsx:157`) | 1 (`app/privacy/page.tsx:138`) | 0 |
| Suspected / unverified findings | 0 | 0 | 1 (`app/privacy/page.tsx:173-182`) |
| Overlaps not counted | 1 (accessibility contrast/reflow) | 0 | 3 (component relevance, performance/SEO, fixed copy items) |

## Recommended fixes

1. **HIGH — `app/privacy/page.tsx:157`:** name the paying founder and admins explicitly; keep "not public" but remove "only".
2. **MED — `app/privacy/page.tsx:138`:** separate profile browsing, conditional CV access, and conditional contact-email display into precise sentences.
3. **LOW — `app/privacy/page.tsx:173-182`:** document the deletion request process and scope, or implement an authenticated deletion/request flow covering profile, CV storage, and related rows.
4. Do not change the inherited metadata at `:7-14` for OG values as part of this pass; that is already owned at `reports/performance-seo.md:233`.
5. Preserve the uncommitted mailto class change at `:179`; it was reviewed as authoritative and showed no source-level regression.

## Notes/limitations

- Static audit first. Playwright MCP navigation to `http://localhost:3000/privacy` succeeded once and returned title `Privacy Policy | Bhutan Tech Connect`; the snapshot at `.playwright-mcp/page-2026-11-24T16-37-38-858Z.yml` confirmed all five anchors, the mailto link, five sections, and rendered copy.
- The dev server stopped before detailed viewport, anchor-click, reduced-motion, and focus checks. Later navigations returned `net::ERR_CONNECTION_REFUSED at http://localhost:3000/privacy`; no server was restarted. HMR WebSocket errors in `.playwright-mcp/console-2026-11-24T16-37-38-532Z.log` follow that shutdown and are not page defects.
- `npm run build` was not run while `next dev` was in play, and no child agents were spawned.
- `AUDIT.md:18` still describes shortlist creation as a `SECURITY DEFINER` RPC; current `app/actions/shortlist.ts:5-6,37` calls the application-code replacement in `lib/neon-data.ts:721-724`. This audit follows current source.
- `reports/page-audits/INDEX.md:16` still lists `/privacy` as `pending`; the orchestrator owns status changes, so this read-only critic did not edit it.
