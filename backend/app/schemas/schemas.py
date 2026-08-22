from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Auth Schemas
class SignupRequest(BaseModel):
    employee_id: str
    full_name: Optional[str] = None
    email: EmailStr
    password: str
    role: str = "EMPLOYEE"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    employee_id: str
    email: str
    role: str

class UserSchema(BaseModel):
    id: str
    employee_id: str
    email: str
    role: str
    is_verified: bool

    class Config:
        from_attributes = True

# Salary Schema
class SalarySchema(BaseModel):
    basic_pay: float
    hra: float
    allowances: float
    deductions: float
    net_salary: float

    class Config:
        from_attributes = True

# Employee Schema
class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    email: str
    role: str = "EMPLOYEE"
    department: str
    designation: str
    joining_date: str
    phone: str
    address: str
    avatar_url: Optional[str] = None
    status: str = "ACTIVE"

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    basic_pay: Optional[float] = None
    hra: Optional[float] = None
    allowances: Optional[float] = None
    deductions: Optional[float] = None

class EmployeeResponse(EmployeeBase):
    id: str
    salary: SalarySchema

    class Config:
        from_attributes = True

# Attendance Schemas
class CheckInRequest(BaseModel):
    employee_id: str

class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    date: str
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    work_hours: Optional[float] = 0.0
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Leave Schemas
class LeaveCreateRequest(BaseModel):
    employee_id: str
    leave_type: str
    start_date: str
    end_date: str
    reason: str

class LeaveReviewRequest(BaseModel):
    admin_comment: Optional[str] = None

class LeaveResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    department: str
    leave_type: str
    start_date: str
    end_date: str
    total_days: int
    reason: str
    status: str
    applied_date: str
    admin_comment: Optional[str] = None
    reviewed_by: Optional[str] = None

    class Config:
        from_attributes = True

# Payroll Schemas
class PayrollUpdateSchema(BaseModel):
    basic_pay: float
    hra: float
    allowances: float
    deductions: float

class PayrollResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    department: str
    month: str
    basic_pay: float
    hra: float
    allowances: float
    deductions: float
    net_salary: float
    payment_status: str
    pay_date: Optional[str] = None

    class Config:
        from_attributes = True

# Notification Schema
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    timestamp: str
    read: bool

    class Config:
        from_attributes = True
