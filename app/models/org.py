"""Organizations, users, and server-side sessions."""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
import uuid

ROLES = ("intake", "nurse", "physician", "admin")


class Organization(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    site_name: Optional[str] = None
    timezone: str = "Asia/Kolkata"
    seat_cap: int = 5
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    retain_until: Optional[datetime] = None


class User(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    name: str
    role: str = "nurse"  # intake | nurse | physician | admin
    org_id: uuid.UUID = Field(index=True)
    is_active: bool = True
    failed_logins: int = 0
    locked_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


class AuthSession(SQLModel, table=True):
    __tablename__ = "authsession"
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    token_hash: str = Field(index=True, unique=True)
    user_id: uuid.UUID = Field(index=True)
    org_id: uuid.UUID = Field(index=True)
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    revoked_at: Optional[datetime] = None
