from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Payroll, Employee
from app.schemas.schemas import PayrollResponse, PayrollUpdateSchema

router = APIRouter(prefix="/payroll", tags=["Payroll"])

@router.get("", response_model=List[PayrollResponse])
def get_all_payroll(db: Session = Depends(get_db)):
    return db.query(Payroll).all()

@router.get("/{employee_id}", response_model=List[PayrollResponse])
def get_employee_payroll(employee_id: str, db: Session = Depends(get_db)):
    return db.query(Payroll).filter(Payroll.employee_id == employee_id).all()

@router.put("/{employee_id}", response_model=PayrollResponse)
def update_employee_salary(employee_id: str, req: PayrollUpdateSchema, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter((Employee.employee_id == employee_id) | (Employee.id == employee_id)).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    net = req.basic_pay + req.hra + req.allowances - req.deductions
    emp.basic_pay = req.basic_pay
    emp.hra = req.hra
    emp.allowances = req.allowances
    emp.deductions = req.deductions
    emp.net_salary = net

    pay = db.query(Payroll).filter(Payroll.employee_id == emp.employee_id).first()
    if pay:
        pay.basic_pay = req.basic_pay
        pay.hra = req.hra
        pay.allowances = req.allowances
        pay.deductions = req.deductions
        pay.net_salary = net
    else:
        pay = Payroll(
            id=f"pay-{emp.employee_id}",
            employee_id=emp.employee_id,
            employee_name=emp.name,
            department=emp.department,
            month="August 2026",
            basic_pay=req.basic_pay,
            hra=req.hra,
            allowances=req.allowances,
            deductions=req.deductions,
            net_salary=net,
            payment_status="PAID"
        )
        db.add(pay)

    db.commit()
    db.refresh(pay)
    return pay
