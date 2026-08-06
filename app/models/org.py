"""Organizations, users, and server-side sessions."""
from datetime import datetime
from typing import Any, Dict, Optional
from sqlmodel import SQLModel, Field, Column, JSON
import uuid

ROLES = ("intake", "nurse", "physician", "admin")

# Canonical urgency enum — display names are cosmetic only (not ESI / protocol cert).
DEFAULT_URGENCY_LABELS: Dict[str, str] = {
    "Critical": "Critical",
    "High": "High",
    "Medium": "Medium",
    "Low": "Low",
}
DEFAULT_NOTICE_VERSION = "hospital-triage-ops-v1"


def resolve_urgency_labels(raw: Any) -> Dict[str, str]:
    """Merge org overrides onto defaults; ignore unknown keys / empty strings."""
    out = dict(DEFAULT_URGENCY_LABELS)
    if isinstance(raw, dict):
        for key in DEFAULT_URGENCY_LABELS:
            val = raw.get(key)
            if isinstance(val, str) and val.strip():
                out[key] = val.strip()[:40]
    return out


class Organization(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    site_name: Optional[str] = None
    timezone: str = "Asia/Kolkata"
    seat_cap: int = 5
    # B1.4 — site display names for Critical/High/Medium/Low (API enum unchanged)
    urgency_labels: Optional[Dict[str, str]] = Field(default=None, sa_column=Column(JSON))
    # B1.6 — org attested hospital notice for triage ops purpose
    notice_accepted_at: Optional[datetime] = None
    notice_accepted_by: Optional[str] = None  # admin email
    notice_version: Optional[str] = None
    # B1.2 — Critical unacked escalation (webhook/email stub; WhatsApp later)
    escalation_webhook_url: Optional[str] = None
    escalation_email: Optional[str] = None
    escalation_minutes: int = 5
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
