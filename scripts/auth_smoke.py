#!/usr/bin/env python3
"""Phase A smoke: unauthenticated APIs fail closed; login + session work.

Uses curl-compatible urllib only — does not import the FastAPI app (avoids
loading the NLP stack / colliding with a running server).

Run with API up:
  DEMO_ADMIN_EMAIL=admin@demo.local DEMO_ADMIN_PASSWORD=demo-change-me \\
    python scripts/auth_smoke.py
"""
from __future__ import annotations
import json
import os
import sys
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

    fake = "00000000-0000-0000-0000-000000000099"
    status, err = c.request(
        "POST",
        f"/api/v1/cases/{fake}/review?action=Confirm&new_level=Critical",
    )
    assert status == 404, f"expected 404 for missing case, got {status} {err}"
    print("✓ review missing case → 404")

    status, err = c.request(
        "POST",
        f"/api/v1/cases/{fake}/review?action=HACK&new_level=Critical",
    )
    # 400 for bad action before 404 is also fine; prefer whitelist first
    assert status in (400, 404), f"expected 400/404 for bad action, got {status}"
    print(f"✓ review invalid action → {status}")

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
