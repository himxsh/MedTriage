from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON
import uuid

URGENCY_RANK = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
VALID_URGENCY = frozenset(URGENCY_RANK)
VALID_ACTIONS = frozenset({"Confirm", "Override"})
REVIEWABLE_STATUS = "Pending Review"

class CaseBase(SQLModel):
    patient_name: Optional[str] = None
    mrn: Optional[str] = None
    input_type: str  # text, audio, pdf
    raw_text: str
    transcription: Optional[str] = None
    
    # AI Generated Summary Fields
    chief_complaint: Optional[str] = None
    key_symptoms: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    risk_flags: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # AI Triage & Urgency
    urgency_level: str = "Low"  # Critical, High, Medium, Low
    confidence_score: float = 0.0
    evidence: Optional[str] = None
    
    # NLP Data
    entities: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    relationships: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    
    # Status
    status: str = "Pending Review"  # Pending Review, In Progress, Completed, Failed
    org_id: Optional[uuid.UUID] = Field(default=None, index=True)
    deleted_at: Optional[datetime] = None
    retain_until: Optional[datetime] = None
    # Intake accept time (for latency); created_at ≈ triage-ready when pipeline succeeds
    accepted_at: Optional[datetime] = None


class Case(CaseBase, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    case_id: uuid.UUID
    clinician_id: str  # server-derived user id string
    action: str  # Confirm, Override
    previous_level: Optional[str] = None
    new_level: str
    reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    org_id: Optional[uuid.UUID] = Field(default=None, index=True)
