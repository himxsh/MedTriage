#!/usr/bin/env python3
"""Offline check: upload path ignores client names and stays under temp_uploads.

Mirrors app.api.v1.intake._safe_upload_path without importing the API (NLP stack).

Run (no server):
  python scripts/upload_path.check.py
"""
from __future__ import annotations
import os
import sys
import tempfile
import uuid


def _safe_upload_path(case_id: uuid.UUID) -> str:
    """Same formula as intake — keep in sync with app/api/v1/intake.py."""
    base = os.path.realpath("temp_uploads")
    os.makedirs(base, exist_ok=True)
    path = os.path.realpath(os.path.join(base, f"{case_id}.bin"))
    if not path.startswith(base + os.sep):
        raise ValueError("Invalid upload path")
    return path


def main() -> None:
    case_id = uuid.uuid4()
    with tempfile.TemporaryDirectory() as tmp:
        prev = os.getcwd()
        try:
            os.chdir(tmp)
            path = _safe_upload_path(case_id)
            base = os.path.realpath("temp_uploads")
            assert path.startswith(base + os.sep), "path escaped temp_uploads"
            assert os.path.basename(path) == f"{case_id}.bin"
            evil = "../../../etc/passwd"
            assert evil not in path
            # Writing via case_id only — client filename never concatenated
            with open(path, "wb") as f:
                f.write(b"x")
            assert os.path.isfile(path)
            assert not os.path.exists(os.path.join(tmp, "etc", "passwd"))
            print(f"✓ contained path: {path}")
        finally:
            os.chdir(prev)

    print("\n✓ upload path containment check passed")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print(f"✗ FAIL: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ ERROR: {e}", file=sys.stderr)
        sys.exit(1)
