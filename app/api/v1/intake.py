from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime
import os
import uuid
import asyncio
import time

from app.core.auth import CurrentUser, INTAKE_ROLES
from app.core.config import settings
from app.db.session import get_session, engine
from app.models.case import Case
from app.services.nlp import nlp_service
from app.services.intelligence import intelligence_service
from app.services.deid import deid_service
from app.services.queue import queue_service

router = APIRouter()

# ponytail: in-memory rate limit; upgrade = Redis when multi-worker
_intake_hits: dict[str, list[float]] = {}
MAX_INTAKE_PER_MIN = 30


def _rate_intake(key: str) -> None:
    now = time.time()
    hits = [t for t in _intake_hits.get(key, []) if now - t < 60]
    if len(hits) >= MAX_INTAKE_PER_MIN:
        raise HTTPException(status_code=429, detail="Intake rate limit exceeded")
    hits.append(now)
    _intake_hits[key] = hits


def _safe_upload_path(case_id: uuid.UUID) -> str:
    """Ignore client filename; contain under resolved temp_uploads."""
    base = os.path.realpath("temp_uploads")
    os.makedirs(base, exist_ok=True)
    path = os.path.realpath(os.path.join(base, f"{case_id}.bin"))
    if not path.startswith(base + os.sep):
        raise HTTPException(status_code=400, detail="Invalid upload path")
    return path


async def _persist_failed_case(
    case_id: uuid.UUID,
    raw_text: str,
    transcription: Optional[str],
    patient_name: Optional[str],
    mrn: Optional[str],
    input_type: str,
    org_id: uuid.UUID,
    accepted_at: datetime,
    err: Exception,
):
    from sqlalchemy.ext.asyncio import AsyncSession as AS
    from sqlalchemy.orm import sessionmaker

    async_session = sessionmaker(engine, class_=AS, expire_on_commit=False)
    async with async_session() as db:
        db.add(
            Case(
                id=case_id,
                patient_name=patient_name,
                mrn=mrn,
                input_type=input_type,
                raw_text=raw_text or "(pipeline failed)",
                transcription=transcription,
                status="Failed",
                urgency_level="Medium",
                confidence_score=0.0,
                evidence=f"pipeline error: {type(err).__name__}: {str(err)[:400]}",
                org_id=org_id,
                accepted_at=accepted_at,
            )
        )
        await db.commit()


async def run_ai_pipeline(
    case_id: uuid.UUID,
    raw_text: str,
    transcription: Optional[str],
    patient_name: Optional[str],
    mrn: Optional[str],
    input_type: str,
    org_id: uuid.UUID,
    accepted_at: Optional[datetime] = None,
):
    accepted = accepted_at or datetime.utcnow()
    try:
        initial_extraction = await asyncio.to_thread(nlp_service.extract_clinical_data, raw_text)
        clinical_entities = initial_extraction.get("entities", [])

        masked_text, entities = await asyncio.to_thread(
            deid_service.mask_pii, raw_text, clinical_entities
        )

        relations = await asyncio.to_thread(
            nlp_service.extract_relationships, masked_text, entities
        )

        analysis = await intelligence_service.analyze_case(masked_text, entities, relations)

        from sqlalchemy.ext.asyncio import AsyncSession as AS
        from sqlalchemy.orm import sessionmaker

        async_session = sessionmaker(engine, class_=AS, expire_on_commit=False)
        async with async_session() as db:
            new_case = Case(
                id=case_id,
                patient_name=patient_name,
                mrn=mrn,
                input_type=input_type,
                raw_text=raw_text,
                transcription=transcription,
                chief_complaint=analysis.get("chief_complaint"),
                key_symptoms=analysis.get("key_symptoms"),
                risk_flags=analysis.get("risk_flags"),
                urgency_level=analysis.get("urgency_level", "Medium"),
                confidence_score=analysis.get("confidence_score", 0.0),
                evidence=analysis.get("evidence"),
                entities=entities,
                relationships=relations,
                status="Pending Review",
                org_id=org_id,
                accepted_at=accepted,
            )
            db.add(new_case)
            await db.commit()

            await queue_service.broadcast_new_case({
                "id": str(case_id),
                "urgency": new_case.urgency_level,
                "patient_name": patient_name,
                "chief_complaint": new_case.chief_complaint,
                "status": "triaged",
                "org_id": str(org_id),
            })
    except Exception as e:
        try:
            await _persist_failed_case(
                case_id, raw_text, transcription, patient_name, mrn, input_type, org_id, accepted, e
            )
        except Exception:
            pass
        raise


@router.post("/intake")
async def create_intake(
    request: Request,
    background_tasks: BackgroundTasks,
    user: CurrentUser,
    patient_name: Optional[str] = Form(None),
    mrn: Optional[str] = Form(None),
    input_type: str = Form(...),
    text_content: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    language: Optional[str] = Form(None),  # hi|en|auto from UI locale
):
    user.require_role(INTAKE_ROLES)
    ip = request.client.host if request.client else "unknown"
    _rate_intake(f"u:{user.id}")
    _rate_intake(f"ip:{ip}")

    case_id = uuid.uuid4()
    accepted_at = datetime.utcnow()
    transcription = None

    if input_type == "audio":
        if not audio_file:
            raise HTTPException(status_code=400, detail="Audio file required")

        file_path = _safe_upload_path(case_id)
        mime_type = (audio_file.content_type or "").split(";")[0].strip() or None
        size = 0
        with open(file_path, "wb") as buffer:
            while True:
                chunk = await audio_file.read(1024 * 64)
                if not chunk:
                    break
                size += len(chunk)
                if size > settings.MAX_AUDIO_BYTES:
                    buffer.close()
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    raise HTTPException(status_code=413, detail="Audio exceeds 25 MB limit")
                buffer.write(chunk)

        org_id = user.org_id
        lang_hint = (language or "").strip() or None

        async def process_audio_background():
            try:
                trans_text = await asyncio.to_thread(
                    nlp_service.transcribe_audio, file_path, lang_hint, mime_type
                )
                await run_ai_pipeline(
                    case_id, trans_text, trans_text, patient_name, mrn, input_type, org_id, accepted_at
                )
            finally:
                if os.path.exists(file_path):
                    os.remove(file_path)

        background_tasks.add_task(process_audio_background)

    elif input_type == "text":
        if not text_content:
            raise HTTPException(status_code=400, detail="text_content required")
        if len(text_content) > settings.MAX_TEXT_CHARS:
            raise HTTPException(status_code=413, detail=f"Text exceeds {settings.MAX_TEXT_CHARS} chars")
        background_tasks.add_task(
            run_ai_pipeline,
            case_id,
            text_content,
            None,
            patient_name,
            mrn,
            input_type,
            user.org_id,
            accepted_at,
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid input_type")

    return {
        "id": str(case_id),
        "status": "processing",
        "message": "Case intake accepted. AI triage is running in the background."
    }
