"""Durable case audio on disk; DB holds mime + has_audio flags only.

ponytail: filesystem under case_audio/{org_id}/{case_id}.bin — not Postgres BYTEA
(25 MB × cases blows backups). Upgrade path = S3/GCS India object store + same API.
"""
from __future__ import annotations

import os
import shutil
import uuid
from typing import Optional

from app.core.config import settings


def _root() -> str:
    return os.path.realpath(settings.CASE_AUDIO_DIR)


def durable_audio_path(org_id: uuid.UUID, case_id: uuid.UUID) -> str:
    """Resolved path contained under CASE_AUDIO_DIR/{org_id}/."""
    base = _root()
    os.makedirs(base, exist_ok=True)
    org_dir = os.path.realpath(os.path.join(base, str(org_id)))
    if not org_dir.startswith(base + os.sep) and org_dir != base:
        raise ValueError("Invalid org audio path")
    os.makedirs(org_dir, exist_ok=True)
    path = os.path.realpath(os.path.join(org_dir, f"{case_id}.bin"))
    if not path.startswith(org_dir + os.sep):
        raise ValueError("Invalid case audio path")
    return path


def persist_from_temp(
    org_id: uuid.UUID,
    case_id: uuid.UUID,
    temp_path: str,
) -> str:
    """Copy intake temp file into durable store; returns durable path."""
    dest = durable_audio_path(org_id, case_id)
    shutil.copy2(temp_path, dest)
    return dest


def delete_audio(org_id: uuid.UUID, case_id: uuid.UUID) -> bool:
    """Unlink durable file if present. Returns True if removed."""
    try:
        path = durable_audio_path(org_id, case_id)
    except ValueError:
        return False
    if os.path.isfile(path):
        os.remove(path)
        return True
    return False


def open_audio_path(org_id: uuid.UUID, case_id: uuid.UUID) -> Optional[str]:
    """Return durable path if file exists, else None."""
    try:
        path = durable_audio_path(org_id, case_id)
    except ValueError:
        return None
    return path if os.path.isfile(path) else None
