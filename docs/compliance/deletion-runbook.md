# Patient data deletion request — runbook

**Trigger:** Hospital (controller) asks to erase or restrict a patient’s triage records (DPDP / internal policy).

## Who acts

- Hospital privacy / medical records contact initiates in writing (email ticket).
- MedTriage **admin** for that org executes in product (or founder if early pilot).

## Steps (product)

1. Verify requester is authorized for that hospital org (do not accept patient-direct emails into MedTriage support without hospital ticket).
2. Identify cases: MRN and/or approximate time window + patient name as entered.
3. For each case ID: admin **soft-delete** via `POST /api/v1/org/cases/{case_id}/delete` (sets `deleted_at`; case disappears from queue/lists).
4. Confirm audit rows: either retain redacted “case deleted” stub for accountability **or** delete audit rows for that `case_id` if hospital requires full erasure (document which path in the ticket).
5. Reply to hospital with case IDs actioned and timestamp (UTC / IST).
6. If LLM provider logs exist outside MedTriage DB, note limitation in reply (see subprocessors) — hospital accepted this in DPA.

## Hard purge

Scheduled hard delete of soft-deleted rows after retain window (ops job — not yet automated; track as follow-up). Until then, soft-delete + access controls.

## Do not

- Delete another org’s data.
- Promise “removed from all model training” if the subprocessor does not offer that — say what we control (our DB + files).
