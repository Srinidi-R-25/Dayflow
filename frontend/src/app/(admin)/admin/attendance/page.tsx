'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { Clock, Filter, Search, Edit2 } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '@/lib/types';

export default function AdminAttendancePage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [editingAtt, setEditingAtt] = useState<AttendanceRecord | null>(null);
  const [, setTick] = useState(0);

  const attendanceLogs = api.getAttendance();

  const filtered = attendanceLogs.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const handleUpdateStatus = (newStatus: AttendanceStatus) => {
    if (editingAtt) {
      const updated = { ...editingAtt, status: newStatus };
      api.updateAttendanceRecord(updated);
      setEditingAtt(null);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Organization Attendance Logs</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Section 3.4.2: HR Admin monitoring for all employee daily/weekly attendance
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Attendance Audit Trail</CardTitle>
            <CardDescription>View, verify, and manually override employee logs</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Punch In</th>
                  <th className="py-3 px-4 font-semibold">Punch Out</th>
                  <th className="py-3 px-4 font-semibold">Work Hours</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {att.employeeName || att.employeeId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {formatDate(att.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {att.checkInTime || '--'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {att.checkOutTime || '--'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {att.workHours ? `${att.workHours} hrs` : '--'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={att.status}>{att.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingAtt(att)}
                        className="gap-1 text-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Modify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Status Override Modal */}
      <Modal
        isOpen={!!editingAtt}
        onClose={() => setEditingAtt(null)}
        title="Admin Attendance Status Override"
        description="Manually adjust employee attendance record"
      >
        {editingAtt && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
              <p className="font-bold text-slate-900 dark:text-slate-100">{editingAtt.employeeName} ({formatDate(editingAtt.date)})</p>
              <p className="text-slate-500 mt-0.5">Current Status: {editingAtt.status}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['PRESENT', 'HALF_DAY', 'LEAVE', 'ABSENT'] as AttendanceStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-xs font-semibold hover:bg-indigo-50 hover:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 transition-all text-left"
                >
                  Mark as {st}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
