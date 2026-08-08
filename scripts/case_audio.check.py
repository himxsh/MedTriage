#!/usr/bin/env python3
"""Offline check: durable case audio paths stay under CASE_AUDIO_DIR/{org_id}/."""
from __future__ import annotations

import os
import sys
import tempfile
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.case_audio import (  # noqa: E402
    delete_audio,
    durable_audio_path,
    open_audio_path,
    persist_from_temp,
)


def main() -> None:
    org = uuid.uuid4()
    case = uuid.uuid4()
    with tempfile.TemporaryDirectory() as tmp:
        prev = os.getcwd()
        try:
            os.chdir(tmp)
            path = durable_audio_path(org, case)
            base = os.path.realpath("case_audio")
            assert path.startswith(base + os.sep), path
            assert str(org) in path
            assert os.path.basename(path) == f"{case}.bin"

            temp = os.path.join(tmp, "in.bin")
            with open(temp, "wb") as f:
                f.write(b"RIFF....WAVEfmt fake")
            dest = persist_from_temp(org, case, temp)
            assert os.path.isfile(dest)
            assert open_audio_path(org, case) == dest
            assert delete_audio(org, case) is True
            assert open_audio_path(org, case) is None
            print("✓ durable case audio path check passed")
        finally:
            os.chdir(prev)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"✗ {e}", file=sys.stderr)
        sys.exit(1)
