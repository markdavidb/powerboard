# common/models/big_task.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SqlEnum, func
from sqlalchemy.orm import relationship
from common.database import Base
from common.enums import TaskStatus, Priority

class BigTask(Base):
    __tablename__ = "big_tasks"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # now uses the TaskStatus enum; defaults to TODO (“ToDo”)
    status      = Column(
        SqlEnum(TaskStatus, name="bigtask_status"),
        default=TaskStatus.TODO,
        nullable=False
    )

    # priority stays as-is
    priority    = Column(
        SqlEnum(Priority, name="priority_enum"),
        default=Priority.MEDIUM,
        nullable=False
    )

    due_date    = Column(DateTime(timezone=True), nullable=True)
    project_id  = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    project = relationship("Project", back_populates="big_tasks")
    tasks   = relationship(
        "Task",
        back_populates="big_task",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    members = relationship(
        "BigTaskMember",
        back_populates="big_task",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
