#!/usr/bin/env python3
"""Phase A smoke: unauthenticated APIs fail closed; login + session work.

Uses curl-compatible urllib only — does not import the FastAPI app (avoids
loading the NLP stack / colliding with a running server).

Run with API up:
  DEMO_ADMIN_EMAIL=admin@demo.local DEMO_ADMIN_PASSWORD=demo-change-me \\
    python scripts/auth_smoke.py

Optional cross-org plant (needs DATABASE_URL + asyncpg):
  MEDTRIAGE_API=http://127.0.0.1:8001 python scripts/auth_smoke.py
"""
from __future__ import annotations
import json
import os
import sys
import uuid
import urllib.error
import urllib.request
from http.cookiejar import CookieJar

BASE = os.environ.get("MEDTRIAGE_API", "http://127.0.0.1:8000")
EMAIL = os.environ.get("DEMO_ADMIN_EMAIL", "admin@demo.local")
PASSWORD = os.environ.get("DEMO_ADMIN_PASSWORD", "demo-change-me")


class Client:
    def __init__(self):
        self.jar = CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))

    def request(self, method: str, path: str, data: dict | None = None) -> tuple[int, object]:
        body = None
        headers = {}
        if data is not None:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(f"{BASE}{path}", data=body, headers=headers, method=method)
        try:
            with self.opener.open(req, timeout=10) as resp:
                raw = resp.read().decode()
                return resp.status, json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            raw = e.read().decode()
            try:
                payload = json.loads(raw) if raw else None
            except json.JSONDecodeError:
                payload = raw
            return e.code, payload

    def multipart(
        self, path: str, fields: dict[str, str], files: list[tuple[str, str, bytes, str]]
    ) -> tuple[int, object]:
        """files: (field_name, filename, content, content_type)"""
        boundary = f"----mt{uuid.uuid4().hex}"
        parts: list[bytes] = []
        for name, value in fields.items():
            parts.append(
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'
                f"{value}\r\n".encode()
            )
        for field, filename, content, ctype in files:
            parts.append(
                (
                    f"--{boundary}\r\n"
                    f'Content-Disposition: form-data; name="{field}"; '
                    f'filename="{filename}"\r\n'
                    f"Content-Type: {ctype}\r\n\r\n"
                ).encode()
                + content
                + b"\r\n"
            )
        parts.append(f"--{boundary}--\r\n".encode())
        body = b"".join(parts)
        req = urllib.request.Request(
            f"{BASE}{path}",
            data=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="POST",
        )
        try:
            with self.opener.open(req, timeout=30) as resp:
                raw = resp.read().decode()
                return resp.status, json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            raw = e.read().decode()
            try:
                payload = json.loads(raw) if raw else None
            except json.JSONDecodeError:
                payload = raw
            return e.code, payload


