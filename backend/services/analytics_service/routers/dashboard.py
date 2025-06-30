# services/analytics_service/routers/dashboard.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import datetime
from dateutil.relativedelta import relativedelta

from common.database import get_db
from common.security.dependencies import get_current_user
from common.models.user import User
from common.models.project import Project
from common.models.project_member import ProjectMember
from common.models.task import Task
from common.models.big_task import BigTask as BigTaskModel

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_summary(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Unpack the single-column query into ints directly
    proj_ids = [
        proj_id
        for (proj_id,) in (
            db.query(Project.id)
            .outerjoin(ProjectMember, ProjectMember.project_id == Project.id)
            .filter(
                or_(
                    Project.owner_id == current_user.id,
                    ProjectMember.user_id == current_user.id
                )
            )
            .all()
        )
    ]

    totals = {
        "projects": len(proj_ids),
        "tasks": db.query(Task).filter(Task.project_id.in_(proj_ids)).count(),
        "epics": db.query(BigTaskModel).filter(BigTaskModel.project_id.in_(proj_ids)).count(),
    }
    dones = {
        "projects": db.query(Project).filter(Project.id.in_(proj_ids), Project.status == "Done").count(),
        "tasks": db.query(Task).filter(Task.project_id.in_(proj_ids), Task.status == "Done").count(),
        "epics": db.query(BigTaskModel)
        .filter(BigTaskModel.project_id.in_(proj_ids),
                BigTaskModel.status == "Done")
        .count(),
    }

    denom = totals["projects"] + totals["tasks"] + totals["epics"]
    numer = dones["projects"] + dones["tasks"] + dones["epics"]

    return {
        "total_projects": totals["projects"],
        "total_tasks": totals["tasks"],
        "total_big_tasks": totals["epics"],
        "done_projects": dones["projects"],
        "done_tasks": dones["tasks"],
        "done_big_tasks": dones["epics"],
        "progress_percentage": round(numer / denom * 100, 2) if denom else 0,
    }


@router.get("/tasks/monthly")
def tasks_monthly(
        months: int = Query(6, ge=1, le=24),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    proj_ids = [
        proj_id
        for (proj_id,) in (
            db.query(Project.id)
            .outerjoin(ProjectMember, ProjectMember.project_id == Project.id)
            .filter(
                or_(
                    Project.owner_id == current_user.id,
                    ProjectMember.user_id == current_user.id
                )
            )
            .all()
        )
    ]

    now = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    keys = [(now - relativedelta(months=i)).strftime("%Y-%m") for i in range(months)][::-1]

    created = db.query(
        func.to_char(Task.created_at, "YYYY-MM").label("m"),
        func.count(Task.id)
    ).filter(Task.project_id.in_(proj_ids)).group_by("m").all()

    completed = db.query(
        func.to_char(Task.created_at, "YYYY-MM").label("m"),
        func.count(Task.id)
    ).filter(Task.project_id.in_(proj_ids), Task.status == "Done").group_by("m").all()

    c_map = {m: n for m, n in created}
    d_map = {m: n for m, n in completed}

    return [
        {"month": k, "created": c_map.get(k, 0), "completed": d_map.get(k, 0)}
        for k in keys
    ]


@router.get("/projects/cumulative")
def projects_cumulative(
        months: int = Query(6, ge=1, le=24),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    proj_ids = [
        proj_id
        for (proj_id,) in (
            db.query(Project.id)
            .outerjoin(ProjectMember, ProjectMember.project_id == Project.id)
            .filter(
                or_(
                    Project.owner_id == current_user.id,
                    ProjectMember.user_id == current_user.id
                )
            )
            .all()
        )
    ]

    now = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    keys = [(now - relativedelta(months=i)).strftime("%Y-%m") for i in range(months)][::-1]

    opened = db.query(
        func.to_char(Project.created_at, "YYYY-MM").label("m"),
        func.count(Project.id)
    ).filter(Project.id.in_(proj_ids)).group_by("m").all()

    closed = db.query(
        func.to_char(Project.created_at, "YYYY-MM").label("m"),
        func.count(Project.id)
    ).filter(Project.id.in_(proj_ids), Project.status == "Done").group_by("m").all()

    o_map = {m: n for m, n in opened}
    c_map = {m: n for m, n in closed}

    return [
        {"month": k, "open": o_map.get(k, 0), "closed": c_map.get(k, 0)}
        for k in keys
    ]
