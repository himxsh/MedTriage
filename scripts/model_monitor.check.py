#!/usr/bin/env python3
"""Offline check: model stats + fallback alert threshold."""
from __future__ import annotations
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services import intelligence as intel  # noqa: E402


def main() -> None:
    intel._stats.update(
        {
            "calls": 0,
            "success": 0,
            "parse_failures": 0,
            "fallback_mock": 0,
            "no_client": 0,
            "latency_ms": [],
        }
    )
    snap = intel.model_stats_snapshot()
    assert snap["calls"] == 0 and snap["fallback_alert"] is False

    intel._stats["calls"] = 10
    intel._stats["fallback_mock"] = 3
    snap = intel.model_stats_snapshot()
    assert snap["fallback_rate"] == 0.3
    assert snap["fallback_alert"] is True, snap

    intel._stats["latency_ms"] = [10.0, 20.0, 30.0]
    snap = intel.model_stats_snapshot()
    assert snap["latency_p50_ms"] == 20.0
    print("✓ model monitoring stats check passed")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print(f"✗ FAIL: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ ERROR: {e}", file=sys.stderr)
        sys.exit(1)
