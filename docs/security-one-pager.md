# MedTriage — Security one-pager (hospital IT)

**Product:** AI-assisted triage CDS — intake → queue → clinician Confirm/Override → audit.  
**Audience:** Hospital IT / CISO questionnaire starter. Fill host region once B0.6 is live.

## Authentication & access

| Control | Detail |
|---------|--------|
| Auth | Email/password; server-side session (`mt_session` httpOnly cookie) |
| MFA | Not in v1 (local accounts for pilot); SSO deferred until demanded |
| Roles | `intake` / `nurse` / `physician` / `admin` |
| Tenancy | All queries scoped by `org_id`; cross-org IDs return 404 |
| Invite | Admin-only; public self-register off in production |
| Lockout | Login lockout after repeated failures; rate limits on login/intake |

## Data & encryption

| Control | Detail |
|---------|--------|
| In transit | TLS terminated at reverse proxy (production); HSTS when enabled |
| At rest | Host-managed disk encryption (cloud volume); DB credentials in env/secrets |
| Uploads | Client filename ignored; stored as `temp_uploads/{case_id}.bin` with path containment; size caps |
| Secrets | API keys backend-only (not in Vite client) |

## Audit & clinical control

- Review actor = session user only (no client-supplied clinician forge)
- Completed cases cannot be re-reviewed (409)
- Confirm / Override + optional down-triage reason (≥10 chars)
- Persistent UI: “AI decision support — clinician must confirm”

## Residency & subprocessors

- **Target:** App + Postgres + Redis in **India** (e.g. Mumbai). See [`india-deploy.md`](./india-deploy.md).
- LLM (Gemini): may process masked text **outside India** — disclosed in DPA / [subprocessors](./compliance/subprocessors.md).

## Availability (pilot)

- Target **99%** during agreed ward hours
- Backups: daily (+ PITR if offered); restore drill before go-live
- Support: next business day for pilot; escalate via IR contacts

## What we do not claim (v1)

- HIPAA US readiness as Year-1 mandate
- Full EHR / FHIR bidirectional sync
- Autonomous triage without clinician gate

## Evidence pack

Auth smoke scripts, org isolation, upload containment checks in repo `scripts/`. Metrics CSV for pilot weeks under Admin → Metrics.
