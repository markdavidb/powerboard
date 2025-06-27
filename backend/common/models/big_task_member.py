from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from common.database import Base
from common.enums import ProjectRole          # reuse the same enum

class BigTaskMember(Base):
    __tablename__ = "big_task_members"

    big_task_id = Column(
        Integer,
        ForeignKey("big_tasks.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role = Column(String, default=ProjectRole.EDITOR.value)

    # two‑way relationships
    big_task = relationship("BigTask", back_populates="members")
    user     = relationship("User", back_populates="big_task_memberships")

    @property
    def username(self) -> str:
        return self.user.username if self.user else ""
