import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.models import User, Employee, Attendance, LeaveRequest, Payroll, Document, Notification, Role, Department
from app.auth.security import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains records. Skipping seed.")
        db.close()
        return

    print("Seeding database with Dayflow HRMS initial dataset...")

    # Roles & Departments
    roles = [Role(name="EMPLOYEE"), Role(name="ADMIN")]
    db.add_all(roles)

    depts = [
        Department(name="Engineering", code="ENG"),
        Department(name="Human Resources", code="HR"),
        Department(name="Product Design", code="DES"),
        Department(name="Marketing", code="MKT"),
    ]
    db.add_all(depts)
    db.commit()

    # Demo Accounts
    # 1. Admin
    admin_user = User(
        id="usr-admin",
        employee_id="EMP002",
        email="admin@dayflow.com",
        hashed_password=get_password_hash("password123"),
        role="ADMIN",
        is_verified=True
    )
    admin_emp = Employee(
        id="emp-2",
        user_id="usr-admin",
        employee_id="EMP002",
        name="Sarah Connor",
        email="admin@dayflow.com",
        role="ADMIN",
        department="Human Resources",
        designation="HR Lead & Administrator",
        joining_date="2022-01-10",
        phone="+1 (555) 876-5432",
        address="100 Cyberdyne Way, Austin, TX 78701",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        status="ACTIVE",
        basic_pay=7000.0,
        hra=2800.0,
        allowances=1500.0,
        deductions=900.0,
        net_salary=10400.0
    )
    db.add(admin_user)
    db.add(admin_emp)

    # 2. Regular Employee
    emp_user = User(
        id="usr-employee",
        employee_id="EMP001",
        email="employee@dayflow.com",
        hashed_password=get_password_hash("password123"),
        role="EMPLOYEE",
        is_verified=True
    )
    emp_profile = Employee(
        id="emp-1",
        user_id="usr-employee",
        employee_id="EMP001",
        name="Alex Morgan",
        email="employee@dayflow.com",
        role="EMPLOYEE",
        department="Engineering",
        designation="Senior Frontend Engineer",
        joining_date="2023-03-15",
        phone="+1 (555) 234-5678",
        address="742 Evergreen Terrace, San Francisco, CA 94107",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        status="ACTIVE",
        basic_pay=6500.0,
        hra=2500.0,
        allowances=1200.0,
        deductions=800.0,
        net_salary=9400.0
    )
    db.add(emp_user)
    db.add(emp_profile)

    # 5 Additional Employees
    extra_employees_data = [
        ("EMP003", "Marcus Vance", "marcus.vance@dayflow.com", "Product Design", "Lead UI/UX Designer", 6000.0, 2200.0, 1000.0, 750.0, 8450.0, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"),
        ("EMP004", "Elena Rostova", "elena.rostova@dayflow.com", "Engineering", "Backend Systems Engineer", 6200.0, 2400.0, 1100.0, 780.0, 8920.0, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"),
        ("EMP005", "David Chen", "david.chen@dayflow.com", "Marketing", "Growth Marketing Specialist", 5200.0, 1900.0, 800.0, 600.0, 7300.0, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"),
        ("EMP006", "Jessica Alba", "jessica.alba@dayflow.com", "Engineering", "Full Stack Developer", 6100.0, 2300.0, 950.0, 720.0, 8630.0, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"),
        ("EMP007", "Robert Downey", "robert.downey@dayflow.com", "Marketing", "Brand Strategy Director", 7200.0, 2900.0, 1600.0, 950.0, 10750.0, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"),
    ]

    for idx, (emp_id_str, name, email, dept, desig, b, h, a, d, n, avatar) in enumerate(extra_employees_data, start=3):
        u = User(
            id=f"usr-{emp_id_str.lower()}",
            employee_id=emp_id_str,
            email=email,
            hashed_password=get_password_hash("password123"),
            role="EMPLOYEE",
            is_verified=True
        )
        e = Employee(
            id=f"emp-{idx}",
            user_id=f"usr-{emp_id_str.lower()}",
            employee_id=emp_id_str,
            name=name,
            email=email,
            role="EMPLOYEE",
            department=dept,
            designation=desig,
            joining_date="2023-09-01",
            phone="+1 (555) 000-1111",
            address="Enterprise Tech Park, Suite 100",
            avatar_url=avatar,
            status="ACTIVE",
            basic_pay=b,
            hra=h,
            allowances=a,
            deductions=d,
            net_salary=n
        )
        db.add(u)
        db.add(e)

        # Payroll record
        pay = Payroll(
            id=f"pay-{emp_id_str}",
            employee_id=emp_id_str,
            employee_name=name,
            department=dept,
            month="August 2026",
            basic_pay=b,
            hra=h,
            allowances=a,
            deductions=d,
            net_salary=n,
            payment_status="PAID",
            pay_date="2026-08-01"
        )
        db.add(pay)

    # Attendance initial seed
    today_str = datetime.date.today().isoformat()
    att1 = Attendance(
        id="att-1",
        employee_id="EMP001",
        employee_name="Alex Morgan",
        date=today_str,
        check_in_time="09:02 AM",
        work_hours=4.5,
        status="PRESENT",
        notes="On time"
    )
    att2 = Attendance(
        id="att-2",
        employee_id="EMP002",
        employee_name="Sarah Connor",
        date=today_str,
        check_in_time="08:45 AM",
        work_hours=4.8,
        status="PRESENT"
    )
    db.add_all([att1, att2])

    # Leave requests initial seed
    lv1 = LeaveRequest(
        id="lv-1",
        employee_id="EMP001",
        employee_name="Alex Morgan",
        department="Engineering",
        leave_type="PAID",
        start_date="2026-08-28",
        end_date="2026-08-30",
        total_days=3,
        reason="Family vacation trip planned for weekend.",
        status="PENDING",
        applied_date="2026-08-20"
    )
    lv2 = LeaveRequest(
        id="lv-2",
        employee_id="EMP003",
        employee_name="Marcus Vance",
        department="Product Design",
        leave_type="PAID",
        start_date="2026-08-22",
        end_date="2026-08-23",
        total_days=2,
        reason="Attending Design Leadership Conference.",
        status="APPROVED",
        applied_date="2026-08-15",
        admin_comment="Approved. Enjoy the conference!",
        reviewed_by="Sarah Connor"
    )
    db.add_all([lv1, lv2])

    # Notifications initial seed
    n1 = Notification(
        id="notif-1",
        user_id="EMP001",
        title="Leave Application Received",
        message="Your leave request for Aug 28 - Aug 30 has been submitted for HR review.",
        type="INFO",
        timestamp=datetime.datetime.utcnow().isoformat(),
        read=False
    )
    n2 = Notification(
        id="notif-2",
        user_id="EMP001",
        title="August Salary Credit",
        message="Your monthly net salary of $9,400 has been processed.",
        type="SUCCESS",
        timestamp=datetime.datetime.utcnow().isoformat(),
        read=True
    )
    db.add_all([n1, n2])

    db.commit()
    print("Database seeding completed successfully! Demo accounts ready:")
    print(" - Admin: admin@dayflow.com (Password: password123)")
    print(" - Employee: employee@dayflow.com (Password: password123)")
    db.close()

if __name__ == "__main__":
    seed_db()
