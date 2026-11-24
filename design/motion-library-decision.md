# Motion library decision: no third runtime

> **Superseded 2026-11-24 (final state).** GSAP and `@gsap/react` have been
> **removed** from `package.json`, and the unused `components/motion/*` set has
> been deleted. Both scroll chapters are static: `desire-chapter.tsx` and
> `pinned-step-chapter.tsx` no longer animate. **Motion is now the only
> animation runtime.** The comparison below is retained as the record of why
> anime.js was rejected; its "keep GSAP" conclusion no longer applies because
> the two chapters that justified it were removed.

Status: accepted 2026-11-24, amended same day. Scope: `motion@14.14.0` remains; `animejs` was rejected.

## Comparison

| | Motion core (`motion/react`) | Motion+ UI | anime.js v4 | GSAP |
|---|---|---|---|---|
| Offers | Declarative props, springs, layout/shared-layout, `AnimatePresence`, gestures, hybrid WAAPI/ScrollTimeline engine, tree-shakable | 520+ examples, 50 Motion UI sections, AnimateNumber, splitText, Studio/AI Kit | All-in-one imperative engine: Timeline, Stagger, ScrollObserver, Draggable, SVG morph/motion-path, splitText/scrambleText, springs, WAAPI | Mature mutable Timeline, ScrollTrigger, broad plugins |
| Bundle | **3.12 kB** minimum (measured against `motion@14.9.0`) | Same core plus paid components | **24.50 KB** full; modular (Timer 5.60, Animation +5.20, Scroll +4.30, Draggable +6.41); 26,182 B gzip @4.0.2 | **27.29 kB** minimum (`gsap@3.15.1`) |
| React 19 fit | Native declarative API, state-linked | React/Vue components | No component API: `useEffect()` + `createScope()` + selector strings (`animate('.logo', …)`) + manual `revert()` | Imperative via `useGSAP` + refs; Motion calls it "messy to integrate with React" |
| Reduced motion | `MotionConfig reducedMotion="user"`, `useReducedMotion()` | Inherits core | Hand-rolled via Scope `mediaQueries`; no first-class `prefers-reduced-motion` helper | Hand-rolled in timeline setup |
| Licence | MIT, irrevocable | MIT on APIs/examples, but **paid access** ($399 one-time/seat; team seats yearly) | MIT © 2025 Julian Garnier | Free standard licence but closed source, Webflow-owned, revocable at Webflow's discretion; barred from Webflow-competing tools |

Sources: https://motion.dev/docs/react · https://motion.dev/docs/gsap-vs-motion · https://motion.dev/plus · https://animejs.com/ · https://animejs.com/documentation · https://animejs.com/documentation/getting-started/using-with-react · https://animejs.com/documentation/scope/scope-parameters/mediaqueries · https://bundlephobia.com/package/animejs@4.0.2 · https://github.com/juliangarnier/anime/blob/master/LICENSE.md · https://gsap.com/community/standard-license/

## Decision

**Keep Motion for interaction physics and component lifecycle; keep GSAP for the two scroll chapters; reject anime.js.** We would be adding a third runtime whose timeline, stagger, scroll-observer, spring, SVG and WAAPI features already exist in the two runtimes we ship. Its one genuine edge — free splitText/scrambleText versus Motion+'s paid Split Text — is not a current requirement.

The skills do not literally say "no second animation runtime"; that is our inference. The concrete lines are:

- unslop §9: *"Remove motion that loops for no reason… Keep motion that explains something."* Checklist: *"No looping or bouncy motion, one easing curve, no animated layout properties."* Two runtimes already strain that "one curve" rule; a third makes it unenforceable.
- Apple Design §16 Purpose: *"Make with intention; decide what not to build."* A third library spends attention and bundle for capability we do not use.
- Apple Design §14: *"Reduced motion doesn't mean no feedback — it means a gentler, non-vestibular equivalent."* Motion already gives us this via `MotionConfig`/`useReducedMotion`, wired in `components/ui/motion-provider.tsx`; anime.js would require reimplementing it.
- On imperative targeting, the precise quote is from Motion's docs, not the skills: *"Mixing its imperative API into React's declarative components leads to more verbose and error-prone code."* https://animejs.com/documentation/getting-started/using-with-react confirms the same `useEffect` + `createScope` + selector-string + `revert()` pattern.

No narrow exception is justified today. Reconsider only if a requirement needs SVG `morphTo` or split-text and Motion+ is not purchased.

## Motion patterns we are not yet using

Two patterns often suggested here are **already implemented**: `whileInView` reveals (`components/ui/motion.tsx:8`) and `AnimatePresence` for the mobile menu (`components/marketing/site-header.tsx:132`). `useReducedMotion` is used in three components. So the real gaps are:

1. **`layoutId` shared element for the active nav hairline** → `components/marketing/site-header.tsx:79-85`. Today two separate 1px spans toggle `opacity-100/opacity-0`, so the mark blinks between links. A single `motion.span layoutId="nav-underline"` moved under the active link turns a route change into a legible spatial transition. Uses transforms, no layout-property animation; unslop-compatible (one existing hairline, no new decoration). Docs: https://motion.dev/docs/react-layout-animations.
2. **`MotionConfig transition` as a house style** → `components/ui/motion-provider.tsx:7`. `MotionConfig` currently sets only `reducedMotion="user"`; components hardcode two different curves (`EASE_OUT` cubic-bezier in `site-header`/`hero-motion` versus the `easeOut` string in `ui/motion.tsx`). Setting one default duration/easing enforces unslop §9's *"one easing curve and a few durations across the screen"* and Apple Design §4's critically-damped default. Docs: https://motion.dev/docs/react-transitions.
3. **`useSpring`/`useMotionValue` numeric tween for a changed figure** → `components/data/live-context.tsx` `IndicatorItem`, where hourly-refreshed statistics update in place. unslop §9 explicitly allows *"a changed number tweens."* Tween only on value change, snap under reduced motion, keep `tabular-nums` and the accessible value truthful. Docs: https://motion.dev/docs/react-animation.

None are implemented by this assessment.

## Licence and credit obligations

- **No anime.js obligation**: nothing was copied or installed. Its MIT notice (© 2025 Julian Garnier) would apply only if adopted.
- **Motion core and Motion free/Motion+ examples are MIT**; if we copy example source, retain the copyright/licence notice (https://motion.dev/plus FAQ). Do not copy Motion+ component source without a seat, even though its APIs are MIT once accessed.
- **GSAP's standard licence** (already in use) forbids use in Webflow-competing tools and is terminable; cite https://gsap.com/community/standard-license/ in any future licence review.
- **This document quotes unslop**, CC BY 4.0 by Damir Sokolovsky (@heydamir): *"unslop by @heydamir"* credit retained. Apple Design is a WWDC-derived skill (no attribution clause) — cited above, not copied verbatim at length.

Word count: ~810.
