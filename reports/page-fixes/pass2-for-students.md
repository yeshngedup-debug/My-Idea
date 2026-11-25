# `/for-students` second pass — feature completeness

Date: 2026-11-25. Scope: `app/for-students/page.tsx` and this report only, per
`reports/page-fixes/MANIFEST.md`. The dirty worktree was treated as the source of
truth. All phase-1 edits and all other agents' uncommitted work were preserved.
No shared file, other page, other report, `MANIFEST.md`, DB file, action, or
config was edited. No install, Reticle wiring, dev server, build, npm test, or
browser tooling was used.

Skills loaded first: `better-interface`, `better-writing`.

## Features verified against current source

### CTA destinations

All four CTAs resolve to files that exist in the tree. No route was added.

| Location | Destination | Verdict |
| --- | --- | --- |
| `:111` hero primary "Create student account" | `/signup` | Exists at `app/(auth)/signup/page.tsx` |
| `:112` hero secondary "See how it works" | `/how-it-works` | Exists at `app/how-it-works/page.tsx` |
| `:171` "Start your profile" | `/signup` | Exists; matches the profile-setup entry |
| `:321` "Read the FAQ about pay" | `/faq` | Exists at `app/faq/page.tsx` |
| `:330` CTA band "Create student account" | `/signup` | Exists; same label as `:111` |

No link text is a bare "Learn more"/"Click here"; each names its destination.
Both external `PhotoCredit` links are registered source/licence URLs, not guesses.

### Application, CV and profile claims

- `:86` "You can send one application per project. A complete profile and CV help
  founders decide." was already softened in phase 1. That correction was verified
  and preserved; it is not re-edited here.
- "One application per project" matches `unique (student_id, project_id)` in
  `neon/schema.sql` and the duplicate handling in `app/actions/projects.ts`.
- Statuses at `:91` (`pending`, `shortlisted`, `accepted`, `rejected`) match the
  schema CHECK and the action's status list. The workflow owner added a
  transition map in `app/actions/projects.ts` this phase; the page copy remains
  accurate.
- "PDF only, up to 5 MB, stored privately" at `:68` and `:218-222` matches the
  upload checks in `app/actions/student-profile.ts` and the signed-URL-only CV
  access in `app/api/cv/[id]/route.ts`.
- Budget range and deadline at `:81,314-318` match the fields rendered by the
  student project pages and the schema.

**Completeness gate.** `applyToProject` in `app/actions/projects.ts:104-136` still
checks only sign-in, student role, an open project, and a duplicate application
before `insertApplication`. It does not read a profile row or `cv_path`. The phase-2
owners explicitly declined to add the gate: `reports/page-fixes/shared-workflow.md:173-176`
states that completeness is guidance in the shipped flow, and
`reports/page-fixes/shared-database.md:94-96` routes the invariant to the workflow
owner. With enforcement ruled out, the remaining "before you apply" strings were
unsupported requirement claims and were corrected in this pass (see below).

### Image alt and credit

- `public/images/bhutanese-students.jpg` exists. The hero alt at `:114` was
  verified in phase 1 against the Wikimedia Commons description for
  `File:Bhutanese_youth.jpg`; credit URL at `:115` is registered in
  `components/ui/photo-credit.tsx:8-12` (Doctor 17, CC BY-SA 4.0). Preserved.
- `public/images/bhutanese-community.jpg` exists. `DZONG_CREDIT` at `:34-35`
  (`File:Boys_in_Bhutan_national_dress.jpg`) is registered in
  `components/ui/photo-credit.tsx:13-17` (Keith Mason, CC BY-SA 3.0). The alt at
  `:247` is consistent with that Commons title. No provenance was guessed and no
  change was made.
- The photo note at `:237-240` was already corrected in phase 1 to "Bhutanese
  people in community settings, not platform listings or members." Verified and
  preserved.

### Accessibility

- One `h1` from `GuideHero`, five chapter `h2`s, item `h3`s, and `main#main-content`
  as the skip target are unchanged.
- Decorative icons remain `aria-hidden` (`:138,194,210,288`); the numbered steps
  use a real `<ol>` at `:275`.
- Link and CTA focus states come from the shared components and `PhotoCredit`;
  none were altered.
