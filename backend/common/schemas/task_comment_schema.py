from pydantic import BaseModel
from datetime import datetime

class TaskCommentBase(BaseModel):
    content: str

class TaskCommentCreate(TaskCommentBase):
    task_id: int

class TaskComment(TaskCommentBase):
    id: int
    task_id: int
    user_id: int
    username: str            # ← now pulled from the model property
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class TaskCommentUpdate(BaseModel):
    content: str
