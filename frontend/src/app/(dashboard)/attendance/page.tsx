'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar, CheckCircle2, AlertTriangle, CalendarDays, Filter } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '@/lib/types';

export default function AttendancePage() {
  const { user, employee } = useAuth();
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!user) return null;

  const records = api.getEmployeeAttendance(user.employeeId);

  const filteredRecords = records.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const totalPresent = records.filter(r => r.status === 'PRESENT').length;
  const totalHalfDay = records.filter(r => r.status === 'HALF_DAY').length;
  const totalLeave = records.filter(r => r.status === 'LEAVE').length;
  const totalAbsent = records.filter(r => r.status === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Tracking</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View your daily & weekly attendance logs and shift hours
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setViewMode('DAILY')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'DAILY'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Daily Logs
          </button>
          <button
            onClick={() => setViewMode('WEEKLY')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'WEEKLY'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Weekly Summary
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-emerald-100 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Present</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-2">{totalPresent} Days</p>
        </Card>

        <Card className="p-4 border-amber-100 bg-amber-50/30 dark:border-amber-950 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Half-Day</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-2">{totalHalfDay} Days</p>
        </Card>

        <Card className="p-4 border-sky-100 bg-sky-50/30 dark:border-sky-950 dark:bg-sky-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">On Leave</span>
            <Calendar className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-900 dark:text-sky-200 mt-2">{totalLeave} Days</p>
        </Card>

        <Card className="p-4 border-rose-100 bg-rose-50/30 dark:border-rose-950 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Absent</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-2">{totalAbsent} Days</p>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card>
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Attendance Log History</CardTitle>
            <CardDescription>Personal attendance record history</CardDescription>
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
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Punch In</th>
                  <th className="py-3 px-4 font-semibold">Punch Out</th>
                  <th className="py-3 px-4 font-semibold">Total Hours</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendance records found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {r.checkInTime || '--'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {r.checkOutTime || '--'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {r.workHours ? `${r.workHours} hrs` : '--'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={r.status}>{r.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                        {r.notes || '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
