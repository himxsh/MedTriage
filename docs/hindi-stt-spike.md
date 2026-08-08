# Hindi STT quality spike (B0.3)

**Status:** Engineering path shipped (`STT_BACKEND=auto`, locale → `language=hi|en`, Gemini fallback).  
**Still open:** Founder listens to ~20 real/synthetic Hindi + Hinglish notes and records WER/usefulness below.

## What shipped

| Piece | Behavior |
|-------|----------|
| Whisper | Uses UI/form `language` hint (`hi` / `en`); else `WHISPER_LANGUAGE` env; else auto-detect |
| Model size | `WHISPER_MODEL_SIZE` (default `small`; try `medium` if Hindi WER is bad) |
| Backend | `STT_BACKEND=auto\|whisper\|gemini` — auto tries Whisper, then Gemini if empty/short |
| Gemini | Multimodal STT with clinical Hindi/Hinglish prompt; MIME sniffed from bytes (`.bin` uploads) |
| UI | Intake audio sends `language=hi` when locale is हिं |

Offline check (no model load):

```bash
python scripts/stt_language.check.py
```

## How to measure (Week-4 spike protocol)

1. Collect **20 clips** (phone voice notes OK): ~10 Hindi Devanagari-leaning, ~5 Hinglish, ~5 English clinical. Synthetic is fine if you lack PHI-safe samples.
2. For each clip, run three passes (same file):
   - `STT_BACKEND=whisper` + `WHISPER_MODEL_SIZE=small` + `language=hi`
   - `STT_BACKEND=whisper` + `WHISPER_MODEL_SIZE=medium` + `language=hi`
   - `STT_BACKEND=gemini`
3. Score each: **usable for triage?** (Y/N) — not academic WER. Flag drug names, laterality, time course, negation.
4. Decision rule:
   - If `small` + `hi` ≥ 16/20 usable → keep defaults.
   - Else if `medium` ≥ 16/20 → set `WHISPER_MODEL_SIZE=medium` in prod.
   - Else if Gemini wins → set `STT_BACKEND=gemini` for voice (or keep `auto` with Gemini fallback).
   - If all fail → **text-first pilot**; voice as soft launch later.

## Results log (fill in)

| # | Lang | small+hi usable? | medium+hi | Gemini | Notes |
|---|------|------------------|-----------|--------|-------|
| 1 | | | | | |
| … | | | | | |

**Verdict (date):** _pending founder listen_  
**Prod setting chosen:** _e.g. STT_BACKEND=auto, WHISPER_MODEL_SIZE=small_

## Ops knobs (`.env`)

```
STT_BACKEND=auto
WHISPER_LANGUAGE=
WHISPER_MODEL_SIZE=small
GOOGLE_API_KEY=…   # required for Gemini STT / triage
```
