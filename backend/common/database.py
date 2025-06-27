from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from common.config import settings

DATABASE_URL = settings.DATABASE_URL

# Create the SQLAlchemy engine
# database.py
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------------------------------------------------
# Automatically create missing tables on startup (DEV ONLY)
# ------------------------------------------------------------------

# 1. Import all your models so that their metadata is registered with Base
import common.models.user
import common.models.project
import common.models.project_member
import common.models.task
import common.models.task_comment
import common.models.big_task          # ← ADD THIS LINE
import common.models.notification          # ← ADD THIS LINE

# 2. Create all tables that don't yet exist
Base.metadata.create_all(bind=engine)
