"""B1.2 Critical escalation — webhook/email stub when unacked > N minutes.

Nurse must still Confirm/Override in-app. Notify ≠ diagnose.
ponytail: email is log-only until SMTP; WhatsApp later.
"""
from __future__ import annotations

import asyncio
import json
import logging
import urllib.error
import urllib.request
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.case import Case
from app.models.org import Organization

logger = logging.getLogger("medtriage.escalation")

# Scan interval — coarse; escalation_minutes is the real gate
_SCAN_SECONDS = 60


def _post_webhook(url: str, payload: dict) -> None:
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": "MedTriage-escalation/1"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            resp.read()
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        logger.warning("escalation webhook failed url=%s err=%s", url[:80], e)


async def scan_once(session_factory: sessionmaker) -> int:
    """Find Critical Pending Review past threshold; fire once. Returns count fired."""
    fired = 0
    async with session_factory() as db:  # type: AsyncSession
        orgs = (
            await db.execute(
                select(Organization).where(Organization.deleted_at.is_(None))
            )
        ).scalars().all()
        now = datetime.utcnow()
        for org in orgs:
            mins = org.escalation_minutes if org.escalation_minutes is not None else 5
            if mins < 1:
                continue
            if not org.escalation_webhook_url and not org.escalation_email:
                continue
            cutoff = now - timedelta(minutes=mins)
            cases = (
                await db.execute(
                    select(Case).where(
                        Case.org_id == org.id,
                        Case.deleted_at.is_(None),
                        Case.status == "Pending Review",
                        Case.urgency_level == "Critical",
                        Case.escalated_at.is_(None),
                        Case.created_at <= cutoff,
                    )
                )
            ).scalars().all()
            for case in cases:
                payload = {
                    "event": "critical_unacked",
                    "org_id": str(org.id),
                    "org_name": org.name,
                    "case_id": str(case.id),
                    "urgency_level": case.urgency_level,
                    "minutes_unacked": mins,
                    "created_at": case.created_at.isoformat() if case.created_at else None,
                    "note": "Clinician must still confirm in MedTriage — notify is not a diagnosis.",
                }
                if org.escalation_email:
                    # stub: no SMTP yet
                    logger.info(
                        "escalation email stub to=%s case=%s payload=%s",
                        org.escalation_email,
                        case.id,
                        json.dumps(payload),
                    )
                if org.escalation_webhook_url:
                    await asyncio.to_thread(_post_webhook, org.escalation_webhook_url, payload)
                case.escalated_at = now
                db.add(case)
                fired += 1
        if fired:
            await db.commit()
    return fired


async def escalation_loop(engine) -> None:
    """Background task — started from app lifespan."""
    factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    await asyncio.sleep(5)  # let startup settle
    logger.info("Critical escalation scanner started (every %ss)", _SCAN_SECONDS)
    while True:
        try:
            n = await scan_once(factory)
            if n:
                logger.info("escalation fired count=%s", n)
        except Exception:
            logger.exception("escalation scan failed")
        await asyncio.sleep(_SCAN_SECONDS)
