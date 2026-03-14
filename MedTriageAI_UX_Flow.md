# MedTriage AI: End-to-End User Experience (UX) & Design Guide

This document outlines the complete user experience flow for the MedTriage AI web application. This guide is intended for the UI/UX design agent to use as a blueprint for designing the remaining pages of the platform, building upon the established "Dashboard/Queue" design.

## 1. Global Navigation & Layout Structure
Based on the existing Dashboard design, the application uses a fixed left sidebar and a flexible main content area.

### Left Sidebar (Fixed)
*   **Brand Logo:** LUNARIS (or MedTriage AI branding)
*   **Primary Navigation (Triage Ops):**
    *   **Queue** (The main dashboard - currently designed)
    *   **Cases** (Historical and all patient records)
    *   **Models** (AI performance, confidence, and bias monitoring)
    *   **Audit Log** (Tracking of human overrides and AI decisions)
*   **Bottom Identity:** User Profile (e.g., Joe Doe, joe@acmecorp.com) with a dropdown for settings/logout.

### Top Header (Global)
*   **Page Title & Subtitle:** Changes based on the active page (e.g., "MedTriage AI - AI-powered intelligent triage...").
*   **Global Actions:**
    *   `+ Export JSON` (For EHR integration)
    *   `+ New Intake` (High-visibility call-to-action to process a new patient)

---

## 2. Core User Journeys & Screen-by-Screen Breakdown

### Step 1: Authentication & Onboarding
*   **What the user sees:** A secure, HIPAA-compliant login screen (email/password or SSO/SAML integration for hospital networks).
*   **Onboarding:** Given the target audience (ER Staff, Nurses, Doctors), onboarding is minimal. First-time login provides a brief 3-step modal tooltip tour:
    1.  *How to add a new patient (Multi-modal input).*
    2.  *Understanding urgency badges.*
    3.  *How to confirm/override AI decisions (Human-in-the-loop).*

### Step 2: The Queue / Main Dashboard (Landing Page)
*   *Note: This page has already been designed, but the interactions are described below for continuity.*
*   **What the user sees:**
    *   **Top KPIs:** Active Cases (e.g., 124), Critical (e.g., 11, highlighted in red), Avg Triage Time (e.g., 2m 14s), Model Confidence (e.g., 91.8%).
    *   **Real-Time Triage Queue (Center):** A list of incoming patients sorted by urgency (Critical [Red], High [Orange], Medium [Blue/Yellow], Low [Green]). Each row shows a snippet of info (e.g., *Chest pain + diaphoresis | 58M | source: voice note*).
    *   **Workflow Status (Bottom Center):** Counts for Pending Review, In Progress, Completed.
    *   **Multi-Modal Input Panel (Right Rail):** Quick-access tools to process a new patient immediately. Buttons for `+ Paste Note`, `+ Upload Audio`, and `+ Upload PDF`.
    *   **Information/Alert Panels:** Banners explaining the "Human confirmation gate" for critical cases and "Explainability/Dataset strategy".
*   **User Action:** The user monitors the queue. If a "Critical" case appears, they click on the row to enter the **Case Detail View**. Alternatively, they use the Right Rail to ingest a new patient.

### Step 3: New Intake Flow (Multi-Modal Input)
*   **User Action:** The user clicks `+ New Intake` in the header or one of the upload buttons in the right rail.
*   **What the user sees:** An overlay modal or slide-out drawer appears with three tabs:
    *   **Text/Paste Note:** A large text area to paste raw clinician notes or intake forms.
    *   **Audio Upload/Record:** An interface to either upload an audio file (`.mp3`/`.wav`) or directly record voice (using OpenAI Whisper STT). Visualizer waves display while recording.
    *   **Document Upload:** A drag-and-drop zone for `.pdf` or `.txt` doctor summaries/referral letters.
*   **Transition:** Upon submitting, a brief "Analyzing..." loading state appears with medical extraction animations, transitioning immediately to the **Case Detail View**.

