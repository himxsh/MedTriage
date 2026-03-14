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
- [x] **2.3 ClinicalBERT Utility:** Integrated for local Relationship Extraction (Onset, Radiation factors).
- [x] **2.4 Gemini Integration:** 
    - [x] Gemini client configured for structured analysis.
    - [x] Unified prompt for **Clinical Summarization** & **Urgency Classification**.
- [x] **2.5 PII Masking:** `DeidService` built with **Safety Filter** to protect medical terms during anonymization.

## 🟢 Phase 3: Backend API Development (Completed)
- [x] **3.1 Intake API (`POST /api/v1/intake`):**
    - [x] Handle multi-part form data (text, audio).
    - [x] Orchestrated full AI pipeline with **Safety Filter** (NER -> Masking -> Mapping -> Gemini).
- [x] **3.2 Case Management API:**
    - [x] `GET /api/v1/cases`: List view implemented.
- [x] **3.3 Review & Audit API:**
    - [x] Clinician confirmation/override and `AuditLog` persistence.

## 🟢 Phase 4: Real-time & Asynchronous Workflows (Completed)
- [x] **4.1 Background Processing:** All AI intensive tasks moved to `BackgroundTasks`.
- [x] **4.2 WebSocket Integration:** 
    - [x] `/ws/queue` endpoint ready.
    - [x] Real-time broadcasting via Redis Pub/Sub validated.

## 🎨 Phase 5: Frontend Development (React + Neo-Brutalist)
- [ ] **5.1 UI Setup:** Initialize Vite + React project with Tailwind CSS.
- [ ] **5.2 Theme System:** Implement "Nordic/Neo-Brutalist" design tokens (bold borders, vibrant accents, dark mode).
- [ ] **5.3 Components:**
    - [ ] Real-time Triage Queue (sorted by urgency).
    - [ ] Dynamic Case Detail View.
    - [ ] Intake Portal with Audio Recorder component.
- [ ] **5.4 State Management:** Use React Query for API data and Zustand for global UI state.

## 🏁 Phase 6: Final Integration & Validation
- [ ] **6.1 End-to-End Testing:** Verify a voice note goes from record -> transcribe -> triage -> dashboard.
- [ ] **6.2 Performance Polish:** Optimize model loading and DB queries.
- [ ] **6.3 Demo Scripts:** Prepare synthetic patient data for a smooth presentation.
