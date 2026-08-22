export type UserRole = 'EMPLOYEE' | 'ADMIN';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export type LeaveType = 'PAID' | 'SICK' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

export interface SalaryStructure {
  basicPay: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  joiningDate: string;
  phone: string;
  address: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  salary: SalaryStructure;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  workHours?: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  adminComment?: string;
  reviewedBy?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string; // e.g. "August 2026"
  basicPay: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: 'PAID' | 'PENDING';
  payDate?: string;
}

export interface DocumentItem {
  id: string;
  employeeId: string;
  title: string;
  category: 'CONTRACT' | 'TAX' | 'IDENTIFICATION' | 'PAYSLIP' | 'CERTIFICATE';
  fileUrl: string;
  uploadDate: string;
  size: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
  read: boolean;
}
