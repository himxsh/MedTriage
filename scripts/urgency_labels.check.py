#!/usr/bin/env python3
"""Offline check: urgency label merge + defaults (B1.4)."""
from __future__ import annotations
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.models.org import resolve_urgency_labels, DEFAULT_URGENCY_LABELS  # noqa: E402

assert resolve_urgency_labels(None) == DEFAULT_URGENCY_LABELS
assert resolve_urgency_labels({}) == DEFAULT_URGENCY_LABELS
assert resolve_urgency_labels({"Critical": "  Red  ", "bogus": "x"})["Critical"] == "Red"
assert "bogus" not in resolve_urgency_labels({"bogus": "x"})
assert resolve_urgency_labels({"Critical": ""})["Critical"] == "Critical"
assert resolve_urgency_labels({"High": "A" * 100})["High"] == "A" * 40
print("✓ urgency_labels resolve check passed")
