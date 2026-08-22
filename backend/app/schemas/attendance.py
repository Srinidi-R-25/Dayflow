from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    full_name: str
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    work_hours: float = 0.0
    status: str  # "Present", "Absent", "Half-day", "Leave"

    class Config:
        from_attributes = True

class DailyAttendanceSummary(BaseModel):
    date: date
    attendance: Optional[AttendanceResponse] = None

class WeeklyAttendanceSummary(BaseModel):
    start_date: date
    end_date: date
    total_hours: float
    days_present: int
    days_absent: int
    records: List[AttendanceResponse]
