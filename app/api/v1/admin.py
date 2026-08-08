"""Org admin console — settings, seats, user list/deactivate."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, ADMIN_ROLES
from app.db.session import get_session
from app.models.org import (
    Organization,
    User,
    DEFAULT_NOTICE_VERSION,
    DEFAULT_URGENCY_LABELS,
    resolve_urgency_labels,
)
from app.models.case import Case
from app.services.case_audio import delete_audio

router = APIRouter()


class OrgOut(BaseModel):
    id: str
    name: str
    site_name: Optional[str]
    timezone: str
    seat_cap: int
    seats_used: int
    seats_active: int
    urgency_labels: dict[str, str]
    notice_accepted_at: Optional[str]
    notice_accepted_by: Optional[str]
    notice_version: Optional[str]
    escalation_webhook_url: Optional[str]
    escalation_email: Optional[str]
    escalation_minutes: int


class OrgPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    site_name: Optional[str] = Field(None, max_length=200)
    timezone: Optional[str] = Field(None, min_length=1, max_length=64)
    seat_cap: Optional[int] = Field(None, ge=1, le=500)
    urgency_labels: Optional[dict[str, str]] = None
    accept_notice: Optional[bool] = None
    notice_version: Optional[str] = Field(None, max_length=64)
    escalation_webhook_url: Optional[str] = Field(None, max_length=500)
    escalation_email: Optional[str] = Field(None, max_length=200)
    escalation_minutes: Optional[int] = Field(None, ge=1, le=240)

    @field_validator("urgency_labels")
    @classmethod
    def _labels_keys(cls, v: Optional[dict[str, str]]) -> Optional[dict[str, str]]:
        if v is None:
            return v
        allowed = set(DEFAULT_URGENCY_LABELS)
        bad = set(v) - allowed
        if bad:
            raise ValueError(f"Unknown urgency keys: {sorted(bad)}")
        return v


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    created_at: str


async def _load_org(user: CurrentUser, db: AsyncSession) -> Organization:
    result = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = result.scalar_one_or_none()
    if not org or org.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


async def _seat_counts(org_id, db: AsyncSession) -> tuple[int, int]:
    total = (
        await db.execute(
            select(func.count()).select_from(User).where(
                User.org_id == org_id,
                User.deleted_at.is_(None),
            )
        )
    ).scalar_one()
    active = (
        await db.execute(
            select(func.count()).select_from(User).where(
                User.org_id == org_id,
                User.deleted_at.is_(None),
                User.is_active == True,  # noqa: E712
            )
        )
    ).scalar_one()
    return int(total), int(active)


def _org_out(org: Organization, used: int, active: int) -> OrgOut:
    return OrgOut(
        id=str(org.id),
        name=org.name,
        site_name=org.site_name,
        timezone=org.timezone,
        seat_cap=org.seat_cap,
        seats_used=used,
        seats_active=active,
        urgency_labels=resolve_urgency_labels(org.urgency_labels),
        notice_accepted_at=org.notice_accepted_at.isoformat() if org.notice_accepted_at else None,
        notice_accepted_by=org.notice_accepted_by,
        notice_version=org.notice_version,
        escalation_webhook_url=org.escalation_webhook_url,
        escalation_email=org.escalation_email,
        escalation_minutes=org.escalation_minutes if org.escalation_minutes is not None else 5,
    )


@router.get("/org")
async def get_org(user: CurrentUser, db: AsyncSession = Depends(get_session)) -> OrgOut:
    user.require_role(ADMIN_ROLES)
    org = await _load_org(user, db)
    used, active = await _seat_counts(org.id, db)
    return _org_out(org, used, active)


@router.patch("/org")
async def patch_org(
    body: OrgPatch,
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
) -> OrgOut:
    user.require_role(ADMIN_ROLES)
    org = await _load_org(user, db)
    if body.name is not None:
        org.name = body.name.strip()
    if body.site_name is not None:
        org.site_name = body.site_name.strip() or None
    if body.timezone is not None:
        org.timezone = body.timezone.strip()
    if body.seat_cap is not None:
        org.seat_cap = body.seat_cap
    if body.urgency_labels is not None:
        org.urgency_labels = resolve_urgency_labels(body.urgency_labels)
    if body.accept_notice is True:
        org.notice_accepted_at = datetime.utcnow()
        org.notice_accepted_by = user.email
        org.notice_version = (
            (body.notice_version.strip() if body.notice_version else None)
            or org.notice_version
            or DEFAULT_NOTICE_VERSION
        )
    elif body.notice_version is not None and body.accept_notice is not False:
        # allow updating version text without re-stamp only if already accepted
        ver = body.notice_version.strip()
        if ver:
            org.notice_version = ver
    if body.escalation_webhook_url is not None:
        url = body.escalation_webhook_url.strip()
        org.escalation_webhook_url = url or None
    if body.escalation_email is not None:
        em = body.escalation_email.strip().lower()
        org.escalation_email = em or None
    if body.escalation_minutes is not None:
        org.escalation_minutes = body.escalation_minutes
    db.add(org)
    await db.commit()
    await db.refresh(org)
    used, active = await _seat_counts(org.id, db)
    return _org_out(org, used, active)


@router.get("/org/users")
async def list_org_users(
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
) -> list[UserOut]:
    user.require_role(ADMIN_ROLES)
    result = await db.execute(
        select(User)
        .where(User.org_id == user.org_id, User.deleted_at.is_(None))
        .order_by(User.created_at.desc())
    )
    return [
        UserOut(
            id=str(u.id),
            email=u.email,
            name=u.name,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at.isoformat() if u.created_at else "",
        )
        for u in result.scalars().all()
    ]


@router.post("/org/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
):
    user.require_role(ADMIN_ROLES)
    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.org_id == user.org_id,
            User.deleted_at.is_(None),
        )
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.is_active = False
    db.add(target)
    await db.commit()
    return {"status": "ok", "id": str(target.id), "is_active": False}


@router.post("/org/users/{user_id}/activate")
async def activate_user(
    user_id: UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
):
    user.require_role(ADMIN_ROLES)
    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.org_id == user.org_id,
            User.deleted_at.is_(None),
        )
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # Soft seat cap: block reactivation when at capacity
    org = await _load_org(user, db)
    _, active = await _seat_counts(org.id, db)
    if not target.is_active and active >= org.seat_cap:
        raise HTTPException(
            status_code=409,
            detail=f"Seat cap reached ({org.seat_cap}). Deactivate a seat or raise the cap.",
        )

    target.is_active = True
    db.add(target)
    await db.commit()
    return {"status": "ok", "id": str(target.id), "is_active": True}


@router.post("/org/cases/{case_id}/delete")
async def soft_delete_case(
    case_id: UUID,
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
):
    """DPDP / hospital erasure request — soft-delete within org only."""
    user.require_role(ADMIN_ROLES)
    result = await db.execute(
        select(Case).where(
            Case.id == case_id,
            Case.org_id == user.org_id,
            Case.deleted_at.is_(None),
        )
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.deleted_at = datetime.utcnow()
    db.add(case)
    await db.commit()
    # Erase durable audio bytes on soft-delete (DPDP)
    delete_audio(user.org_id, case_id)
    return {"status": "ok", "id": str(case_id), "deleted_at": case.deleted_at.isoformat()}
