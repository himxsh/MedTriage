# MedTriage Backend Workflow and Architecture

## Scope
This document describes the end-to-end backend workflow and system architecture for MedTriage.
It intentionally excludes frontend implementation details.

## System Goals
- Accept clinical intake from text or audio.
- De-identify protected health information before AI reasoning.
- Extract structured clinical entities and relations.
- Generate triage-focused intelligence (summary, urgency, confidence, evidence).
- Persist case and audit data in PostgreSQL.
- Broadcast triage updates through Redis and WebSockets.

## High-Level Architecture

### Core Backend Components
- FastAPI application layer for HTTP and WebSocket endpoints.
- Async PostgreSQL persistence via SQLModel and SQLAlchemy async engine.
- Redis pub/sub channel for real-time triage update fanout.
- NLP service layer for transcription, NER/linking, relationship extraction.
- De-identification service for masking PII while preserving clinical entities.
- Intelligence service for Gemini-based structured case analysis.

### Data Plane and Control Plane
- Data plane:
  - Clinical text, extracted entities, relationships, summary fields, urgency decisions.
- Control plane:
  - Background task scheduling, startup model loading strategy, redis listener loop, websocket broadcast.

## Runtime Topology

### Application Startup
1. FastAPI app starts.
2. Database initialization runs and creates SQLModel tables.
3. Redis listener background task is launched.
4. HTTP routers are mounted under /api/v1.
5. WebSocket endpoint is available at /ws/queue.

### Long-Lived Background Processes
- Redis listener subscribes to triage_updates channel.
- On each message, listener broadcasts payload to all connected websocket clients.

## Backend Module Structure

### API Layer
- app/main.py:
  - App creation, CORS, websocket manager, startup hooks, redis listener.
- app/api/v1/intake.py:
  - Intake endpoint and asynchronous AI pipeline orchestration.
- app/api/v1/cases.py:
  - Case list/detail retrieval and clinician review writes.

### Service Layer
- app/services/deid.py:
  - PII masking using regex + spaCy NER, with protected-entity overlap filtering.
- app/services/nlp.py:
  - Whisper transcription, scispaCy entity extraction and UMLS linking, relationship extraction.
- app/services/intelligence.py:
  - Gemini prompt orchestration and structured JSON parsing.
- app/services/queue.py:
  - Redis publish helper for triage update events.

### Persistence Layer
- app/db/session.py:
  - Async engine/session creation and table bootstrap.
- app/models/case.py:
  - Case and AuditLog schemas.

## Detailed Workflow

## 1. Intake Submission

### Route
- POST /api/v1/intake

### Input Modes
- text:
  - Accepts text_content.
- audio:
  - Accepts multipart upload audio_file and stores a temporary file.

### Immediate Response Pattern
- Endpoint returns quickly with a generated case id and processing status.
- Heavy AI processing runs in background tasks.

## 2. AI Pipeline Orchestration

Function: run_ai_pipeline in intake module.

### Stage A: Initial Clinical Extraction on Raw Text
- Runs clinical NER first on raw input.
- Captures clinical entities with offsets and potential UMLS mappings.
- Purpose: protect genuine medical terms from accidental masking during de-identification.

### Stage B: De-identification with Protected Entity Preservation
- PII spans detected from:
  - regex email patterns
  - regex phone patterns
  - spaCy entities: PERSON, ORG, GPE
- Any candidate PII span overlapping protected clinical entities is skipped.
- Replacements are applied and protected-entity offsets are adjusted to the masked text.
- Output:
  - masked_text
  - projected entity list aligned to masked_text offsets

### Stage C: Relationship Extraction
- Hybrid contextual logic is used:
  - disease-centric scanning
  - keyword buckets for relation categories
  - simple local negation checks
  - deduplication by source and relation type
- Output is a lightweight relation list with evidence snippets and indicators.

### Stage D: Clinical Intelligence and Triage
- Structured prompt is sent to Gemini model with:
  - de-identified text
  - extracted entities
  - extracted relationships
- Expected model output JSON:
  - chief_complaint
  - key_symptoms
  - risk_flags
  - urgency_level
  - confidence_score
  - evidence
- If model call fails or API key is missing, fallback mock analysis is returned.

### Stage E: Persistence
- A new async DB session is created inside the background task.
- A Case row is inserted with:
  - source input fields
  - extracted NLP artifacts
  - AI-generated summary and urgency fields
  - status defaulting to Pending Review

### Stage F: Event Publication
- A triage summary payload is published to Redis channel triage_updates.
- Payload includes case id, urgency, patient_name, chief_complaint, and status.

