# Incident response — one-pager

## Severity (internal)

| Level | Example | Action |
|-------|---------|--------|
| SEV1 | Confirmed PHI exposure / auth bypass / ransomware | All-hands; notify hospital ≤72h |
| SEV2 | Elevated error rate, WS down during ward hours, key leak suspected | Mitigate; notify if PHI risk |
| SEV3 | Single-site config issue | Ticket; no breach notice |

## Who to call (fill before go-live)

| Role | Name | Phone / WhatsApp | Email |
|------|------|------------------|-------|
| Founder / eng on-call | | | |
| Hospital IT contact | | | |
| Hospital clinical champion | | | |
| Legal / privacy (fractional) | | | |

## 72-hour clock (personal-data breach)

1. **Detect** — monitoring, user report, audit anomaly.
2. **Contain** — rotate keys, revoke sessions, take endpoint offline if needed.
3. **Assess** — what data, which org, whether India-only or subprocessor involved.
4. **Notify hospital controller** in writing within **72 hours** of confirmation (sooner if possible). Include: nature, approximate volume, likely consequences, measures taken.
5. **Remediate + postmortem** — within 5 business days internal write-up.

## Evidence to preserve

Auth logs, deploy version, relevant case IDs (minimize PHI in tickets), timeline UTC.
