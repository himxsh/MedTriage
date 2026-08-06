from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime
import uuid

from app.core.auth import CurrentUser, REVIEW_ROLES, EVIDENCE_ROLES
from app.db.session import get_session
from app.models.case import (
    Case, AuditLog, URGENCY_RANK, VALID_URGENCY, VALID_ACTIONS, REVIEWABLE_STATUS,
)

router = APIRouter()


@router.get("/cases")
async def get_cases(user: CurrentUser, db: AsyncSession = Depends(get_session)):
    user.require_role(REVIEW_ROLES)
    query = (
        select(Case)
        .where(Case.org_id == user.org_id, Case.deleted_at.is_(None))
        .order_by(Case.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/cases/{case_id}")
async def get_case_detail(
    case_id: uuid.UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
):
    user.require_role(REVIEW_ROLES)
    query = select(Case).where(
        Case.id == case_id,
        Case.org_id == user.org_id,
        Case.deleted_at.is_(None),
    )
    result = await db.execute(query)
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Strip evidence for roles without physician+ access
    if user.role not in EVIDENCE_ROLES:
        data = case.model_dump()
        data["evidence"] = None
        return data
    return case


@router.post("/cases/{case_id}/review")
async def review_case(
    case_id: uuid.UUID,
    action: str,
    new_level: str,
    user: CurrentUser,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
):
    """Clinician identity comes from session only — client clinician_id ignored."""
    user.require_role(REVIEW_ROLES)

    if action not in VALID_ACTIONS:
        raise HTTPException(status_code=400, detail=f"action must be one of {sorted(VALID_ACTIONS)}")
    if new_level not in VALID_URGENCY:
        raise HTTPException(status_code=400, detail=f"new_level must be one of {sorted(VALID_URGENCY)}")

    query = select(Case).where(
        Case.id == case_id,
        Case.org_id == user.org_id,
        Case.deleted_at.is_(None),
    )
    result = await db.execute(query)
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case.status != REVIEWABLE_STATUS:
        raise HTTPException(status_code=409, detail="Case is not pending review")

    if action == "Override" and URGENCY_RANK.get(new_level, 99) > URGENCY_RANK.get(case.urgency_level, 0):
        stripped = (reason or "").strip()
        if len(stripped) < 10:
            raise HTTPException(status_code=400, detail="Down-triage override requires a reason (min 10 characters)")

    previous_level = case.urgency_level
    case.urgency_level = new_level
    case.status = "Completed"
    case.updated_at = datetime.utcnow()

    log = AuditLog(
        case_id=case_id,
        clinician_id=str(user.id),
        action=action,
        previous_level=previous_level,
        new_level=new_level,
        reason=reason,
        org_id=user.org_id,
    )

    db.add(case)
    db.add(log)
    await db.commit()

    return {"status": "success", "case_id": str(case_id)}


@router.get("/audit")
async def get_audit_logs(user: CurrentUser, db: AsyncSession = Depends(get_session)):
    user.require_role(REVIEW_ROLES)
    query = (
        select(AuditLog)
        .where(AuditLog.org_id == user.org_id)
        .order_by(AuditLog.timestamp.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()
