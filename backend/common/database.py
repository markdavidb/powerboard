# common/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from common.config import settings

DATABASE_URL = settings.DATABASE_URL

# —————————————————————————————————————————————————————————————————————————
# Engine: cap the pool so we never exceed Supabase's pool of 15
# —————————————————————————————————————————————————————————————————————————
engine = create_engine(
    DATABASE_URL,
    pool_size=5,         # at most  5 persistent connections
    max_overflow=0,      # no extra “overflow” sockets
    pool_timeout=30,     # fail fast if you hit all 5
    pool_pre_ping=True   # auto‐ recycle dropped connections
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base = declarative_base()

# —————————————————————————————————————————————————————————————————————————
# Dependency‐helper to ensure sessions always get closed
# —————————————————————————————————————————————————————————————————————————
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# —————————————————————————————————————————————————————————————————————————
# (DEV‐only) import all your models so metadata.create_all() sees them
# —————————————————————————————————————————————————————————————————————————
import common.models.user
import common.models.project
import common.models.project_member
import common.models.task
import common.models.task_comment
import common.models.big_task
import common.models.notification

Base.metadata.create_all(bind=engine)
