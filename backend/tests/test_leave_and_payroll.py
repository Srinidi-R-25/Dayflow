from datetime import date, timedelta

def test_leave_application_and_approval(client, create_test_user):
    emp, emp_token = create_test_user(employee_id="EMP_LEAVE", email="leave_emp@test.com", role="Employee")
    hr, hr_token = create_test_user(employee_id="HR_LEAVE", email="leave_hr@test.com", role="HR")

    today = date.today()
    next_week = today + timedelta(days=5)

    # Apply leave
    apply_resp = client.post("/api/v1/leave/apply", json={
        "leave_type": "Paid",
        "start_date": str(today),
        "end_date": str(next_week),
        "remarks": "Vacation"
    }, headers={"Authorization": f"Bearer {emp_token}"})

    assert apply_resp.status_code == 201
    leave_id = apply_resp.json()["id"]
    assert apply_resp.json()["status"] == "Pending"

    # Approve leave as HR
    approve_resp = client.put(f"/api/v1/leave/{leave_id}/approve", json={
        "admin_comments": "Approved. Enjoy!"
    }, headers={"Authorization": f"Bearer {hr_token}"})

    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "Approved"
    assert approve_resp.json()["admin_comments"] == "Approved. Enjoy!"

def test_payroll_access_control(client, create_test_user):
    emp, emp_token = create_test_user(employee_id="EMP_PAY", email="pay_emp@test.com", role="Employee")
    hr, hr_token = create_test_user(employee_id="HR_PAY", email="pay_hr@test.com", role="HR")

    # Employee views own payroll
    my_pay = client.get("/api/v1/payroll/me", headers={"Authorization": f"Bearer {emp_token}"})
    assert my_pay.status_code == 200

    # Employee forbidden from accessing admin all payroll
    forbidden_pay = client.get("/api/v1/payroll/admin/all", headers={"Authorization": f"Bearer {emp_token}"})
    assert forbidden_pay.status_code == 403

    # HR accesses admin payroll list
    hr_pay = client.get("/api/v1/payroll/admin/all", headers={"Authorization": f"Bearer {hr_token}"})
    assert hr_pay.status_code == 200
