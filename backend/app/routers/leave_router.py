import datetime
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import LeaveRequest, Employee, Notification, Attendance
from app.schemas.schemas import LeaveResponse, LeaveCreateRequest, LeaveReviewRequest

router = APIRouter(prefix="/leave", tags=["Leave Management"])

def get_today_str() -> str:
    return datetime.date.today().isoformat()

@router.get("", response_model=List[LeaveResponse])
def get_all_leaves(db: Session = Depends(get_db)):
    return db.query(LeaveRequest).order_by(LeaveRequest.applied_date.desc()).all()

@router.get("/employee/{employee_id}", response_model=List[LeaveResponse])
def get_employee_leaves(employee_id: str, db: Session = Depends(get_db)):
    return db.query(LeaveRequest).filter(LeaveRequest.employee_id == employee_id).order_by(LeaveRequest.applied_date.desc()).all()

@router.get("/{id}", response_model=LeaveResponse)
def get_leave(id: str, db: Session = Depends(get_db)):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return leave

@router.post("", response_model=LeaveResponse)
def apply_leave(req: LeaveCreateRequest, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter((Employee.employee_id == req.employee_id) | (Employee.id == req.employee_id)).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Date validation
    start = datetime.datetime.strptime(req.start_date, "%Y-%m-%d")
    end = datetime.datetime.strptime(req.end_date, "%Y-%m-%d")
    if end < start:
        raise HTTPException(status_code=400, detail="Leave end date cannot be before start date.")

    diff_days = (end - start).days + 1

    leave = LeaveRequest(
        id=f"lv-{uuid.uuid4().hex[:8]}",
        employee_id=emp.employee_id,
        employee_name=emp.name,
        department=emp.department,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        total_days=diff_days,
        reason=req.reason,
        status="PENDING",
        applied_date=get_today_str()
    )
    db.add(leave)

    # Notification for employee
    notif = Notification(
        id=f"notif-{uuid.uuid4().hex[:8]}",
        user_id=emp.employee_id,
        title="Leave Request Submitted",
        message=f"Your request for {req.leave_type.lower()} leave ({req.start_date} to {req.end_date}) is pending HR approval.",
        type="INFO",
        timestamp=datetime.datetime.utcnow().isoformat(),
        read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(leave)
    return leave

@router.put("/{id}/approve", response_model=LeaveResponse)
def approve_leave(id: str, req: LeaveReviewRequest, db: Session = Depends(get_db)):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = "APPROVED"
    leave.admin_comment = req.admin_comment or "Approved by HR Administrator"
    leave.reviewed_by = "Sarah Connor"

    # Reflect leave in attendance
    att = Attendance(
        id=f"att-{uuid.uuid4().hex[:8]}",
        employee_id=leave.employee_id,
        employee_name=leave.employee_name,
        date=leave.start_date,
        status="LEAVE",
        work_hours=0.0,
        notes=f"Approved {leave.leave_type} Leave"
    )
    db.add(att)

    # Notify employee
    notif = Notification(
        id=f"notif-{uuid.uuid4().hex[:8]}",
        user_id=leave.employee_id,
        title="Leave Request Approved! 🎉",
        message=f"Your leave request ({leave.start_date} to {leave.end_date}) has been approved.",
        type="SUCCESS",
        timestamp=datetime.datetime.utcnow().isoformat(),
        read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(leave)
    return leave

@router.put("/{id}/reject", response_model=LeaveResponse)
def reject_leave(id: str, req: LeaveReviewRequest, db: Session = Depends(get_db)):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave.status = "REJECTED"
    leave.admin_comment = req.admin_comment or "Request declined by HR Administrator"
    leave.reviewed_by = "Sarah Connor"

    # Notify employee
    notif = Notification(
        id=f"notif-{uuid.uuid4().hex[:8]}",
        user_id=leave.employee_id,
        title="Leave Request Declined",
        message=f"Your leave request ({leave.start_date} to {leave.end_date}) was declined. Note: {leave.admin_comment}",
        type="ALERT",
        timestamp=datetime.datetime.utcnow().isoformat(),
        read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(leave)
    return leave
