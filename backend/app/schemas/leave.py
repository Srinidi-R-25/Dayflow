from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field

class LeaveApplyRequest(BaseModel):
    leave_type: str = Field(..., example="Paid")  # "Paid", "Sick", "Unpaid"
    start_date: date
    end_date: date
    remarks: str = ""

class LeaveApprovalRequest(BaseModel):
    admin_comments: Optional[str] = ""

class LeaveResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    full_name: str
    leave_type: str
    start_date: date
    end_date: date
    remarks: str
    status: str  # "Pending", "Approved", "Rejected"
    admin_comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
