# MedTriage — Production User Flow & AI Agent Validation Guide

---

## 🏠 Landing Page (`/`)

**What the user sees:**
- Hero headline, sub-headline, CTA button
- 3 stat blocks (response time, accuracy, HIPAA compliance)
- 3 feature columns (De-ID Engine, Clinical NER, Real-Time Queue)
- Navigation bar with: `Login` and `Get Started` buttons

**What the user can do:**
- Click **Get Started** → goes to `/register`
- Click **Login** → goes to `/login`
- Scroll down to read features

---

## 🔐 Auth Flow

### `/login`
- Email + Password fields
- Submit → validates credentials → redirects to `/dashboard`
- "Forgot Password" link → `/forgot-password`
- Error state: inline error message below field

### `/register`
- Name, Email, Clinician ID, Password, Role dropdown (`Nurse`, `Doctor`, `Admin`)
- Submit → account created → redirects to `/dashboard`

---

## 📊 Dashboard (`/dashboard`)

**What the user sees:**
- Top bar: live clock, WebSocket status dot (`LIVE` / `DISCONNECTED`), user name, logout
- Left sidebar: `QUEUE` / `CASES` / `REVIEW` / `AUDIT` / `SETTINGS`
- Header counters: **PENDING** count / **IN REVIEW** count / **COMPLETED** count
- Triage queue table with columns: `CASE ID` / `PATIENT` / `CHIEF COMPLAINT` / `URGENCY` / `CONFIDENCE` / `TIME`

**What the user can do:**
- Click any **table row** → right panel opens with full case detail (no page navigation)
- Click column headers → sort by that column
- Filter bar above table: filter by urgency level (`CRITICAL` / `HIGH` / `MODERATE` / `LOW`) and status (`Pending` / `Completed`)
- Click **+ NEW INTAKE** button → opens intake submission form (inline panel or `/intake`)
- Real-time: new cases auto-appear at top of queue via WebSocket without refresh

---

## 📥 Intake Submission (`/intake`)

**Two tabs / toggle:**

### Text Mode
- Large textarea: *"Enter clinical notes..."*
- Patient Name field (optional)
- Submit button → shows processing state (`ANALYZING...` scan-line animation)
- On success: case card appears in queue, success toast notification

### Audio Mode
- Drag-and-drop audio upload zone
- OR record button (browser mic)
- Patient Name field
- Submit → shows `TRANSCRIBING... → ANALYZING...` staged status
- On success: same as text mode

**What the user sees during processing:**
- Case ID generated immediately (e.g. `#00187`)
- Status badge: `PROCESSING` → auto-updates to `PENDING REVIEW` when pipeline completes

---

## 🗂️ Case Detail Panel (right drawer on Dashboard)

**Opened by clicking any queue row.**

**What the user sees:**
- `CASE #00142` header + current status badge
- **CHIEF COMPLAINT** — large body text
- **KEY SYMPTOMS** — em-dash bulleted mono list
- **RISK FLAGS** — red monospaced text
- **AI CONFIDENCE** — large gold percentage number
- **EVIDENCE** — gray quoted snippets from the clinical text
- **ENTITIES** — inline tags (symptoms, diagnoses, medications with UMLS codes on hover)
- **RELATIONSHIPS** — compact list (e.g. `fever → caused_by → infection`)
- **URGENCY LEVEL** — large color-coded tag (`CRITICAL` / `HIGH` / `MODERATE` / `LOW`)

**What the user can do:**
- Click **ESCALATE** → inline confirmation → urgency bumps up one level, audit log entry created
- Click **MARK COMPLETE** → confirmation → status → `COMPLETED`, audit entry created
- Click **OVERRIDE URGENCY** → dropdown to manually select a different level → reason text field → confirm → audit entry created
- Click **VIEW RAW TEXT** toggle → shows original de-identified clinical text
- Click **X** or another row → panel closes / switches

---

## 📋 Cases Page (`/cases`)

**What the user sees:**
- Full paginated table of all cases (not just pending)
- Columns: `CASE ID` / `PATIENT` / `URGENCY` / `STATUS` / `CLINICIAN` / `CREATED AT` / `UPDATED AT`
- Search bar: search by Case ID or chief complaint keyword

**What the user can do:**
- Click any row → goes to `/cases/:id` (full page detail view)
- Filter by status, urgency, date range
- Export table as CSV (Admin only)

### `/cases/:id` — Full Case Page
- Everything from the right drawer panel, but full-page
- Shows complete audit trail for that case at the bottom
- Button: **BACK TO CASES**

---

## ✅ Review Page (`/review`)

**What the user sees:**
- Queue filtered to only cases with status `Pending Review` assigned to the logged-in clinician
- Same table layout as dashboard queue

**What the user can do:**
- Same case detail panel interactions (Escalate, Complete, Override)
- Bulk action bar (appears when rows are selected): **MARK SELECTED COMPLETE**

---

## 🗒️ Audit Log Page (`/audit`)

**What the user sees:**
- Dense full-page table: `TIMESTAMP` / `CLINICIAN ID` / `CASE ID` / `ACTION` / `PREV LEVEL` / `NEW LEVEL` / `REASON`
- Alternating row backgrounds, fully monospaced

**What the user can do:**
- Filter by clinician ID, date range, action type
- Click `CASE ID` in any row → opens `/cases/:id`
- Export as CSV (Admin only)

---

## ⚙️ Settings Page (`/settings`)

### Profile Tab
- Edit name, email, password
- View assigned Clinician ID (read-only)

### Notifications Tab (Admin only)
- Toggle: WebSocket live alerts on/off
- Toggle: Email alerts for CRITICAL cases

### System Tab (Admin only)
- View active WebSocket connections count
- View Redis connection status
- View NLP model versions loaded (Whisper, scispaCy, ClinicalBERT)
- Toggle: Debug mode on/off

---

## 🔔 Global UI States

| State | What to check |
|---|---|
| **WebSocket LIVE** | Gold pulsing dot visible in top bar |
| **WebSocket DISCONNECTED** | Dot turns gray, label changes to `OFFLINE` |
| **New case arrives** | Row animates in at top of queue without page reload |
| **Loading** | Gold horizontal scan-line on affected element, no spinners |
| **Error** | Inline red monospaced error message, no modal popups |
| **Empty state** | "NO CASES IN QUEUE" in large Bebas Neue, centered |
| **Hover** | Instant color inversion (no transition delay) |
| **Selected row** | 4px gold left border, dark background |
| **Session expired** | Redirect to `/login` with message `SESSION EXPIRED` |

---

## 🤖 AI Agent Validation Checklist

For each page and state above, the agent should verify:

1. **Page loads** at the correct route
2. **All expected UI elements** are present and visible
3. **Interactive elements** respond correctly (buttons, rows, toggles)
4. **Data flows correctly** — intake → queue → detail → audit
5. **Real-time updates** appear without refresh
6. **Error and empty states** render without breaking layout
7. **Design system holds** — no rounded corners, no gradients, monospaced data, gold accents only on interactive/critical elements
8. **Auth gates** — unauthenticated users redirected to `/login` from all protected routes

---

## 🗺️ Route Map Summary

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing Page | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Main Triage Dashboard | Yes |
| `/intake` | Intake Submission | Yes |
| `/cases` | All Cases Table | Yes |
| `/cases/:id` | Full Case Detail | Yes |
| `/review` | Clinician Review Queue | Yes |
| `/audit` | Audit Log | Yes |
| `/settings` | User / System Settings | Yes |