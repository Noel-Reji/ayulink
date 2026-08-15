from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    user_id: Optional[str] = None,
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    if user_id:
        query = query.filter(Notification.recipient_user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)

    return query.order_by(Notification.created_at.desc()).limit(30).all()

@router.patch("/{id}/read", response_model=NotificationOut)
def mark_notification_read(id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.post("/mark-all-read")
def mark_all_read(user_id: str, db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.recipient_user_id == user_id).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}
