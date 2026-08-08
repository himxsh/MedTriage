"""Speech-to-text helpers for clinical intake (Whisper + optional Gemini).

ponytail: Whisper `small` is the default; Hindi quality may need `medium` or Gemini —
measure with docs/hindi-stt-spike.md before changing the default model size.
"""
from __future__ import annotations

from typing import Optional, Tuple

# UI / form hints → Whisper ISO-639-1 (None = Whisper auto-detect)
_LANG_MAP = {
    "hi": "hi",
    "hindi": "hi",
    "en": "en",
    "english": "en",
    "auto": None,
    "": None,
}


def resolve_whisper_language(hint: Optional[str]) -> Optional[str]:
    """Map intake/UI language hint to Whisper `language=` (or None = auto)."""
    if hint is None:
        return None
    key = hint.strip().lower()
    if key not in _LANG_MAP:
        # Unknown codes: pass through if 2-letter, else auto
        return key if len(key) == 2 else None
    return _LANG_MAP[key]


def sniff_audio_mime(path: str, declared: Optional[str] = None) -> str:
    """Best-effort MIME for Gemini; prefer magic bytes over .bin extension."""
    if declared:
        base = declared.split(";")[0].strip().lower()
        if base.startswith("audio/"):
            return base
    try:
        with open(path, "rb") as f:
            head = f.read(16)
    except OSError:
        return "audio/wav"
    if head.startswith(b"RIFF") and b"WAVE" in head[:12]:
        return "audio/wav"
    if head.startswith(b"OggS"):
        return "audio/ogg"
    if head.startswith(b"\x1aE\xdf\xa3"):  # EBML / WebM
        return "audio/webm"
    if head[4:8] == b"ftyp":
        return "audio/mp4"
    if head.startswith(b"ID3") or head[:2] in (b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"):
        return "audio/mpeg"
    return "audio/wav"


def should_fallback_to_gemini(text: str, min_chars: int = 3) -> bool:
    """Empty / tiny Whisper output → try Gemini multimodal."""
    return len((text or "").strip()) < min_chars


def gemini_stt_prompt(language_hint: Optional[str]) -> str:
    lang = (language_hint or "auto").strip().lower()
    if lang in ("hi", "hindi"):
        focus = "Prefer Hindi (Devanagari) or Hinglish as spoken; keep medical terms intact."
    elif lang in ("en", "english"):
        focus = "Prefer English; keep medical terms intact."
    else:
        focus = "Language may be English, Hindi (Devanagari), or Hinglish."
    return (
        "Transcribe this clinical triage intake audio for an Indian acute-care desk. "
        f"{focus} "
        "Output only the transcript text — no commentary, labels, or markdown."
    )


def pick_stt_plan(
    backend: str,
    whisper_ok: bool,
    gemini_ok: bool,
) -> Tuple[str, ...]:
    """Ordered backends to try. Raises ValueError if none available."""
    b = (backend or "auto").strip().lower()
    if b == "whisper":
        if not whisper_ok:
            raise ValueError("STT_BACKEND=whisper but Whisper unavailable")
        return ("whisper",)
    if b == "gemini":
        if not gemini_ok:
            raise ValueError("STT_BACKEND=gemini but GOOGLE_API_KEY missing")
        return ("gemini",)
    # auto
    plan = []
    if whisper_ok:
        plan.append("whisper")
    if gemini_ok:
        plan.append("gemini")
    if not plan:
        raise ValueError("No STT backend available (Whisper + Gemini both unavailable)")
    return tuple(plan)
