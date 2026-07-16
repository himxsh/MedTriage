# MedTriage AI — Agent / Project Guide

This file is the single source of truth for what the project is, how it works, how to run it, and how to change it. Prefer this over scattered docs.

---

## One-liner

**AI-powered clinical triage and decision support.** Converts unstructured intake (text notes or voice audio) into structured summaries with urgency prioritization for ER staff, nurses, and physicians.

## Purpose & safety

- Ingests free-text clinical notes or voice recordings
- Runs a multi-stage NLP pipeline (clinical NER, de-identification, relationship extraction)
- Produces a structured triage assessment via Gemini
- Broadcasts results in real time to clinicians over WebSocket
- Every AI decision is **reviewable and auditable**

**MedTriage is clinical decision support — not a medical device.** It augments, never replaces, licensed clinician judgment. AI urgency must be confirmed or overridden before clinical action. Do not ship UI/API changes that present AI output as a final diagnosis or unreviewed order.

**License:** PolyForm Noncommercial 1.0.0 (`LICENSE`). Source-available for education, research, personal, and nonprofit use. **Commercial use requires separate permission** from Himesh Jain. Not OSI open source.

---

## Features

| Feature | Detail |
|---------|--------|
| Multi-modal intake | Text notes or voice audio (Whisper STT) |
| Clinical NER | scispaCy BC5CDR + UMLS entity linking |
| De-identification | Regex + spaCy NER; protects clinical entity spans so meds/diseases are not masked |
| Hybrid relations | Contextual modifiers, negation windows, keyword/context scanning; ClinicalBERT path exists (load may be unused for inference) |
| Structured triage | Gemini → chief complaint, symptoms, risk flags, urgency, confidence, evidence |
| Review & override | Confirm or change urgency; down-triage requires reason ≥10 chars |
| Real-time queue | Redis `triage_updates` → FastAPI WebSocket `/ws/queue` |
| Audit log | Every Confirm/Override with previous→new level + reason |

---

## Architecture

### System flow

```
Intake (text/audio)
  → FastAPI
  → PostgreSQL (cases + audit)
  → Redis pub/sub (triage_updates)
  → WebSocket /ws/queue
  → React SPA :3000
```

### AI triage pipeline (background after intake)

1. Intake accepted → client gets `{ status: "processing" }` immediately (202-style fast return)
2. If audio → Whisper STT → `raw_text` / `transcription`
3. scispaCy NER + UMLS on **raw** text (entities to protect from De-ID)
4. De-ID PII (email, phone, PERSON/ORG/GPE) while preserving clinical spans; entity offsets updated
5. Hybrid relationship extraction on masked text
6. Gemini structured triage JSON
7. Persist `Case` with `status: "Pending Review"`
8. Publish to Redis → WebSocket broadcast

### Clinician review

```
UI GET /api/v1/cases → queue
UI POST /api/v1/cases/{id}/review → update urgency + AuditLog → status Completed
```

**Down-triage rule:** If `action == "Override"` and new urgency is *lower* priority than current (`URGENCY_RANK`: Critical=0 … Low=3), `reason` is required (min 10 non-whitespace chars).

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, SQLModel, SQLAlchemy async, uvicorn |
| DB | PostgreSQL via `asyncpg` (`postgresql+asyncpg://…`) |
| Messaging | Redis pub/sub |
| NLP | spaCy `en_core_web_sm`, scispaCy BC5CDR + UMLS linker, Whisper `small`, ClinicalBERT path |
| AI | Google Gemini via `google-genai` (`gemini-3.1-flash-lite-preview`); mock fallback if no API key |
| Frontend | React 19, TypeScript, Vite 6, Tailwind 4, Motion, Lucide, React Router 7 |
| Ad video | Remotion 4 (`remotion-ad/`) |

---

## Repository layout

