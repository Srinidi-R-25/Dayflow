import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Employee, User, AuditLog
from app.schemas.schemas import EmployeeResponse, EmployeeCreate, EmployeeUpdate, SalarySchema
from app.auth.security import get_current_user, get_password_hash

router = APIRouter(tags=["Employees"])

def map_employee_response(emp: Employee) -> EmployeeResponse:
    return EmployeeResponse(
        id=emp.id,
        employee_id=emp.employee_id,
        name=emp.name,
        email=emp.email,
        role=emp.role,
        department=emp.department,
        designation=emp.designation,
        joining_date=emp.joining_date,
        phone=emp.phone,
        address=emp.address,
        avatar_url=emp.avatar_url,
        status=emp.status,
        salary=SalarySchema(
            basic_pay=emp.basic_pay,
            hra=emp.hra,
            allowances=emp.allowances,
            deductions=emp.deductions,
            net_salary=emp.net_salary,
        )
    )

@router.get("/employees", response_model=List[EmployeeResponse])
def get_all_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    return [map_employee_response(e) for e in employees]

@router.get("/employees/{id}", response_model=EmployeeResponse)
def get_employee(id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter((Employee.id == id) | (Employee.employee_id == id)).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return map_employee_response(emp)

@router.post("/employees", response_model=EmployeeResponse)
def create_employee(req: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(Employee.employee_id == req.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    emp_id = f"emp-{uuid.uuid4().hex[:8]}"

    new_user = User(
        id=user_id,
        employee_id=req.employee_id,
        email=req.email,
        hashed_password=get_password_hash("password123"),
        role=req.role,
        is_verified=True,
    )
    db.add(new_user)

    emp = Employee(
        id=emp_id,
        user_id=user_id,
        employee_id=req.employee_id,
        name=req.name,
        email=req.email,
        role=req.role,
        department=req.department,
        designation=req.designation,
        joining_date=req.joining_date,
        phone=req.phone,
        address=req.address,
        avatar_url=req.avatar_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        status=req.status,
        basic_pay=6000.0,
        hra=2400.0,
        allowances=1000.0,
        deductions=700.0,
        net_salary=8700.0,
    )
    db.add(emp)

    # Audit log
    log = AuditLog(
        id=f"log-{uuid.uuid4().hex[:8]}",
        actor_id="admin",
        action="CREATE_EMPLOYEE",
        target_entity=emp.employee_id,
        description=f"Created new employee {emp.name} ({emp.employee_id})"
    )
    db.add(log)
    db.commit()

    return map_employee_response(emp)

@router.put("/employees/{id}", response_model=EmployeeResponse)
def update_employee(id: str, req: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter((Employee.id == id) | (Employee.employee_id == id)).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if req.name is not None: emp.name = req.name
    if req.phone is not None: emp.phone = req.phone
    if req.address is not None: emp.address = req.address
    if req.avatar_url is not None: emp.avatar_url = req.avatar_url
    if req.department is not None: emp.department = req.department
    if req.designation is not None: emp.designation = req.designation
    if req.role is not None: emp.role = req.role
    if req.status is not None: emp.status = req.status

    if req.basic_pay is not None: emp.basic_pay = req.basic_pay
    if req.hra is not None: emp.hra = req.hra
    if req.allowances is not None: emp.allowances = req.allowances
    if req.deductions is not None: emp.deductions = req.deductions
    emp.net_salary = emp.basic_pay + emp.hra + emp.allowances - emp.deductions

    db.commit()
    db.refresh(emp)
    return map_employee_response(emp)

@router.get("/profile", response_model=EmployeeResponse)
def get_current_profile(current_user: Optional[User] = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        # Default fallback
        emp = db.query(Employee).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Profile not found")
        return map_employee_response(emp)
    
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Profile not found")
    return map_employee_response(emp)

@router.put("/profile", response_model=EmployeeResponse)
def update_profile(req: EmployeeUpdate, current_user: Optional[User] = Depends(get_current_user), db: Session = Depends(get_db)):
    emp = None
    if current_user:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        emp = db.query(Employee).first()
    
    if not emp:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Section 3.3.2 rule: Employees can edit only phone, address, profile picture
    if req.phone is not None: emp.phone = req.phone
    if req.address is not None: emp.address = req.address
    if req.avatar_url is not None: emp.avatar_url = req.avatar_url

    db.commit()
    db.refresh(emp)
    return map_employee_response(emp)
