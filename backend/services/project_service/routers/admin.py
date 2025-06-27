# service/project_service/routers/admin.py
# services/project_service/routers/admin.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from common.database import get_db
from common.schemas.project_schema  import Project
from common.schemas.big_task_schema import BigTask
from common.schemas.task_schema     import Task
from common.models.project          import Project as ProjectDB
from common.models.big_task         import BigTask as BigTaskDB
from common.models.task             import Task as TaskDB
from common.security.dependencies  import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    # ensure every request is authenticated
    dependencies=[Depends(get_current_user)],
)

def require_admin(request: Request):
    """
    Dependency that raises 403 unless request.state.is_admin is True.
    FastAPI will inject the Request here automatically.
    """
    if not getattr(request.state, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin role required")


@router.get(
    "/projects",
    response_model=List[Project],
    dependencies=[Depends(require_admin)],  # <-- enforce admin
)
def list_all_projects(db: Session = Depends(get_db)):
    """Return EVERY project in the system (admin-only)."""
    return db.query(ProjectDB).all()


@router.get(
    "/big-tasks",
    response_model=List[BigTask],
    dependencies=[Depends(require_admin)],
)
def list_all_big_tasks(db: Session = Depends(get_db)):
    return db.query(BigTaskDB).all()


@router.get(
    "/tasks",
    response_model=List[Task],
    dependencies=[Depends(require_admin)],
)
def list_all_tasks(db: Session = Depends(get_db)):
    return db.query(TaskDB).all()
