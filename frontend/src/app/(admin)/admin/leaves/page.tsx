'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { CheckSquare, CheckCircle, XCircle, MessageSquare, Filter } from 'lucide-react';
import { LeaveRequest } from '@/lib/types';

export default function AdminLeavesPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState('');
  const [, setTick] = useState(0);

  const leaves = api.getLeaves();

  const filtered = leaves.filter((l) => {
    if (filterStatus === 'ALL') return true;
    return l.status === filterStatus;
  });

  const handleApprove = () => {
    if (selectedLeave) {
      api.reviewLeave(selectedLeave.id, 'APPROVED', comment || 'Approved by HR Manager', 'Sarah Connor');
      setSelectedLeave(null);
      setComment('');
      setTick(t => t + 1);
    }
  };

  const handleReject = () => {
    if (selectedLeave) {
      api.reviewLeave(selectedLeave.id, 'REJECTED', comment || 'Declined by HR Manager', 'Sarah Connor');
      setSelectedLeave(null);
      setComment('');
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Leave Approvals Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Section 3.5.2: Admin review, approval workflows, and comment notes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Organization Leave Requests</CardTitle>
            <CardDescription>Filter by status and process employee time-off requests</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">All Requests</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Date Range</th>
                  <th className="py-3 px-4 font-semibold">Days</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {leave.employeeName}
                      <p className="text-[10px] text-slate-400 font-normal">{leave.department}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={leave.leaveType}>{leave.leaveType}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {leave.totalDays}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={leave.status}>{leave.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {leave.status === 'PENDING' ? (
                        <Button
                          size="sm"
                          onClick={() => setSelectedLeave(leave)}
                          className="text-xs"
                        >
                          Review Request
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Reviewed by {leave.reviewedBy || 'Admin'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title="Leave Approval Decision"
        description="HR Admin approval panel"
      >
        {selectedLeave && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">{selectedLeave.employeeName} ({selectedLeave.department})</p>
              <p className="text-slate-600 dark:text-slate-300">
                Leave Type: <span className="font-semibold">{selectedLeave.leaveType}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Duration: {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)} ({selectedLeave.totalDays} days)
              </p>
              <p className="text-slate-500 italic mt-1">&ldquo;{selectedLeave.reason}&rdquo;</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Add Admin Comments</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Specify reasons or instructions for employee..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
