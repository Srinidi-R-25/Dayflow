from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class PayrollUpdateRequest(BaseModel):
    basic_salary: float
    allowances: float = 0.0
    deductions: float = 0.0

class PayrollResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    full_name: str
    department: str
    designation: str
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    effective_date: date
    updated_at: datetime

    class Config:
        from_attributes = True
