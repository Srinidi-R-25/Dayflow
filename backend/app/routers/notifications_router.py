from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(user_id: str = "EMP001", db: Session = Depends(get_db)):
    return db.query(Notification).filter((Notification.user_id == user_id) | (Notification.user_id == "ALL")).order_by(Notification.timestamp.desc()).all()

@router.put("/{id}/read")
def mark_read(id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"status": "success"}

@router.put("/read-all")
def mark_all_read(user_id: str = "EMP001", db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user_id).update({"read": True})
    db.commit()
    return {"status": "success"}
