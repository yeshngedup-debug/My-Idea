# Icon fix report — brand-mark rollout / last navy leftovers

Date: 2026-11-24. Role: fixer (scoped). Product source edited only inside the
assigned paths. Written per `reports/PROTOCOL.md`.

## Reports read before editing

- `reports/PROTOCOL.md` — coordination rules.
- `reports/orchestrator.md` — HIGH item 8 records that the signup-form navy and
  `design/site.webmanifest` navy were **already fixed by the orchestrator**;
  item 15 flags the binary icons for deterministic regeneration.
- `reports/copy-critic.md` — no overlap with icons/colour (explicitly states
  `icon-fix.md` has no overlap).

No `visual-critic.md`, `accessibility-critic.md` or `brand-mark.md` existed at
finalization time.

## Changes applied (exact)

### 1. `app/layout.tsx` — icon links (my only product-source edit)

- Moved `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` to the
  first icon position so the corrected vector mark (forest `#17352b` + amber
  `#e0ad3c` arch cap) is the preferred favicon.
- Kept `/favicon.ico` and `/favicon-32.png`, `/favicon-16.png`,
  `/favicon-48.png` as legacy fallbacks and added an inline JSX comment stating
  they are **stale binaries** carrying the old navy mark, that **no SVG
  equivalent exists in `/public`** for those sizes, and that they must be
  regenerated from `favicon.svg` before ship.
- Kept `/apple-touch-icon.png` (180×180) as a PNG with an inline comment:
  **iOS does not accept SVG for `apple-touch-icon`**, so an SVG reference would
  be dishonest; this binary is also stale and needs regeneration.
- `og-image.svg` reference unchanged (already canonical).

`layout.tsx` uses manual `<link>` tags in `<head>`, not a Next.js
`export const metadata = { icons: ... }` object; I edited the existing icon
links rather than introducing a metadata export (which would duplicate the
head tags and was out of scope for a safe minimal fix).

### 2. `components/auth/signup-form.tsx` — NOT re-edited (overlap)

The navy focus border is already gone. The orchestrator applied
`focus:border-[#16324f]` → `focus:border-[#d84f37]` and
`focus:ring-amber-300` → `focus:ring-[#d84f37]/20` (see
`reports/orchestrator.md`, "Edits applied before the pause"). Per
PROTOCOL.md rule 2 I did not duplicate this fix.

**Conflict to resolve by the parent:** the assignment asked for `#b23c26`.
`design/brand-guidelines.md:17-18,129` defines `#b23c26` as the *small-text
accent* ("focus ring in legal UI") and `#d84f37` as the *default focus ring*.
The orchestrator's `#d84f37` also matches the other three signup fields and
`components/auth/styles.ts`. I left it in place to avoid making the password
field inconsistent with its siblings. If `#b23c26` is still required, that is
a deliberate override of the owning report and should be applied there.

### 3. `design/site.webmanifest` — NOT re-edited (overlap)

Already fixed by the orchestrator: `theme_color` and `background_color` are
both `#f5f2ea`, matching `public/site.webmanifest`. No navy remains.

### 4. `public/*.svg` audit — no edits needed

Scanned all seven files with grep for navy hex
(`16324f`, `0f2a44`, `1a3a5c`, `0d2137`, case-insensitive) plus the literal
word `navy`: **zero matches**.

- `public/favicon.svg` — canonical only: forest `#17352b`, amber `#e0ad3c`.
- `public/og-image.svg` — `#f5f2ea` page, `#eae5d9`, `#17352b`, `#244b3e`,
  `#d84f37`, `#e0ad3c`, `#59675f`. No navy.
- `window.svg`, `vercel.svg`, `next.svg`, `globe.svg`, `file.svg` — unused
  Next.js starter assets, grayscale (`#000`, `#fff`, `#666`). Not referenced
  by the app (grep across `app/**` found only `favicon.svg` and `og-image.svg`).
  Left untouched.
- SVG masters in `design/` (including navy originals) are archived and were
  deliberately left alone. There is **no SVG equivalent for `icon-192.png` in
  `/public`**, which is why the PNG references in both webmanifests were kept.

### Navy verification

Grep for `#16324f` / `#1e3a5f` in `app/layout.tsx`,
`components/auth/signup-form.tsx`, `design/site.webmanifest` and
`public/site.webmanifest`: **no matches** in any of the four.

## Remaining binary limitations (not fixed — no binary hand-edits, no image generation)

These files in `public/` are still stale (old navy mark / missing amber arch
cap) and were **not** modified:

`favicon.ico`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png`,
`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png`.

Consequences: legacy-browser favicons, the iOS home-screen icon, and all PWA
manifest icons still show the retired navy mark. Modern browsers that support
SVG favicons get the correct mark from `/favicon.svg`; OG shares get the
correct mark from `/og-image.svg`.

Apple-touch-icon note: iOS requires PNG here, so it must be regenerated as a
180×180 PNG, not repointed at an SVG.

`favicon.ico` note: ICO can embed PNG-compressed entries, so the single command
below builds it from the regenerated 16/32/48 PNGs with Node built-ins (no
ImageMagick on this machine — `magick` is absent; `convert.exe` on PATH is the
Windows disk utility, **not** ImageMagick. `ffmpeg` is not on PATH).

## Exact regeneration command (run from repo root, PowerShell)

Uses the locally installed `playwright` + Chromium; no image-generation credits
and no extra packages needed. Save as a temp `.js` if the one-liner is
awkward on your shell.

```powershell
node -e "const fs=require('fs'),{chromium}=require('playwright');(async()=>{const svg=fs.readFileSync('public/favicon.svg','utf8'),b=await chromium.launch();const sizes={'favicon-16.png':16,'favicon-32.png':32,'favicon-48.png':48,'apple-touch-icon.png':180,'icon-192.png':192,'icon-512.png':512,'maskable-512.png':512};for(const [name,n] of Object.entries(sizes)){const p=await b.newPage({viewport:{width:n,height:n},deviceScaleFactor:1});await p.setContent('<style>html,body{margin:0;padding:0}svg{width:100vw;height:100vh;display:block}</style>'+svg);await p.screenshot({path:'public/'+name});await p.close();}await b.close();const names=['favicon-16.png','favicon-32.png','favicon-48.png'],bufs=names.map(n=>fs.readFileSync('public/'+n));let off=6+16*bufs.length;const h=Buffer.alloc(6);h.writeUInt16LE(0,0);h.writeUInt16LE(1,2);h.writeUInt16LE(bufs.length,4);const dir=Buffer.alloc(16*bufs.length);bufs.forEach((buf,i)=>{const n=parseInt(names[i].match(/\d+/)[0],10);dir.writeUInt8(n,i*16);dir.writeUInt8(n,i*16+1);dir.writeUInt8(0,i*16+2);dir.writeUInt8(0,i*16+3);dir.writeUInt16LE(1,i*16+4);dir.writeUInt16LE(32,i*16+6);dir.writeUInt32LE(buf.length,i*16+8);dir.writeUInt32LE(off,i*16+12);off+=buf.length;});fs.writeFileSync('public/favicon.ico',Buffer.concat([h,dir,...bufs]));console.log('icons regenerated from public/favicon.svg');})().catch(e=>{console.error(e);process.exit(1)})"
```

`maskable-512.png` is produced from the same mark; if a platform requires a
stricter maskable safe zone, give it a dedicated padded master before
regenerating.

## Verification not run

No build/dev/tests were run (orchestrator owns verification gates per
PROTOCOL.md). Checks performed were read-only: file reads, grep sweeps, git
diff/log, and tool availability probing.
