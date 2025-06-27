# scheduler_service/jobs.py

from datetime       import datetime, timedelta
from common.database import SessionLocal
from common.models.task    import Task
from common.models.project import Project
from services.notification_service.events import task_overdue, project_due_soon

def overdue_task_check() -> None:
    """
    Find all non-Done tasks whose due_date is in the past,
    and fire off an overdue notification for each.
    """
    with SessionLocal() as db:
        now = datetime.utcnow()
        overdue_tasks = (
            db.query(Task)
              .filter(
                  Task.due_date != None,
                  Task.due_date < now,
                  Task.status   != "Done"
              )
              .all()
        )
        for t in overdue_tasks:
            task_overdue(db, t)

def project_due_soon_check() -> None:
    """
    Find all non-Done projects due within the next 3 days,
    and fire off a “due soon” reminder for each.
    """
    with SessionLocal() as db:
        now  = datetime.utcnow()
        soon = now + timedelta(days=3)
        upcoming = (
            db.query(Project)
              .filter(
                  Project.due_date != None,
                  Project.due_date >= now,
                  Project.due_date <= soon,
                  Project.status   != "Done"
              )
              .all()
        )
        for p in upcoming:
            project_due_soon(db, p)
