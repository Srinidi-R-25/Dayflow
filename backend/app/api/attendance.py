from typing import List, Optional
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Attendance
from app.schemas.attendance import (
    AttendanceResponse, DailyAttendanceSummary, WeeklyAttendanceSummary
)
from app.api.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def format_attendance_response(att: Attendance, user: User) -> AttendanceResponse:
    p = user.profile
    full_name = p.full_name if p and p.full_name else user.email.split("@")[0].capitalize()
    return AttendanceResponse(
        id=att.id,
        user_id=user.id,
        employee_id=user.employee_id,
        full_name=full_name,
        date=att.date,
        check_in=att.check_in,
        check_out=att.check_out,
        work_hours=round(att.work_hours, 2),
        status=att.status
    )

@router.post("/check-in", response_model=AttendanceResponse)
def check_in(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    att = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.date == today
    ).first()

    now = datetime.utcnow()
    if not att:
        att = Attendance(
            user_id=current_user.id,
            date=today,
            check_in=now,
            status="Present"
        )
        db.add(att)
    else:
        if att.check_in is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked in for today"
            )
        att.check_in = now
        att.status = "Present"

    db.commit()
    db.refresh(att)
    return format_attendance_response(att, current_user)

@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    att = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.date == today
    ).first()

    if not att or not att.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check out without checking in first"
        )

    now = datetime.utcnow()
    att.check_out = now
    
    # Calculate duration
    duration_seconds = (now - att.check_in).total_seconds()
    hours = max(0.0, duration_seconds / 3600.0)
    att.work_hours = hours

    if hours >= 6.0:
        att.status = "Present"
    elif hours > 0.0:
        att.status = "Half-day"
    else:
        att.status = "Absent"

    db.commit()
    db.refresh(att)
    return format_attendance_response(att, current_user)

@router.get("/daily", response_model=DailyAttendanceSummary)
def get_daily_attendance(
    target_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query_date = target_date or date.today()
    att = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.date == query_date
    ).first()

    return DailyAttendanceSummary(
        date=query_date,
        attendance=format_attendance_response(att, current_user) if att else None
    )

@router.get("/weekly", response_model=WeeklyAttendanceSummary)
def get_weekly_attendance(
    start_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    end = start_date or date.today()
    start = end - timedelta(days=6)

    records = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.date >= start,
        Attendance.date <= end
    ).all()

    total_hours = sum(r.work_hours for r in records)
    days_present = sum(1 for r in records if r.status in ["Present", "Half-day"])
    days_absent = sum(1 for r in records if r.status == "Absent")

    formatted_records = [format_attendance_response(r, current_user) for r in records]

    return WeeklyAttendanceSummary(
        start_date=start,
        end_date=end,
        total_hours=round(total_hours, 2),
        days_present=days_present,
        days_absent=days_absent,
        records=formatted_records
    )

@router.get("/admin/all", response_model=List[AttendanceResponse])
def get_admin_attendance(
    target_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    query_date = target_date or date.today()
    records = db.query(Attendance).filter(Attendance.date == query_date).all()
    
    result = []
    for r in records:
        user = db.query(User).filter(User.id == r.user_id).first()
        if user:
            result.append(format_attendance_response(r, user))
    return result
