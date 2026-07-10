from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid

from app.db.session import get_session
from app.models.case import Case, AuditLog

router = APIRouter()

@router.get("/cases")
async def get_cases(db: AsyncSession = Depends(get_session)):
    """
    Get all cases, sorted by urgency and creation time.
    """
    # Define urgency weights for sorting
    # Critical: 0, High: 1, Medium: 2, Low: 3 (ascending for order_by)
    # Actually simpler to just filter/sort in python for now or use CASE in SQL
    query = select(Case).order_by(Case.created_at.desc())
    result = await db.execute(query)
    cases = result.scalars().all()
    return cases

@router.get("/cases/{case_id}")
async def get_case_detail(case_id: uuid.UUID, db: AsyncSession = Depends(get_session)):
    query = select(Case).where(Case.id == case_id)
    result = await db.execute(query)
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    return case

@router.post("/cases/{case_id}/review")
async def review_case(
    case_id: uuid.UUID,
    clinician_id: str,
    action: str,  # Confirm, Override
    new_level: str,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_session)
):
    query = select(Case).where(Case.id == case_id)
    result = await db.execute(query)
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    previous_level = case.urgency_level
    case.urgency_level = new_level
    case.status = "Completed"
    
    # Create audit log
    log = AuditLog(
        case_id=case_id,
        clinician_id=clinician_id,
        action=action,
        previous_level=previous_level,
        new_level=new_level,
        reason=reason
    )
    
    db.add(case)
    db.add(log)
    await db.commit()
    
    return {"status": "success", "case_id": str(case_id)}

@router.get("/audit")
async def get_audit_logs(db: AsyncSession = Depends(get_session)):
    query = select(AuditLog).order_by(AuditLog.timestamp.desc())
    result = await db.execute(query)
    return result.scalars().all()
