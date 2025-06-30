# services/project_service/routers/big_tasks.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from common.database import get_db
from common.schemas.big_task_schema      import BigTask, BigTaskCreate
from common.models.big_task              import BigTask as BigTaskModel
from common.models.big_task_member       import BigTaskMember
from common.models.project               import Project
from common.models.project_member        import ProjectMember
from common.models.user                  import User
from common.security.dependencies        import get_current_user
from services.notification_service.events import added_to_big_task
from common.models.task import Task                 # ← new import

router = APIRouter(prefix="/big_tasks", tags=["Big Tasks"])

# ─────────────────────────────  NEW PURE-LOGIC HELPER  ─────────────────────────────
def _assert_can_delete(task_count: int) -> None:
    """
    Raise 400 if the big-task still has tasks attached.
    Pure-logic helper so we can unit-test without the DB.
    """
    if task_count:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete big-task; it still contains {task_count} task(s). "
                   "Delete or move them first.",
        )

# ---------------------------------------------------------------------------
# CREATE  (now always inserts the creator as a member and refreshes `members`)
# ---------------------------------------------------------------------------
@router.post("/", response_model=BigTask, status_code=status.HTTP_201_CREATED)
def create_big_task(
    big_task_in: BigTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1) guard project access
    project = db.query(Project).filter(Project.id == big_task_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.owner_id != current_user.id:
        if not db.query(ProjectMember).filter(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id    == current_user.id
        ).first():
            raise HTTPException(status_code=403, detail="Not authorized")

    # 2) create the epic
    bt = BigTaskModel(**big_task_in.dict())
    db.add(bt)
    db.commit()
    db.refresh(bt)

    # 3) add the creator as an **owner** member
    db.add(
        BigTaskMember(
            big_task_id = bt.id,
            user_id     = current_user.id,
            role        = "owner",
        )
    )
    db.commit()

    # 4) reload the relationship so the response includes it
    db.refresh(bt, attribute_names=["members"])

    added_to_big_task(db, bt, current_user)   # notify

    return bt


# LIST ----------------------------------------------------------------------
@router.get("/", response_model=List[BigTask])
def list_big_tasks(
    project_id: Optional[int] = Query(
        None,
        description="If provided, return big tasks for this project; otherwise across all accessible projects"
    ),
    mine_only: bool = Query(
        False,
        description="If true, return only the big tasks the current user is a member of"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # — Per-project branch
    if project_id is not None:
        # 1) ensure project exists and guard access
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if project.owner_id != current_user.id:
            pm = (
                db.query(ProjectMember)
                  .filter(
                    ProjectMember.project_id == project_id,
                    ProjectMember.user_id    == current_user.id
                  )
                  .first()
            )
            if not pm:
                raise HTTPException(status_code=403, detail="Not authorized to view big tasks here")

        # 2) base query for this project
        query = (
            db.query(BigTaskModel)
              .options(
                joinedload(BigTaskModel.tasks),
                joinedload(BigTaskModel.members)
              )
              .filter(BigTaskModel.project_id == project_id)
        )

        # 3) apply mine_only if requested and user is not owner
        if mine_only and project.owner_id != current_user.id:
            query = (
                query
                  .join(
                    BigTaskMember,
                    BigTaskMember.big_task_id == BigTaskModel.id
                  )
                  .filter(BigTaskMember.user_id == current_user.id)
            )

        return query.all()

    # — Global branch (across all projects user can access)
    # 1) collect accessible project IDs
    owned_ids  = db.query(Project.id).filter(Project.owner_id == current_user.id)
    member_ids = db.query(ProjectMember.project_id).filter(ProjectMember.user_id == current_user.id)
    accessible = owned_ids.union(member_ids).subquery()

    # 2) base query over those projects
    query = (
        db.query(BigTaskModel)
          .options(
            joinedload(BigTaskModel.tasks),
            joinedload(BigTaskModel.members)
          )
          .filter(BigTaskModel.project_id.in_(accessible))
    )

    # 3) if mine_only, restrict to epics where user is a member
    if mine_only:
        query = (
            query
              .join(
                BigTaskMember,
                BigTaskMember.big_task_id == BigTaskModel.id
              )
              .filter(BigTaskMember.user_id == current_user.id)
        )

    return query.all()


# GET one big task ----------------------------------------------------------
@router.get("/{big_task_id}", response_model=BigTask)
def get_big_task(
    big_task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bt = (
        db.query(BigTaskModel)
          .options(joinedload(BigTaskModel.tasks),
                   joinedload(BigTaskModel.members))
          .filter(BigTaskModel.id == big_task_id)
          .first()
    )
    if not bt:
        raise HTTPException(status_code=404, detail="BigTask not found")

    project = db.query(Project).filter(Project.id == bt.project_id).first()

    # project-level guard
    if project.owner_id != current_user.id:
        pm = (
            db.query(ProjectMember)
              .filter(ProjectMember.project_id == project.id,
                      ProjectMember.user_id == current_user.id)
              .first()
        )
        if not pm:
            raise HTTPException(status_code=403, detail="Not authorized to view this big task")

        # enforce Big-Task membership
        btm = (
            db.query(BigTaskMember)
              .filter(BigTaskMember.big_task_id == big_task_id,
                      BigTaskMember.user_id == current_user.id)
              .first()
        )
        if not btm:
            raise HTTPException(status_code=403, detail="Not a member of this big task")

    return bt


# UPDATE -------------------------------------------------------------------
@router.put("/{big_task_id}", response_model=BigTask)
def update_big_task(
    big_task_id: int,
    big_task_in: BigTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bt = db.query(BigTaskModel).filter(BigTaskModel.id == big_task_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="BigTask not found")

    project = db.query(Project).filter(Project.id == bt.project_id).first()

    # project-level guard
    if project.owner_id != current_user.id:
        pm = (
            db.query(ProjectMember)
              .filter(ProjectMember.project_id == project.id,
                      ProjectMember.user_id == current_user.id)
              .first()
        )
        if not pm:
            raise HTTPException(status_code=403, detail="Not authorized to update this big task")

        # enforce Big-Task membership
        btm = (
            db.query(BigTaskMember)
              .filter(BigTaskMember.big_task_id == big_task_id,
                      BigTaskMember.user_id == current_user.id)
              .first()
        )
        if not btm:
            raise HTTPException(status_code=403, detail="Not a member of this big task")

    # apply updates
    bt.title       = big_task_in.title
    bt.description = big_task_in.description
    bt.status      = big_task_in.status
    bt.priority    = big_task_in.priority
    bt.due_date    = big_task_in.due_date

    db.commit()
    db.refresh(bt)
    return bt

@router.delete("/{big_task_id}")
def delete_big_task(
    big_task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bt = db.query(BigTaskModel).filter(BigTaskModel.id == big_task_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="BigTask not found")

    project = db.query(Project).filter(Project.id == bt.project_id).first()

    # project-level guard
    if project.owner_id != current_user.id:
        pm = (
            db.query(ProjectMember)
              .filter(
                  ProjectMember.project_id == project.id,
                  ProjectMember.user_id == current_user.id,
              )
              .first()
        )
        if not pm:
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this big task"
            )

        # big-task membership guard
        btm = (
            db.query(BigTaskMember)
              .filter(
                  BigTaskMember.big_task_id == big_task_id,
                  BigTaskMember.user_id == current_user.id,
              )
              .first()
        )
        if not btm:
            raise HTTPException(
                status_code=403, detail="Not a member of this big task"
            )

    # ─── guard: deny deletion if tasks still exist ───
    task_count = db.query(Task).filter(Task.big_task_id == big_task_id).count()
    _assert_can_delete(task_count)          # ← now uses the helper
    # ────────────────────────────────────────────────

    db.delete(bt)
    db.commit()
    return {"detail": "BigTask deleted successfully"}