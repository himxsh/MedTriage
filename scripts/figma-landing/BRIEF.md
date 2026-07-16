# OpenCode brief — MedTriage Landing Page (Figma)

## Ponytail (required, full)
You are in ponytail full for this entire task. Lazy senior: efficient, not careless.
After tracing the real flow, climb: YAGNI → reuse in-repo → stdlib → native → installed dep → one line → minimum that works.
No unrequested abstractions, no avoidable new deps, no boilerplate, fewest files, shortest correct diff.
Bug fix = root cause in the shared function, not one patch per caller.
Mark deliberate corners with `ponytail:` (ceiling + upgrade path).
Non-trivial logic: leave ONE small runnable check. Do not commit/push unless asked.

---

## Goal
Produce **executable Figma Plugin API scripts** that build one desktop landing page matching `frontend/src/components/LandingPage.tsx` exactly in structure, copy, typography, and color.

The orchestrator (Cursor) will run each script via `use_figma` against file:
- **fileKey:** `ko3SvpVaFnmcEIgrlfV6fT`
- **URL:** https://www.figma.com/design/ko3SvpVaFnmcEIgrlfV6fT
- **Name:** MedTriage — Landing Page

You do **not** call Figma yourself. You only write scripts to disk.

---

## Constraints
- Follow existing repo patterns; smallest correct diff
- Do not commit or push unless explicitly asked
- Do **not** import Material 3 / Simple Design System / iOS kits — they fight MedTriage’s brutalist clinical look
- Build **local** color/spacing variables + local components (Feature Card, Primary CTA button)
- One major section per script file (orchestrator runs them separately)
- Every script MUST `return { success, createdNodeIds, mutatedNodeIds, … }` with IDs
- Colors are 0–1 RGB, not 0–255
- Load fonts before any text mutation (`await figma.loadFontAsync`)
- Prefer `figma.createAutoLayout()` over absolute-positioned frames for content
- Append to auto-layout parent **before** setting `layoutSizingHorizontal/Vertical` to `FILL`/`HUG`
- Icons: import via `figma.createNodeFromSvg(svgString)` with width/height + viewBox — never reconstruct from rotated primitives
- Page context resets between runs — do not rely on `figma.currentPage` persistence beyond reading IDs from prior script returns (write IDs into `STATE.json`)

---

## Out of scope
- Mobile breakpoint frame (desktop 1440 only for v1)
- Capturing the live web app via screenshot tools
- Code Connect mappings
- Changing React/frontend code
- Using community UI kit components

---

## Done when
- Files exist under `scripts/figma-landing/`:
  - `00-fonts-and-tokens.js`
  - `01-wrapper.js`
  - `02-header.js`
  - `03-hero.js`
  - `04-features.js` (includes FeatureCard **component** + 3 instances)
  - `05-footer.js`
  - `06-validate-fonts.js`
  - `STATE.json` schema documented in `README.md` (keys the orchestrator will fill after each run)
  - `README.md` with execution order + how STATE.json is updated
- Each script is plain top-level `await` JS (no IIFE, no `figma.closePlugin()`)
- Scripts that need prior IDs read from a hardcoded placeholder like `/* STATE:wrapperId */` string `"REPLACE_WRAPPER_ID"` that the orchestrator will substitute — OR read `STATE.json` if you prefer Node… **No:** scripts run inside Figma Plugin sandbox, not Node. Use string placeholders:
  - `REPLACE_WRAPPER_ID`
  - `REPLACE_FEATURE_CARD_KEY` (component key if published) or `REPLACE_FEATURE_CARD_ID`
  - Document every placeholder in README.md
- Fonts asserted in `06-validate-fonts.js`: only Bebas Neue, IBM Plex Mono, Space Grotesk (or documented fallbacks if Bebas unavailable)
- One smoke check: `scripts/figma-landing/check-placeholders.sh` that fails if any `REPLACE_` token remains after orchestrator substitution (or a note that check runs pre-flight)

---

## Design system discovery (already done — do not re-litigate)

