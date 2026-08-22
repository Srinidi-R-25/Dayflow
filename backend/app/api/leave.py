from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, LeaveRequest, Notification
from app.schemas.leave import LeaveApplyRequest, LeaveApprovalRequest, LeaveResponse
from app.api.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/leave", tags=["Leave & Time-off"])

def format_leave_response(leave: LeaveRequest, user: User) -> LeaveResponse:
    p = user.profile
    full_name = p.full_name if p and p.full_name else user.email.split("@")[0].capitalize()
    return LeaveResponse(
        id=leave.id,
        user_id=user.id,
        employee_id=user.employee_id,
        full_name=full_name,
        leave_type=leave.leave_type,
        start_date=leave.start_date,
        end_date=leave.end_date,
        remarks=leave.remarks or "",
        status=leave.status,
        admin_comments=leave.admin_comments,
        created_at=leave.created_at
    )

@router.post("/apply", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
def apply_leave(
    payload: LeaveApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be earlier than start date"
        )
    
    new_leave = LeaveRequest(
        user_id=current_user.id,
        leave_type=payload.leave_type if payload.leave_type in ["Paid", "Sick", "Unpaid"] else "Paid",
        start_date=payload.start_date,
        end_date=payload.end_date,
        remarks=payload.remarks,
        status="Pending"
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)

    # Notify HR/Admins
    admins = db.query(User).filter(User.role.in_(["HR", "Admin"])).all()
    for admin in admins:
        db.add(Notification(
            user_id=admin.id,
            title="New Leave Request",
            message=f"{current_user.employee_id} submitted a {payload.leave_type} leave request from {payload.start_date} to {payload.end_date}."
        ))
    db.commit()

    return format_leave_response(new_leave, current_user)

@router.get("/my-leaves", response_model=List[LeaveResponse])
def get_my_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.user_id == current_user.id
    ).order_by(LeaveRequest.created_at.desc()).all()

    return [format_leave_response(l, current_user) for l in leaves]

@router.get("/admin/all", response_model=List[LeaveResponse])
def get_all_leaves(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    query = db.query(LeaveRequest)
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
    leaves = query.order_by(LeaveRequest.created_at.desc()).all()

    result = []
    for l in leaves:
        user = db.query(User).filter(User.id == l.user_id).first()
        if user:
            result.append(format_leave_response(l, user))
    return result

@router.put("/{leave_id}/approve", response_model=LeaveResponse)
def approve_leave(
    leave_id: int,
    payload: LeaveApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave.status = "Approved"
    if payload.admin_comments is not None:
        leave.admin_comments = payload.admin_comments

    # Send notification to applicant
    db.add(Notification(
        user_id=leave.user_id,
        title="Leave Approved",
        message=f"Your leave request ({leave.leave_type}: {leave.start_date} to {leave.end_date}) was approved by HR."
    ))
    db.commit()
    db.refresh(leave)

    user = db.query(User).filter(User.id == leave.user_id).first()
    return format_leave_response(leave, user)

@router.put("/{leave_id}/reject", response_model=LeaveResponse)
def reject_leave(
    leave_id: int,
    payload: LeaveApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["HR", "Admin"]))
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave.status = "Rejected"
    if payload.admin_comments is not None:
        leave.admin_comments = payload.admin_comments

    # Send notification to applicant
    db.add(Notification(
        user_id=leave.user_id,
        title="Leave Rejected",
        message=f"Your leave request ({leave.leave_type}: {leave.start_date} to {leave.end_date}) was rejected by HR."
    ))
    db.commit()
    db.refresh(leave)

    user = db.query(User).filter(User.id == leave.user_id).first()
    return format_leave_response(leave, user)
