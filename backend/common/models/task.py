from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from common.database import Base
from common.enums import IssueType, Priority

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="To Do")
    issue_type = Column(Enum(IssueType), default=IssueType.TASK, nullable=False)
    priority = Column(Enum(Priority), default=Priority.MEDIUM, nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", backref="tasks_assigned", foreign_keys=[assignee_id])
    reporter = relationship("User", foreign_keys=[reporter_id])
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    big_task_id = Column(Integer,
                         ForeignKey("big_tasks.id", ondelete="RESTRICT"),
                         nullable=True)
    big_task = relationship("BigTask", back_populates="tasks")

    @property
    def creator_name(self) -> str:
        return self.reporter.username if self.reporter else ""
