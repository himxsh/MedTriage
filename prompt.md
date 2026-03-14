# MedTriageAI — Frontend Prompt for Agentic UI/UX AI

## Overview

You are building the frontend for **MedTriageAI**, a clinical AI triage system used by ER staff and clinicians. The UI must feel authoritative, fast, and trust-inspiring — designed for high-stakes, time-pressured medical environments. Every screen must prioritize information clarity over decoration. Think: surgical precision in layout, zero cognitive overhead.

---

## Design Principles

- **Clinical clarity first.** No gradients, no decorative flourishes. Information must be scannable in under 2 seconds.
- **Color carries meaning.** Red = Critical, Orange = High, Yellow = Medium, Green = Low. These are non-negotiable and must be consistent system-wide.
- **Human in the loop is sacred.** Every AI decision must be presented as a recommendation, never a command. Override paths must be equally prominent as confirm paths.
- **Confidence is a first-class citizen.** Confidence scores and evidence highlights must appear wherever an AI decision is shown.
- **Audit visibility.** Users must always feel that their actions are recorded. Subtle indicators of logging should be present at key decision points.

---

## Tech Stack Assumptions

- React + TypeScript
- Tailwind CSS (utility-first, no custom design tokens unless specified)
- React Query for server state (cases, queues)
- Zustand or Context for local UI state
- WebSocket or SSE for real-time queue updates
- React Hook Form for all form inputs
- Radix UI or shadcn/ui for accessible primitives

---

## Application Screens & Components

---

### 1. Dashboard — Triage Queue

**Route:** `/dashboard`

**Purpose:** The main working surface. Shows the live prioritized case queue.

**Layout:**
- Fixed top navbar: Logo left, Clinician name + role right, notification bell
- Left sidebar (collapsible): Navigation links — Dashboard, New Intake, Audit Log, Settings
- Main content: Priority-sorted case queue table

**Case Queue Table Columns:**
| Column | Description |
|---|---|
| Priority Badge | Color-coded pill: `CRITICAL` (red), `HIGH` (orange), `MEDIUM` (yellow), `LOW` (green) |
| Patient ID | De-identified (`PT-XXXXX`) |
| Chief Complaint | One-line AI-extracted summary |
| Input Type | Icon: text / audio / PDF |
| Confidence Score | Progress bar + percentage (e.g., 87%) |
| Flagged | Warning icon if flagged for mandatory human review |
| Status | `Pending Review` / `In Progress` / `Completed` |
| Time in Queue | Relative timestamp (e.g., "4 min ago") |
| Action | `Review →` button |

**Behavior:**
- Cases sorted by: Critical > High > Medium > Low, then by time in queue (oldest first within tier)
- Real-time updates via WebSocket — new cases animate in from the top of their tier
- Rows flagged for human review must have a pulsing amber border or icon
- Clicking anywhere on a row navigates to the Case Detail View
- Filter bar above table: filter by priority, status, input type, flagged only
- Empty state: "No pending cases. Queue is clear." with a subtle checkmark

---

### 2. New Intake — Input Selection

**Route:** `/intake/new`

**Purpose:** Entry point for submitting a new patient case.

**Layout:**
- Centered card, max-width 640px
- Heading: "New Patient Intake"
- Subheading: "Select how you'd like to submit clinical information"

**Input Type Cards (3 options, horizontal row):**

1. **Text / Paste Note**
   - Icon: document with lines
   - Label: "Paste Clinical Note"
   - Subtext: "Intake form, clinical notes, discharge summary"

2. **Audio Recording**
   - Icon: microphone
   - Label: "Upload Voice Recording"
   - Subtext: "MP3, WAV, M4A — transcribed via Whisper STT"

3. **PDF / TXT Upload**
   - Icon: file upload
   - Label: "Upload Document"
   - Subtext: "Referral letters, lab reports, summaries"

