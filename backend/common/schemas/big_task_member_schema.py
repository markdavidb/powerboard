#common/schemas/big_task_member_schema.py
from pydantic import BaseModel
from common.enums import ProjectRole

class BigTaskMemberBase(BaseModel):
    big_task_id: int
    username: str
    role: ProjectRole = ProjectRole.EDITOR

    class Config:
        from_attributes = True

class BigTaskMemberCreate(BigTaskMemberBase):
    pass

class BigTaskMember(BigTaskMemberBase):
    pass
