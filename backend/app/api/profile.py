from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, Profile, Payroll
from app.schemas.profile import (
    ProfileResponse, ProfileEmployeeUpdate, ProfileAdminUpdate, PayrollSummary
)
from app.api.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/profile", tags=["Profile"])

def build_profile_response(user: User) -> ProfileResponse:
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id)
    
    payroll_summary = None
    if user.payroll:
        payroll_summary = PayrollSummary(
            basic_salary=user.payroll.basic_salary,
            allowances=user.payroll.allowances,
            deductions=user.payroll.deductions,
            net_salary=user.payroll.net_salary
        )

    return ProfileResponse(
        id=profile.id if profile else 0,
        user_id=user.id,
        employee_id=user.employee_id,
        email=user.email,
        role=user.role,
        full_name=profile.full_name if profile else "",
        phone=profile.phone if profile else "",
        address=profile.address if profile else "",
        department=profile.department if profile else "General",
        designation=profile.designation if profile else "Staff",
        join_date=profile.join_date if profile else None,
        profile_picture=profile.profile_picture if profile else "",
        documents=profile.documents if profile and profile.documents else [],
        payroll=payroll_summary
    )

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return build_profile_response(current_user)

@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    payload: ProfileEmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    if payload.full_name is not None:
        profile.full_name = payload.full_name
    if payload.phone is not None:
        profile.phone = payload.phone
    if payload.address is not None:
        profile.address = payload.address
    if payload.profile_picture is not None:
        profile.profile_picture = payload.profile_picture

    db.commit()
    db.refresh(profile)
    return build_profile_response(current_user)

@router.get("/{user_id}", response_model=ProfileResponse)
def get_profile_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only Admin/HR or the user themselves can view this
    if current_user.role not in ["HR", "Admin"] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return build_profile_response(target_user)

@router.put("/{user_id}", response_model=ProfileResponse)
def update_profile_by_admin(
    user_id: int,
    payload: ProfileAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    profile = target_user.profile
    if not profile:
        profile = Profile(user_id=target_user.id)
        db.add(profile)
    
    if payload.full_name is not None:
        profile.full_name = payload.full_name
    if payload.phone is not None:
        profile.phone = payload.phone
    if payload.address is not None:
        profile.address = payload.address
    if payload.profile_picture is not None:
        profile.profile_picture = payload.profile_picture
    if payload.department is not None:
        profile.department = payload.department
    if payload.designation is not None:
        profile.designation = payload.designation
    if payload.join_date is not None:
        profile.join_date = payload.join_date
    if payload.documents is not None:
        profile.documents = payload.documents

    db.commit()
    db.refresh(profile)
    return build_profile_response(target_user)
