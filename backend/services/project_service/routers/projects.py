# app/routes/projects.py
from fastapi       import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy     import or_

from common.database        import get_db
from common.schemas.project_schema import ProjectCreate, Project
from common.models.project        import Project as ProjectModel
from common.models.project_member import ProjectMember
from common.models.user           import User
from common.security.dependencies     import get_current_user
from common.models.big_task import BigTask  # ensure at top

router = APIRouter()

# ────────────────────────────────  NEW HELPERS  ────────────────────────────────
def _assert_is_owner(owner_id: int, user_id: int, action: str) -> None:
    """
    Raise 403 when `user_id` is not the owner. Pure logic for unit tests.
    """
    if owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to {action} this project",
        )

def _assert_no_big_tasks(task_count: int) -> None:
    """
    Raise 400 if the project still has big tasks attached.
    """
    if task_count > 0:
        raise HTTPException(
            status_code=400,
            detail="You must delete or move all big tasks in this project before deleting the project.",
        )
# ───────────────────────────────────────────────────────────────────────────────


@router.post("/", response_model=Project)
def create_project(
    project_in:   ProjectCreate,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    new_project = ProjectModel(
        title       = project_in.title,
        description = project_in.description,
        status      = project_in.status,
        due_date    = project_in.due_date,
        owner_id    = current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/", response_model=list[Project])
def get_projects(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    return (
        db.query(ProjectModel)
          .options(joinedload(ProjectModel.owner))
          .outerjoin(ProjectMember, ProjectModel.id == ProjectMember.project_id)
          .filter(
              or_(
                  ProjectModel.owner_id == current_user.id,
                  ProjectMember.user_id == current_user.id
              )
          )
          .all()
    )


@router.get("/{project_id}", response_model=Project)
def get_project(
    project_id:   int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id    == current_user.id
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Not authorized to access this project")
    return project


@router.put("/{project_id}", response_model=Project)
def update_project(
    project_id:   int,
    project_in:   ProjectCreate,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    _assert_is_owner(project.owner_id, current_user.id, "update")   # ← helper

    project.title       = project_in.title
    project.description = project_in.description
    project.status      = project_in.status
    project.due_date    = project_in.due_date

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(
    project_id:   int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    _assert_is_owner(project.owner_id, current_user.id, "delete")   # ← helper

    # guard: deny deletion if big tasks still exist
    big_task_count = db.query(BigTask).filter(BigTask.project_id == project_id).count()
    _assert_no_big_tasks(big_task_count)                            # ← helper

    db.query(ProjectMember).filter(ProjectMember.project_id == project_id).delete(synchronize_session=False)
    db.delete(project)
    db.commit()
    return {"detail": "Project deleted successfully"}
