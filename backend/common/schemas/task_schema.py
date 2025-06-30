# common/schemas/task_schema.py
from pydantic import BaseModel
from typing   import Optional
from datetime import datetime
from common.enums import TaskStatus, IssueType, Priority
from common.schemas.project_schema import Project as ProjectSchema


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status:      TaskStatus    = TaskStatus.TODO
    issue_type:  IssueType     = IssueType.TASK
    priority:    Priority      = Priority.MEDIUM
    due_date:    Optional[datetime] = None
    big_task_id: Optional[int]      = None        # Epic
    # ❌  reporter_id removed – the server fills it in.


class TaskCreate(TaskBase):
    project_id:   int
    assignee_id:  Optional[int] = None            # If none ⇢ defaults to the current user


class Task(TaskBase):
    id:           int
    reporter_id:  int
    assignee_id:  Optional[int] = None
    created_at:   datetime
    updated_at:   Optional[datetime]
    creator_name: str

    # Nested project info
    project: Optional[ProjectSchema]

    class Config:
        from_attributes = True