| Step | Result |
|------|--------|
| 2a-i Code Connect | **None** in repo (`*.figma.ts` / `*.figma.tsx` absent) |
| 2a-ii Existing screens | **Empty new file** — N/A |
| 2a-iii Libraries present | Material 3, SDS, iOS/macOS kits — **ignore for visual fidelity** |
| Product fonts | Bebas Neue (display), IBM Plex Mono (UI/labels), Space Grotesk (body/sans) from `frontend/src/index.css` + Google Fonts link in `frontend/index.html` |
| Images | Landing has **no** `<img>` — only Lucide vector icons. No `generate_figma_design` capture required |

---

## Product tokens (create as local Figma variables)

### Colors (collection: `MedTriage / Color`)
| Name | Hex | RGB 0–1 | Scopes |
|------|-----|---------|--------|
| `primary` | `#4A90D9` | `74/255, 144/255, 217/255` | FRAME_FILL, SHAPE_FILL, STROKE_COLOR |
| `primary-ink` | `#1E5A8B` | `30/255, 90/255, 139/255` | TEXT_FILL, FRAME_FILL, SHAPE_FILL |
| `linen` | `#F0F5FA` | `240/255, 245/255, 250/255` | FRAME_FILL, SHAPE_FILL |
| `black` | `#000000` | `0,0,0` | TEXT_FILL, FRAME_FILL, STROKE_COLOR |
| `white` | `#FFFFFF` | `1,1,1` | FRAME_FILL, TEXT_FILL |
| `black/60` | black @ 0.6 opacity OR solid `#666666` | prefer solid `#000000` fill with node opacity, or `#666666` | TEXT_FILL |
| `black/10` | `#E5E5E5` approx border | for strokes | STROKE_COLOR |
| `black/5` | `#F2F2F2` | features strip bg | FRAME_FILL |

Set `variable.scopes` explicitly — never leave `ALL_SCOPES`.

### Spacing (collection: `MedTriage / Space`) — GAP / WIDTH_HEIGHT / PADDING scopes as appropriate
| Name | px |
|------|-----|
| `space/4` | 16 |
| `space/6` | 24 |
| `space/8` | 32 |
| `space/10` | 40 |
| `space/12` | 48 |
| `space/16` | 64 |
| `space/20` | 80 |

### Typography (local text styles if fonts load; else set fontName per text node)
| Style name | Family | Style | Size | Tracking / LH | Use |
|------------|--------|-------|------|---------------|-----|
| `Display/Hero` | Bebas Neue | Regular | 200 | tracking tighter; lineHeight ~0.8× | H1 |
| `Display/Feature` | Bebas Neue | Regular | 48 | tracking wide | Feature H3 |
| `Mono/Nav` | IBM Plex Mono | Bold | 14 | uppercase | Header links |
| `Mono/Brand` | IBM Plex Mono | Bold | 24 | tracking tight | MEDTRIAGE wordmark |
| `Mono/Subhead` | IBM Plex Mono | Regular | 24–28 | tracking 0.2em; uppercase | Hero subcopy |
| `Mono/CTA` | IBM Plex Mono | Bold | 20 | uppercase | Get Started |
| `Mono/Body` | IBM Plex Mono | Regular | 14 | uppercase; opacity 60% | Feature body |
| `Mono/Footer` | IBM Plex Mono | Regular | 10 | uppercase | Footer |

**Font loading recipe:** Before creating/editing text:
```js
await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Mono", style: "Bold" });
await figma.loadFontAsync({ family: "Space Grotesk", style: "Regular" });
await figma.loadFontAsync({ family: "Space Grotesk", style: "Bold" });
```
If a family is missing from `listAvailableFontsAsync()`, fall back to closest available and record in return value `fontFallbacks`. Prefer failing loudly in validate script over silent Inter.

---

## Page structure (exact copy from LandingPage.tsx)

### Frame: `Landing / Desktop`
- Width: **1440**, height: hug content
- Vertical auto-layout, primary axis TOP, counter STRETCH
- Fill: `linen`
- Name: `Landing / Desktop`

### Section 1 — Header
- Horizontal auto-layout, space-between, pad x=40 y=24
- Fill: white; bottom stroke black/10 (1px)
- Left: icon layout-grid 32×32 primary + text `MEDTRIAGE` (Mono/Brand)
- Right: `Docs` link + `LOGIN` (Mono/Nav, uppercase)

