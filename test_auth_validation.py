from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_endpoint_exists():
    response = client.post(
        "/auth/login",
        json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
    )

    # Endpoint should respond and should not return 404
    assert response.status_code != 404


def test_signup_endpoint_exists():
    response = client.post(
        "/auth/signup",
        json={
            "email": "test@example.com",
            "password": "TestPassword123"
        }
    )

    # Endpoint should respond and should not return 404
    assert response.status_code != 404