### Step 4: Case Detail & Review Page (Needs Design)
*This is the most critical interactive page of the application.*
*   **What the user sees:** A split-screen or dual-column layout to ensure transparency.
    *   **Header:** Patient ID (de-identified), Time of Intake, Workflow Status Dropdown (Pending Review, In Progress, Completed).
    *   **Left Column - Original Source:** The raw text, transcript of the audio, or PDF content.
        *   *Explainability Highlights (Crucial):* The text is highlighted with colors mapping to the AI's deductions. For example, "chest pain" and "diaphoresis" are highlighted in red to show *why* the AI chose the "Critical" label. 
    *   **Right Column - Structured AI Summary:**
        *   **Recommended Priority Badge:** e.g., CRITICAL (with an AI confidence score next to it).
        *   **Chief Complaint:** Condensed 1-2 sentence description.
        *   **Key Symptoms & Entities:** Tags or a clean list of extracted data (Symptoms, Medications, Demographics) utilizing NER logic (ICD-10/SNOMED mapping).
        *   **Risk Flags:** Warning icons for specific hazards (e.g., *Onset condition < 1 hour*).
*   **Primary User Action (Human-In-The-Loop):**
    *   At the bottom or top of the right column, the user must interact with the **AI Decision Gate**.
    *   **Buttons:** `[ Confirm Triage Level ]` or `[ Override ]`.
    *   If the user clicks `Override`, a small modal pops up asking for the new Urgency Level and an optional brief "Reason for override" (saved to the Audit Log).
*   **Secondary Actions:** Export Summary to PDF/JSON.

### Step 5: Cases List View (Needs Design)
*   **User Action:** User clicks "Cases" in the left sidebar.
*   **What the user sees:** A comprehensive table/data grid of all historical cases.
*   **Features:**
    *   Robust filtering and search menu. Filter by: Urgency, Date/Time, Keywords, Source Type (Audio/Text), Workflow Status.
    *   Columns: Case ID, Chief Complaint, Primary Risk, Urgency, Assigned To, Status, Time In, AI Confidence.
    *   Clicking a row brings the user back to the **Case Detail View** in read-only mode (or editable mode if 'In Progress').

### Step 6: Audit Log (Needs Design)
*   **User Action:** User clicks "Audit Log" in the left sidebar.
*   **What the user sees:** A ledger built for accountability and management review.
*   **Features:**
    *   A chronological feed of system events and human interventions.
    *   Entries look like: *"Nurse Jane Doe overrode AI decision from HIGH to CRITICAL on Case #4492. Reason: Patient exhibits new signs of pallor."*
    *   Filter by: "Overrides only", "Critical Cases", "User".

### Step 7: Models & Analytics page (Needs Design)
*   **User Action:** User clicks "Models" in the left sidebar.
*   **What the user sees:** A data visualization dashboard for AI Administrators.
*   **Features:**
    *   Charts showing Model Evaluation Metrics over time (NER Accuracy, Urgency Classification F1 Score).
    *   "Bias Monitoring" section (showing urgency classification distributions across varying demographic subgroups to ensure fairness).
    *   System health metrics (Whisper STT processing latency, LLM summary generation times).

---

## 3. Design Principles for the Agent
When generating the UIs for the remaining pages, the design agent should adhere to:
1.  **High Contrast & Readability:** This is a clinical environment. Text must be easily skimmable.
2.  **Color Semantics:** Strictly maintain the urgency colors (Red=Critical, Orange=High, Blue/Yellow=Medium, Green=Low). Do not use these colors for standard UI buttons (use neutral or the brand's orange, as seen in the Lunaris logo).
3.  **Information Density vs. Cognitive Overload:** The goal of the app is to reduce cognitive load. The UI should use white space effectively and group related medical entities (e.g., in the Structured Summary).
4.  **Transparency:** Never hide the raw original data. The side-by-side view (Source vs. Summary) is mandatory for clinical safety.