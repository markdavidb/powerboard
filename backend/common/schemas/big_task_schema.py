# common/schemas/schemas/big_task_schema.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from common.enums import Priority
from .task_schema import Task  # avoids circular import
from .big_task_member_schema import BigTaskMember

class BigTaskBase(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        description="Title must be at least one character"
    )
    description: Optional[str] = None
    status: str = "Open"
    priority: Priority = Priority.MEDIUM
    due_date: Optional[datetime] = None
    project_id: int

class BigTaskCreate(BigTaskBase):
    pass

class BigTask(BigTaskBase):
    id: int
    created_at: datetime
    tasks: List[Task] = []
    members: List[BigTaskMember] = []

    model_config = {"from_attributes": True}