**Behavior:**
- Clicking a card highlights it and reveals the corresponding input form below (accordion expand)
- Each card is keyboard accessible and has a visible focus ring

---

### 3. New Intake — Input Forms

**Route:** `/intake/new` (inline, below card selection)

#### 3a. Text Form
- Large `<textarea>` (min 8 rows), placeholder: "Paste or type clinical notes here…"
- Character counter bottom-right
- Submit button: "Analyze & Triage →"

#### 3b. Audio Form
- Drag-and-drop upload zone with file type hint: "MP3 · WAV · M4A · OGG"
- Or: "Record directly" toggle — in-browser microphone capture with waveform visualizer and stop/pause controls
- After upload: show file name, duration, waveform preview strip
- Status indicator: "Transcribing with Whisper…" (skeleton loader / spinner)
- On completion: show transcription preview (collapsed by default, expandable)
- Submit button: "Analyze & Triage →"

#### 3c. PDF / TXT Form
- Drag-and-drop upload zone: "PDF · TXT"
- File preview: show file name + page count (for PDF)
- Submit button: "Analyze & Triage →"

**Post-Submission Processing State (all types):**
Show a full-width processing pipeline progress indicator (not a spinner, but a step-by-step pipeline tracker):

```
[✓] Input Received
[✓] De-identification
[~] Clinical NER (Extracting entities…)
[ ] Relationship Extraction
[ ] Ontology Mapping
[ ] LLM Summarization
[ ] Urgency Classification
```

Steps complete in sequence. Estimated time shown. User can navigate away; processing continues in background and they are notified on completion.

---

### 4. Case Detail View

**Route:** `/cases/:caseId`

**Purpose:** Full case review — original source + AI analysis side by side.

**Layout:** Two-column split (50/50 on large screens, stacked on mobile)

#### Left Panel — Source Document
- Title: "Source Input"
- Badge showing input type (Text / Audio / PDF)
- If audio: inline audio player + toggle to show/hide transcript
- Full original text rendered in a scrollable panel
- **Explainability Highlights:** Key phrases (symptoms, risk flags, diagnoses) highlighted inline with color-coded chips and tooltips explaining why each was flagged
  - Hover/click on highlight → tooltip: `"Flagged as: Chest pain — linked to CRITICAL urgency classification (ICD-10: R07.4)"`

#### Right Panel — AI Analysis
- **Chief Complaint:** Single bold sentence
- **Key Symptoms:** Bulleted list of extracted entities (with ICD-10/SNOMED codes shown as subtle badges)
- **Risk Flags:** Distinct red-background section listing high-risk signals (e.g., "Severe chest pain + diaphoresis + radiation to left arm")
- **Recommended Priority:**
  - Large colored badge: CRITICAL / HIGH / MEDIUM / LOW
  - Confidence score with progress bar (e.g., "Confidence: 91%")
  - Confidence band note: "High — AI recommendation can be accepted with standard review"
  - If flagged: amber banner "⚠ Flagged for Mandatory Human Review — confidence below threshold"
- **Medications Identified:** Inline list
- **Timeline:** Extracted onset, duration, aggravating/alleviating factors
- **Ontology Codes:** Accordion expand for full ICD-10 / SNOMED mapping

---

### 5. Human-in-the-Loop Decision Gate

**Location:** Bottom of Case Detail View (sticky footer bar or fixed action panel)

**Purpose:** Clinician confirms or overrides the AI's urgency recommendation.

**Layout:**
- Left side: "AI Recommends: **CRITICAL**" with confidence score
- Right side: two action buttons

**Button 1 — Confirm:**
- Label: "Confirm AI Decision"
- Style: Filled, green
- On click: confirmation modal "Confirm triage level as CRITICAL for PT-XXXXX?" → [Cancel] [Confirm]

