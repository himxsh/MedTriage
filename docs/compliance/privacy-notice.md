# Privacy notice (pilot / triage ops) — template

**Audience:** Hospital attaches this (or equivalent) to its existing patient / visitor notice.  
**Role of MedTriage:** Processor of operational triage data on behalf of the hospital (controller).

---

## What MedTriage processes

For triage workflow only, MedTriage may process:

- Intake text or voice notes submitted by hospital staff
- Optional identifiers staff enter (e.g. name, MRN)
- AI-generated summary fields (chief complaint, symptoms, risk flags, urgency suggestion, evidence)
- Clinician review actions (Confirm / Override) and audit metadata (who, when, reason)

MedTriage is **clinical decision support**: urgency is advisory until a clinician Confirms or Overrides. It is **not** a diagnosis, prescription, or autonomous triage system.

## Purpose

Support hospital staff in structuring intake, prioritizing a live queue, and maintaining an audit trail of clinician decisions.

## Lawful basis / notice (DPDP-oriented)

Hospital is responsible for ensuring patients are informed under applicable Indian law (including the Digital Personal Data Protection Act, 2023, as applicable) that operational data may be processed for triage / acute-care operations. MedTriage processes data only on documented hospital instructions.

## Cross-border processing

De-identification is applied before calls to the LLM provider where feasible. Some content may still leave India if the configured model provider hosts inference outside India. See [subprocessors.md](./subprocessors.md). Hospital must accept this in the DPA before live PHI.

## Retention

Default pilot retention: **90 days** unless the Order Form / DPA says otherwise. See [retention-policy.md](./retention-policy.md).

## Rights / contact

Patients should contact the **hospital** (controller) for access, correction, or erasure requests. Hospital may instruct MedTriage per [deletion-runbook.md](./deletion-runbook.md).

---

*Template only — customize entity names, contact emails, and jurisdiction with counsel.*
