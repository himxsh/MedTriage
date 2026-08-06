# MedTriage — India production progress log

**Plan:** [`INDIA-PRODUCTION-PLAN.md`](./INDIA-PRODUCTION-PLAN.md)  
**Started:** 2026-08-06  
**Current focus:** Phase A — Security & tenancy foundation

This file records what shipped while executing the India production plan. Update it at the end of each working session.

---

## Session 1 — 2026-08-06 (Phase A kickoff)

### Goal

Close the blocking security gaps (S1–S6, P1) enough that the SPA and API are no longer open PHI surfaces: real auth, org tenancy, server-side audit actor, review state machine, upload containment, CORS/WS hardening.

### Done

#### A1 — Authentication (real)

- Added `Organization`, `User`, `AuthSession` models (`app/models/org.py`).
- Password hashing via stdlib PBKDF2-SHA256 (`app/core/security.py`) — no new deps; marked `ponytail:` for argon2 upgrade if audit requires.
- Server-side sessions: opaque token in **httpOnly** `mt_session` cookie; token stored hashed in DB; logout revokes session.
- Login lockout after 5 failures (15 min); per-IP login rate limit (in-memory).
- API routes:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/me`
  - `POST /api/v1/auth/invite` (admin only)
  - `POST /api/v1/auth/bootstrap` (first admin only, or when `ALLOW_PUBLIC_REGISTER=true`)
- Seed on startup: demo org **Demo Hospital** + admin `admin@demo.local` / `demo-change-me` (override via env).
- Public self-register **off** by default; Register UI is first-time bootstrap only.
- Frontend: Login talks to real API; `ProtectedRoute` gates `/queue`, `/cases`, `/audit`, `/account`; Account reads `/me` (no localStorage clinician forge); Logout clears session.

#### A2 — Authorization & audit integrity

- `clinician_id` for review is **derived from session only** — query param removed from API; frontend no longer sends it.
- All case/audit/intake queries scoped by `org_id`.
- Review rejects unless `status == "Pending Review"` → **409**.
- Whitelist: `action ∈ {Confirm, Override}`, `new_level ∈ {Critical, High, Medium, Low}`.
- Down-triage Override still requires reason ≥ 10 chars.
- RBAC v1: `intake` / `nurse` / `physician` / `admin` with role gates on intake vs review; evidence stripped for non-physician/admin on case detail.

#### A3 — Upload & intake hardening

- Client filename ignored; files stored as `temp_uploads/{case_id}.bin` with realpath containment check.
- Max audio **25 MB**; max text **20k** chars (configurable).
- Per-user + per-IP rate limit on `/intake` (in-memory; Redis upgrade path noted).

#### A4 — Transport & config (partial)

- CORS allowlist from `CORS_ORIGINS` (exact origins, credentials on) — no more `*`.
- WebSocket `/ws/queue` requires session cookie; broadcasts filtered by `org_id`.
- Removed Vite `GEMINI_API_KEY` client `define` (backend-only keys).
- `.env.example` updated with auth/CORS/demo seed vars.
- Still open: TLS/HSTS (needs prod reverse proxy), binding guidance for ops.

#### A5 — Data model migration

- `organizations`, `user`, `authsession` tables.
- `org_id` (+ soft-delete stubs `deleted_at`, `retain_until`) on cases; `org_id` on audit logs.
- Startup `ALTER … IF NOT EXISTS` for existing Postgres DBs (no Alembic yet).
- Orphan cases/audit rows without `org_id` backfilled to demo org on seed.

#### A6 — Verification

- `scripts/auth_smoke.py` — unauth → 401; login/me/cases; invalid review action; logout.
- `scripts/security_hash.check.py` — password hash round-trip.
- `frontend/scripts/smoke-api.mjs` updated for auth gate.
- **Verified live** against API on `:8001`: smoke passed; 5 legacy cases visible under demo org after backfill.

### Files touched (high level)

| Area | Paths |
|------|--------|
| Models | `app/models/org.py`, `app/models/case.py`, `app/models/__init__.py` |
| Auth core | `app/core/security.py`, `app/core/auth.py`, `app/core/config.py` |
| API | `app/api/v1/auth.py`, `app/api/v1/cases.py`, `app/api/v1/intake.py`, `app/main.py` |
| DB | `app/db/session.py` |
| Frontend | `api.ts`, `App.tsx`, `ProtectedRoute.tsx`, `Login.tsx`, `Register.tsx`, `Account.tsx`, `AppShell.tsx`, `CaseDetailDrawer.tsx`, `Queue.tsx`, `types.ts`, `vite.config.ts` |
| Ops/docs | `.env.example`, `scripts/auth_smoke.py`, `scripts/security_hash.check.py`, `frontend/scripts/smoke-api.mjs`, this file |

### Checklist vs plan (Phase A)

| Item | Status |
|------|--------|
| A1 User model + sessions + `/me` + ProtectedRoute | Done |
| A1 Invite-only register | Done (bootstrap + admin invite) |
| A1 Password change UI | Not started |
| A2 Server actor + org scope + review enums + Completed lock | Done |
| A3 Upload contain + size + rate limit | Done |
| A3 Kiosk API key | Deferred (optional) |
| A4 CORS allowlist + authenticated WS | Done |
| A4 TLS/HSTS + private bind runbook | Not started |
| A5 orgs + org_id + seed + retention stubs | Done |
| A6 Smoke / regression scripts | Done (auth + hash) |

### How to exercise locally

```bash
# From repo root, with Postgres + Redis up
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000   # or 8001 if 8000 is taken

# Smoke
MEDTRIAGE_API=http://127.0.0.1:8000 python scripts/auth_smoke.py
python scripts/security_hash.check.py

# UI: login with admin@demo.local / demo-change-me
```

**Note:** On this machine something else already owned `:8000` (`api.server:app`). Phase A work was verified on `:8001`. Frontend uses a **Vite proxy** (`/api` → uvicorn) so the session cookie is same-origin — do **not** set `VITE_API_URL` to `127.0.0.1` while browsing `localhost` (cookie will drop → login 200 then cases 401).

### Demo credentials (local seed)

| Field | Value |
|-------|--------|
| Email | `admin@demo.local` |
| Password | `demo-change-me` |
| Role | `admin` |

Change via `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` before first seed, or invite new users as admin.

---

## Remaining (next sessions)

### Finish Phase A

1. Password-change endpoint + Account UI.
2. TLS/HSTS + production CORS origins + cookie `Secure=true` behind HTTPS.
3. Expand regression curls for path-traversal attempt and cross-org case ID → 404.
4. Consider Alembic once schema churn settles.

### Phase B (after A exit)

Per plan: metrics export, Hindi+EN, admin console, India region deploy, DPA pack, INR landing — do **not** take real PHI until A + B0.6/B0.7 are signed.

### Non-eng (parallel, founder)

- 50-hospital outreach list  
- Clinical advisor + lawyer kickoff  
- Incorporate / IP vehicle  
- INR pricing on landing  

---

## Change log

| Date | Summary |
|------|---------|
| 2026-08-06 | Phase A1–A6 core: auth, RBAC, org tenancy, audit actor, upload harden, SPA guards, smokes |
| 2026-08-06 | Vite same-origin `/api`+`/ws` proxy — fixes login 200 then cases 401 (cookie drop) |

