from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Attendance, LeaveRequest, Payroll, Employee

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/attendance")
def get_attendance_analytics(db: Session = Depends(get_db)):
    total = db.query(Attendance).count() or 1
    present = db.query(Attendance).filter(Attendance.status == "PRESENT").count()
    absent = db.query(Attendance).filter(Attendance.status == "ABSENT").count()
    leave = db.query(Attendance).filter(Attendance.status == "LEAVE").count()

    return {
        "attendance_trends": [
            {"day": "Mon", "Present": 24, "Absent": 1, "Leave": 1},
            {"day": "Tue", "Present": 25, "Absent": 0, "Leave": 1},
            {"day": "Wed", "Present": 23, "Absent": 2, "Leave": 1},
            {"day": "Thu", "Present": 24, "Absent": 1, "Leave": 1},
            {"day": "Fri", "Present": 22, "Absent": 2, "Leave": 2},
        ],
        "present_percentage": round((present / total) * 100, 1),
        "absent_percentage": round((absent / total) * 100, 1),
        "leave_percentage": round((leave / total) * 100, 1),
    }

@router.get("/leave")
def get_leave_analytics(db: Session = Depends(get_db)):
    total = db.query(LeaveRequest).count()
    pending = db.query(LeaveRequest).filter(LeaveRequest.status == "PENDING").count()
    approved = db.query(LeaveRequest).filter(LeaveRequest.status == "APPROVED").count()
    rejected = db.query(LeaveRequest).filter(LeaveRequest.status == "REJECTED").count()

    return {
        "total_requests": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "leave_distribution": [
            {"name": "Paid Leave", "value": 45, "color": "#4f46e5"},
            {"name": "Sick Leave", "value": 30, "color": "#f59e0b"},
            {"name": "Unpaid Leave", "value": 25, "color": "#ef4444"},
        ]
    }

@router.get("/payroll")
def get_payroll_analytics(db: Session = Depends(get_db)):
    payrolls = db.query(Payroll).all()
    total_salary = sum(p.net_salary for p in payrolls)

    dept_totals = {}
    for p in payrolls:
        dept_totals[p.department] = dept_totals.get(p.department, 0.0) + p.net_salary

    dept_breakdown = [{"department": k, "amount": v} for k, v in dept_totals.items()]

    return {
        "total_salary": total_salary,
        "department_payroll": dept_breakdown or [
            {"department": "Engineering", "amount": 18320},
            {"department": "Human Resources", "amount": 10400},
            {"department": "Product Design", "amount": 8450},
            {"department": "Marketing", "amount": 7300},
        ]
    }
