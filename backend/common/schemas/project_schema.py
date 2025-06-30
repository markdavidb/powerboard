# common/schemas/project_schema.py
from pydantic    import BaseModel, Field
from typing      import List, Optional
from datetime    import datetime
from common.enums            import ProjectStatus   # ← import enum
from .project_member_schema    import ProjectMember
from .user_schema              import User as UserSchema

class ProjectBase(BaseModel):
    title:       str
    description: Optional[str]        = None
    due_date:    Optional[datetime]   = None
    status:      ProjectStatus        = ProjectStatus.IN_PROGRESS  # ← NEW

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id:        int
    owner_id:  int
    owner:     Optional[UserSchema]
    members:   List[ProjectMember]    = Field(default_factory=list)

    model_config = {
        "from_attributes": True
    }
