from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import os
import uuid
import shutil
import asyncio

from app.db.session import get_session, engine
from app.models.case import Case
from app.services.nlp import nlp_service
from app.services.intelligence import intelligence_service
from app.services.deid import deid_service
from app.services.queue import queue_service

router = APIRouter()

async def run_ai_pipeline(case_id: uuid.UUID, raw_text: str, transcription: Optional[str], patient_name: Optional[str], mrn: Optional[str], input_type: str):
    """
    Background task to run the heavy AI pipeline.
    """
    # 1. Initial Clinical Extraction on RAW text to identify terms to protect
    # We do this specifically to prevent De-ID from masking medications/diseases
    initial_extraction = nlp_service.extract_clinical_data(raw_text)
    clinical_entities = initial_extraction.get("entities", [])
    
    # 2. De-identification (Protecting the medical terms found in step 1)
    # This now returns the updated entity list with projected offsets
    masked_text, entities = deid_service.mask_pii(raw_text, protected_entities=clinical_entities)
    
    # 3. Relationship Extraction (Stage skipped here, using entities from Step 2)
    relations = nlp_service.extract_relationships(masked_text, entities)
    
    # 5. Gemini Analysis (Summary & Triage)
    analysis = await intelligence_service.analyze_case(masked_text, entities, relations)
    
    # 4. Save to Database (New Session for Background Task)
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
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
            status="Pending Review"
        )
        db.add(new_case)
        await db.commit()

        # 5. Broadcast to WebSockets via Redis
        await queue_service.broadcast_new_case({
            "id": str(case_id),
            "urgency": new_case.urgency_level,
            "patient_name": patient_name,
            "chief_complaint": new_case.chief_complaint,
            "status": "triaged"
        })

@router.post("/intake")
async def create_intake(
    background_tasks: BackgroundTasks,
    patient_name: Optional[str] = Form(None),
    mrn: Optional[str] = Form(None),
    input_type: str = Form(...),  # text, audio
    text_content: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None)
):
    """
    Intake endpoint. Returns 202 quickly and processes AI in background.
    """
    case_id = uuid.uuid4()
    raw_text = ""
    transcription = None
    
    if input_type == "audio":
        if not audio_file:
            raise HTTPException(status_code=400, detail="Audio file required")
        
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = f"{temp_dir}/{case_id}_{audio_file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
            
        # Transcription must happen before background task if we want to clean up the file
        # or we pass the file path. Let's do it in background but keep file until done.
        
        async def process_audio_background():
            try:
                trans_text = nlp_service.transcribe_audio(file_path)
                await run_ai_pipeline(case_id, trans_text, trans_text, patient_name, mrn, input_type)
            finally:
                if os.path.exists(file_path):
                    os.remove(file_path)

        background_tasks.add_task(process_audio_background)
                
    elif input_type == "text":
        if not text_content:
            raise HTTPException(status_code=400, detail="text_content required")
        background_tasks.add_task(run_ai_pipeline, case_id, text_content, None, patient_name, mrn, input_type)
    else:
        raise HTTPException(status_code=400, detail="Invalid input_type")

    return {
        "id": str(case_id),
        "status": "processing",
        "message": "Case intake accepted. AI triage is running in the background."
    }
