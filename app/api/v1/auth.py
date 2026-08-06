"""Login / logout / me. Invite-only register (bootstrap when empty, else admin invite)."""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, ADMIN_ROLES
from app.core.config import settings
from app.core.security import (
    SESSION_COOKIE,
    LOCKOUT_AFTER,
    LOCKOUT_MINUTES,
    hash_password,
    verify_password,
    new_session_token,
    hash_token,
    session_expiry,
)
from app.db.session import get_session
from app.models.org import Organization, AuthSession, User, ROLES

router = APIRouter()

# ponytail: in-memory IP login attempts; upgrade = Redis when multi-worker
_login_hits: dict[str, list[float]] = {}


class LoginBody(BaseModel):
    email: str
    password: str


class InviteBody(BaseModel):
    email: str
    password: str = Field(min_length=8)
    name: str
    role: str = "nurse"


class MeOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    org_id: str


class PasswordChangeBody(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


def _cookie_kwargs() -> dict:
    return {
        "key": SESSION_COOKIE,
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": "lax",
        "path": "/",
        "max_age": 12 * 3600,
    }


def _rate_login(ip: str) -> None:
    import time
    now = time.time()
    hits = [t for t in _login_hits.get(ip, []) if now - t < 60]
    if len(hits) >= 20:
        raise HTTPException(status_code=429, detail="Too many login attempts")
    hits.append(now)
    _login_hits[ip] = hits


@router.post("/auth/login")
async def login(
    body: LoginBody,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_session),
):
    ip = request.client.host if request.client else "unknown"
    _rate_login(ip)

    result = await db.execute(select(User).where(User.email == body.email.lower().strip()))
    user = result.scalar_one_or_none()
    if not user or not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(status_code=423, detail="Account locked — try later")

    if not verify_password(body.password, user.password_hash):
        user.failed_logins = (user.failed_logins or 0) + 1
        if user.failed_logins >= LOCKOUT_AFTER:
            user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
            user.failed_logins = 0
        db.add(user)
        await db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user.failed_logins = 0
    user.locked_until = None
    token = new_session_token()
    sess = AuthSession(
        token_hash=hash_token(token),
        user_id=user.id,
        org_id=user.org_id,
        expires_at=session_expiry(),
    )
    db.add(user)
    db.add(sess)
    await db.commit()

    response.set_cookie(value=token, **_cookie_kwargs())
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "org_id": str(user.org_id),
    }


@router.post("/auth/logout")
async def logout_session(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_session),
):
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        th = hash_token(token)
        result = await db.execute(select(AuthSession).where(AuthSession.token_hash == th))
        sess = result.scalar_one_or_none()
        if sess and sess.revoked_at is None:
            sess.revoked_at = datetime.utcnow()
            db.add(sess)
            await db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"status": "ok"}


@router.get("/me")
async def me(user: CurrentUser) -> MeOut:
    return MeOut(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
        org_id=str(user.org_id),
    )


@router.post("/auth/password")
async def change_password(
    body: PasswordChangeBody,
    request: Request,
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
):
    """Change password; revoke all other sessions for this user."""
    result = await db.execute(select(User).where(User.id == user.id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not verify_password(body.current_password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if body.current_password == body.new_password:
        raise HTTPException(status_code=400, detail="New password must differ from current")

    db_user.password_hash = hash_password(body.new_password)
    db.add(db_user)

    current_th = None
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        current_th = hash_token(token)

    sess_result = await db.execute(
        select(AuthSession).where(
            AuthSession.user_id == user.id,
            AuthSession.revoked_at.is_(None),
        )
    )
    now = datetime.utcnow()
    for sess in sess_result.scalars().all():
        if current_th and sess.token_hash == current_th:
            continue
        sess.revoked_at = now
        db.add(sess)

    await db.commit()
    return {"status": "ok"}


@router.post("/auth/invite")
async def invite_user(
    body: InviteBody,
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
):
    """Admin invites a clinician into their org. Public self-register is off."""
    user.require_role(ADMIN_ROLES)
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail=f"role must be one of {ROLES}")

    org_result = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = org_result.scalar_one_or_none()
    if org:
        active = (
            await db.execute(
                select(func.count()).select_from(User).where(
                    User.org_id == user.org_id,
                    User.deleted_at.is_(None),
                    User.is_active == True,  # noqa: E712
                )
            )
        ).scalar_one()
        if int(active) >= org.seat_cap:
            raise HTTPException(
                status_code=409,
                detail=f"Seat cap reached ({org.seat_cap}). Deactivate a seat or raise the cap.",
            )

    email = body.email.lower().strip()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(
        email=email,
        password_hash=hash_password(body.password),
        name=body.name.strip(),
        role=body.role,
        org_id=user.org_id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"id": str(new_user.id), "email": new_user.email, "role": new_user.role}


@router.post("/auth/bootstrap")
async def bootstrap_register(
    body: InviteBody,
    response: Response,
    db: AsyncSession = Depends(get_session),
):
    """
    One-shot: create first org + admin when zero users exist.
    Also allowed when ALLOW_PUBLIC_REGISTER=true (dev only).
    """
    count = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    if count > 0 and not settings.ALLOW_PUBLIC_REGISTER:
        raise HTTPException(status_code=403, detail="Invite-only — ask your admin")

    email = body.email.lower().strip()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    role = "admin" if count == 0 else (body.role if body.role in ROLES else "nurse")

    org_result = await db.execute(select(Organization).limit(1))
    org = org_result.scalar_one_or_none()
    if not org:
        org = Organization(name="Demo Hospital", site_name="ED Desk 1", timezone="Asia/Kolkata")
        db.add(org)
        await db.flush()

    new_user = User(
        email=email,
        password_hash=hash_password(body.password),
        name=body.name.strip(),
        role=role,
        org_id=org.id,
    )
    db.add(new_user)
    await db.flush()

    token = new_session_token()
    sess = AuthSession(
        token_hash=hash_token(token),
        user_id=new_user.id,
        org_id=org.id,
        expires_at=session_expiry(),
    )
    db.add(sess)
    await db.commit()

    response.set_cookie(value=token, **_cookie_kwargs())
    return {
        "id": str(new_user.id),
        "email": new_user.email,
        "name": new_user.name,
        "role": new_user.role,
        "org_id": str(org.id),
    }
