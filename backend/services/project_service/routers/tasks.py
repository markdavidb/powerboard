# app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from common.database  import get_db
from common.schemas.task_schema import TaskCreate, Task
from common.models.task     import Task as TaskModel
from common.models.project  import Project  as ProjectModel
from common.models.big_task import BigTask  as BigTaskModel
from common.models.project_member   import ProjectMember
from common.models.big_task_member  import BigTaskMember
from common.models.user   import User
from common.security.dependencies import get_current_user
from services.notification_service.events import (
    task_assigned,
    task_status_changed,
)

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────
def _effective_assignee_id(task_in: TaskCreate, current_user: User) -> int:
    """
    If the client didn’t send assignee_id ⇒ default to the caller himself.
    """
    return task_in.assignee_id or current_user.id


# ─────────────────────────────────────────────────────────────────────────────
# CREATE
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/", response_model=Task)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1) Validate / load project
    project = db.query(ProjectModel).filter(ProjectModel.id == task_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.owner_id != current_user.id:
        membership = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project.id,
                ProjectMember.user_id == current_user.id,
            )
            .first()
        )
        if not membership:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to create tasks in this project",
            )

    # 2) Determine the final assignee
    assignee_id = _effective_assignee_id(task_in, current_user)

    # 3) Ensure the assignee is part of the project
    if assignee_id != project.owner_id:
        assignee_mem = (
            db.query(ProjectMember)
            .filter(ProjectMember.project_id == project.id, ProjectMember.user_id == assignee_id)
            .first()
        )
        if not assignee_mem:
            raise HTTPException(status_code=400, detail="Assignee is not a member of this project")

    # 4) If an epic (big_task_id) was supplied – validate membership there too
    if task_in.big_task_id is not None:
        epic = db.query(BigTaskModel).filter(BigTaskModel.id == task_in.big_task_id).first()
        if not epic or epic.project_id != project.id:
            raise HTTPException(status_code=400, detail="big_task_id is invalid for this project")

        # Caller must be member of the epic (unless owner)
        if project.owner_id != current_user.id:
            epic_mem = (
                db.query(BigTaskMember)
                .filter(
                    BigTaskMember.big_task_id == epic.id,
                    BigTaskMember.user_id == current_user.id,
                )
                .first()
            )
            if not epic_mem:
                raise HTTPException(status_code=403, detail="Not a member of this big task")

        # Assignee must also belong to the epic
        if assignee_id != project.owner_id:
            assignee_epic_mem = (
                db.query(BigTaskMember)
                .filter(BigTaskMember.big_task_id == epic.id, BigTaskMember.user_id == assignee_id)
                .first()
            )
            if not assignee_epic_mem:
                raise HTTPException(status_code=400, detail="Assignee is not a member of this big task")

    # 5) Create and persist
    new_task = TaskModel(
        title        = task_in.title,
        description  = task_in.description,
        status       = task_in.status,
        issue_type   = task_in.issue_type,
        priority     = task_in.priority,
        reporter_id  = current_user.id,
        assignee_id  = assignee_id,
        due_date     = task_in.due_date,
        project_id   = task_in.project_id,
        big_task_id  = task_in.big_task_id,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    if new_task.assignee_id:
        task_assigned(db, new_task, new_task.assignee)

    return new_task


@router.get("/", response_model=List[Task])
def list_tasks(
    project_id: Optional[int] = None,
    big_task_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = (
        db.query(TaskModel)
        .options(
            joinedload(TaskModel.project)  # Task ➜ Project
            .joinedload(ProjectModel.owner),  # ➜ Owner
            joinedload(TaskModel.big_task)  # Task ➜ BigTask (Epic)
        )
    )

    # Filter by epic
    if big_task_id is not None:
        epic = db.query(BigTaskModel).filter(BigTaskModel.id == big_task_id).first()
        if not epic:
            raise HTTPException(status_code=404, detail="Big task not found")

        project = db.query(ProjectModel).filter(ProjectModel.id == epic.project_id).first()
        if project.owner_id != current_user.id:
            proj_mem = db.query(ProjectMember).filter(
                ProjectMember.project_id == project.id,
                ProjectMember.user_id == current_user.id
            ).first()
            if not proj_mem:
                raise HTTPException(status_code=403, detail="Not authorized")

            epic_mem = db.query(BigTaskMember).filter(
                BigTaskMember.big_task_id == epic.id,
                BigTaskMember.user_id == current_user.id
            ).first()
            if not epic_mem:
                raise HTTPException(status_code=403, detail="Not a member of this big task")

        return q.filter(TaskModel.big_task_id == big_task_id).all()

    # Filter by project
    if project_id is not None:
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if project.owner_id != current_user.id:
            proj_mem = db.query(ProjectMember).filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == current_user.id
            ).first()
            if not proj_mem:
                raise HTTPException(status_code=403, detail="Not authorized")

        return q.filter(TaskModel.project_id == project_id).all()

    # All accessible
    owned_ids  = db.query(ProjectModel.id).filter(ProjectModel.owner_id == current_user.id)
    member_ids = db.query(ProjectMember.project_id).filter(ProjectMember.user_id == current_user.id)
    accessible = owned_ids.union(member_ids).subquery()

    return q.filter(TaskModel.project_id.in_(accessible)).all()


@router.get("/{task_id}", response_model=Task)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = (
        db.query(TaskModel)
          .options(joinedload(TaskModel.project).joinedload(ProjectModel.owner))
          .filter(TaskModel.id == task_id)
          .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(ProjectModel).filter(ProjectModel.id == task.project_id).first()
    if project.owner_id != current_user.id:
        proj_mem = db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == current_user.id
        ).first()
        if not proj_mem:
            raise HTTPException(status_code=403, detail="Not authorized")
        if task.big_task_id:
            bt_mem = db.query(BigTaskMember).filter(
                BigTaskMember.big_task_id == task.big_task_id,
                BigTaskMember.user_id == current_user.id
            ).first()
            if not bt_mem:
                raise HTTPException(status_code=403, detail="Not a member of this big task")

    return task


@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(ProjectModel).filter(ProjectModel.id == task.project_id).first()
    if project.owner_id != current_user.id:
        proj_mem = db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == current_user.id
        ).first()
        if not proj_mem:
            raise HTTPException(status_code=403, detail="Not authorized")

    old_status = task.status

    task.title        = task_in.title
    task.description  = task_in.description
    task.status       = task_in.status
    task.issue_type   = task_in.issue_type
    task.priority     = task_in.priority
    task.due_date     = task_in.due_date
    task.assignee_id  = task_in.assignee_id
    task.big_task_id  = task_in.big_task_id

    db.commit()
    db.refresh(task)

    task_status_changed(db, task, old_status)

    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = db.query(ProjectModel).filter(ProjectModel.id == task.project_id).first()
    if project.owner_id != current_user.id:
        proj_mem = db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == current_user.id
        ).first()
        if not proj_mem:
            raise HTTPException(status_code=403, detail="Not authorized")
        if task.big_task_id:
            bt_mem = db.query(BigTaskMember).filter(
                BigTaskMember.big_task_id == task.big_task_id,
                BigTaskMember.user_id == current_user.id
            ).first()
            if not bt_mem:
                raise HTTPException(status_code=403, detail="Not a member of this big task")

    db.delete(task)
    db.commit()
    return {"detail": "Task deleted successfully"}
