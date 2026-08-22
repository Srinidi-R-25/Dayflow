# Import all models here so Alembic can discover them
from app.db.session import Base
from app.models.models import User, Profile, Attendance, LeaveRequest, Payroll, Notification
