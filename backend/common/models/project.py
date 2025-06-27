#app/models/project.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Enum
from sqlalchemy.orm   import relationship
from common.database import Base
from common.enums  import ProjectStatus  # ← import your enum

class Project(Base):
    __tablename__ = "projects"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String,  nullable=False)
    description = Column(String,  nullable=True)
    status      = Column(Enum(ProjectStatus), default=ProjectStatus.IN_PROGRESS, nullable=False)  # ← NEW
    due_date    = Column(DateTime(timezone=True), nullable=True)
    owner_id    = Column(Integer, ForeignKey("users.id"))
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    owner      = relationship("User", back_populates="owned_projects")
    tasks      = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    big_tasks  = relationship(
        "BigTask",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    members    = relationship(
        "ProjectMember",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
