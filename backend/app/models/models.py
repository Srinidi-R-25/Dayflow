import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # 'EMPLOYEE', 'ADMIN'

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="EMPLOYEE")
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    employee_profile = relationship("Employee", back_populates="user", uselist=False)

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, default="EMPLOYEE")
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    joining_date = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    
    # Salary fields
    basic_pay = Column(Float, default=6000.0)
    hra = Column(Float, default=2400.0)
    allowances = Column(Float, default=1000.0)
    deductions = Column(Float, default=700.0)
    net_salary = Column(Float, default=8700.0)

    user = relationship("User", back_populates="employee_profile")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False)
    employee_name = Column(String, nullable=True)
    date = Column(String, nullable=False) # YYYY-MM-DD
    check_in_time = Column(String, nullable=True)
    check_out_time = Column(String, nullable=True)
    work_hours = Column(Float, default=0.0)
    status = Column(String, default="PRESENT") # PRESENT, ABSENT, HALF_DAY, LEAVE
    notes = Column(String, nullable=True)

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    leave_type = Column(String, nullable=False) # PAID, SICK, UNPAID
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    total_days = Column(Integer, default=1)
    reason = Column(Text, nullable=False)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    applied_date = Column(String, nullable=False)
    admin_comment = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=True)

class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False)
    employee_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    month = Column(String, nullable=False) # e.g. "August 2026"
    basic_pay = Column(Float, nullable=False)
    hra = Column(Float, nullable=False)
    allowances = Column(Float, nullable=False)
    deductions = Column(Float, nullable=False)
    net_salary = Column(Float, nullable=False)
    payment_status = Column(String, default="PAID")
    pay_date = Column(String, nullable=True)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    upload_date = Column(String, nullable=False)
    size = Column(String, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="INFO")
    timestamp = Column(String, nullable=False)
    read = Column(Boolean, default=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    actor_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    target_entity = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
