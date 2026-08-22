import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Employee
from app.schemas.schemas import SignupRequest, LoginRequest, TokenResponse, UserSchema
from app.auth.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    # Check duplicate email or employee_id
    existing_user = db.query(User).filter((User.email == req.email) | (User.employee_id == req.employee_id)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email or Employee ID already exists."
        )

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    emp_id = f"emp-{uuid.uuid4().hex[:8]}"
    hashed_pwd = get_password_hash(req.password)

    new_user = User(
        id=user_id,
        employee_id=req.employee_id,
        email=req.email,
        hashed_password=hashed_pwd,
        role=req.role,
        is_verified=True,
    )
    db.add(new_user)

    # Create associated Employee profile
    name = req.full_name or req.email.split("@")[0].replace(".", " ").title()
    new_employee = Employee(
        id=emp_id,
        user_id=user_id,
        employee_id=req.employee_id,
        name=name,
        email=req.email,
        role=req.role,
        department="General",
        designation="Team Member" if req.role == "EMPLOYEE" else "HR Administrator",
        joining_date="2026-08-01",
        phone="+1 (555) 000-0000",
        address="Dayflow Enterprise HQ",
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        status="ACTIVE",
        basic_pay=6000.0,
        hra=2400.0,
        allowances=1000.0,
        deductions=700.0,
        net_salary=8700.0,
    )
    db.add(new_employee)
    db.commit()

    token = create_access_token({"sub": user_id, "role": req.role})
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        employee_id=req.employee_id,
        email=req.email,
        role=req.role,
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        employee_id=user.employee_id,
        email=user.email,
        role=user.role,
    )

@router.post("/verify-email")
def verify_email():
    return {"status": "success", "message": "Email verified successfully."}

@router.post("/logout")
def logout():
    return {"status": "success", "message": "Logged out successfully."}
