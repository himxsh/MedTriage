# India-region production deploy — runbook (B0.6)

**Goal:** App + Postgres + Redis in an India region (e.g. **Mumbai**). No live PHI until this + signed DPA.

Companion: [`ops-production.md`](./ops-production.md), [`.env.example`](../.env.example).

## Target topology

```
Internet → TLS LB / Caddy / nginx (India)
        → uvicorn 127.0.0.1:8000  (or private subnet)
        → Postgres (India) + Redis (India)
Frontend: static build behind same origin or allowlisted CORS origin
```

## Checklist

### Environments

- [ ] **Staging** (synthetic data only) and **prod** (separate DB/Redis/secrets)
- [ ] No long-lived prod credentials in laptop plaintext — use secret manager / sealed env
- [ ] `COOKIE_SECURE=True`, `ENABLE_HSTS=True`, `ALLOW_PUBLIC_REGISTER=False`
- [ ] `CORS_ORIGINS` = exact `https://…` frontend origin(s)

### Data plane

- [ ] Postgres in Mumbai (or equivalent India AZ); automated **daily backups**
- [ ] Enable PITR if the provider offers it; schedule a **restore drill once** before pilot
- [ ] Redis private to VPC; not public
- [ ] Disk encryption on volumes

### App

- [ ] Bind API to private IP / loopback behind proxy — not public `0.0.0.0` without firewall
- [ ] Structured logs (JSON preferred); ship to host logging
- [ ] Error tracking (Sentry or equivalent) with PHI scrubbing rules
- [ ] Gemini key in secret manager; budget alert per org when possible
- [ ] Uptime target: **99% during ward hours** (define hours in Order Form)

### Go-live gate

- [ ] Auth smoke + cross-org 404 + upload containment scripts green against staging
- [ ] DPA signed ([compliance/](./compliance/))
- [ ] Hospital IT has [security-one-pager.md](./security-one-pager.md)
- [ ] IR contacts filled in [incident-response.md](./compliance/incident-response.md)

## Suggested providers (pick one; do not bikeshed)

AWS `ap-south-1`, GCP `asia-south1`, Azure `centralindia`, or equivalent Mumbai region. Prefer managed Postgres + Redis.

## Staging smoke (after DNS/TLS)

```bash
MEDTRIAGE_API=https://api.staging.example python scripts/auth_smoke.py
python scripts/upload_path.check.py
```

## Not done in-repo yet

Actual cloud account provisioning, Terraform, and CI deploy — founder ops when AWS/GCP account is ready. This runbook is the gate list.
