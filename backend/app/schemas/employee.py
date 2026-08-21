from typing import Optional, List, Any
from datetime import date
from pydantic import BaseModel, EmailStr
from app.schemas.profile import ProfileResponse

class EmployeeListItem(BaseModel):
    id: int
    employee_id: str
    email: str
    role: str
    is_verified: bool
    full_name: str
    department: str
    designation: str
    phone: str
    profile_picture: str

    class Config:
        from_attributes = True

class EmployeeAdminCreate(BaseModel):
    employee_id: str
    email: EmailStr
    password: str
    role: str = "Employee"
    full_name: Optional[str] = ""
    department: Optional[str] = "General"
    designation: Optional[str] = "Staff"
    phone: Optional[str] = ""
    address: Optional[str] = ""

class EmployeeAdminUpdate(BaseModel):
    role: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    is_verified: Optional[bool] = None
