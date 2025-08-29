from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Create async engine with proper driver handling
if settings.DATABASE_URL.startswith("sqlite"):
    # Use aiosqlite for SQLite async support
    async_database_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    sync_database_url = settings.DATABASE_URL
else:
    # Use asyncpg for PostgreSQL
    async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    sync_database_url = settings.DATABASE_URL

# Async engine
async_engine = create_async_engine(
    async_database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300
)

# Sync engine
sync_engine = create_engine(
    sync_database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create sync session factory
SessionLocal = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False
)

# Create base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """Dependency to get async database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_db():
    """Dependency to get synchronous database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


async def init_db():
    """Initialize database tables"""
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db():
    """Close database connections"""
    await async_engine.dispose()
    sync_engine.dispose()
    logger.info("Database connections closed") 