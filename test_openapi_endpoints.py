from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_openapi_contains_auth_endpoints():
    response = client.get("/openapi.json")

    assert response.status_code == 200

    paths = response.json()["paths"]

    assert any("auth" in path.lower() for path in paths)


def test_openapi_contains_attendance_endpoints():
    response = client.get("/openapi.json")

    assert response.status_code == 200

    paths = response.json()["paths"]

    assert any("attendance" in path.lower() for path in paths)


def test_openapi_contains_leave_endpoints():
    response = client.get("/openapi.json")

    assert response.status_code == 200

    paths = response.json()["paths"]

    assert any("leave" in path.lower() for path in paths)
