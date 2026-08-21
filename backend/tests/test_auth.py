def test_signup(client):
    response = client.post("/api/v1/auth/signup", json={
        "employee_id": "EMP100",
        "email": "testuser@dayflow.com",
        "password": "Password123!",
        "role": "Employee"
    })
    assert response.status_code == 201
    assert "Verification token created" in response.json()["message"]

def test_login_success(client, create_test_user):
    user, _ = create_test_user(email="login@test.com", password="secretpassword")
    response = client.post("/api/v1/auth/login", json={
        "email": "login@test.com",
        "password": "secretpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "login@test.com"

def test_login_invalid_password(client, create_test_user):
    create_test_user(email="login2@test.com", password="secretpassword")
    response = client.post("/api/v1/auth/login", json={
        "email": "login2@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_logout(client, create_test_user):
    _, token = create_test_user()
    response = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
