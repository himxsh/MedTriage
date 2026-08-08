# MedTriage — Product Overview

MedTriage is AI-assisted clinical triage decision support for acute-care teams. It turns unstructured intake — free-text notes or voice recordings — into a structured, prioritized case summary, then requires a clinician to confirm or override the recommendation before action.

It supports clinical judgment. It does not diagnose, prescribe, or replace triage staff.

## Who it’s for

- Emergency departments and urgent-care desks
- Triage nurses, emergency physicians, and nursing supervisors
- Clinical operations and innovation teams running supervised pilots

Built for site-by-site deployment, especially Indian acute-care and ED walk-in workflows.

## What the product does

Core workflow:

**Intake → AI-assisted triage → live queue → clinician review → audit**

1. **Intake** — Submit a text note or voice recording.
2. **Processing** — Speech (if needed) is transcribed; clinical entities are extracted and linked; PII is scrubbed where appropriate; relationships and modifiers are inferred.
3. **Structured triage** — The system produces chief complaint, symptoms, risk flags, urgency suggestion, confidence, and supporting evidence.
4. **Live queue** — Cases appear in a real-time prioritized queue for the care team.
5. **Human oversight** — A clinician confirms or overrides urgency; every decision is logged.

Urgency suggestions are advisory until reviewed.

## Services we offer

### 1. Multi-modal clinical intake

- Free-text clinical notes
- Voice audio intake with transcription
- Structured case records ready for review

### 2. Clinical intelligence pipeline

- Clinical named-entity recognition with UMLS mapping
- Automated de-identification (PHI scrubbing) that preserves clinical meaning
- Relationship and modifier extraction (including negation and context)
- AI-generated structured triage summaries with evidence

### 3. Live triage operations

- Real-time triage queue with urgency prioritization
- Case detail views for symptoms, risk flags, entities, and evidence
- WebSocket updates so connected clinicians see new and updated cases promptly

### 4. Clinician confirmation and override

- Confirm AI urgency recommendations
- Override with rationale when clinical judgment differs
- Persistent safety messaging: AI decision support — clinician must confirm before action

### 5. Audit and accountability

- Full audit trail of confirmations and overrides
- Exportable usage and override metrics for pilot evaluation
- Reviewable history for clinical operations and quality review

### 6. Pilot and site deployment

| Offer | What you get |
|-------|----------------|
| **2-Week Pilot** | Supervised evaluation at one site: text + voice intake, live queue, audit log, up to 5 clinician seats, metrics export |
| **Site Monthly** | Ongoing single-site deployment: pilot capabilities plus ongoing metrics review, up to 25 clinician seats |
| **Hospital Group** | Multi-site rollout, volume pricing, SLA and clinical onboarding, custom integrations on request |

Pilots are scoped to one narrow intake workflow at one site, with deployment support, clinician onboarding, and weekly feedback review.

## What MedTriage is not

- Not a diagnostic system
- Not an autonomous medical device
- Not a replacement for nurses, physicians, or established triage protocols
- Not a claim of certified ESI (or other protocol) scoring unless explicitly licensed and validated

## Operating principle

MedTriage succeeds when it saves clinicians time without weakening clinical control. Every product and delivery decision should preserve that constraint.