- Body secondary `#56645c` and small-text accent `#b23c26` on paper/surface stay
  on the audited AA contrast pairs. All four edits change copy text only: no new
  element, colour, token, ARIA attribute, or motion was introduced.

## Fixes made in `app/for-students/page.tsx`

1. `:30` metadata description: "Build a complete profile ... apply with your CV"
   became "Build a profile ... apply to projects that fit". The old text still
   carried the same "apply with your CV" requirement that phase 1 removed from
   `:86`, in the page's most public copy.
2. `:169`: "Fill in every field before you apply." became "A complete profile and
   CV help founders decide." This removes a gate the action does not enforce and
   matches the accepted guidance wording in `app/how-it-works/page.tsx:52,77`.
3. `:184`: card badge "Complete before you apply" became "Helps founders decide".
   Same reason, same on-palette `#b23c26` accent.
4. `:270-271`: "Everything you need after your profile is done lives in your
   student workspace." became "Everything you need to browse and apply lives in
   your student workspace." Removes the last implication that workspace access
   depends on profile completion.

All four use existing vocabulary and the existing `#56645c` body copy style. No
layout, colour, token, component, CTA target, metadata field, or route changed.

## Checks performed

- `npx eslint app/for-students/page.tsx` — exit 0, no findings.
- `npx tsc --noEmit --pretty false` — exit 0, clean.
- `git diff -- app/for-students/page.tsx` reviewed: four copy edits from this pass
  plus the three preserved phase-1 edits, nothing else.
- Read the installed Next.js 16 guides for this page's APIs: `12-images.md` and
  `14-metadata-and-og-images.md` (plus `AGENTS.md` rules). The page remains a
  Server Component with static metadata and no form, fetch, or server action, so
  no directive or boundary change applies.
- Read `AGENTS.md`, `design/brand-system.md`, `design/voice-guide.md`,
  `app/globals.css`, `lib/design-tokens.ts`, `MANIFEST.md` (`for-students` row),
  `reports/page-fixes/for-students.md`, and the three phase-2 shared reports
  before editing. Source-verified the claim chain in `app/actions/projects.ts`,
  `app/actions/student-profile.ts`, `app/api/cv/[id]/route.ts`, and
  `components/ui/photo-credit.tsx`.
- Not run by design: full `next build`, `npm test`, dev server, browser tooling.
  No runtime assertion is claimed.

## Routed findings (not edited here)

- **Completeness gate remains unenforced (MEDIUM, workflow/database owner).**
  `app/actions/projects.ts:123-124` inserts before any profile/CV read. This pass
  resolved the user-facing side by making the copy guidance only. If the product
  later wants a real gate, the workflow owner must add the check before
  `insertApplication` (load `getStudentProfile`, require the listed fields and a
  non-null `cv_path`, return a fixable message), align `lib/validators.ts`, and
  coordinate a DB invariant with the database owner. No shared file was touched.
- **Returning-user CTAs (LOW, signup/design-system owner).** `:111`, `:171` and
  `:330` send a signed-in student to `/signup`. S2 in `reports/page-audits/for-students.md`
  is still unconfirmed: it needs an authenticated runtime session, which this
  pass may not run, and may be an intentional marketing default. Auth-state-aware
  CTAs are outside this file and were not changed.
- No other finding on this route requires a shared-file fix. No image provenance
  gap was found on the two photographs this page uses.

## Deliberate non-changes

- `:128-129` "You do not need a long work history, just a complete profile, clear
  skills, and time for focused work." and `:328-329` "Your profile is the first
  step" / "Complete it once, then apply to projects that fit." are advisory
  "what helps" framing, not claims that the app enforces a gate. Left intact to
  keep the voice and the diff small.
- The phase-1 `:86`, `:114` and `:237-240` corrections were verified and left
  unchanged.
- Both photo credits, the hero and second alt text, and every CTA destination
  were left unchanged after verification.
- No new dependency, route, colour, gradient, emoji, component, or token.
- Shared components, `app/globals.css`, `lib/design-tokens.ts`, DB files, server
  actions, validators, `MANIFEST.md`, and other agents' reports were not edited.
  All pre-existing uncommitted work was preserved; no destructive git command was
  run.
