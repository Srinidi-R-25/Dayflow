import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  PayrollRecord, 
  DocumentItem, 
  NotificationItem,
  User
} from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVES, 
  INITIAL_PAYROLL, 
  INITIAL_DOCUMENTS, 
  INITIAL_NOTIFICATIONS 
} from './mock-data';
import { getTodayDateString } from './utils';

const KEYS = {
  EMPLOYEES: 'dayflow_employees',
  ATTENDANCE: 'dayflow_attendance',
  LEAVES: 'dayflow_leaves',
  PAYROLL: 'dayflow_payroll',
  DOCUMENTS: 'dayflow_documents',
  NOTIFICATIONS: 'dayflow_notifications',
  CURRENT_USER: 'dayflow_current_user',
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Service API
export const api = {
  // Authentication & User
  getCurrentUser: (): User | null => {
    return getStored<User | null>(KEYS.CURRENT_USER, {
      id: 'emp-1',
      employeeId: 'EMP001',
      email: 'alex.morgan@dayflow.com',
      role: 'EMPLOYEE',
      isVerified: true,
    });
  },

  setCurrentUser: (user: User | null): void => {
    setStored(KEYS.CURRENT_USER, user);
  },

  // Employees
  getEmployees: (): Employee[] => {
    return getStored<Employee[]>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },

  getEmployeeById: (idOrEmpId: string): Employee | undefined => {
    const employees = api.getEmployees();
    return employees.find(e => e.id === idOrEmpId || e.employeeId === idOrEmpId);
  },

  updateEmployee: (updated: Employee): Employee => {
    const employees = api.getEmployees();
    const index = employees.findIndex(e => e.id === updated.id);
    if (index !== -1) {
      employees[index] = updated;
    } else {
      employees.push(updated);
    }
    setStored(KEYS.EMPLOYEES, employees);
    return updated;
  },

  addEmployee: (newEmp: Omit<Employee, 'id'>): Employee => {
    const employees = api.getEmployees();
    const id = `emp-${Date.now()}`;
    const employee: Employee = { ...newEmp, id };
    employees.push(employee);
    setStored(KEYS.EMPLOYEES, employees);
    return employee;
  },

  // Attendance
  getAttendance: (): AttendanceRecord[] => {
    return getStored<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },

  getEmployeeAttendance: (employeeId: string): AttendanceRecord[] => {
    return api.getAttendance().filter(a => a.employeeId === employeeId);
  },

  getTodayAttendance: (employeeId: string): AttendanceRecord | undefined => {
    const today = getTodayDateString();
    return api.getAttendance().find(a => a.employeeId === employeeId && a.date === today);
  },

  checkIn: (employeeId: string, employeeName: string): AttendanceRecord => {
    const records = api.getAttendance();
    const today = getTodayDateString();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let todayRecord = records.find(r => r.employeeId === employeeId && r.date === today);

    if (todayRecord) {
      todayRecord.checkInTime = timeStr;
      todayRecord.status = 'PRESENT';
    } else {
      todayRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName,
        date: today,
        checkInTime: timeStr,
        status: 'PRESENT',
        workHours: 0,
      };
      records.unshift(todayRecord);
    }

    setStored(KEYS.ATTENDANCE, records);
    return todayRecord;
  },

  checkOut: (employeeId: string): AttendanceRecord | undefined => {
    const records = api.getAttendance();
    const today = getTodayDateString();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const todayRecord = records.find(r => r.employeeId === employeeId && r.date === today);
    if (todayRecord) {
      todayRecord.checkOutTime = timeStr;
      todayRecord.workHours = 8.5; // Calculated standard shift
      setStored(KEYS.ATTENDANCE, records);
    }
    return todayRecord;
  },

  updateAttendanceRecord: (record: AttendanceRecord): AttendanceRecord => {
    const records = api.getAttendance();
    const idx = records.findIndex(r => r.id === record.id);
    if (idx !== -1) {
      records[idx] = record;
    } else {
      records.unshift(record);
    }
    setStored(KEYS.ATTENDANCE, records);
    return record;
  },

  // Leaves
  getLeaves: (): LeaveRequest[] => {
    return getStored<LeaveRequest[]>(KEYS.LEAVES, INITIAL_LEAVES);
  },

  getEmployeeLeaves: (employeeId: string): LeaveRequest[] => {
    return api.getLeaves().filter(l => l.employeeId === employeeId);
  },

  applyLeave: (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>): LeaveRequest => {
    const leaves = api.getLeaves();
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `lv-${Date.now()}`,
      status: 'PENDING',
      appliedDate: getTodayDateString(),
    };
    leaves.unshift(newLeave);
    setStored(KEYS.LEAVES, leaves);

    // Notify employee
    api.addNotification({
      userId: leaveData.employeeId,
      title: 'Leave Request Submitted',
      message: `Your request for ${leaveData.leaveType.toLowerCase()} leave (${leaveData.startDate} to ${leaveData.endDate}) has been submitted for approval.`,
      type: 'INFO',
    });

    return newLeave;
  },

  reviewLeave: (leaveId: string, status: 'APPROVED' | 'REJECTED', adminComment?: string, reviewerName: string = 'Admin'): LeaveRequest | undefined => {
    const leaves = api.getLeaves();
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
      leave.status = status;
      leave.adminComment = adminComment;
      leave.reviewedBy = reviewerName;
      setStored(KEYS.LEAVES, leaves);

      // Add Notification for Employee
      api.addNotification({
        userId: leave.employeeId,
        title: `Leave Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        message: `Your leave request for ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()}.${adminComment ? ` HR Note: "${adminComment}"` : ''}`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'ALERT',
      });
    }
    return leave;
  },

  // Payroll
  getPayroll: (): PayrollRecord[] => {
    return getStored<PayrollRecord[]>(KEYS.PAYROLL, INITIAL_PAYROLL);
  },

  getEmployeePayroll: (employeeId: string): PayrollRecord[] => {
    return api.getPayroll().filter(p => p.employeeId === employeeId);
  },

  updateSalaryStructure: (employeeId: string, basicPay: number, hra: number, allowances: number, deductions: number): Employee | undefined => {
    const employees = api.getEmployees();
    const emp = employees.find(e => e.id === employeeId || e.employeeId === employeeId);
    if (emp) {
      const netSalary = basicPay + hra + allowances - deductions;
      emp.salary = { basicPay, hra, allowances, deductions, netSalary };
      setStored(KEYS.EMPLOYEES, employees);

      // Also update payroll record for current month
      const payrolls = api.getPayroll();
      const currentPay = payrolls.find(p => p.employeeId === emp.employeeId && p.month === 'August 2026');
      if (currentPay) {
        currentPay.basicPay = basicPay;
        currentPay.hra = hra;
        currentPay.allowances = allowances;
        currentPay.deductions = deductions;
        currentPay.netSalary = netSalary;
        setStored(KEYS.PAYROLL, payrolls);
      }
    }
    return emp;
  },

  // Documents
  getDocuments: (employeeId?: string): DocumentItem[] => {
    const docs = getStored<DocumentItem[]>(KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    return employeeId ? docs.filter(d => d.employeeId === employeeId) : docs;
  },

  // Notifications
  getNotifications: (userId: string): NotificationItem[] => {
    const notifs = getStored<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs.filter(n => n.userId === userId);
  },

  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem => {
    const notifs = getStored<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifs.unshift(newNotif);
    setStored(KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },

  markNotificationAsRead: (id: string): void => {
    const notifs = getStored<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = notifs.find(n => n.id === id);
    if (item) {
      item.read = true;
      setStored(KEYS.NOTIFICATIONS, notifs);
    }
  },
};
