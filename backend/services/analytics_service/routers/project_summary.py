# analytics_service/routers/project_summary.py
from datetime import datetime

from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from common.database import get_db
from common.models.big_task import BigTask as BigTaskModel
from common.models.project import Project
from common.models.project_member import ProjectMember
from common.models.task import Task
from common.models.user import User
from common.security.dependencies import get_current_user

# All URLs will live under:  /api/analytics/project/…
router = APIRouter(prefix="/projects", tags=["project_summary"])


# ──────────────────────────── helpers ────────────────────────────
def _require_project_access(
    project_id: int, db: Session, current_user: User
) -> Project:
    """
    Make sure the caller owns / is a member of the project.
    Returns the Project record (or raises 404 / 403).
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    if project.owner_id != current_user.id:
        in_team = (
            db.query(ProjectMember)
            .filter(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == current_user.id,
            )
            .first()
        )
        if not in_team:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this project",
            )
    return project


# ──────────────────────────── summary card data ────────────────────────────
@router.get("/{project_id}/summary")
def get_project_summary(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _require_project_access(project_id, db, current_user)

    # 1️⃣  TASK COUNTS --------------------------------------------------------
    status_counts = dict(
        db.query(Task.status, func.count(Task.id))
        .filter(Task.project_id == project_id)
        .group_by(Task.status)
        .all()
    )
    total_tasks = sum(status_counts.values())
    done_tasks = status_counts.get("Done", 0)

    todo_tasks = status_counts.get("To Do", 0)
    in_progress_tasks = status_counts.get("In Progress", 0)
    review_tasks = status_counts.get("Review", 0)

    overdue_tasks = (
        db.query(func.count(Task.id))
        .filter(
            Task.project_id == project_id,
            Task.due_date.isnot(None),
            Task.due_date < datetime.utcnow(),
            Task.status != "Done",
        )
        .scalar()
    )

    progress_pct = round((done_tasks / total_tasks) * 100, 2) if total_tasks else 0

    # 2️⃣  EPIC / BIG-TASK COUNTS -------------------------------------------
    epic_counts = dict(
        db.query(BigTaskModel.status, func.count(BigTaskModel.id))
        .filter(BigTaskModel.project_id == project_id)
        .group_by(BigTaskModel.status)
        .all()
    )
    total_big_tasks = sum(epic_counts.values())
    done_big_tasks = epic_counts.get("Done", 0)

    # 3️⃣  RESPONSE ----------------------------------------------------------
    return {
        "project_id": project.id,
        "project_title": project.title,
        "total_tasks": total_tasks,
        "todo_tasks": todo_tasks,
        "in_progress_tasks": in_progress_tasks,
        "review_tasks": review_tasks,
        "done_tasks": done_tasks,
        "overdue_tasks": overdue_tasks,
        "progress_percentage": progress_pct,
        "total_big_tasks": total_big_tasks,
        "done_big_tasks": done_big_tasks,
    }


# ──────────────────────────── monthly chart data ───────────────────────────
@router.get("/{project_id}/tasks/monthly")
def project_tasks_monthly(
    project_id: int,
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns a list like:
    [
        {"month": "2025-01", "created": 12, "completed": 7},
        …
    ]
    suitable for the area-chart you already wired on the dashboard.
    """
    _require_project_access(project_id, db, current_user)

    # build YYYY-MM keys (oldest → newest)
    now = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    keys = [
        (now - relativedelta(months=i)).strftime("%Y-%m") for i in range(months)
    ][::-1]

    created = (
        db.query(func.to_char(Task.created_at, "YYYY-MM").label("m"), func.count(Task.id))
        .filter(Task.project_id == project_id)
        .group_by("m")
        .all()
    )
    completed = (
        db.query(func.to_char(Task.created_at, "YYYY-MM").label("m"), func.count(Task.id))
        .filter(Task.project_id == project_id, Task.status == "Done")
        .group_by("m")
        .all()
    )

    c_map = {m: n for m, n in created}
    d_map = {m: n for m, n in completed}

    return [
        {"month": k, "created": c_map.get(k, 0), "completed": d_map.get(k, 0)}
        for k in keys
    ]