## 3. Audio-Specific Flow
- Intake endpoint writes uploaded audio to temp_uploads.
- Background function transcribes audio first via Whisper.
- Transcribed text is then passed into the same pipeline function.
- Temporary file is deleted in a finally block.

## 4. Case Retrieval and Human Review Flow

### List Cases
- GET /api/v1/cases
- Returns cases ordered by creation time descending.

### Case Detail
- GET /api/v1/cases/{case_id}
- Returns full case record or 404.

### Clinician Review Action
- POST /api/v1/cases/{case_id}/review
- Inputs include clinician_id, action, new_level, optional reason.
- Workflow:
  - fetch case
  - capture previous urgency
  - update urgency_level and mark status Completed
  - insert AuditLog record
  - commit both updates in same transaction scope

## 5. Real-Time Queue Update Flow
- Producer: queue service publishes case updates to Redis.
- Subscriber: redis_listener in app startup task listens continuously.
- Broadcaster: websocket manager sends payload to each active ws client.
- Client connection endpoint: /ws/queue.

## Data Model Architecture

## Case Model
Main attributes include:
- identity and lifecycle:
  - id, created_at, updated_at, status
- intake fields:
  - patient_name, input_type, raw_text, transcription
- summarization fields:
  - chief_complaint, key_symptoms, risk_flags
- triage decision fields:
  - urgency_level, confidence_score, evidence
- NLP artifacts:
  - entities (JSON)
  - relationships (JSON)

## AuditLog Model
Tracks human decision actions:
- case_id
- clinician_id
- action
- previous_level
- new_level
- reason
- timestamp

## Infrastructure and Configuration

## Environment Configuration
- PROJECT_NAME
- API_V1_STR
- GOOGLE_API_KEY
- DATABASE_URL
- REDIS_URL
- WHISPER_MODEL_PATH
- SCISPACY_MODEL_PATH
- CLINICAL_BERT_PATH
- DEBUG

## Database
- Async PostgreSQL driver expected via asyncpg.
- SQLModel metadata creation occurs on startup.

## Redis
- Used for pub/sub event fanout.
- Channel name: triage_updates.

## Model Loading Strategy
- NLP service uses lazy loading for heavy models.
- Whisper, scispaCy linker, and ClinicalBERT are loaded only when first needed.

## API Surface Summary

### HTTP Endpoints
- GET /
- POST /api/v1/intake
- GET /api/v1/cases
- GET /api/v1/cases/{case_id}
- POST /api/v1/cases/{case_id}/review

### WebSocket Endpoint
- WS /ws/queue

## Validation and Developer Utility Scripts

### test_full_pipeline.py
- Runs a complete offline pipeline simulation:
  - extraction on raw text
  - de-identification
  - relationships
  - mappings view
  - intelligence call

### test_mapping.py
- Focused test for clinical entity extraction and UMLS mapping quality.

### verify_bert.py
- Verifies relationship model and tokenizer can load from local relations directory.

## Backend Workflow Sequence Diagram (Text Form)
1. Intake request arrives.
2. Case id generated and request acknowledged.
3. Background AI task starts.
4. Initial clinical extraction runs.
5. De-identification runs with clinical protection.
6. Relationship extraction runs.
7. Gemini analysis runs.
8. Case row persisted.
9. Redis triage event published.
10. Redis listener receives message.
11. WebSocket manager broadcasts to connected clients.
12. Clinician reviews case and writes audit trail.

## Current Architectural Characteristics

### Strengths
- Clear service separation between extraction, de-id, intelligence, and queueing.
- Async IO for API, DB, Redis, and websocket fanout.
- Human-in-the-loop review captured in audit table.
- Fast intake response pattern with background processing.

### Known Constraints
- No explicit authentication/authorization layer in current API routes.
- CORS is fully open.
- Relationship extraction is heuristic/context-based, not a fully supervised relation classifier pipeline.
- Case ordering by urgency is not yet SQL-weighted; currently creation-time descending.
- Background tasks are process-local; no distributed task queue orchestration yet.

## Suggested Backend Evolution Paths
- Add authn/authz for clinician actions and audit integrity.
- Introduce durable job queue and worker service for pipeline execution.
- Add retry/backoff and dead-letter handling for AI stage failures.
- Add structured observability: trace ids, stage-level timings, failure metrics.
- Add schema versioning for entities/relationships payload contracts.
- Enforce stricter request and response contracts with dedicated Pydantic schemas.

## Conclusion
MedTriage backend is organized as an asynchronous, service-oriented triage pipeline that emphasizes de-identification, clinical extraction, model-assisted urgency classification, and human-audited decision closure, with real-time update propagation through Redis and WebSockets.
