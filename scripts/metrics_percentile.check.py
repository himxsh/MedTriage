#!/usr/bin/env python3
"""Offline check for metrics percentile helper (no server)."""
from __future__ import annotations
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.api.v1.metrics import _percentile  # noqa: E402


def main() -> None:
    assert _percentile([], 0.95) is None
    assert _percentile([10.0], 0.95) == 10.0
    vals = [1.0, 2.0, 3.0, 4.0, 5.0]
    p50 = _percentile(vals, 0.5)
    assert p50 == 3.0, p50
    p95 = _percentile(vals, 0.95)
    assert 4.0 <= p95 <= 5.0, p95
    print("✓ metrics percentile helper ok")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print(f"✗ FAIL: {e}", file=sys.stderr)
        sys.exit(1)