**Button 2 — Override:**
- Label: "Override Decision"
- Style: Outlined, red
- On click: slide-in panel or modal with:
  - Heading: "Override AI Triage Decision"
  - Dropdown: Select new urgency level (Critical / High / Medium / Low)
  - Textarea: "Reason for override (required)" — min 20 characters enforced
  - Submit: "Submit Override"
  - Cancel link

**Post-decision:**
- Both paths immediately lock the decision controls and show:
  - "Decision recorded — [Clinician Name] · [Timestamp]"
  - Subtle "Logged to audit trail" indicator with lock icon
- Status badge updates to "In Progress"

---

### 6. Audit Log

**Route:** `/audit`

**Purpose:** Full immutable log of all clinician decisions.

**Layout:** Full-width table

**Columns:**
| Column | Description |
|---|---|
| Timestamp | ISO datetime, displayed as relative + absolute on hover |
| Clinician ID | Name + role |
| Patient ID | De-identified |
| Action | `Confirmed` (green) / `Overridden` (red) |
| AI Decision | Original AI urgency recommendation |
| Final Decision | Clinician's accepted level |
| Override Reason | Shown inline if action = Override, truncated with expand |
| Confidence at Decision | Score at time of decision |

**Filters:** Date range, clinician, action type (Confirmed / Overridden), priority level

**Export button:** Download as CSV

---

### 7. Export

**Trigger:** Button in Case Detail View top-right: "Export Case"

**Options (presented as a dropdown or modal):**
- **JSON** — For EHR integration. Downloadable `.json` with full structured case data
- **PDF Report** — Formatted clinical summary report. Includes: patient ID, chief complaint, extracted entities, AI decision, confidence score, clinician decision, timestamp, override reason if applicable

---

## Global UI Patterns

### Priority Color System
```
CRITICAL  →  bg-red-600     text-white      badge, row highlight, left border accent
HIGH      →  bg-orange-500  text-white
MEDIUM    →  bg-yellow-400  text-gray-900
LOW       →  bg-green-500   text-white
FLAGGED   →  bg-amber-400   pulsing border  (mandatory review cases)
```

### Confidence Score Display
- `>= 85%` → Green progress bar, "High Confidence"
- `65–84%` → Yellow progress bar, "Moderate Confidence"
- `< 65%` → Red progress bar, "Low Confidence — Flagged for Review"

### Processing Pipeline Tracker
Used on intake submission. Step states:
- `pending` → hollow circle
- `in-progress` → animated spinner circle
- `complete` → filled checkmark circle (green)
- `error` → X circle (red)

### Flagged for Review Banner
Amber banner that appears at the top of flagged case detail views:
```
⚠  This case has been flagged for mandatory human review.
   AI confidence fell below the required threshold. Clinical judgment required.
```

### Toast Notifications
- Case processed successfully → green toast
- Confidence threshold not met → amber toast with "Review Required" CTA
- Decision recorded → subtle green toast
- Error states → red toast with retry option

---

## Accessibility Requirements

- All interactive elements keyboard navigable (Tab / Enter / Space)
- Focus rings visible on all controls
- Priority badges use both color AND text (never color alone)
- `aria-label` on all icon-only buttons
- Screen reader announcements on real-time queue updates (`aria-live="polite"`)
- Minimum contrast ratio 4.5:1 for all text

---

## Responsive Behavior

- **Desktop (≥1280px):** Full two-column case detail, sidebar always visible
- **Tablet (768–1279px):** Sidebar collapses to icon rail, case detail stacks vertically
- **Mobile (<768px):** Bottom tab navigation, single-column layout, simplified queue table (3 columns max)

---

## Key Non-Functional Requirements

- Queue updates must reflect within **2 seconds** of a new case being processed
- Case Detail View must load in under **1 second** (skeleton loaders for async content)
- All forms must be protected against accidental navigation away (unsaved changes prompt)
- De-identified patient IDs must be used everywhere in the UI — no real names or DOBs ever displayed
- All AI outputs are labeled "AI Recommendation" — never presented as a definitive diagnosis
