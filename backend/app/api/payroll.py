from typing import List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Payroll, Notification
from app.schemas.payroll import PayrollResponse, PayrollUpdateRequest
from app.api.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/payroll", tags=["Payroll"])

def format_payroll_response(p: Payroll, user: User) -> PayrollResponse:
    prof = user.profile
    full_name = prof.full_name if prof and prof.full_name else user.email.split("@")[0].capitalize()
    dept = prof.department if prof else "General"
    desig = prof.designation if prof else "Staff"

    return PayrollResponse(
        id=p.id,
        user_id=user.id,
        employee_id=user.employee_id,
        full_name=full_name,
        department=dept,
        designation=desig,
        basic_salary=p.basic_salary,
        allowances=p.allowances,
        deductions=p.deductions,
        net_salary=p.net_salary,
        effective_date=p.effective_date,
        updated_at=p.updated_at or datetime.utcnow()
    )

@router.get("/me", response_model=PayrollResponse)
def get_my_payroll(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    p = current_user.payroll
    if not p:
        p = Payroll(
            user_id=current_user.id,
            basic_salary=3000.0,
            allowances=500.0,
            deductions=200.0,
            net_salary=3300.0
        )
        db.add(p)
        db.commit()
        db.refresh(p)
    return format_payroll_response(p, current_user)

@router.get("/admin/all", response_model=List[PayrollResponse])
def get_all_payrolls(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    payrolls = db.query(Payroll).all()
    result = []
    for p in payrolls:
        u = db.query(User).filter(User.id == p.user_id).first()
        if u:
            result.append(format_payroll_response(p, u))
    return result

@router.put("/admin/{user_id}", response_model=PayrollResponse)
def update_payroll_by_admin(
    user_id: int,
    payload: PayrollUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Employee not found")

    p = target_user.payroll
    if not p:
        p = Payroll(user_id=target_user.id)
        db.add(p)

    p.basic_salary = payload.basic_salary
    p.allowances = payload.allowances
    p.deductions = payload.deductions
    p.net_salary = payload.basic_salary + payload.allowances - payload.deductions
    p.effective_date = date.today()
    p.updated_at = datetime.utcnow()

    # Notify employee
    db.add(Notification(
        user_id=target_user.id,
        title="Salary Structure Updated",
        message=f"Your payroll details were updated by HR. New Net Salary: ${p.net_salary:,.2f}"
    ))
    db.commit()
    db.refresh(p)

    return format_payroll_response(p, target_user)
