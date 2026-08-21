from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    employee_id: str = Field(..., example="EMP001")
    email: EmailStr = Field(..., example="employee@dayflow.com")
    password: str = Field(..., min_length=6, example="SecurePass123!")
    role: str = Field(default="Employee", example="Employee")  # "Employee" or "HR" / "Admin"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    employee_id: str
    email: str
    role: str
    is_verified: bool

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class MessageResponse(BaseModel):
    message: str
