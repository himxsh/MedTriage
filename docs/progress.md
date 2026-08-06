# MedTriage — India production progress log

**Plan:** [`INDIA-PRODUCTION-PLAN.md`](./INDIA-PRODUCTION-PLAN.md)  
**Started:** 2026-08-06  
**Current focus:** Phase B0 — compliance pack + deploy runbook done; cloud provision + legal sign-off remain

This file records what shipped while executing the India production plan. Update it at the end of each working session.

---

## Session 7 — 2026-08-06 (B0.6 runbook + B0.7/B0.8 docs)

### Goal

PHI gate paperwork: compliance templates, security one-pager, India deploy checklist; admin soft-delete for erasure requests.

### Done

- `docs/compliance/*` — privacy notice, DPA skeleton, retention, deletion runbook, IR, subprocessors, CDS claims.
- `docs/security-one-pager.md`, `docs/pilot-success-criteria.md`, `docs/india-deploy.md`.
- `POST /api/v1/org/cases/{id}/delete` + Admin UI soft-delete field.

### Still blocking real PHI

- Provision India cloud (follow india-deploy.md).
- Lawyer + hospital sign DPA; fill IR contacts.
- Hindi STT quality spike (optional for text-first pilots).

---

## Session 6 — 2026-08-06 (B0.8 INR + B0.3 locale)

### Goal

India GTM pricing + bilingual chrome for intake/nurses.

### Done

- Landing: ₹39,999 pilot / ₹99,000 site-month / custom group.
- `frontend/src/i18n.ts` EN|HI; header toggle; SafetyBanner + nav + intake strings.
- Gemini prompt: Hinglish in, English urgency enum out.

### Commits

Pushed on `master` this session.

---

## Session 5 — 2026-08-06 (B0.4 safety + B0.5 queue)

### Goal

Sellable nurse queue: CDS banner, immutable completed, filters, Critical keyboard + alerts.

### Done

- Persistent CDS safety banner in AppShell.
- Case drawer: stronger risk flags; Completed/Failed immutable footers; confirm hint.
- Queue: status + urgency + time filters; Critical pin/sort; `C` confirms next Critical; optional Critical sound + pulse; offline banner; empty states; tablet-friendlier padding/table scroll.
- Review bumps `updated_at`.

### Commit

Pushed on `master` (this session).

---

## Session 4 — 2026-08-06 (Phase B0.1 admin console)

### Goal

Org admin console so pilots can invite seats without founder SQL.

### Done

- `GET/PATCH /org`, `GET /org/users`, activate/deactivate; invite enforces soft seat cap.
- Frontend `/admin` (admin nav): site form, seat bar, invite, clinician table, API/WS status.

### Verified

Admin smoke on `:8003` — org read/patch, invite, deactivate/activate.

---

## Session 3 — 2026-08-06 (Phase B0.2 metrics)

### Goal

Ship the pilot sales asset: org-scoped metrics + CSV export.

### Done

- `accepted_at` on cases; intake stamps accept time; pipeline failures persist `status=Failed`.
- `GET /api/v1/metrics?from=&to=` (admin) + `format=csv`.
- Frontend `/metrics` page (admin nav only): date range, KPIs, urgency + review panels, CSV download.
- Offline check: `scripts/metrics_percentile.check.py`.

### Verified

```bash
# API on :8002
# unauth → 401; admin JSON + CSV OK (ingested=6, reviews=6 on demo)
```

---

## Session 2 — 2026-08-06 (Phase A close-out)

### Goal

Finish remaining Phase A checklist items: password change, TLS/HSTS ops posture, expanded security regression.

### Done

#### Password change (A1)

- `POST /api/v1/auth/password` — verifies current password, min 8 chars, rejects same-as-current.
- Revokes all **other** sessions for the user (current cookie kept).
- Account UI: change-password form with confirm field.
- Smoke: wrong current → 401; change + restore demo password.

#### TLS / HSTS / bind (A4)

- `ENABLE_HSTS` setting + `SecurityHeadersMiddleware` (`Strict-Transport-Security` when on).
- `COOKIE_SECURE` already wired; `.env.example` documents prod values.
- `docs/ops-production.md` — reverse-proxy layout, bind rules, cookie/CORS checklist.
- `__main__` uvicorn host default `127.0.0.1` (not public `0.0.0.0`).

#### Regression expansion (A6)

- `scripts/upload_path.check.py` — offline containment (evil `../` never enters path).
- `scripts/auth_smoke.py` — password change; GET missing case → 404; optional cross-org plant via `DATABASE_URL`; intake multipart with `../../etc/passwd` filename (stores `{case_id}.bin` only).

### Verified

```bash
MEDTRIAGE_API=http://127.0.0.1:8001 python scripts/auth_smoke.py  # all ✓
python scripts/upload_path.check.py
python scripts/security_hash.check.py
```

### Checklist vs plan (Phase A)

| Item | Status |
|------|--------|
| A1 Password change UI | Done |
| A4 TLS/HSTS + private bind runbook | Done (proxy terminates TLS; app flags) |
| A4 Secrets rotation / secret manager | Ops follow-up (not coded) |
| A3 Kiosk API key | Still deferred |
| A6 Path-traversal + cross-org smokes | Done |
| Alembic | Still deferred until schema settles |

**Phase A eng exit:** met. Do not take real PHI until B0.6/B0.7 also signed.

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

### Phase B0 (next eng)

1. Provision India-region staging/prod (execute `docs/india-deploy.md`).
2. Lawyer review of DPA + commercial license / SaaS terms.
3. Hindi voice STT quality spike (Whisper vs Gemini) — remaining B0.3.

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
| 2026-08-06 | Phase A close-out: password change, HSTS/ops runbook, path + cross-org regression |
| 2026-08-06 | Phase B0.2: pilot metrics API + admin UI + CSV; accepted_at + Failed status |
| 2026-08-06 | Phase B0.1: org admin console (settings, seats, invite UI) |
| 2026-08-06 | Phase B0.4/B0.5: CDS banner, completed lock UI, queue filters + Critical alerts |
| 2026-08-06 | Landing pricing → INR (₹39,999 pilot / ₹99,000 site-month) |
| 2026-08-06 | B0.3 EN/Hindi locale toggle + Hinglish Gemini prompt |
| 2026-08-06 | B0.7 compliance pack + security/pilot one-pagers + india-deploy runbook; case soft-delete |
