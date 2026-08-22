const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'dayflow.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    -- Users table for authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('employee', 'admin', 'hr')),
      is_verified INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Employees table for profile data
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      department TEXT,
      designation TEXT,
      joining_date TEXT,
      employment_type TEXT DEFAULT 'full-time',
      profile_pic TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'terminated')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Attendance table
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      status TEXT DEFAULT 'absent' CHECK(status IN ('present', 'absent', 'half-day', 'leave')),
      working_hours REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(employee_id, date),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Leave requests table
    CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL CHECK(leave_type IN ('paid', 'sick', 'unpaid', 'casual', 'maternity', 'paternity')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_days INTEGER,
      remarks TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      admin_comment TEXT,
      approved_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users(id)
    );

    -- Payroll / Salary structure table
    CREATE TABLE IF NOT EXISTS payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      basic_salary REAL DEFAULT 0,
      hra REAL DEFAULT 0,
      transport_allowance REAL DEFAULT 0,
      medical_allowance REAL DEFAULT 0,
      other_allowances REAL DEFAULT 0,
      pf_deduction REAL DEFAULT 0,
      tax_deduction REAL DEFAULT 0,
      other_deductions REAL DEFAULT 0,
      net_salary REAL DEFAULT 0,
      effective_from TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error', 'leave', 'attendance', 'payroll')),
      is_read INTEGER DEFAULT 0,
      related_id INTEGER,
      related_type TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Documents table
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      doc_name TEXT NOT NULL,
      doc_type TEXT,
      file_path TEXT NOT NULL,
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
  `);

  // Create default admin account if not exists
  const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get('admin@dayflow.com');
  if (!adminExists) {
    const passwordHash = bcrypt.hashSync('Admin@123', 12);
    const result = db.prepare(`
      INSERT INTO users (employee_id, email, password_hash, role, is_verified)
      VALUES (?, ?, ?, ?, 1)
    `).run('ADMIN001', 'admin@dayflow.com', passwordHash, 'admin');

    db.prepare(`
      INSERT INTO employees (user_id, full_name, department, designation, joining_date, employment_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(result.lastInsertRowid, 'System Administrator', 'Administration', 'HR Manager', '2024-01-01', 'full-time', 'active');

    const emp = db.prepare("SELECT id FROM employees WHERE user_id = ?").get(result.lastInsertRowid);
    db.prepare(`
      INSERT INTO payroll (employee_id, basic_salary, hra, transport_allowance, medical_allowance, pf_deduction, tax_deduction, net_salary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(emp.id, 80000, 20000, 3000, 2000, 9600, 8000, 87400);

    // Create a demo employee account
    const empPasswordHash = bcrypt.hashSync('Emp@123', 12);
    const empResult = db.prepare(`
      INSERT INTO users (employee_id, email, password_hash, role, is_verified)
      VALUES (?, ?, ?, ?, 1)
    `).run('EMP001', 'employee@dayflow.com', empPasswordHash, 'employee');

    db.prepare(`
      INSERT INTO employees (user_id, full_name, phone, department, designation, joining_date, employment_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(empResult.lastInsertRowid, 'John Smith', '9876543210', 'Engineering', 'Software Engineer', '2024-03-01', 'full-time', 'active');

    const empProfile = db.prepare("SELECT id FROM employees WHERE user_id = ?").get(empResult.lastInsertRowid);
    db.prepare(`
      INSERT INTO payroll (employee_id, basic_salary, hra, transport_allowance, medical_allowance, pf_deduction, tax_deduction, net_salary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(empProfile.id, 50000, 12500, 2000, 1500, 6000, 5000, 55000);

    console.log('✅ Database initialized with demo accounts:');
    console.log('   Admin: admin@dayflow.com / Admin@123');
    console.log('   Employee: employee@dayflow.com / Emp@123');
  }

  console.log('✅ Database ready at:', DB_PATH);
}

initializeDatabase();

module.exports = db;
