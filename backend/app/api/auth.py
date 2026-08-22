import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, Profile, Payroll, Notification
from app.schemas.auth import (
    SignupRequest, LoginRequest, TokenResponse, VerifyEmailRequest, 
    ResendVerificationRequest, MessageResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # Check if employee_id already exists
    if db.query(User).filter(User.employee_id == payload.employee_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already registered"
        )
    # Check if email already exists
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate verification token
    verification_token = secrets.token_urlsafe(32)

    new_user = User(
        employee_id=payload.employee_id,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role if payload.role in ["Employee", "HR", "Admin"] else "Employee",
        is_verified=False,
        verification_token=verification_token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize Profile
    new_profile = Profile(
        user_id=new_user.id,
        full_name=payload.email.split("@")[0].capitalize(),
        department="General",
        designation="Staff"
    )
    # Initialize Payroll record
    new_payroll = Payroll(
        user_id=new_user.id,
        basic_salary=3000.0,
        allowances=500.0,
        deductions=200.0,
        net_salary=3300.0
    )
    # Welcome notification
    new_notif = Notification(
        user_id=new_user.id,
        title="Welcome to Dayflow",
        message="Account created successfully. Please verify your email."
    )
    db.add(new_profile)
    db.add(new_payroll)
    db.add(new_notif)
    db.commit()

    return MessageResponse(
        message=f"Signup successful. Verification token created for email testing: {verification_token}"
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        employee_id=user.employee_id,
        email=user.email,
        role=user.role,
        is_verified=user.is_verified
    )

@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == payload.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return MessageResponse(message="Email verified successfully")

@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email not found"
        )
    if user.is_verified:
        return MessageResponse(message="Email is already verified")
    
    user.verification_token = secrets.token_urlsafe(32)
    db.commit()
    return MessageResponse(
        message=f"New verification token generated: {user.verification_token}"
    )

@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    return MessageResponse(message="Successfully logged out")
