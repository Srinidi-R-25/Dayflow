'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Clock, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  LogOut, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Bell,
  ArrowRight
} from 'lucide-react';
import { AttendanceRecord } from '@/lib/types';

export default function EmployeeDashboardPage() {
  const { employee, user, logout } = useAuth();
  const [todayAtt, setTodayAtt] = useState<AttendanceRecord | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    if (user?.employeeId) {
      setTodayAtt(api.getTodayAttendance(user.employeeId));
    }
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [user]);

  const handlePunchIn = () => {
    if (user) {
      const rec = api.checkIn(user.employeeId, employee?.name || 'Employee');
      setTodayAtt({ ...rec });
    }
  };

  const handlePunchOut = () => {
    if (user) {
      const rec = api.checkOut(user.employeeId);
      if (rec) setTodayAtt({ ...rec });
    }
  };

  const attendanceHistory = user ? api.getEmployeeAttendance(user.employeeId) : [];
  const leaveRequests = user ? api.getEmployeeLeaves(user.employeeId) : [];
  const notifications = user ? api.getNotifications(user.employeeId) : [];

  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length;
  const approvedLeaves = leaveRequests.filter(l => l.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-xl shadow-indigo-600/10">
        <div>
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs mb-2">
            Employee Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {employee?.name || 'Employee'}! 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-100">
            {employee?.designation} • {employee?.department}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs">
              <User className="h-4 w-4" /> Profile
            </Button>
          </Link>
          <Button onClick={logout} variant="secondary" size="sm" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Punch Card Widget (Section 3.4.1 requirement) */}
        <Card className="lg:col-span-1 border-indigo-100 shadow-md dark:border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Attendance Check-In
              </CardTitle>
              <Badge status={todayAtt?.checkInTime ? 'PRESENT' : 'ABSENT'}>
                {todayAtt?.checkOutTime ? 'Completed' : todayAtt?.checkInTime ? 'Punched In' : 'Not Checked In'}
              </Badge>
            </div>
            <CardDescription>Record your daily workday hours</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 text-center">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Time</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {currentTime || '09:00:00 AM'}
              </p>
              <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="rounded-lg bg-indigo-50/50 p-3 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/50">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Punch In</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {todayAtt?.checkInTime || '-- : --'}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50/50 p-3 dark:bg-purple-950/30 border border-purple-100/50 dark:border-purple-900/50">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Punch Out</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {todayAtt?.checkOutTime || '-- : --'}
                </p>
              </div>
            </div>

            {!todayAtt?.checkInTime ? (
              <Button onClick={handlePunchIn} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="h-5 w-5" /> Punch In Now
              </Button>
            ) : !todayAtt?.checkOutTime ? (
              <Button onClick={handlePunchOut} className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-md shadow-rose-600/20">
                <LogOut className="h-5 w-5" /> Punch Out Now
              </Button>
            ) : (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ✓ Shift completed for today ({todayAtt.workHours} hours logged)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Access Grid Cards (Section 3.2.1 Requirement) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/profile">
              <Card className="hover:border-indigo-500 hover:shadow-md transition-all p-4 flex flex-col items-center text-center group">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-xs text-slate-900 dark:text-slate-100">My Profile</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Job & Personal Details</p>
              </Card>
            </Link>

            <Link href="/attendance">
              <Card className="hover:border-indigo-500 hover:shadow-md transition-all p-4 flex flex-col items-center text-center group">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-xs text-slate-900 dark:text-slate-100">Attendance</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Daily & Weekly Log</p>
              </Card>
            </Link>

            <Link href="/leave">
              <Card className="hover:border-indigo-500 hover:shadow-md transition-all p-4 flex flex-col items-center text-center group">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-xs text-slate-900 dark:text-slate-100">Leave Requests</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{pendingLeaves} Pending</p>
              </Card>
            </Link>

            <Link href="/payroll">
              <Card className="hover:border-indigo-500 hover:shadow-md transition-all p-4 flex flex-col items-center text-center group">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-xs text-slate-900 dark:text-slate-100">Payroll</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{formatCurrency(employee?.salary.netSalary || 0)} / mo</p>
              </Card>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 dark:bg-indigo-950 dark:text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Days Present</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">22 / 24</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 dark:bg-emerald-950 dark:text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Leave Balance</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">14 Days</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 dark:bg-purple-950 dark:text-purple-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Net Pay (Aug)</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatCurrency(employee?.salary.netSalary || 0)}
                </p>
              </div>
            </Card>
          </div>

          {/* Recent Activity / Alerts Feed */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Recent Alerts & Notifications
                </CardTitle>
                <CardDescription>Latest company and leave updates</CardDescription>
              </div>
              <Link href="/notifications" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                View All
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3 flex items-start gap-3">
                  <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${item.read ? 'bg-slate-300' : 'bg-indigo-600'}`} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
