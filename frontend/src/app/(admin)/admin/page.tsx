'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  DollarSign, 
  UserCheck, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Eye,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { Employee, LeaveRequest } from '@/lib/types';

export default function AdminDashboardPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [reviewLeave, setReviewLeave] = useState<LeaveRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [, setTick] = useState(0);

  const employees = api.getEmployees();
  const attendance = api.getAttendance();
  const leaves = api.getLeaves();
  const payroll = api.getPayroll();

  const totalEmployees = employees.length;
  const todayPresent = attendance.filter(a => a.date === '2026-08-22' && a.status === 'PRESENT').length;
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const totalPayroll = payroll.reduce((acc, curr) => acc + curr.netSalary, 0);

  const handleApprove = () => {
    if (reviewLeave) {
      api.reviewLeave(reviewLeave.id, 'APPROVED', adminComment || 'Approved by HR Administrator', 'Sarah Connor');
      setReviewLeave(null);
      setAdminComment('');
      setTick(t => t + 1);
    }
  };

  const handleReject = () => {
    if (reviewLeave) {
      api.reviewLeave(reviewLeave.id, 'REJECTED', adminComment || 'Request declined by HR Administrator', 'Sarah Connor');
      setReviewLeave(null);
      setAdminComment('');
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-xs flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> HR Management Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Organization Overview</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Real-time management for workforce attendance, approvals, and payroll
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/employees">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
              <Users className="h-4 w-4" /> Manage Workforce
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalEmployees}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Active Workforce</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Attendance</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{todayPresent} / {totalEmployees}</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">{Math.round((todayPresent / totalEmployees) * 100)}% Turnout Today</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Leaves</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{pendingLeaves.length}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Requires Action</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
            <CheckSquare className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Payroll</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(totalPayroll)}</p>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">August 2026</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Main Admin Section: Leave Approvals Hub & Quick Employee Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Requests Widget (Section 3.2.2 requirement) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Pending Leave Approvals ({pendingLeaves.length})
              </CardTitle>
              <CardDescription>Review and act on employee time-off requests</CardDescription>
            </div>
            <Link href="/admin/leaves" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              View All Leaves
            </Link>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                ✓ All leave requests have been reviewed!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingLeaves.map((leave) => (
                  <div key={leave.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{leave.employeeName}</span>
                        <span className="text-[10px] text-slate-400">• {leave.department}</span>
                        <Badge status={leave.leaveType}>{leave.leaveType}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {formatDate(leave.startDate)} → {formatDate(leave.endDate)} ({leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'})
                      </p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">&ldquo;{leave.reason}&rdquo;</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setReviewLeave(leave)}
                      className="gap-1 text-xs shrink-0"
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Employee Switcher / Inspector (Section 3.2.2 requirement) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Employee Roster Inspector
            </CardTitle>
            <CardDescription>Click to inspect details or switch context</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatarUrl}
                    alt={emp.name}
                    className="h-8 w-8 rounded-full object-cover border border-indigo-200"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{emp.name}</p>
                    <p className="text-[10px] text-slate-500">{emp.designation}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Employee Detail Modal */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title="Employee Information Card"
        description="Admin view of complete employee details"
      >
        {selectedEmployee && (
          <div className="space-y-4 text-xs pt-2">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
              <img src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h3>
                <p className="text-slate-500">{selectedEmployee.designation} ({selectedEmployee.department})</p>
                <Badge status={selectedEmployee.status} className="mt-1">{selectedEmployee.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-slate-400 font-medium">Employee ID</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selectedEmployee.employeeId}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Work Email</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selectedEmployee.email}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Phone</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selectedEmployee.phone}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Monthly Net Salary</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{formatCurrency(selectedEmployee.salary.netSalary)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                Close
              </Button>
              <Link href="/admin/employees">
                <Button className="gap-1">Edit Employee Profile</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Leave Modal */}
      <Modal
        isOpen={!!reviewLeave}
        onClose={() => setReviewLeave(null)}
        title="Review Leave Request"
        description="Section 3.5.2 rule: Admin can approve or reject requests with comments."
      >
        {reviewLeave && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>{reviewLeave.employeeName} ({reviewLeave.department})</span>
                <Badge status={reviewLeave.leaveType}>{reviewLeave.leaveType}</Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Duration: <span className="font-semibold">{formatDate(reviewLeave.startDate)} to {formatDate(reviewLeave.endDate)}</span> ({reviewLeave.totalDays} days)
              </p>
              <p className="text-slate-500 italic">&ldquo;{reviewLeave.reason}&rdquo;</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Admin Comment (Optional)</label>
              <input
                type="text"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="e.g. Approved. Please ensure project handoff."
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="danger" onClick={handleReject} className="gap-1">
                <XCircle className="h-4 w-4" /> Reject Request
              </Button>
              <Button variant="success" onClick={handleApprove} className="gap-1">
                <CheckCircle className="h-4 w-4" /> Approve Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
