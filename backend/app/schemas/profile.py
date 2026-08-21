from typing import Optional, List, Any
from datetime import date
from pydantic import BaseModel

class ProfileBase(BaseModel):
    full_name: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    profile_picture: Optional[str] = ""

class ProfileEmployeeUpdate(ProfileBase):
    pass

class ProfileAdminUpdate(ProfileBase):
    department: Optional[str] = None
    designation: Optional[str] = None
    join_date: Optional[date] = None
    documents: Optional[List[Any]] = None

class PayrollSummary(BaseModel):
    basic_salary: float = 0.0
    allowances: float = 0.0
    deductions: float = 0.0
    net_salary: float = 0.0

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    employee_id: str
    email: str
    role: str
    department: str
    designation: str
    join_date: Optional[date] = None
    documents: List[Any] = []
    payroll: Optional[PayrollSummary] = None

    class Config:
        from_attributes = True
