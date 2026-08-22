import datetime
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Attendance, Employee
from app.schemas.schemas import AttendanceResponse, CheckInRequest

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def get_today_str() -> str:
    return datetime.date.today().isoformat()

def get_now_time_str() -> str:
    return datetime.datetime.now().strftime("%I:%M %p")

@router.get("", response_model=List[AttendanceResponse])
def get_all_attendance(db: Session = Depends(get_db)):
    return db.query(Attendance).order_by(Attendance.date.desc()).all()

@router.get("/{employee_id}", response_model=List[AttendanceResponse])
def get_employee_attendance(employee_id: str, db: Session = Depends(get_db)):
    return db.query(Attendance).filter(Attendance.employee_id == employee_id).order_by(Attendance.date.desc()).all()

@router.post("/check-in", response_model=AttendanceResponse)
def check_in(req: CheckInRequest, db: Session = Depends(get_db)):
    today = get_today_str()
    emp = db.query(Employee).filter((Employee.employee_id == req.employee_id) | (Employee.id == req.employee_id)).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(Attendance).filter(
        Attendance.employee_id == emp.employee_id,
        Attendance.date == today
    ).first()

    if existing and existing.check_in_time:
        raise HTTPException(
            status_code=400,
            detail="Employee has already checked in for today."
        )

    now_str = get_now_time_str()
    if existing:
        existing.check_in_time = now_str
        existing.status = "PRESENT"
        db.commit()
        db.refresh(existing)
        return existing

    rec = Attendance(
        id=f"att-{uuid.uuid4().hex[:8]}",
        employee_id=emp.employee_id,
        employee_name=emp.name,
        date=today,
        check_in_time=now_str,
        status="PRESENT",
        work_hours=0.0,
        notes="Punched in on time"
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.post("/check-out", response_model=AttendanceResponse)
def check_out(req: CheckInRequest, db: Session = Depends(get_db)):
    today = get_today_str()
    emp = db.query(Employee).filter((Employee.employee_id == req.employee_id) | (Employee.id == req.employee_id)).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(Attendance).filter(
        Attendance.employee_id == emp.employee_id,
        Attendance.date == today
    ).first()

    if not existing or not existing.check_in_time:
        raise HTTPException(
            status_code=400,
            detail="Cannot check out without checking in first."
        )

    if existing.check_out_time:
        raise HTTPException(
            status_code=400,
            detail="Employee has already checked out for today."
        )

    now_str = get_now_time_str()
    existing.check_out_time = now_str
    existing.work_hours = 8.5
    db.commit()
    db.refresh(existing)
    return existing
