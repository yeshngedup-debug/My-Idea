# Brand token normalization report

Scope: `components/{ui,editorial,interactive,data,library,marketing}/**`. 21 files changed; no pages, app, lib, design docs, or build/dev.

- Replaced `slate/gray/zinc/red/emerald/amber-*` and `white/black` utilities with the canonical warm ramp: page #f5f2ea, surface #fffefa, ink #18251f, forest #17352b, small-text accent #b23c26, destructive #9d3328, borders 8-15% ink.
- Small-text #d84f37 -> #b23c26 for AA. #d84f37 remains only on focus rings, source-link underlines and one decorative icon.
- Added visible focus rings and 44px targets to Button, inputs, textarea, submit button, photo credit; removed submit-button heavy shadow.
- Card radius 12px, control radius 8px; font-bold -> font-medium on buttons and status timeline.
- `nav.ts` PALETTE now imports `colors.*` from lib/design-tokens (values unchanged).
- Zero off-brand utility classes remain in the six scoped directories.

Left outside scope: `components/auth/**` and `components/layout/**` still have slate/amber-200/font-bold/text-white (icon-fix agent owns the signup navy border only). Two easing curves persist: [0.22,1,0.36,1] in CSS/header/hero/fade vs [0.23,1,0.32,1] in text-reveal/design-tokens, plus "easeOut" in ui/motion.tsx. shadcn/progress uses token textSecondary #56645c while brief says #5e554a. Photo dark washes kept as intentional brand cinematic wash.