### Section 2 — Hero
- Vertical auto-layout, center, pad y≈160 x=40
- Fill: linen; bottom stroke black/10
- H1: `TRIAGE. ` + italic-styled span feel for `FASTER.` in primary-ink
  - Figma has no CSS italic on Bebas easily — use Bebas Neue Regular for both; color primary-ink on `FASTER.` (split into two TEXT nodes OR one text with range fills)
- Subhead: `Next-generation clinical intelligence for critical care environments.`
- CTA button component instance: label `Get Started`
  - Fill primary, text white, pad ~64×24, border 2px black/20, Mono/CTA

### Section 3 — Features (3-column)
- Horizontal auto-layout, FILL children equally
- Background black/5; top rule
- Three Feature Card instances:

| Icon color | Title | Body |
|------------|-------|------|
| primary | DE-ID GENERATOR | Automated PHI scrubbing with zero-latency overhead. Built for high-volume clinical streams. |
| black | CLINICAL NER | UMLS-mapped entity extraction. Identify diagnosis, medications, and symptoms in real-time. |
| primary | TRIAGE CORE | Dynamic prioritization engine with human-in-the-loop validation flow. |

Feature Card main component:
- Vertical AL, pad 80, gap 40
- White bg on cards 1 & 3; middle transparent/linen-ish
- Right stroke black/10 on cards 1 & 2
- Icon slot (INSTANCE_SWAP or just frame) 64×64
- Title Display/Feature
- Body Mono/Body black/60

### Section 4 — Footer
- White bg, pad 64
- Left: `MEDTRIAGE INTELLIGENCE CORP` + blurb
- Right: 3 link columns RESOURCES / PLATFORM / LEGAL with links from source
- Divider + bottom row: `BUILT FOR PRECISION / 2024` · `SECURE SESSION ACTIVE`

---

## Icon SVGs (use createNodeFromSvg — stroke #4A90D9 or #000000 as needed)

Lucide 24 viewBox; resize to 32 (header) or 64 (features) after import.

### layout-grid (header, primary #4A90D9)
```svg
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/>
  <rect x="14" y="3" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/>
  <rect x="14" y="14" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/>
  <rect x="3" y="14" width="7" height="7" rx="1" stroke="#4A90D9" stroke-width="2"/>
</svg>
```

### shield-check (primary)
```svg
<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" stroke="#4A90D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="m9 12 2 2 4-4" stroke="#4A90D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### stethoscope (black)
```svg
<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 2v2" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
  <path d="M5 2v2" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
  <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 15a6 6 0 0 0 12 0v-3" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
  <circle cx="20" cy="10" r="2" stroke="#000000" stroke-width="2"/>
</svg>
```

### clipboard-list (primary)
```svg
<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="#4A90D9" stroke-width="2"/>
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="#4A90D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 11h4" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 16h4" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/>
  <path d="M8 11h.01" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/>
  <path d="M8 16h.01" stroke="#4A90D9" stroke-width="2" stroke-linecap="round"/>
</svg>
```

---

## Critical Figma Plugin API rules (must obey)
1. `return` only channel — no console.log reliance
2. Never `figma.notify` / `closePlugin` / pluginData (unsupported)
3. Never set `figma.currentPage =` — use `await figma.setCurrentPageAsync` at most once per script if needed
4. Position page-level wrapper away from (0,0): scan children maxX + 200
5. On error scripts are atomic — write correct scripts first time
6. Componentize Feature Card + CTA Button once, then instance
7. Bind fills/gaps to variables via `setBoundVariable` / `setBoundVariableForPaint` when variables exist

---

## Deliverable format
Write files only under `scripts/figma-landing/`. Each `.js` file body is the exact `code` string for `use_figma` (no markdown fences inside the file).

Start with `00-fonts-and-tokens.js` creating collections + text styles.
Then `01-wrapper.js` creating empty `Landing / Desktop` and returning `wrapperId`.
Subsequent scripts: `const wrapper = await figma.getNodeByIdAsync("REPLACE_WRAPPER_ID");` then append section.

Update `STATE.json` template:
```json
{
  "fileKey": "ko3SvpVaFnmcEIgrlfV6fT",
  "wrapperId": null,
  "featureCardId": null,
  "ctaButtonId": null,
  "variableCollectionId": null
}
```
