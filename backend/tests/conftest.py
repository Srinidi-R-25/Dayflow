import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.models.models import User, Profile, Payroll

TEST_DB_FILE = "./test_dayflow.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        if os.path.exists(TEST_DB_FILE):
            try:
                os.remove(TEST_DB_FILE)
            except OSError:
                pass

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def create_test_user(db_session):
    def _create(employee_id="EMP001", email="emp1@test.com", password="password123", role="Employee", is_verified=True):
        user = User(
            employee_id=employee_id,
            email=email,
            hashed_password=get_password_hash(password),
            role=role,
            is_verified=is_verified
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        profile = Profile(
            user_id=user.id,
            full_name=email.split("@")[0].capitalize(),
            department="Engineering",
            designation="Software Engineer"
        )
        payroll = Payroll(
            user_id=user.id,
            basic_salary=4000.0,
            allowances=600.0,
            deductions=200.0,
            net_salary=4400.0
        )
        db_session.add(profile)
        db_session.add(payroll)
        db_session.commit()

        token = create_access_token(subject=user.id, role=user.role)
        return user, token

    return _create
