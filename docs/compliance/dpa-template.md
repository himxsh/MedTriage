# Data Processing Agreement (DPA) — template

**Parties:** Hospital / Clinic (“Controller”) and MedTriage operator (“Processor”).  
**Status:** Skeleton for counsel. PolyForm Noncommercial covers public code; **paid use requires a commercial contract + this DPA (or equivalent).**

---

## 1. Subject matter

Processor provides AI-assisted triage software (intake → structured summary → live queue → clinician Confirm/Override → audit) as clinical decision support.

## 2. Duration

From pilot start date until termination of the Order Form / SaaS agreement, plus retention/deletion wind-down per §7.

## 3. Nature and purpose of processing

| Item | Detail |
|------|--------|
| Purpose | Triage ops support; audit of clinician decisions |
| Categories of data subjects | Patients whose encounters are entered by hospital staff |
| Categories of data | Clinical narrative (text/audio transcript), optional identifiers, AI outputs, review audit logs |
| Special category / health | Yes — health-related operational data |

## 4. Controller instructions

Processor processes only on Controller’s documented instructions (Order Form, this DPA, admin configuration). Processor will not sell personal data.

## 5. Security

Processor maintains: authentication (session cookies), org tenancy isolation, upload containment, TLS in production, audit logging of reviews, role-based access. See [security-one-pager.md](../security-one-pager.md).

## 6. Subprocessors

Controller authorizes subprocessors listed in [subprocessors.md](./subprocessors.md). Processor will give reasonable notice of material additions. Cross-border LLM inference must be expressly accepted by Controller if Gemini/Google (or equivalent) is used outside India.

## 7. Retention and deletion

Default pilot retain **90 days** unless agreed otherwise. On written request or contract end, Processor soft-deletes / deletes per [deletion-runbook.md](./deletion-runbook.md) and [retention-policy.md](./retention-policy.md), except where law requires longer retention of security logs.

## 8. Assistance

Processor assists Controller with data subject requests, security incidents (§9), and reasonable audits (questionnaire + evidence pack first; on-site only if paid enterprise).

## 9. Incidents

Processor notifies Controller without undue delay and within **72 hours** of confirming a personal-data breach affecting Controller data, per [incident-response.md](./incident-response.md).

## 10. Claims / positioning

Product is CDS with human gate. Controller will not market MedTriage as autonomous diagnosis or as replacing licensed clinical judgment.

## 11. Governing law

India / [state to insert], unless Order Form specifies otherwise.

---

**Signatures**

| | Controller | Processor |
|--|------------|-----------|
| Name | | |
| Title | | |
| Date | | |
| Signature | | |
