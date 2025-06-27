# notification_service/events.py

from sqlalchemy.orm import Session
from common.models.notification import Notification
from common.realtime           import push_message
from common.models.user        import User

def _notify(db: Session, user: User, message: str):
    """
    1) Write a Notification row for the given user.
    2) Push real-time over the gateway.
    """
    notification = Notification(user_id=user.id, message=message)
    db.add(notification)
    db.commit()

    push_message(
        user.auth0_id,
        {"type": "notification", "message": message}
    )

def added_to_project(db: Session, project, added_user: User, by_user: User):
    _notify(
        db, added_user,
        f"You were added to project “{project.title}” by {by_user.username}"
    )

def added_to_big_task(db: Session, big_task, added_user: User):
    _notify(
        db, added_user,
        f"You were added to big task “{big_task.title}”"
    )

def task_assigned(db: Session, task, assignee: User):
    _notify(
        db, assignee,
        f"You were assigned a new task: “{task.title}”"
    )

def comment_added(db: Session, task, commenter: User):
    targets = {task.reporter_id}
    if task.assignee_id:
        targets.add(task.assignee_id)
    targets.discard(commenter.id)

    for uid in targets:
        user = db.query(User).filter(User.id == uid).one()
        _notify(
            db, user,
            f"New comment on task “{task.title}” by {commenter.username}"
        )

def task_status_changed(db: Session, task, old_status: str):
    if task.assignee_id:
        user = db.query(User).filter(User.id == task.assignee_id).one()
        _notify(
            db, user,
            f"Your task “{task.title}” status changed from {old_status} to {task.status}"
        )

def project_due_soon(db: Session, project):
    """
    Send “due soon” reminders to every project member and owner,
    but only if they haven’t already received one for this project.
    """
    message = f"Reminder: project “{project.title}” is due soon"
    user_ids = {m.user_id for m in project.members}
    user_ids.add(project.owner_id)

    for uid in user_ids:
        # skip if we've already sent this exact reminder
        exists = (
            db.query(Notification)
              .filter(
                  Notification.user_id == uid,
                  Notification.message == message
              )
              .first()
        )
        if exists:
            continue

        user = db.query(User).filter(User.id == uid).one()
        _notify(db, user, message)

def task_overdue(db: Session, task):
    if task.assignee_id:
        user = db.query(User).filter(User.id == task.assignee_id).one()
        _notify(
            db, user,
            f"Your task “{task.title}” is overdue!"
        )

def promoted_role(db: Session, project, user: User):
    _notify(
        db, user,
        f"You have been granted admin role in “{project.title}”"
    )

def removed_from_project(db: Session, project, user: User):
    _notify(
        db, user,
        f"You have been removed from project “{project.title}”"
    )

def removed_from_big_task(db: Session, big_task, user: User):
    _notify(
        db, user,
        f"You have been removed from big task “{big_task.title}”"
    )
