# notification_service/routers/notifications.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from common.database import get_db
from common.security.dependencies import get_current_user
from common.models.user import User
from common.models.notification import Notification

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/", response_model=list[dict])
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all notifications for the current user.
    If `unread_only=True`, return only the unread ones,
    and immediately mark them as read in the database.
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.read.is_(False))

    notes = query.order_by(Notification.created_at.desc()).all()

    if unread_only and notes:
        for note in notes:
            note.read = True
        db.commit()

    return [
        {
            "id":         n.id,
            "message":    n.message,
            "read":       n.read,
            "created_at": n.created_at,
        }
        for n in notes
    ]


@router.post("/{note_id}/read", response_model=dict)
def mark_read(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a single notification as read.
    """
    note = (
        db.query(Notification)
        .filter(Notification.id == note_id, Notification.user_id == current_user.id)
        .first()
    )
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    note.read = True
    db.commit()
    return {"detail": "marked as read"}


@router.post("/read_all", response_model=dict)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark *all* unread notifications for the current user as read.
    """
    # fetch only unread
    unread_notes = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.read.is_(False))
        .all()
    )

    # nothing to do
    if not unread_notes:
        return {"detail": "no unread notifications"}

    # mark them
    for note in unread_notes:
        note.read = True
    db.commit()

    return {
        "detail": f"marked {len(unread_notes)} notification(s) as read"
    }
