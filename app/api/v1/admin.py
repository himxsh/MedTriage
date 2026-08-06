"""Org admin console — settings, seats, user list/deactivate."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, ADMIN_ROLES
from app.db.session import get_session
from app.models.org import Organization, User
from app.models.case import Case

router = APIRouter()


class OrgOut(BaseModel):
    id: str
    name: str
    site_name: Optional[str]
    timezone: str
    seat_cap: int
    seats_used: int
    seats_active: int


class OrgPatch(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    site_name: Optional[str] = Field(None, max_length=200)
    timezone: Optional[str] = Field(None, min_length=1, max_length=64)
    seat_cap: Optional[int] = Field(None, ge=1, le=500)


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


@router.get("/org")
async def get_org(user: CurrentUser, db: AsyncSession = Depends(get_session)) -> OrgOut:
    user.require_role(ADMIN_ROLES)
    org = await _load_org(user, db)
    used, active = await _seat_counts(org.id, db)
    return OrgOut(
        id=str(org.id),
        name=org.name,
        site_name=org.site_name,
        timezone=org.timezone,
        seat_cap=org.seat_cap,
        seats_used=used,
        seats_active=active,
    )


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
    db.add(org)
    await db.commit()
    await db.refresh(org)
    used, active = await _seat_counts(org.id, db)
    return OrgOut(
        id=str(org.id),
        name=org.name,
        site_name=org.site_name,
        timezone=org.timezone,
        seat_cap=org.seat_cap,
        seats_used=used,
        seats_active=active,
    )


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
    return {"status": "ok", "id": str(case_id), "deleted_at": case.deleted_at.isoformat()}
