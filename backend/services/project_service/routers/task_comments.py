# app/routers/task_comments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from common.database import get_db
from common.schemas.task_comment_schema import TaskCommentCreate, TaskComment, TaskCommentUpdate
from common.models.task_comment import TaskComment as TaskCommentModel
from common.models.task import Task
from common.security.dependencies import get_current_user
from common.models.user import User
from services.notification_service.events import comment_added

router = APIRouter()


@router.post("/", response_model=TaskComment)
def create_comment(
        comment_in: TaskCommentCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == comment_in.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    new_comment = TaskCommentModel(
        task_id=comment_in.task_id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    comment_added(db, task, current_user)

    return new_comment


@router.get("/task/{task_id}", response_model=List[TaskComment])
def list_comments(
        task_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comments = (
        db.query(TaskCommentModel)
        .options(joinedload(TaskCommentModel.user))  # ← eager-load user
        .filter(TaskCommentModel.task_id == task_id)
        .order_by(TaskCommentModel.created_at.desc(), TaskCommentModel.id.desc(),
                  )
        .all()
    )
    return comments


@router.put("/{comment_id}", response_model=TaskComment)
def update_comment(
        comment_id: int,
        comment_in: TaskCommentUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    comment = db.query(TaskCommentModel).filter(TaskCommentModel.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    comment.content = comment_in.content
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}")
def delete_comment(
        comment_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    comment = db.query(TaskCommentModel).filter(TaskCommentModel.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    db.delete(comment)
    db.commit()
    return {"detail": "Comment deleted successfully"}
