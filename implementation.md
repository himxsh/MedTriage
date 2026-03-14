# MedTriage AI Implementation Guide

Step-by-step instructions to stand up the ingestion, NLP, and triage pipeline described in the plan. Document assumes you are coding from `/Users/himeshjain/Desktop/projects/random`.

## 1. Overview
- Input sources: paste text, upload audio (Whisper STT), upload PDF/TXT. 
- NLP stack: spaCy/scispaCy or ClinicalBERT for extraction + relation + ontology mapping, followed by Gemini prompts for summary + urgency.
- Storage/queue: PostgreSQL for cases/audit, Redis for live priority queue.
- Frontend: React + Tailwind + WebSockets for queue, case details, human-in-the-loop gate.

## 2. Prerequisites
1. **System**: macOS with Python 3.11+ and Homebrew.
2. **Tools**: `git`, `brew`, `python3`, `node`/`npm`.
3. **Services**: PostgreSQL server, Redis server, Gemini API credentials (for summarization/classification), optional Whisper runtime.

## 3. Local setup
1. Clone repo & enter directory:
   ```bash
   git clone <repo> .
   cd /Users/himeshjain/Desktop/projects/random
   ```
2. Create Python virtualenv and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install fastapi uvicorn psycopg[binary] asyncpg redis spacy scispacy openai-whisper
   pip install https://s3-us-west-2.amazonaws.com/ai2-s2-scispacy/releases/v0.5.1/en_ner_bc5cdr_md-0.5.1.tar.gz
   ```
   If pip cannot reach the internet, download wheels or model TARs manually and install from local path.
3. Install the frontend stack:
   ```bash
   cd ui
   npm install
   ```

## 4. Model downloads
1. **spaCy/scispaCy NER:** already installed above. Ensure it downloads by running `python -m spacy validate`.
2. **Relation extractor:** fetch a pretrained ClinicalBERT/BERT_general_e2e checkpoint from Hugging Face into `models/relations`. Use `huggingface-cli download` or `git lfs`.
3. **Whisper**: install via pip; optionally download a smaller `tiny` or `base` model for faster triage.

## 5. Backend pipeline
1. Create FastAPI service with the following routes:
   - `/intake` (POST) accepts text/audio/pdf, triggers Whisper (if audio) and de-identification.
   - `/cases/{id}` returns structured summary + evidence for the UI.
   - `/audit` returns audit entries.
2. Processing steps:
   1. **De-identification**: run spaCy `EntityRuler` + regex replace for PII (names, MRN, email, phones).
   2. **NER**: load `en_ner_bc5cdr_md` and feed cleaned text.
   3. **Relationship extraction**: load transformer checkpoint; for each pair, classify relations (Onset, Duration, Aggravator).
   4. **Ontology mapping**: use spaCy concept linker or lookup table (CSV/SQL) to map extracted text to ICD-10/SNOMED codes.
   5. **Gemini prompts**: send structured context to prompt for summary (chief complaint, symptoms, risk flags, ICD codes) and another prompt for urgency level + confidence + evidence.
3. Store: write case + summary + urg level + confidence + relations + codes into PostgreSQL, push case ID with urgency priority into Redis list or sorted set.

## 6. Frontend
1. React app uses WebSocket (or SSE) to subscribe to Redis queue updates via backend.
2. Case detail view shows side-by-side source text (with highlights) and Gemini summary + evidence.
3. Decision gate offers Confirm/Override buttons; both trigger backend audit log writes and workflow status changes.
4. Export button calls backend to produce JSON/PDF via FastAPI endpoints.

## 7. Deployment notes
- Run PostgreSQL & Redis (locally or in container). Ensure credentials in `.env` accessible by backend.
- Use environment variables for Gemini API key, Whisper model path, database URLs, and Redis URL.
- Run backend with `uvicorn app.main:app --reload` and frontend with `npm run dev`.

## 8. Testing
- Seed synthetic cases (Synthea/MIMIC snippets) to verify queue and classification thresholds.
- Confirm low-confidence Gemini responses trigger “flag for mandatory review.”
- Run `pytest` once the backend & pipeline functions are implemented.

## 9. Next steps
1. Integrate audit log UI + export CSV/JSON.
2. Add bias monitoring page (models tab) using stored metrics.
3. Prepare demo scripts (text, audio, overrides).