```
.
├── AGENTS.md                 # This file — project source of truth
├── README.md                 # Public-facing overview (optional; keep in sync if changed)
├── LICENSE                   # PolyForm Noncommercial 1.0.0
├── .env.example              # Env template (copy to .env; .env is gitignored)
├── app/                      # FastAPI backend
│   ├── main.py               # App, CORS, WS /ws/queue, startup init_db + Redis listener
│   ├── core/config.py        # pydantic-settings from .env
│   ├── db/session.py         # Async engine, get_session, init_db (create_all + mrn ALTER)
│   ├── models/case.py        # Case, AuditLog, URGENCY_RANK
│   ├── api/v1/
│   │   ├── intake.py         # POST /intake + background pipeline
│   │   └── cases.py          # cases CRUD-ish, review, audit
│   └── services/
│       ├── nlp.py            # Whisper, scispaCy NER/UMLS, relations
│       ├── deid.py           # PII masking with clinical protection
│       ├── intelligence.py   # Gemini triage (+ mock)
│       └── queue.py          # Redis publish triage_updates
├── frontend/                 # React SPA (Vite port 3000)
│   └── src/
│       ├── App.tsx           # Routes
│       ├── api.ts            # API client + clinician localStorage
│       ├── types.ts          # PatientCase, AuditEntry, UrgencyLevel, screens
│       ├── nav.ts            # AppShell nav items
│       ├── urgencyStyles.ts  # Urgency badge styling
│       └── components/       # Landing, Login, Register, AppShell, Queue, Cases,
│                             # CaseDetailDrawer, IntakeModal, AuditLog, Account, UrgencyBadge
├── models/                   # Local ML weights (gitignored via /models/)
│   ├── whisper/
│   ├── scispacy/
│   └── relations/            # ClinicalBERT
├── remotion-ad/              # 40s product ad (Remotion)
├── screenshots/              # UI preview PNGs for README
├── temp_uploads/             # Ephemeral audio uploads (cleaned after STT)
└── scripts/                  # Utility scripts (some gitignored)
```

**Gitignore notes:** `/models/` ignores root ML weights only (not `app/models/`). Also ignore `.venv/`, `.env`, `node_modules/`, `remotion-ad/out/`, `temp_uploads/`, large docs/binaries as listed in `.gitignore`.

---

## Environment

Copy `.env.example` → `.env`:

| Variable | Purpose | Example / default |
|----------|---------|-------------------|
| `GOOGLE_API_KEY` | Gemini; without it, mock triage is used | required for real AI |
| `DATABASE_URL` | Async Postgres | `postgresql+asyncpg://user:password@localhost:5432/medtriage` |
| `REDIS_URL` | Redis | `redis://localhost:6379/0` |
| `WHISPER_MODEL_PATH` | Whisper weights dir/file | `models/whisper/small.pt` |
| `SCISPACY_MODEL_PATH` | scispaCy BC5CDR model dir | `models/scispacy/en_ner_bc5cdr_md-0.5.4` |
| `CLINICAL_BERT_PATH` | ClinicalBERT | `models/relations` |
| `PROJECT_NAME` | OpenAPI title | `MedTriage AI` |
| `API_V1_STR` | API prefix | `/api/v1` |
| `DEBUG` | Settings flag | `True` / `False` |

Frontend (optional Vite env):

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | API base | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000/ws/queue` |

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL running with a `medtriage` database
- Redis running
- Gemini API key (optional locally; mock analysis without it)
- Model weights under `models/` as in `.env.example`
- spaCy model: `python -m spacy download en_core_web_sm`

### Backend

```bash
cp .env.example .env
# Edit .env

python3.11 -m venv .venv
source .venv/bin/activate

pip install fastapi uvicorn sqlmodel sqlalchemy asyncpg redis pydantic-settings \
            google-genai spacy scispacy transformers torch openai-whisper \
            python-multipart

python -m spacy download en_core_web_sm

uvicorn app.main:app --reload    # http://localhost:8000
# or: python -m app.main
```

On startup: `init_db()` creates tables and ensures `"case".mrn` exists (`ALTER TABLE "case" ADD COLUMN IF NOT EXISTS mrn`). No Alembic — schema drift is handled ad hoc in `session.py`.

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:3000  (vite --port=3000 --host=0.0.0.0)
npm run lint   # tsc --noEmit
npm run build
```

### Remotion ad

```bash
cd remotion-ad
npm install
npm run studio   # preview
npm run render   # out/medtriage-ad.mp4
```

Composition **MedTriageAd**: 1920×1080, 30fps, 1200 frames (40s). Fonts: Bebas Neue, Space Grotesk, IBM Plex Mono. Colors: primary `#4A90D9`, primary-ink `#1E5A8B`, linen `#F0F5FA`. Scene list and creative notes live in `remotion-ad/README.md` (and should stay mirrored here if that file is removed).

