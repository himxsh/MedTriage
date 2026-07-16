# MedTriage Landing — Figma Plugin Scripts

Builds the MedTriage landing page (desktop 1440) in Figma using Plugin API scripts.

## Execution order

| Order | Script | Purpose | Returns |
|-------|--------|---------|---------|
| 1 | `00-fonts-and-tokens.js` | Load fonts; create MedTriage/Color + MedTriage/Space variable collections; create text styles; create Feature Card + CTA Button components | `colorCollectionId`, `spaceCollectionId`, `textStyleIds`, `featureCardId`, `ctaButtonId`, `fontFallbacks` |
| 2 | `01-wrapper.js` | Create `Landing / Desktop` auto-layout frame (1440, linen fill) | `wrapperId` |
| 3 | `02-header.js` | Header with icon + MEDTRIAGE brand + Docs/LOGIN nav | — |
| 4 | `03-hero.js` | Hero with "TRIAGE. FASTER." heading, subhead, CTA button instance | — |
| 5 | `04-features.js` | Feature Card component instances + 3-column features section | — |
| 6 | `05-footer.js` | Footer with brand, 3 link columns, divider, bottom row | — |
| 7 | `06-validate-fonts.js` | Check Bebas Neue, IBM Plex Mono, Space Grotesk availability | `allAvailable`, `fontAvailability` |

## Placeholders

Scripts use `REPLACE_*` tokens that the orchestrator substitutes with actual Figma node IDs from prior runs:

| Token | Set by | Used by |
|-------|--------|---------|
| `REPLACE_WRAPPER_ID` | `01-wrapper.js` | `02-header.js`, `03-hero.js`, `04-features.js`, `05-footer.js` |
| `REPLACE_FEATURE_CARD_ID` | `00-fonts-and-tokens.js` | `04-features.js` |
| `REPLACE_CTA_BUTTON_ID` | `00-fonts-and-tokens.js` | `03-hero.js` |

## STATE.json schema

```json
{
  "fileKey": "ko3SvpVaFnmcEIgrlfV6fT",
  "wrapperId": "<set after 01-wrapper.js>",
  "featureCardId": "<set after 00-fonts-and-tokens.js>",
  "ctaButtonId": "<set after 00-fonts-and-tokens.js>",
  "colorCollectionId": "<set after 00-fonts-and-tokens.js>",
  "spaceCollectionId": "<set after 00-fonts-and-tokens.js>",
  "textStyleIds": { "<name>": "<id>" },
  "fontFallbacks": {}
}
```

## Font handling

- Each script loads fonts it needs before creating text nodes
- Fallback to Arial if a font is unavailable; recorded in `fontFallbacks` return
- `06-validate-fonts.js` does a final availability check — use to verify before rendering

## Notes

- All scripts are plain top-level await JS (no IIFE, no `figma.closePlugin()`)
- Colors use 0–1 RGB range
- Components are created off-canvas (x=-10000) in script 00
- Text styles are created as design reference; section scripts set `fontName` explicitly
