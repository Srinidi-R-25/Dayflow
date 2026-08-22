'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, Download, TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';

const attendanceTrendsData = [
  { day: 'Mon', Present: 24, Absent: 1, Leave: 1 },
  { day: 'Tue', Present: 25, Absent: 0, Leave: 1 },
  { day: 'Wed', Present: 23, Absent: 2, Leave: 1 },
  { day: 'Thu', Present: 24, Absent: 1, Leave: 1 },
  { day: 'Fri', Present: 22, Absent: 2, Leave: 2 },
];

const leaveDistributionData = [
  { name: 'Paid Leave', value: 45, color: '#4f46e5' },
  { name: 'Sick Leave', value: 30, color: '#f59e0b' },
  { name: 'Unpaid Leave', value: 25, color: '#ef4444' },
];

const payrollByDeptData = [
  { department: 'Engineering', amount: 18320 },
  { department: 'Human Resources', amount: 10400 },
  { department: 'Product Design', amount: 8450 },
  { department: 'Marketing', amount: 7300 },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Section 6 Enhancements: Visual insights into workforce attendance, leave utilization, and payroll cost breakdown
          </p>
        </div>

        <Button onClick={() => window.print()} className="gap-2 shadow-md shadow-indigo-600/20">
          <Download className="h-4 w-4" /> Export HR Report PDF
        </Button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Weekly Attendance Trends
            </CardTitle>
            <CardDescription>Daily turnout distribution across organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Leave" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leave Type Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Leave Distribution by Category
            </CardTitle>
            <CardDescription>Share of Paid, Sick, and Unpaid leaves requested</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leaveDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Expense by Department */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Department Payroll Cost Allocation ($)
            </CardTitle>
            <CardDescription>Monthly net salary budget per department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollByDeptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="department" stroke="#9ca3af" fontSize={12} width={120} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
