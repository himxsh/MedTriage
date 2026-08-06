# Subprocessors

Last updated: 2026-08-06. Update this list when vendors change; notify DPA counterparties of material additions.

| Subprocessor | Purpose | Data involved | Region (typical) |
|--------------|---------|---------------|------------------|
| Google Gemini (Google LLC / Google Cloud) | LLM triage structuring | De-ID’d / masked clinical text where pipeline succeeds; residual identifiers possible if masking fails | **Often outside India** — confirm current API region |
| Cloud host (TBD — e.g. AWS Mumbai / GCP Mumbai / OCI Mumbai) | App, Postgres, Redis | Full application database for the site | **India (target)** |
| Email / transactional mail (TBD) | Admin invites, ops alerts | Email, name, role — not full case text if avoidable | Vendor-dependent |
| Error tracking (TBD — e.g. Sentry) | Crash / exception telemetry | Stack traces; scrub PHI from breadcrumbs | Prefer India or EU with DPA |

## De-ID before LLM

Pipeline: NLP extract → de-ID / mask → Gemini. Goal: reduce direct identifiers in prompts. **Not a guarantee of zero residual PHI.** Hospitals must accept residual risk in the DPA.

## Cross-border note (get legal eyes)

If Gemini inference runs outside India, personal data (or data that could re-identify) may leave India. Mitigations: masking, minimize free-text identifiers, India-hosted DB, contractual terms. **Do not process live PHI until counsel + hospital sign off.**
