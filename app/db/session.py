from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, select
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_size=20,
    max_overflow=10
)

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session


async def _seed_demo_org() -> None:
    """Seed one demo org + admin if no users exist; attach orphan cases to demo org."""
    from app.models.org import Organization, User
    from app.models.case import Case, AuditLog
    from app.core.security import hash_password

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as db:
        result = await db.execute(select(Organization).limit(1))
        org = result.scalar_one_or_none()
        if not org:
            org = Organization(name="Demo Hospital", site_name="ED Desk 1", timezone="Asia/Kolkata")
            db.add(org)
            await db.flush()

        result = await db.execute(select(User).limit(1))
        if not result.scalar_one_or_none():
            admin = User(
                email=settings.DEMO_ADMIN_EMAIL.lower(),
                password_hash=hash_password(settings.DEMO_ADMIN_PASSWORD),
                name="Demo Admin",
                role="admin",
                org_id=org.id,
            )
            db.add(admin)
            print(f"✅ Seeded demo org + admin ({settings.DEMO_ADMIN_EMAIL})")

        # Attach legacy rows missing org_id to demo org
        await db.execute(
            text('UPDATE "case" SET org_id = :oid WHERE org_id IS NULL').bindparams(oid=org.id)
        )
        await db.execute(
            text("UPDATE auditlog SET org_id = :oid WHERE org_id IS NULL").bindparams(oid=org.id)
        )
        await db.commit()


async def init_db():
    async with engine.begin() as conn:
        from app.models.case import Case, AuditLog  # noqa: F401
        from app.models.org import Organization, User, AuthSession  # noqa: F401
        await conn.run_sync(SQLModel.metadata.create_all)
        # ponytail: no Alembic — ALTER IF NOT EXISTS for columns added post-create
        alters = [
            'ALTER TABLE "case" ADD COLUMN IF NOT EXISTS mrn VARCHAR',
            'ALTER TABLE "case" ADD COLUMN IF NOT EXISTS org_id UUID',
            'ALTER TABLE "case" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP',
            'ALTER TABLE "case" ADD COLUMN IF NOT EXISTS retain_until TIMESTAMP',
            'ALTER TABLE "case" ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP',
            'ALTER TABLE "case" ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP',
            'ALTER TABLE auditlog ADD COLUMN IF NOT EXISTS org_id UUID',
            'ALTER TABLE organization ADD COLUMN IF NOT EXISTS urgency_labels JSON',
            'ALTER TABLE organization ADD COLUMN IF NOT EXISTS notice_accepted_at TIMESTAMP',
            'ALTER TABLE organization ADD COLUMN IF NOT EXISTS notice_accepted_by VARCHAR',
            'ALTER TABLE organization ADD COLUMN IF NOT EXISTS notice_version VARCHAR',
            'ALTER TABLE organization ADD COLUMN IF NOT EXISTS escalation_webhook_url VARCHAR',
            'ALTER TABLE organization ADD COLUMN IF NOT EXISTS escalation_email VARCHAR',
            'ALTER TABLE organization ADD COLUMN IF NOT EXISTS escalation_minutes INTEGER DEFAULT 5',
        ]
        for stmt in alters:
            try:
                await conn.execute(text(stmt))
            except Exception:
                pass
    await _seed_demo_org()
