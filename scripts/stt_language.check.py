#!/usr/bin/env python3
"""Offline check: STT language resolve, MIME sniff, backend plan, fallback gate."""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.stt import (  # noqa: E402
    gemini_stt_prompt,
    pick_stt_plan,
    resolve_whisper_language,
    should_fallback_to_gemini,
    sniff_audio_mime,
)


def main() -> None:
    assert resolve_whisper_language("hi") == "hi"
    assert resolve_whisper_language("Hindi") == "hi"
    assert resolve_whisper_language("en") == "en"
    assert resolve_whisper_language("auto") is None
    assert resolve_whisper_language("") is None
    assert resolve_whisper_language(None) is None
    assert resolve_whisper_language("ta") == "ta"  # passthrough 2-letter

    assert should_fallback_to_gemini("") is True
    assert should_fallback_to_gemini("  ab ") is True
    assert should_fallback_to_gemini("chest pain radiating to left arm") is False

    assert pick_stt_plan("whisper", True, True) == ("whisper",)
    assert pick_stt_plan("gemini", True, True) == ("gemini",)
    assert pick_stt_plan("auto", True, True) == ("whisper", "gemini")
    assert pick_stt_plan("auto", True, False) == ("whisper",)
    assert pick_stt_plan("auto", False, True) == ("gemini",)

    try:
        pick_stt_plan("whisper", False, True)
        raise AssertionError("expected ValueError")
    except ValueError:
        pass

    prompt = gemini_stt_prompt("hi")
    assert "Hindi" in prompt and "transcript" in prompt.lower()

    with tempfile.NamedTemporaryFile(suffix=".bin", delete=False) as f:
        f.write(b"RIFF....WAVEfmt ")
        path = f.name
    try:
        assert sniff_audio_mime(path) == "audio/wav"
        assert sniff_audio_mime(path, "audio/webm") == "audio/webm"
    finally:
        Path(path).unlink(missing_ok=True)

    print("✓ stt language / plan / mime check passed")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"✗ {e}", file=sys.stderr)
        sys.exit(1)
