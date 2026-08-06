"""Pilot metrics — org-scoped aggregates for weekly review + CSV export."""
from __future__ import annotations
from datetime import datetime, timedelta
from statistics import median
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, ADMIN_ROLES
from app.db.session import get_session
from app.models.case import Case, AuditLog, URGENCY_RANK
from app.models.org import AuthSession

router = APIRouter()


class MetricsOut(BaseModel):
    org_id: str
    from_ts: str
    to_ts: str
    cases_ingested: int
    cases_processed: int
    cases_failed: int
    latency_median_sec: Optional[float]
    latency_p95_sec: Optional[float]
    latency_sample_n: int
    reviews_total: int
    confirms: int
    overrides: int
    confirm_rate: Optional[float]
    override_rate: Optional[float]
    down_triage_overrides: int
    down_triage_reason_pct: Optional[float]
    urgency_distribution: dict[str, int]
    active_clinicians: int
    open_sessions: int
    notes: list[str]


def _parse_day(s: Optional[str], default: datetime, *, end: bool = False) -> datetime:
    if not s:
        return default
    try:
        if len(s) == 10:
            d = datetime.strptime(s, "%Y-%m-%d")
            return d + timedelta(days=1) if end else d
        return datetime.fromisoformat(s.replace("Z", ""))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date: {e}") from e


def _percentile(sorted_vals: list[float], p: float) -> Optional[float]:
    if not sorted_vals:
        return None
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    k = (len(sorted_vals) - 1) * p
    f = int(k)
    c = min(f + 1, len(sorted_vals) - 1)
    if f == c:
        return sorted_vals[f]
    return sorted_vals[f] + (sorted_vals[c] - sorted_vals[f]) * (k - f)


async def _compute_metrics(
    user: CurrentUser,
    db: AsyncSession,
    from_ts: datetime,
    to_ts: datetime,
) -> MetricsOut:
    cases_q = await db.execute(
        select(Case).where(
            Case.org_id == user.org_id,
            Case.deleted_at.is_(None),
            Case.created_at >= from_ts,
            Case.created_at < to_ts,
        )
    )
    cases = list(cases_q.scalars().all())

    ingested = len(cases)
    failed = sum(1 for c in cases if c.status == "Failed")
    processed = sum(1 for c in cases if c.status != "Failed")

    latencies: list[float] = []
    for c in cases:
        if c.status == "Failed":
            continue
        if c.accepted_at and c.created_at and c.created_at >= c.accepted_at:
            latencies.append((c.created_at - c.accepted_at).total_seconds())
    latencies.sort()

    audit_q = await db.execute(
        select(AuditLog).where(
            AuditLog.org_id == user.org_id,
            AuditLog.timestamp >= from_ts,
            AuditLog.timestamp < to_ts,
        )
    )
    audits = list(audit_q.scalars().all())
    confirms = sum(1 for a in audits if a.action == "Confirm")
    overrides = sum(1 for a in audits if a.action == "Override")
    reviews = confirms + overrides

    down = [
        a
        for a in audits
        if a.action == "Override"
        and a.previous_level
        and a.new_level
        and URGENCY_RANK.get(a.new_level, 99) > URGENCY_RANK.get(a.previous_level, -1)
    ]
    down_with_reason = sum(1 for a in down if a.reason and len(a.reason.strip()) >= 10)

    urgency: dict[str, int] = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for c in cases:
        if c.status == "Failed":
            continue
        key = c.urgency_level if c.urgency_level in urgency else "Medium"
        urgency[key] += 1

    clinicians = {a.clinician_id for a in audits if a.clinician_id}

    sess_q = await db.execute(
        select(AuthSession).where(
            AuthSession.org_id == user.org_id,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > datetime.utcnow(),
        )
    )
    open_sessions = len(list(sess_q.scalars().all()))

    notes = [
        "cases_ingested = rows created in range (pipeline success or Failed).",
        "latency = created_at − accepted_at when accepted_at is set (new intakes only).",
        "active_clinicians = distinct audit actors in range.",
        "open_sessions = non-revoked unexpired sessions now (not historical uptime).",
    ]

    return MetricsOut(
        org_id=str(user.org_id),
        from_ts=from_ts.isoformat(),
        to_ts=to_ts.isoformat(),
        cases_ingested=ingested,
        cases_processed=processed,
        cases_failed=failed,
        latency_median_sec=round(median(latencies), 2) if latencies else None,
        latency_p95_sec=round(_percentile(latencies, 0.95), 2) if latencies else None,
        latency_sample_n=len(latencies),
        reviews_total=reviews,
        confirms=confirms,
        overrides=overrides,
        confirm_rate=round(confirms / reviews, 4) if reviews else None,
        override_rate=round(overrides / reviews, 4) if reviews else None,
        down_triage_overrides=len(down),
        down_triage_reason_pct=round(down_with_reason / len(down), 4) if down else None,
        urgency_distribution=urgency,
        active_clinicians=len(clinicians),
        open_sessions=open_sessions,
        notes=notes,
    )


def _metrics_csv(m: MetricsOut) -> str:
    lines = [
        "metric,value",
        f"org_id,{m.org_id}",
        f"from,{m.from_ts}",
        f"to,{m.to_ts}",
        f"cases_ingested,{m.cases_ingested}",
        f"cases_processed,{m.cases_processed}",
        f"cases_failed,{m.cases_failed}",
        f"latency_median_sec,{m.latency_median_sec if m.latency_median_sec is not None else ''}",
        f"latency_p95_sec,{m.latency_p95_sec if m.latency_p95_sec is not None else ''}",
        f"latency_sample_n,{m.latency_sample_n}",
        f"reviews_total,{m.reviews_total}",
        f"confirms,{m.confirms}",
        f"overrides,{m.overrides}",
        f"confirm_rate,{m.confirm_rate if m.confirm_rate is not None else ''}",
        f"override_rate,{m.override_rate if m.override_rate is not None else ''}",
        f"down_triage_overrides,{m.down_triage_overrides}",
        f"down_triage_reason_pct,{m.down_triage_reason_pct if m.down_triage_reason_pct is not None else ''}",
        f"urgency_critical,{m.urgency_distribution.get('Critical', 0)}",
        f"urgency_high,{m.urgency_distribution.get('High', 0)}",
        f"urgency_medium,{m.urgency_distribution.get('Medium', 0)}",
        f"urgency_low,{m.urgency_distribution.get('Low', 0)}",
        f"active_clinicians,{m.active_clinicians}",
        f"open_sessions,{m.open_sessions}",
    ]
    return "\n".join(lines) + "\n"


@router.get("/metrics")
async def get_metrics(
    user: CurrentUser,
    db: AsyncSession = Depends(get_session),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    format: Optional[str] = Query(None),
):
    """Admin-only pilot metrics for the caller's org."""
    user.require_role(ADMIN_ROLES)
    now = datetime.utcnow()
    default_to = now + timedelta(days=1)
    to_ts = _parse_day(to_date, default_to, end=True)
    from_ts = _parse_day(from_date, to_ts - timedelta(days=14), end=False)
    if from_ts >= to_ts:
        raise HTTPException(status_code=400, detail="'from' must be before 'to'")

    m = await _compute_metrics(user, db, from_ts, to_ts)
    if format == "csv":
        return PlainTextResponse(
            _metrics_csv(m),
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="metrics-{from_ts.date()}-{to_ts.date()}.csv"'
            },
        )
    return m
