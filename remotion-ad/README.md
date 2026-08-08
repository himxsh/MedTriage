# MedTriage — Remotion Ad (new frontend)

Product promo for the current MedTriage landing + Syncra clinician UI.

## Quick start

```bash
cd remotion-ad
npm install
npm run studio
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run studio` | Remotion Studio preview |
| `npm run render` | Render MP4 to `out/medtriage-ad.mp4` |

Copy the render into the landing MacBook slot:

```bash
cp out/medtriage-ad.mp4 ../frontend/public/medtriage-ad.mp4
```

## Specs

- Composition: **MedTriageAd** — 1920×1080, 30fps, 900 frames (30s)
- Fonts: Instrument Serif (marketing), Inter (product UI)
- Palette: landing blue gradient `#5FA9E8 → #A7D2F5`, Syncra ink `#131722`, linen `#F0F5FA`

## Scenes

1. **Hero** — Landing recreation: Coming Soon, TRIAGE. FASTER., waitlist pill
2. **Promise** — Intake → AI triage → live queue → clinician confirm
3. **Intake** — New Intake modal screenshot
4. **Queue** — Live queue screenshot + Live pulse
5. **Review** — Case detail screenshot + Confirm chip
6. **CTA** — TRIAGE. FASTER. / Join waitlist

Studio Visual Mode: interactive elements use `Interactive.*` with inline `interpolate()` keyframes.
