from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Profile, Attendance, LeaveRequest, Payroll
from app.schemas.analytics import AnalyticsSummaryResponse
from app.api.deps import RoleChecker, get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/dashboard", response_model=AnalyticsSummaryResponse)
def get_analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    total_employees = db.query(User).count()
    
    today = date.today()
    present_today = db.query(Attendance).filter(
        Attendance.date == today,
        Attendance.status.in_(["Present", "Half-day"])
    ).count()

    absent_today = db.query(Attendance).filter(
        Attendance.date == today,
        Attendance.status == "Absent"
    ).count()

    pending_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.status == "Pending"
    ).count()

    payrolls = db.query(Payroll).all()
    total_monthly_payroll = sum(p.net_salary for p in payrolls)

    profiles = db.query(Profile).all()
    dept_dist = {}
    for p in profiles:
        dept = p.department or "Unassigned"
        dept_dist[dept] = dept_dist.get(dept, 0) + 1

    attendance_rate = (present_today / total_employees * 100.0) if total_employees > 0 else 0.0

    return AnalyticsSummaryResponse(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        pending_leaves=pending_leaves,
        total_monthly_payroll=round(total_monthly_payroll, 2),
        department_distribution=dept_dist,
        attendance_rate=round(attendance_rate, 2)
    )
