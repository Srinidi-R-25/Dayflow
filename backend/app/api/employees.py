from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Profile, Payroll
from app.schemas.employee import EmployeeListItem, EmployeeAdminCreate, EmployeeAdminUpdate
from app.core.security import get_password_hash
from app.api.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=List[EmployeeListItem])
def list_employees(
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User)
    users = query.all()
    
    result = []
    for user in users:
        p = user.profile
        if department and p and p.department != department:
            continue
        result.append(EmployeeListItem(
            id=user.id,
            employee_id=user.employee_id,
            email=user.email,
            role=user.role,
            is_verified=user.is_verified,
            full_name=p.full_name if p else "",
            department=p.department if p else "General",
            designation=p.designation if p else "Staff",
            phone=p.phone if p else "",
            profile_picture=p.profile_picture if p else ""
        ))
    return result

@router.post("", response_model=EmployeeListItem, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeAdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    if db.query(User).filter(User.employee_id == payload.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        employee_id=payload.employee_id,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_profile = Profile(
        user_id=new_user.id,
        full_name=payload.full_name or payload.email.split("@")[0].capitalize(),
        department=payload.department or "General",
        designation=payload.designation or "Staff",
        phone=payload.phone or "",
        address=payload.address or ""
    )
    new_payroll = Payroll(
        user_id=new_user.id,
        basic_salary=3000.0,
        allowances=500.0,
        deductions=200.0,
        net_salary=3300.0
    )
    db.add(new_profile)
    db.add(new_payroll)
    db.commit()

    return EmployeeListItem(
        id=new_user.id,
        employee_id=new_user.employee_id,
        email=new_user.email,
        role=new_user.role,
        is_verified=new_user.is_verified,
        full_name=new_profile.full_name,
        department=new_profile.department,
        designation=new_profile.designation,
        phone=new_profile.phone,
        profile_picture=new_profile.profile_picture
    )

@router.put("/{user_id}", response_model=EmployeeListItem)
def update_employee(
    user_id: int,
    payload: EmployeeAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if payload.role is not None:
        user.role = payload.role
    if payload.is_verified is not None:
        user.is_verified = payload.is_verified

    p = user.profile
    if not p:
        p = Profile(user_id=user.id)
        db.add(p)
    
    if payload.full_name is not None:
        p.full_name = payload.full_name
    if payload.department is not None:
        p.department = payload.department
    if payload.designation is not None:
        p.designation = payload.designation
    if payload.phone is not None:
        p.phone = payload.phone
    if payload.address is not None:
        p.address = payload.address
    if payload.profile_picture is not None:
        p.profile_picture = payload.profile_picture

    db.commit()
    db.refresh(user)

    return EmployeeListItem(
        id=user.id,
        employee_id=user.employee_id,
        email=user.email,
        role=user.role,
        is_verified=user.is_verified,
        full_name=p.full_name,
        department=p.department,
        designation=p.designation,
        phone=p.phone,
        profile_picture=p.profile_picture
    )
