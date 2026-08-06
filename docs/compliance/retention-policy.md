# Data retention policy — pilot default

## Default

| Class | Default retain | Notes |
|-------|----------------|-------|
| Cases (incl. text, AI fields) | **90 days** from `created_at` | Soft-delete then purge |
| Audit logs | **90 days** (or match case) | Needed for pilot evidence |
| Auth sessions | Until expiry / logout (≤12h typical) | Not PHI |
| Temp audio uploads | Deleted after transcription attempt | `temp_uploads/{case_id}.bin` |
| Metrics aggregates | Derived; no extra PHI store | CSV exports held by hospital |

## Configuration

- Org fields `retain_until` / `deleted_at` exist on cases for future scheduled purge.
- Pilot Order Form may shorten or extend (e.g. 30 / 180 days).
- Paying sites: agree retention in DPA; do not keep “forever” by accident.

## Operational rule

Do **not** take real PHI until Phase A security exit **and** India hosting (B0.6) + signed DPA (B0.7) are in place.
