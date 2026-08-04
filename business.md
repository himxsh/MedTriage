# MedTriage AI — Business Brief

## Positioning

MedTriage is clinical decision-support software for acute-care teams. It converts text or voice intake into a structured, prioritized case summary, then requires a clinician to confirm or override the AI recommendation.

It is not a diagnostic tool or autonomous medical device. The product supports clinical judgment; it does not replace it.

## Problem

Emergency and acute-care teams receive inconsistent, unstructured intake information. Clinicians must manually extract symptoms, risk factors, and urgency while managing a changing queue. This creates avoidable administrative work and makes prioritization harder to audit.

## Product

MedTriage provides:

- Text and voice intake
- Structured chief complaint, symptoms, risk flags, urgency, confidence, and evidence
- Clinical entity extraction and UMLS linking
- PII de-identification
- A live triage queue
- Clinician confirmation and override controls
- An audit trail of every urgency decision

The core workflow is:

`Intake → AI-assisted triage → live queue → clinician review → audit`

## Target Customer

### Initial customer

Small hospitals, urgent-care networks, emergency departments, and clinical innovation teams that can run a limited workflow pilot without replacing their existing EHR.

### Users

- Triage nurses
- Emergency physicians
- Nursing supervisors
- Clinical operations leaders

### Buyers

- Head of emergency medicine
- Chief nursing officer
- Clinical operations or innovation lead
- Hospital IT leadership

## Value Proposition

MedTriage aims to:

- Reduce the time spent converting intake notes into a usable case summary
- Surface risk factors consistently
- Keep a real-time, prioritized queue visible to the care team
- Preserve clinician control over every urgency decision
- Create an auditable record of AI recommendations and human overrides

These are product hypotheses until validated in a supervised clinical pilot. MedTriage should not claim improved outcomes or reduced wait times without measured evidence.

## Commercial Model

The initial model is paid pilots followed by site-based subscriptions.

### Launch pricing

- **2-Week Pilot — $499 one-time**
  - Text and voice intake
  - Live queue and audit log
  - Up to 5 clinician seats

- **1-Month Site Plan — $1,200 recurring**
  - Everything in the pilot
  - Priority model updates
  - Up to 25 clinician seats

- **Enterprise — Contact Sales**
  - Multi-site rollout
  - Unlimited seats
  - SLA and clinical onboarding
  - SSO and custom integrations

Pricing is an initial sales hypothesis, not validated willingness-to-pay. Enterprise capabilities listed above are roadmap commitments and must not be sold as available until implemented.

The public repository uses the PolyForm Noncommercial License. Commercial use requires a separate agreement from the copyright holder.

## Pilot Offer

A pilot should evaluate one narrow intake workflow at one site.

### Included

- Deployment and basic configuration
- Clinician onboarding
- A defined evaluation period
- Weekly feedback review
- Exportable usage and override metrics

### Success measures

- Median time from intake submission to structured summary
- Percentage of cases successfully processed
- Clinician confirmation and override rates
- Down-triage rationale completion
- Clinician-reported usefulness
- System uptime during the pilot

Clinical accuracy, safety, and workflow impact must be evaluated by qualified clinicians. No pilot result should be represented as medical validation without an appropriate study.

## Go-to-Market

1. Recruit one clinical design partner through direct founder outreach.
2. Run a supervised 2-week pilot on a narrow, non-critical workflow.
3. Use measured pilot results and clinician feedback to improve the product.
4. Convert successful pilots to monthly site subscriptions.
5. Add EHR integration, SSO, and procurement support only when demanded by paying customers.

The initial sales motion is founder-led and evidence-led. A working pilot and credible workflow metrics matter more than broad marketing.

## Safety, Security, and Compliance

Before production use with real patient data, MedTriage requires:

- Real authentication and role-based authorization
- Server-derived clinician identity
- Encryption in transit and at rest
- Restricted CORS and authenticated WebSockets
- Formal retention, deletion, backup, and incident-response policies
- Vendor agreements and deployment controls appropriate to the jurisdiction
- Clinical risk review, model monitoring, and documented human oversight
- Legal review of healthcare privacy and medical-device obligations

The current application is a prototype and is not production-ready for protected health information.

## Current State

Implemented:

- Multi-stage text and audio triage pipeline
- Clinical NER, UMLS linking, de-identification, and relationship extraction
- Gemini-generated structured triage
- PostgreSQL persistence
- Redis and WebSocket live updates
- Clinician review, override rules, and audit logs
- React clinical queue and intake interface

Not yet implemented:

- Production authentication or authorization
- Billing and subscription management
- Enterprise SSO
- EHR integration
- Production compliance controls
- Clinical validation
- Multi-tenant account isolation

## Near-Term Milestones

1. Harden authentication, authorization, audit identity, uploads, and deployment.
2. Add pilot telemetry and exportable evaluation metrics.
3. Secure one clinical design partner.
4. Complete a supervised pilot with predefined success criteria.
5. Decide whether to continue, reposition, or stop based on evidence.

## Operating Principle

MedTriage wins only if it saves clinicians time without weakening clinical control. Every product, sales, and AI decision should preserve that constraint.
