def test_get_profile(client, create_test_user):
    user, token = create_test_user(employee_id="EMP501", email="profile@test.com")
    response = client.get("/api/v1/profile/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == "EMP501"
    assert data["email"] == "profile@test.com"

def test_update_profile(client, create_test_user):
    _, token = create_test_user()
    response = client.put("/api/v1/profile/me", json={
        "full_name": "Updated Name",
        "phone": "+1234567890",
        "address": "123 Tech Street"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["phone"] == "+1234567890"

def test_check_in_and_check_out(client, create_test_user):
    _, token = create_test_user(employee_id="EMP_ATT")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check-in
    response_in = client.post("/api/v1/attendance/check-in", headers=headers)
    assert response_in.status_code == 200
    assert response_in.json()["status"] == "Present"

    # Check-out
    response_out = client.post("/api/v1/attendance/check-out", headers=headers)
    assert response_out.status_code == 200
    assert "work_hours" in response_out.json()
