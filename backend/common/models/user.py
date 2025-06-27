# app/models/user.py

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from common.database import Base
from common.models.big_task_member import BigTaskMember


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    auth0_id        = Column(String, unique=True, index=True, nullable=False)
    username        = Column(String, unique=True, index=True, nullable=False)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)

    # NEW profile fields ↓
    display_name = Column(String(80), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    bio = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # ──────────────────────────────────────────────────────────────
    # relationships
    # ──────────────────────────────────────────────────────────────

    # 1) Projects this user owns
    owned_projects = relationship(
        "Project",
        back_populates="owner",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # 2) Rows in the project_members join‑table
    project_memberships = relationship(
        "ProjectMember",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    big_task_memberships = relationship("BigTaskMember", back_populates="user",
                                        cascade="all, delete-orphan",
                                        passive_deletes=True)