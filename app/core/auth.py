"""Auth dependencies: session cookie → current user, org-scoped."""
from datetime import datetime
from typing import Annotated, Optional
from fastapi import Cookie, Depends, HTTPException, WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import SESSION_COOKIE, hash_token
from app.db.session import get_session
from app.models.org import AuthSession, User

# Roles that may create intake
INTAKE_ROLES = frozenset({"intake", "nurse", "physician", "admin"})
# Roles that may review / see queue
REVIEW_ROLES = frozenset({"nurse", "physician", "admin"})
# Roles that may see full evidence detail
EVIDENCE_ROLES = frozenset({"physician", "admin"})
ADMIN_ROLES = frozenset({"admin"})


class AuthUser:
    def __init__(self, user: User):
        self.id = user.id
        self.email = user.email
        self.name = user.name
        self.role = user.role
        self.org_id = user.org_id
        self.is_active = user.is_active

    def require_role(self, allowed: frozenset[str]) -> None:
        if self.role not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient role")


async def _user_from_token(db: AsyncSession, token: Optional[str]) -> AuthUser:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    th = hash_token(token)
    result = await db.execute(
        select(AuthSession).where(
            AuthSession.token_hash == th,
            AuthSession.revoked_at.is_(None),
        )
    )
    sess = result.scalar_one_or_none()
    if not sess or sess.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired")
    result = await db.execute(
        select(User).where(User.id == sess.user_id, User.is_active == True)  # noqa: E712
    )
    user = result.scalar_one_or_none()
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=401, detail="User inactive")
    return AuthUser(user)


async def get_current_user(
    db: AsyncSession = Depends(get_session),
    mt_session: Optional[str] = Cookie(None, alias=SESSION_COOKIE),
) -> AuthUser:
    return await _user_from_token(db, mt_session)


async def get_optional_user(
    db: AsyncSession = Depends(get_session),
    mt_session: Optional[str] = Cookie(None, alias=SESSION_COOKIE),
) -> Optional[AuthUser]:
    if not mt_session:
        return None
    try:
        return await _user_from_token(db, mt_session)
    except HTTPException:
        return None


CurrentUser = Annotated[AuthUser, Depends(get_current_user)]


async def ws_user_from_cookie(websocket: WebSocket, db: AsyncSession) -> Optional[AuthUser]:
    """Return user or None — caller accepts then closes on None."""
    token = websocket.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    try:
        return await _user_from_token(db, token)
    except HTTPException:
        return None