def _plant_foreign_case() -> str | None:
    """Insert a case under a throwaway org; return its id. None if DB unavailable."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return None
    try:
        import asyncio
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy import text
    except ImportError:
        return None

    case_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())

    async def _run() -> None:
        engine = create_async_engine(db_url)
        async with engine.begin() as conn:
            await conn.execute(
                text(
                    "INSERT INTO organization (id, name, timezone, seat_cap, created_at) "
                    "VALUES (CAST(:id AS uuid), :name, 'Asia/Kolkata', 5, NOW())"
                ),
                {"id": org_id, "name": f"Smoke Foreign {org_id[:8]}"},
            )
            await conn.execute(
                text(
                    'INSERT INTO "case" (id, org_id, status, input_type, raw_text, '
                    "urgency_level, confidence_score, created_at, updated_at) "
                    "VALUES (CAST(:id AS uuid), CAST(:oid AS uuid), 'Pending Review', "
                    "'text', 'smoke foreign case', 'Low', 0, NOW(), NOW())"
                ),
                {"id": case_id, "oid": org_id},
            )
        await engine.dispose()

    try:
        asyncio.run(_run())
        return case_id
    except Exception as e:
        print(f"  (skip cross-org plant: {e})")
        return None


def main() -> None:
    c = Client()

    status, _ = c.request("GET", "/api/v1/cases")
    assert status == 401, f"expected 401 for GET /cases, got {status}"
    print("✓ unauthenticated GET /cases → 401")

    status, _ = c.request("GET", "/api/v1/audit")
    assert status == 401, f"expected 401 for GET /audit, got {status}"
    print("✓ unauthenticated GET /audit → 401")

    status, me = c.request("POST", "/api/v1/auth/login", {"email": EMAIL, "password": PASSWORD})
    assert status == 200, f"login failed: {status} {me}"
    assert isinstance(me, dict) and "id" in me and "org_id" in me
    print(f"✓ login as {me['email']} role={me['role']}")

    status, me2 = c.request("GET", "/api/v1/me")
    assert status == 200 and isinstance(me2, dict) and me2["id"] == me["id"]
    print("✓ GET /me returns session user")

    status, cases = c.request("GET", "/api/v1/cases")
    assert status == 200 and isinstance(cases, list)
    print(f"✓ authenticated GET /cases → {len(cases)} cases")

    # Password change round-trip (restore demo password)
    tmp_pw = "smoke-temp-pw-9x"
    status, err = c.request(
        "POST",
        "/api/v1/auth/password",
        {"current_password": "wrong", "new_password": tmp_pw},
    )
    assert status == 401, f"expected 401 for bad current password, got {status} {err}"
    print("✓ password change rejects wrong current → 401")

    status, _ = c.request(
        "POST",
        "/api/v1/auth/password",
        {"current_password": PASSWORD, "new_password": tmp_pw},
    )
    assert status == 200, f"password change failed: {status}"
    status, _ = c.request(
        "POST",
        "/api/v1/auth/password",
        {"current_password": tmp_pw, "new_password": PASSWORD},
    )
    assert status == 200, f"password restore failed: {status}"
    print("✓ password change + restore")

    fake = "00000000-0000-0000-0000-000000000099"
    status, err = c.request("GET", f"/api/v1/cases/{fake}")
    assert status == 404, f"expected 404 for foreign/missing case, got {status} {err}"
    print("✓ GET missing/foreign case id → 404")

    status, err = c.request(
        "POST",
        f"/api/v1/cases/{fake}/review?action=Confirm&new_level=Critical",
    )
    assert status == 404, f"expected 404 for missing case, got {status} {err}"
    print("✓ review missing case → 404")

    foreign_id = _plant_foreign_case()
    if foreign_id:
        status, err = c.request("GET", f"/api/v1/cases/{foreign_id}")
        assert status == 404, f"expected 404 for cross-org case, got {status} {err}"
        print(f"✓ GET cross-org case → 404 ({foreign_id[:8]}…)")
    else:
        print("✓ GET cross-org case → skipped (set DATABASE_URL to plant)")

    status, err = c.request(
        "POST",
        f"/api/v1/cases/{fake}/review?action=HACK&new_level=Critical",
    )
    assert status in (400, 404), f"expected 400/404 for bad action, got {status}"
    print(f"✓ review invalid action → {status}")

    # Path-traversal attempt: evil filename must not escape; intake still accepts
    status, intake = c.multipart(
        "/api/v1/intake",
        {"input_type": "audio", "text_content": ""},
        [
            (
                "audio_file",
                "../../etc/passwd",
                b"RIFF....WAVEfmt ",  # tiny stub; pipeline may fail later — we care about accept path
                "audio/wav",
            )
        ],
    )
    # 200 accepted into queue, or 4xx validation — never 500 from path escape
    assert status in (200, 400, 422), f"unexpected intake status {status} {intake}"
    if status == 200 and isinstance(intake, dict) and "id" in intake:
        stored = os.path.join("temp_uploads", f"{intake['id']}.bin")
        escaped = os.path.realpath("etc/passwd") if os.path.exists("etc/passwd") else None
        # File must land under temp_uploads/{case_id}.bin when written
        # (pipeline writes asynchronously; check naming contract via offline script too)
        print(f"✓ intake with evil filename accepted ({status}); id={intake['id']}")
        print(f"  (stored name contract: temp_uploads/{{id}}.bin — see upload_path.check.py)")
        _ = stored, escaped
    else:
        print(f"✓ intake with evil filename → {status} (no path escape crash)")

    status, _ = c.request("POST", "/api/v1/auth/logout")
    assert status == 200
    status, _ = c.request("GET", "/api/v1/me")
    assert status == 401
    print("✓ logout clears session")

    print("\n✓ Phase A auth smoke passed")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print(f"✗ FAIL: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ ERROR: {e}", file=sys.stderr)
        sys.exit(1)
