# Dayflow - Human Resource Management System

## Database Module

This file contains the database configuration and initialization for the **Dayflow Human Resource Management System (HRMS)**.

The database is built using **SQLite** with the `better-sqlite3` package.

## Technologies Used

* Node.js
* SQLite
* better-sqlite3
* bcryptjs
* JavaScript

## Database File

The database file is automatically created as:

```text
dayflow.db
```

The database is stored in the same directory as `db.js`.

The application enables:

* SQLite WAL mode for better performance
* Foreign key constraints for maintaining relationships between tables

## Database Tables

### 1. Users

Stores authentication and login information.

Main fields:

* `id`
* `employee_id`
* `email`
* `password_hash`
* `role`
* `is_verified`
* `is_active`
* `created_at`
* `updated_at`

Supported roles:

* Employee
* HR
* Admin

### 2. Employees

Stores employee profile information.

Main fields:

* `id`
* `user_id`
* `full_name`
* `phone`
* `address`
* `department`
* `designation`
* `joining_date`
* `employment_type`
* `profile_pic`
* `status`

Employee status can be:

* Active
* Inactive
* Terminated

### 3. Attendance

Stores employee attendance records.

Main fields:

* `id`
* `employee_id`
* `date`
* `check_in`
* `check_out`
* `status`
* `working_hours`
* `notes`

Attendance status can be:

* Present
* Absent
* Half-day
* Leave

Each employee can have only one attendance record for a particular date.

### 4. Leaves

Stores employee leave requests.

Main fields:

* `id`
* `employee_id`
* `leave_type`
* `start_date`
* `end_date`
* `total_days`
* `remarks`
* `status`
* `admin_comment`
* `approved_by`

Supported leave types include:

* Paid
* Sick
* Unpaid
* Casual
* Maternity
* Paternity

Leave request status:

* Pending
* Approved
* Rejected

### 5. Payroll

Stores employee salary information.

Main fields:

* `id`
* `employee_id`
* `basic_salary`
* `hra`
* `transport_allowance`
* `medical_allowance`
* `other_allowances`
* `pf_deduction`
* `tax_deduction`
* `other_deductions`
* `net_salary`
* `effective_from`

Employees can view their salary information, while Admin/HR can manage salary details.

### 6. Notifications

Stores notifications for users.

Main fields:

* `id`
* `user_id`
* `title`
* `message`
* `type`
* `is_read`
* `related_id`
* `related_type`
* `created_at`

Notification types include:

* Info
* Success
* Warning
* Error
* Leave
* Attendance
* Payroll

### 7. Documents

Stores employee document information.

Main fields:

* `id`
* `employee_id`
* `doc_name`
* `doc_type`
* `file_path`
* `uploaded_at`

## Database Relationships

```text
Users
  |
  | 1 : 1
  ↓
Employees
  |
  ├── Attendance
  |
  ├── Leaves
  |
  ├── Payroll
  |
  └── Documents

Users
  |
  └── Notifications
```

The database uses foreign keys to maintain relationships between users, employees, attendance, leaves, payroll, notifications, and documents.

## Installation

Install the required packages:

```bash
npm install better-sqlite3 bcryptjs
```

## Database Initialization

The database is initialized automatically when `db.js` is executed.

Run:

```bash
node db.js
```

If the database does not already exist, SQLite creates:

```text
dayflow.db
```

The required tables are then created automatically.

## Demo Accounts

The database creates development/demo accounts automatically if they do not already exist.

### Admin

```text
Email: admin@dayflow.com
Password: Admin@123
Employee ID: ADMIN001
Role: Admin
```

### Employee

```text
Email: employee@dayflow.com
Password: Emp@123
Employee ID: EMP001
Role: Employee
```

**Important:** These credentials are for local development/demo purposes only. Change or remove them before deploying the application publicly.

## Default Demo Data

The database also creates sample payroll records for the demo Admin and Employee accounts.

This allows the following features to be tested:

* Login
* Employee profile
* Attendance
* Leave management
* Payroll
* Role-based access

## Using the Database in the Application

The database can be imported into other Node.js files using:

```javascript
const db = require('./db');
```

Example:

```javascript
const db = require('./db');

const users = db.prepare('SELECT * FROM users').all();

console.log(users);
```

## Project Structure

A typical project structure can be:

```text
Dayflow/
│
├── db.js
├── dayflow.db
├── package.json
├── package-lock.json
│
├── server.js
│
├── routes/
├── controllers/
├── middleware/
├── models/
│
└── frontend/
```

## Security

The application uses `bcryptjs` to hash passwords before storing them in the database.

Passwords should never be stored as plain text.

For production deployment:

* Change the default demo passwords.
* Do not commit sensitive credentials.
* Use environment variables for secrets.
* Use HTTPS.
* Implement proper authentication and authorization.
* Back up the database securely.

## Purpose

The Dayflow database supports the main HRMS features:

* User authentication
* Role-based access
* Employee profile management
* Attendance tracking
* Leave management
* Payroll management
* Notifications
* Employee document management

## Status

The database module provides the core SQLite database structure required for the Dayflow HRMS application.

More application features can be built on top of this database using Node.js APIs and the Dayflow frontend.
