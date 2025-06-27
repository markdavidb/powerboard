# app/schemas/project_member_schema.py

from pydantic import BaseModel
from common.enums import ProjectRole

class ProjectMemberBase(BaseModel):
    project_id: int
    username:   str
    role:       ProjectRole = ProjectRole.EDITOR

class ProjectMemberCreate(ProjectMemberBase):
    """
    Used for POST /projects/members/
    Only needs project_id, username, role.
    """
    pass

class ProjectMember(ProjectMemberBase):
    """
    Returned by all member‐related GETs, and by the POST response.
    Includes the actual user_id assigned in the database.
    """
    user_id: int

    model_config = {"from_attributes": True}
