from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from app.core.config import settings

# Create the async engine
# Note: DATABASE_URL must start with postgresql+asyncpg://
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_size=20,
    max_overflow=10
)

# Async session generator
async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

# Helper to create all tables (for development)
async def init_db():
    async with engine.begin() as conn:
        # Import models here to register them with SQLModel.metadata
        from app.models.case import Case, AuditLog
        await conn.run_sync(SQLModel.metadata.create_all)
