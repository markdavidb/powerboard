# services/project_service/routers/big_task_members.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from common.database import get_db
from common.security.dependencies import get_current_user
from common.models.user import User
from common.models.big_task_member import BigTaskMember
from common.models.big_task import BigTask
from common.models.project import Project
from common.models.project_member import ProjectMember
from common.schemas.big_task_member_schema import BigTaskMemberCreate, BigTaskMember as BigTaskMemberSchema
from services.notification_service.events import added_to_big_task  # ⬅️ import at top of file
from services.notification_service.events import removed_from_big_task

router = APIRouter(prefix="/big_task_members", tags=["big_task_members"])


def _assert_project_access(db: Session, current_user: User, big_task: BigTask):
    project = db.query(Project).filter(Project.id == big_task.project_id).first()
    if project.owner_id == current_user.id:
        return
    proj_owner_mem = db.query(ProjectMember).filter(
        ProjectMember.project_id == project.id,
        ProjectMember.user_id    == current_user.id,
        ProjectMember.role       == "owner",
    ).first()
    if not proj_owner_mem:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage members of this big task",
        )


@router.post("/", response_model=BigTaskMemberSchema)
def add_member(
    member_in: BigTaskMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1) fetch big task
    big_task = db.query(BigTask).filter(BigTask.id == member_in.big_task_id).first()
    if not big_task:
        raise HTTPException(status_code=404, detail="BigTask not found")

    # 2) guard
    _assert_project_access(db, current_user, big_task)

    # 3) fetch user to add
    user_to_add = db.query(User).filter(User.username == member_in.username).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")

    # 4) ensure project membership
    project_id = big_task.project_id
    proj_mem = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id    == user_to_add.id,
    ).first()
    if not proj_mem:
        # auto‑add to project as 'viewer'
        new_pm = ProjectMember(
            project_id=project_id,
            user_id   =user_to_add.id,
            role      ="viewer",
        )
        db.add(new_pm)
        db.commit()

    # 5) ensure not already big-task member
    exists = db.query(BigTaskMember).filter(
        BigTaskMember.big_task_id == big_task.id,
        BigTaskMember.user_id     == user_to_add.id,
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="User already a member of this big task")

    # 6) add to big task
    bm = BigTaskMember(
        big_task_id=big_task.id,
        user_id    =user_to_add.id,
        role       =member_in.role,
    )
    db.add(bm)
    db.commit()
    db.refresh(bm)

    added_to_big_task(db, big_task, user_to_add)

    return bm


@router.get("/{big_task_id}/members", response_model=List[BigTaskMemberSchema])
def list_members(
    big_task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bt = db.query(BigTask).filter(BigTask.id == big_task_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="BigTask not found")

    project = db.query(Project).filter(Project.id == bt.project_id).first()
    if project.owner_id != current_user.id:
        pm = db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id    == current_user.id
        ).first()
        if not pm:
            raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(BigTaskMember).filter(
        BigTaskMember.big_task_id == big_task_id
    ).all()


@router.delete("/{big_task_id}/members/{username}")
def remove_member(
    big_task_id: int,
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bt = db.query(BigTask).filter(BigTask.id == big_task_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="BigTask not found")

    _assert_project_access(db, current_user, bt)

    user_obj = db.query(User).filter(User.username == username).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    member = db.query(BigTaskMember).filter(
        BigTaskMember.big_task_id == big_task_id,
        BigTaskMember.user_id     == user_obj.id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()
    removed_from_big_task(db, bt, user_obj)

    return {"detail": "Member removed"}
