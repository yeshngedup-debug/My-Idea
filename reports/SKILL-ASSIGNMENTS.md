# Skill assignments for delegated agents

The orchestrator assigns one or more skills to every agent it spawns. The
agent must read each assigned SKILL.md before acting and cite it in its report.
When skills conflict, use this precedence:

1. `design-taste-frontend` is authoritative for landing/portfolio aesthetics.
2. `unslop` is authoritative for removing AI tells and for minimal copy.
3. `apple-design` governs interaction physics, interruptibility and reduced motion.
4. `animate` governs whether an animation should exist and its ingredients.
5. `better-*` skills govern evidence-based interface findings.
6. `gpt-taste` is a stricter variant only where it does not contradict 1-4
   (reject its GSAP-everywhere, marquee, heavy-glass and meta-label impulses).

## Matrix

| Agent role | Required skills | Notes |
|---|---|---|
| Visual design critic / fixer | unslop, better-interface, better-ui, better-layout, design-taste-frontend, apple-design | Judge rendered pages, not just source |
| Copy and typography | unslop (passes 4-5), better-writing, better-typography, design/voice-guide (repo) | No em-dashes, hype, tracked labels, trailing periods on short strings |
| Accessibility and motion | frontend-a11y, better-accessibility, apple-design, animate | WCAG 2.2 AA; reduced motion; escalation triggers are HIGH on sight |
| Component library work | animate, apple-design, unslop, design-taste-frontend | Copy source, no new animation runtimes unless justified |
| Brand identity / tokens | brand-guidelines, design-dna, design-taste-frontend | Keep two-dot bridge mark; no sacred symbols, node networks, violet |
| Dashboard UI | better-layout, better-accessibility, unslop | Dense but quiet; real tables; no stat-card slop |
| Performance / SEO | performance-optimizer (agent skill), seo-specialist, webapp-testing | Evidence with file:line or measured runtime result |
| Content integrity | documentation-engineer, better-writing | Preserve facts, prices, links, legal text |
| Verification / gates | verification-loop, e2e-testing, install-and-verify | Run the seven gates; never claim an unverified pass |
| Security regression check | security-review, api-security-testing | Re-verify RLS fixes after any data-layer change |
| Component library / interaction | unslop, design-taste-frontend, apple-design, animate, emil-design-eng, frontend-a11y, better-accessibility | Feature-tied components only; no decorative gallery widgets, no second animation runtime, no glow/blur/marquee/parallax; cite source URL and licence in `reports/orchestrator.md` |

## Delegation rule

Every spawned agent prompt must name the skills to load and the report file it
must write under `reports/`. No agent edits outside its assigned paths. The
orchestrator consolidates findings and owns final verification.
