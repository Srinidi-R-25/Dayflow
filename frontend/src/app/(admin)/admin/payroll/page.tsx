'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Edit3, CheckCircle, ShieldCheck } from 'lucide-react';
import { PayrollRecord } from '@/lib/types';

export default function AdminPayrollPage() {
  const [selectedPay, setSelectedPay] = useState<PayrollRecord | null>(null);
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [, setTick] = useState(0);

  const payrolls = api.getPayroll();
  const totalCompanyPayroll = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);

  const handleEditOpen = (p: PayrollRecord) => {
    setSelectedPay(p);
    setBasic(p.basicPay);
    setHra(p.hra);
    setAllowances(p.allowances);
    setDeductions(p.deductions);
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPay) {
      api.updateSalaryStructure(selectedPay.employeeId, basic, hra, allowances, deductions);
      setSelectedPay(null);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Payroll & Salary Control</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Section 3.6.2: View organization payroll and update salary structures
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-purple-100 bg-purple-50/30 dark:border-purple-950 dark:bg-purple-950/20">
          <p className="text-xs font-semibold text-purple-900 dark:text-purple-300">Total Monthly Outflow</p>
          <p className="text-3xl font-black text-purple-950 dark:text-purple-100 mt-2">{formatCurrency(totalCompanyPayroll)}</p>
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Processed Salaries</p>
          <p className="text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-2">
            {payrolls.filter(p => p.paymentStatus === 'PAID').length} / {payrolls.length}
          </p>
        </Card>

        <Card className="p-5 border-amber-100 bg-amber-50/30 dark:border-amber-950 dark:bg-amber-950/20">
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">Pending Disbursement</p>
          <p className="text-3xl font-black text-amber-950 dark:text-amber-100 mt-2">
            {payrolls.filter(p => p.paymentStatus === 'PENDING').length} Employees
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Compensation Register</CardTitle>
          <CardDescription>Click &ldquo;Adjust Structure&rdquo; to modify individual salary components</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Basic Pay</th>
                  <th className="py-3 px-4 font-semibold">Allowances</th>
                  <th className="py-3 px-4 font-semibold">Deductions</th>
                  <th className="py-3 px-4 font-semibold">Net Salary</th>
                  <th className="py-3 px-4 font-semibold text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {p.employeeName}
                      <p className="text-[10px] text-slate-400 font-normal">{p.employeeId}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {p.department}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(p.basicPay)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(p.hra + p.allowances)}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-medium">
                      -{formatCurrency(p.deductions)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400 text-sm">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOpen(p)}
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Adjust Structure
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Salary Modal */}
      <Modal
        isOpen={!!selectedPay}
        onClose={() => setSelectedPay(null)}
        title="Adjust Salary Structure"
        description="Update compensation parameters for selected employee"
      >
        {selectedPay && (
          <form onSubmit={handleSaveSalary} className="space-y-4 text-xs pt-2">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
              <p className="font-bold text-slate-900 dark:text-slate-100">{selectedPay.employeeName} ({selectedPay.department})</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Basic Pay ($)"
                type="number"
                value={basic}
                onChange={(e) => setBasic(Number(e.target.value))}
                required
              />
              <Input
                label="House Rent Allowance (HRA) ($)"
                type="number"
                value={hra}
                onChange={(e) => setHra(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Special Allowances ($)"
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(Number(e.target.value))}
                required
              />
              <Input
                label="Deductions (Tax & Benefits) ($)"
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                required
              />
            </div>

            <div className="rounded-xl bg-indigo-50 p-4 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
              <p className="text-[11px] font-semibold uppercase tracking-wider">Calculated Net Take-Home</p>
              <p className="text-2xl font-black mt-1">{formatCurrency(basic + hra + allowances - deductions)}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setSelectedPay(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Salary Structure</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
