# common/database.py
# ──────────────────────────────────────────────────────────────────────────────
# Central SQLAlchemy engine + session factory.
# Designed for Supabase Nano:
#   • Default pool size = 2 sockets per process (override with DB_POOL_SIZE)
#   • No overflow, so we never exceed the hard 200-connection limit.
#   • Pre-ping and recycle keep long-lived services healthy.
# ──────────────────────────────────────────────────────────────────────────────

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from common.config import settings

# -----------------------------------------------------------------------------
# Connection string (set this in Railway / .env)
# -----------------------------------------------------------------------------
DATABASE_URL: str = settings.DATABASE_URL

# -----------------------------------------------------------------------------
# Pool configuration
# -----------------------------------------------------------------------------
POOL_SIZE       = int(getattr(settings, "DB_POOL_SIZE", 2))   # sockets / process
MAX_OVERFLOW    = 0        # never go beyond POOL_SIZE
POOL_TIMEOUT    = 30       # seconds to wait before raising
POOL_RECYCLE    = 1_800    # drop idle sockets after 30 min
POOL_PRE_PING   = True     # heal TCP half-opens automatically

engine = create_engine(
    DATABASE_URL,
    pool_size     = POOL_SIZE,
    max_overflow  = MAX_OVERFLOW,
    pool_timeout  = POOL_TIMEOUT,
    pool_recycle  = POOL_RECYCLE,
    pool_pre_ping = POOL_PRE_PING,
)

# -----------------------------------------------------------------------------
# Session factory and base model
# -----------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -----------------------------------------------------------------------------
# FastAPI dependency – makes sure every DB session is returned to the pool
# -----------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------------------------------------------------------
# (Development only) import all models so `metadata.create_all()` sees them.
# Remove the import block if you run your migrations with Alembic.
# -----------------------------------------------------------------------------
import common.models.user
import common.models.project
import common.models.project_member
import common.models.task
import common.models.task_comment
import common.models.big_task
import common.models.notification

Base.metadata.create_all(bind=engine)
