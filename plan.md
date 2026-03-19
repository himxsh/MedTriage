# MedTriage AI - Implementation Plan

This document outlines the step-by-step engineering roadmap for building the MedTriage AI system.

## 🟢 Phase 1: Foundation & Infrastructure (Completed)
- [x] **1.1 Project Initialization:** Set up directory structure and virtual environment.
- [x] **1.2 Model Procurement:** Download and verify Whisper, scispaCy, and ClinicalBERT.
- [x] **1.3 Environment Config:** Create `.env` management and pydantic settings.
- [x] **1.4 Database Setup:** Initialize PostgreSQL and Redis services; create `medtriage` DB.
- [x] **1.5 Persistence Layer:** Define SQLModel schemas for `Case` and `AuditLog`.
- [x] **1.6 App Entry Point:** Create FastAPI boilerplate with async DB initialization.

## 🟢 Phase 2: Core AI Pipeline ("The Engine") (Completed)
- [x] **2.1 Whisper Integration:** Service implemented to load local Whisper weights and transcribe audio.
- [x] **2.2 Clinical NER & Linking:**
    - [x] `scispaCy` extraction for disease/chemical entities implemented.
    - [x] `scispaCy.linking.EntityLinker` added for UMLS/ICD-10 mapping.
- [x] **2.3 ClinicalBERT Utility:** Integrated for local Relationship Extraction (Onset, Radiation factors) using **transformers**.
- [x] **2.4 Gemini Integration:** 
    - [x] Gemini client configured for structured analysis and triage urgency logic.
- [x] **2.5 PII Masking:** `DeidService` enhanced with **NER-first Safety Filter** (prevents masking of medical terms like Metformin/Lisinopril).

## 🟢 Phase 3: Backend API Development (Completed)
- [x] **3.1 Intake API (`POST /api/v1/intake`):** Successfully orchestrates De-ID, NER, BERT, and Gemini.
- [x] **3.2 Case Management API:** `GET /api/v1/cases` and `GET /api/v1/cases/{id}` implemented.
- [x] **3.3 Review & Audit API:** `POST /api/v1/cases/{id}/review` with clinician audit logging.

## 🟢 Phase 4: Real-time & Asynchronous Workflows (Completed)
- [x] **4.1 Background Processing:** Heavy AI processing offloaded to `BackgroundTasks`.
- [x] **4.2 WebSocket Integration:** Redis Pub/Sub established for broadcasting live case updates.

## 🎨 Phase 5: Frontend Development (React + Nordic Brutalist)
- [ ] **5.1 UI Setup:** Initialize Vite + React project (Configuration completed).
- [ ] **5.2 Theme System:** Nordic/Neo-Brutalist design tokens.
- [ ] **5.3 Components:**
    - [ ] Real-time Triage Queue (sorted by urgency).
    - [ ] **Audio Recorder (Option 1):** Record-then-upload flow using MediaRecorder API.
    - [ ] Dynamic Case Detail View with clinical highlights.
- [ ] **5.4 Performance:** Proxy configuration for API/WebSockets established.

## 🏁 Phase 6: Final Integration & Validation
- [x] **6.1 Component Validation:** Verified DB/Redis/Service connections via automated testing.
- [x] **6.2 Pipeline Validation:** `test_full_pipeline.py` successfully processed complex medical cases.
- [x] **6.3 Version Control:** Updated `.gitignore` and pushed stable backend core to GitHub.
- [ ] **6.4 End-to-End Demo:** Full voice-to-dashboard walk-through.
