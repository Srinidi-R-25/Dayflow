from typing import List, Dict, Any
from pydantic import BaseModel

class AnalyticsSummaryResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    pending_leaves: int
    total_monthly_payroll: float
    department_distribution: Dict[str, int]
    attendance_rate: float
