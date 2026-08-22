'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, Download, Lock, CheckCircle, FileText, Printer, Building } from 'lucide-react';
import { PayrollRecord } from '@/lib/types';

export default function PayrollPage() {
  const { user, employee } = useAuth();
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  if (!user || !employee) return null;

  const payrollHistory = api.getEmployeePayroll(user.employeeId);
  const currentPay = payrollHistory[0] || {
    id: 'pay-curr',
    employeeId: employee.employeeId,
    employeeName: employee.name,
    department: employee.department,
    month: 'August 2026',
    basicPay: employee.salary.basicPay,
    hra: employee.salary.hra,
    allowances: employee.salary.allowances,
    deductions: employee.salary.deductions,
    netSalary: employee.salary.netSalary,
    paymentStatus: 'PAID',
    payDate: '2026-08-01',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Payroll & Compensation</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View your salary structure, deductions, and monthly pay slips
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          <Lock className="h-3.5 w-3.5" /> Read-Only Employee View
        </div>
      </div>

      {/* Current Month Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-indigo-100 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Current Salary Structure ({currentPay.month})</CardTitle>
                <CardDescription>Itemized monthly breakdown</CardDescription>
              </div>
              <Badge status={currentPay.paymentStatus}>{currentPay.paymentStatus}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <p className="text-[11px] font-semibold text-slate-400">Basic Pay</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatCurrency(currentPay.basicPay)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                <p className="text-[11px] font-semibold text-slate-400">Allowances (HRA + Special)</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatCurrency(currentPay.hra + currentPay.allowances)}
                </p>
              </div>
              <div className="rounded-xl bg-rose-50/50 p-3 dark:bg-rose-950/30">
                <p className="text-[11px] font-semibold text-rose-500">Total Deductions</p>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  -{formatCurrency(currentPay.deductions)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-indigo-900 to-indigo-800 p-5 text-white shadow-lg">
              <div>
                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Net Salary Credit</p>
                <p className="text-3xl font-black mt-1">{formatCurrency(currentPay.netSalary)}</p>
                <p className="text-[11px] text-indigo-200 mt-0.5">Directly credited to Bank Account ending ****4092</p>
              </div>

              <Button
                onClick={() => setSelectedPayslip(currentPay as PayrollRecord)}
                className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold gap-2 shrink-0 shadow-md"
              >
                <Download className="h-4 w-4" /> Download Pay Slip
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Deduction Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deductions Breakdown</CardTitle>
            <CardDescription>Tax & statutory contributions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Income Tax (TDS)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(currentPay.deductions * 0.6)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Provident Fund (PF)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(currentPay.deductions * 0.3)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Health Insurance Premium</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(currentPay.deductions * 0.1)}</span>
            </div>
            <div className="pt-2 text-center text-[11px] text-slate-400 italic">
              Tax declarations managed under Section 80C.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pay Slip History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Pay Slips</CardTitle>
          <CardDescription>Archive of previous monthly compensation records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Pay Period</th>
                  <th className="py-3 px-4 font-semibold">Basic Pay</th>
                  <th className="py-3 px-4 font-semibold">Allowances</th>
                  <th className="py-3 px-4 font-semibold">Deductions</th>
                  <th className="py-3 px-4 font-semibold">Net Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payrollHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {p.month}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {formatCurrency(p.basicPay)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {formatCurrency(p.hra + p.allowances)}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-medium">
                      -{formatCurrency(p.deductions)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={p.paymentStatus}>{p.paymentStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPayslip(p)}
                        className="gap-1 text-xs"
                      >
                        <FileText className="h-3.5 w-3.5" /> View Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Detail Modal */}
      <Modal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Official Salary Slip"
        description="Dayflow HRMS Generated Compensation Document"
        className="max-w-2xl"
      >
        {selectedPayslip && (
          <div className="space-y-6 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">D</div>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">Dayflow Inc.</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">100 Enterprise Way, Suite 400</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Salary Slip</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedPayslip.month}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Employee Name</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Employee ID</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedPayslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Department</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedPayslip.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Payment Date</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedPayslip.payDate ? formatDate(selectedPayslip.payDate) : 'Processed'}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Earnings</th>
                      <th className="py-2 px-3 font-semibold text-right">Amount</th>
                      <th className="py-2 px-3 font-semibold border-l border-slate-200 dark:border-slate-800">Deductions</th>
                      <th className="py-2 px-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-2 px-3">Basic Pay</td>
                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(selectedPayslip.basicPay)}</td>
                      <td className="py-2 px-3 border-l border-slate-200 dark:border-slate-800">Income Tax & TDS</td>
                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(selectedPayslip.deductions * 0.6)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">HRA</td>
                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(selectedPayslip.hra)}</td>
                      <td className="py-2 px-3 border-l border-slate-200 dark:border-slate-800">PF Contribution</td>
                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(selectedPayslip.deductions * 0.4)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Special Allowances</td>
                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(selectedPayslip.allowances)}</td>
                      <td className="py-2 px-3 border-l border-slate-200 dark:border-slate-800">--</td>
                      <td className="py-2 px-3 text-right font-medium">--</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-indigo-50/70 font-bold dark:bg-indigo-950/50 text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800">
                    <tr>
                      <td className="py-2 px-3">Total Gross Earnings</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(selectedPayslip.basicPay + selectedPayslip.hra + selectedPayslip.allowances)}</td>
                      <td className="py-2 px-3 border-l border-slate-200 dark:border-slate-800">Total Deductions</td>
                      <td className="py-2 px-3 text-right text-rose-600">{formatCurrency(selectedPayslip.deductions)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Net Take Home Pay:</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedPayslip.netSalary)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedPayslip(null)}>
                Close
              </Button>
              <Button onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
