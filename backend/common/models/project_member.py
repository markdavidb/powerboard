# common/models/project_member.py
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from common.database import Base
from common.enums import ProjectRole


class ProjectMember(Base):
    __tablename__ = "project_members"

    # 👉 on‑delete CASCADE means the DB itself will erase these rows when
    #    the referenced project or user is removed.
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role = Column(String, default=ProjectRole.EDITOR.value)

    # 2‑way relationships
    user = relationship("User", back_populates="project_memberships")
    project = relationship("Project", back_populates="members")

    # Convenience
    @property
    def username(self):
        return self.user.username if self.user else ""
