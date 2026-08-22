'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, FileText, MessageSquare } from 'lucide-react';
import { LeaveType, LeaveRequest } from '@/lib/types';

export default function LeaveRequestsPage() {
  const { user, employee } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('PAID');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-03');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!user || !employee) return null;

  const leaveList = api.getEmployeeLeaves(user.employeeId);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays(startDate, endDate);

    api.applyLeave({
      employeeId: user.employeeId,
      employeeName: employee.name,
      department: employee.department,
      leaveType,
      startDate,
      endDate,
      totalDays: days,
      reason: reason || 'Personal leave request.',
    });

    setIsModalOpen(false);
    setReason('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Leave & Time-Off Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Apply for paid, sick, or unpaid leave and track approval status
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-md shadow-indigo-600/20">
          <Plus className="h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Leave request submitted successfully! Pending HR approval.</span>
        </div>
      )}

      {/* Leave Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-indigo-100 bg-indigo-50/30 dark:border-indigo-950 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Paid Leave Balance</span>
            <Badge status="PAID">12 Days Left</Badge>
          </div>
          <p className="text-2xl font-black text-indigo-950 dark:text-indigo-100 mt-2">12 / 15</p>
        </Card>

        <Card className="p-4 border-amber-100 bg-amber-50/30 dark:border-amber-950 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">Sick Leave Balance</span>
            <Badge status="SICK">7 Days Left</Badge>
          </div>
          <p className="text-2xl font-black text-amber-950 dark:text-amber-100 mt-2">7 / 10</p>
        </Card>

        <Card className="p-4 border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pending Approvals</span>
            <Badge status="PENDING">{leaveList.filter(l => l.status === 'PENDING').length}</Badge>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {leaveList.filter(l => l.status === 'PENDING').length} Requests
          </p>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
          <CardDescription>Track status and comments from HR Officer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Dates</th>
                  <th className="py-3 px-4 font-semibold">Days</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">HR Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaveList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaveList.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <Badge status={leave.leaveType}>{leave.leaveType} LEAVE</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {leave.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={leave.status}>{leave.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs">
                        {leave.adminComment ? (
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <MessageSquare className="h-3 w-3 text-indigo-500 shrink-0" />
                            {leave.adminComment}
                          </span>
                        ) : (
                          '--'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Time-Off / Leave"
        description="Fill out the details below. Section 3.5.1 requirements enforced."
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Leave Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['PAID', 'SICK', 'UNPAID'] as LeaveType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLeaveType(t)}
                  className={`rounded-lg border py-2 text-xs font-semibold transition-all ${
                    leaveType === t
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            Total Request Duration: <span className="font-bold text-slate-900 dark:text-white">{calculateDays(startDate, endDate)} Days</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Remarks / Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for your time-off request..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