**Ad narrative:** Patient Alex Rivera (crushing chest pain) through intake → live queue → case detail → audit → pipeline → CTA. Brutalist command-center UI built in React (no screenshot footage).

---

## HTTP / WebSocket API

Base path: `/api/v1` (unless `API_V1_STR` changed). CORS is wide open (`allow_origins=["*"]`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health: `{ message, status: "running" }` |
| `POST` | `/api/v1/intake` | Multipart intake; returns processing stub |
| `GET` | `/api/v1/cases` | All cases, newest first (`created_at` desc) |
| `GET` | `/api/v1/cases/{id}` | Single case |
| `POST` | `/api/v1/cases/{id}/review` | Clinician confirm/override |
| `GET` | `/api/v1/audit` | Audit entries, newest first |
| `WS` | `/ws/queue` | Fan-out of Redis `triage_updates` |

### `POST /api/v1/intake` (multipart form)

| Field | Required | Notes |
|-------|----------|-------|
| `input_type` | yes | `text` or `audio` |
| `text_content` | if text | Clinical notes |
| `audio_file` | if audio | Uploaded file → temp_uploads → Whisper → deleted |
| `patient_name` | no | |
| `mrn` | no | Medical record number |

**Response:**

```json
{
  "id": "<uuid>",
  "status": "processing",
  "message": "Case intake accepted. AI triage is running in the background."
}
```

Case row is written when the background pipeline finishes (not at accept time).

### `POST /api/v1/cases/{id}/review` (query params)

| Param | Notes |
|-------|-------|
| `clinician_id` | Who reviewed |
| `action` | `Confirm` or `Override` |
| `new_level` | `Critical` \| `High` \| `Medium` \| `Low` |
| `reason` | Required (≥10 chars) when down-triaging via Override |

Sets `case.status = "Completed"`, writes `AuditLog` with `previous_level` / `new_level`.

### Redis / WebSocket payload (example)

Published after triage:

```json
{
  "id": "<uuid>",
  "urgency": "High",
  "patient_name": "...",
  "chief_complaint": "...",
  "status": "triaged"
}
```

---

## Data model (`app/models/case.py`)

### Urgency

`URGENCY_RANK = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}`  
Lower number = higher priority.

### `Case` (table name `"case"` — quoted in raw SQL; Postgres reserved word)

| Field | Type / notes |
|-------|----------------|
| `id` | UUID PK |
| `patient_name`, `mrn` | Optional strings |
| `input_type` | `text` / `audio` (also comments mention pdf) |
| `raw_text`, `transcription` | Source text |
| `chief_complaint`, `evidence` | AI strings |
| `key_symptoms`, `risk_flags` | JSON lists |
| `urgency_level` | default `Low` until AI fills |
| `confidence_score` | float 0–1 |
| `entities`, `relationships` | JSON |
| `status` | `Pending Review` → `Completed` (also mentions In Progress) |
| `created_at`, `updated_at` | datetime |

### `AuditLog`

| Field | Notes |
|-------|-------|
| `id` | int PK |
| `case_id` | UUID |
| `clinician_id` | string |
| `action` | Confirm / Override |
| `previous_level`, `new_level` | urgency strings |
| `reason` | optional |
| `timestamp` | datetime |

### Gemini output shape (`intelligence.py`)

```json
{
  "chief_complaint": "string",
  "key_symptoms": ["..."],
  "risk_flags": ["..."],
  "urgency_level": "Critical|High|Medium|Low",
  "confidence_score": 0.0,
  "evidence": "string"
}
```

Mock (no key / error): Medium, confidence 0.5, evidence notes API fallback.

---

## Backend services (behavioral notes)

| Module | Behavior |
|--------|----------|
| `nlp.py` | Lazy-loads Whisper, scispaCy+UMLS, ClinicalBERT. `extract_clinical_data` → entities + UMLS mappings. `extract_relationships` → hybrid heuristics (BERT may load but keyword/context path is what matters for output). |
| `deid.py` | Masks EMAIL/PHONE/PERSON/ORG/GPE; skips spans overlapping protected clinical entities; returns `(masked_text, updated_entities)`. |
| `intelligence.py` | Single Gemini JSON call with text + entities + relations; strips \`\`\`json fences; falls back to mock. |
| `queue.py` | `publish("triage_updates", json)`. |
| `main.py` | Startup: `init_db` + `asyncio` Redis listener → `ConnectionManager.broadcast`. WS clients must stay connected (`receive_text` keep-alive). |

---

## Frontend

### Routes

| Path | Screen |
|------|--------|
| `/` | Landing |
| `/login`, `/register` | Auth UI (clinician identity → localStorage; not a full auth backend) |
| `/queue` | Live triage queue (default app home) |
| `/cases` | Case list / history |
| `/audit` | Decision log |
| `/account` | Account / settings |
| `/dashboard` → `/queue`, `/history` → `/cases`, `/review` → `/queue`, `/settings` → `/account` | Redirects |

Intake is a **modal** (`IntakeModal`), not a route — opened via nav `intake`.

### Clinician identity

`localStorage`: `clinician_name`, `clinician_id` via `saveClinician` / `getClinician` in `api.ts`. Defaults to `Dr. Unknown` / `unknown`.

### Key UI pieces

- **Queue** — urgency badges, filters, open case drawer
- **CaseDetailDrawer** — complaint, confidence, entities/UMLS, evidence, Confirm/Override (hide actions when status is Completed / not Pending Review)
- **IntakeModal** — text or audio; patient name + MRN; reset state when reopened
- **AuditLog** — from→to urgency + reasons
- **urgencyStyles** — shared badge colors; keep `urgencyStyles.check.ts` green if you change styles

Visual language: linen background, clinical blue primary (`#4A90D9` / ink `#1E5A8B`), dense “command center” product UI — match existing frontend / Remotion theme when adding screens.

---

## Ports & local URLs

| Service | URL |
|---------|-----|
| API | http://localhost:8000 |
| OpenAPI | http://localhost:8000/api/v1/openapi.json |
| Frontend | http://localhost:3000 |
| Remotion Studio | remotion-ad studio (also tends to :3000 — don’t run both on same port) |

---

## Conventions for agents changing code

1. **Smallest correct diff.** Reuse `app/services/*`, `frontend/src/api.ts`, `types.ts`, `urgencyStyles.ts`.
2. **Bug = root cause.** Shared helpers over per-caller patches (e.g. review rules live in `cases.py`).
3. **Audit honesty.** Confirm/Override must always record previous→new level and reason when required.
4. **Postgres `"case"` table** must stay quoted in raw SQL.
5. **No Alembic** today — if you add columns, follow the `init_db` ALTER IF NOT EXISTS pattern or introduce migrations properly.
6. **Don’t present AI as final.** Completed cases shouldn’t re-offer Confirm/Override.
7. **Secrets:** never commit `.env` or API keys.
8. **Ponytail:** no unrequested abstractions/deps; mark deliberate ceilings with `ponytail:` comments.
9. **Tests:** non-trivial logic should leave one small runnable check (existing examples: `urgencyStyles.check.ts`; ad-hoc `test_*.py` at root may be gitignored).

---

## Remotion ad scenes (40s)

| Time | Scene |
|------|-------|
| 0–2.5s | Brand open — MEDTRIAGE + feature stack |
| 2.5–10.5s | Intake modal (typewriter notes, audio waveform, submit flow) |
| 10.5–19.5s | Live queue table |
| 19.5–26.5s | Case detail drawer |
| 26.5–31s | Audit trail |
| 31–37s | Pipeline conveyor (6 nodes) |
| 37–40s | CTA — GET STARTED |

Entry: `remotion-ad/src/index.ts` → `Root.tsx` registers `MedTriageAd`.

---

## Known limitations / honest gaps

- No real auth server — login/register are UI + localStorage clinician id
- Schema evolution is manual (`init_db` ALTER), not migration-managed
- ClinicalBERT may be loaded while relation extraction is largely heuristic
- Without `GOOGLE_API_KEY`, triage is mock Medium / 0.5 confidence
- Case is not inserted until background pipeline completes (queue only updates after triage)
- CORS is fully open — fine for local demo, not production-hardened
- Frontend and Remotion both may want port 3000

---

## Quick mental model

**Intake → NER → De-ID → Relations → Gemini → DB → Redis → WS → Queue UI → Clinician review → Audit.**

Everything else (landing, Remotion, screenshots) markets or demos that loop.
