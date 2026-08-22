'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Plus, Search, Edit3, Shield, Mail, Phone, Building } from 'lucide-react';
import { Employee, UserRole } from '@/lib/types';

export default function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [, setTick] = useState(0);

  // New Employee Form state
  const [newEmpId, setNewEmpId] = useState('EMP006');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newDesignation, setNewDesignation] = useState('Software Engineer');
  const [newRole, setNewRole] = useState<UserRole>('EMPLOYEE');

  const employees = api.getEmployees();

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      api.updateEmployee(editingEmp);
      setEditingEmp(null);
      setTick(t => t + 1);
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    api.addEmployee({
      employeeId: newEmpId,
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
      designation: newDesignation,
      joiningDate: new Date().toISOString().split('T')[0],
      phone: '+1 (555) 999-8888',
      address: 'Corporate Housing, Tech District',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'ACTIVE',
      salary: { basicPay: 6000, hra: 2400, allowances: 1000, deductions: 700, netSalary: 8700 }
    });
    setIsAddOpen(false);
    setNewName('');
    setNewEmail('');
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workforce & Employee Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Admin full control over employee records, job details, and salary structures
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shadow-md shadow-indigo-600/20">
          <Plus className="h-4 w-4" /> Add New Employee
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Employee Directory ({filteredEmployees.length})</CardTitle>
            <CardDescription>Search and update employee profiles</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product Design">Product Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 font-semibold">Employee</th>
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Net Salary</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatarUrl} alt={emp.name} className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {emp.employeeId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {emp.department} • <span className="text-[11px] text-slate-400">{emp.designation}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {emp.role}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(emp.salary.netSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={emp.status}>{emp.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEmp({ ...emp })}
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Full Edit Modal (Section 3.3.2 requirement) */}
      <Modal
        isOpen={!!editingEmp}
        onClose={() => setEditingEmp(null)}
        title="Admin Edit Employee Profile"
        description="Admin privilege: Full authorization to update all personal, job, and compensation fields."
        className="max-w-xl"
      >
        {editingEmp && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={editingEmp.name}
                onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
                required
              />
              <Input
                label="Work Email"
                type="email"
                value={editingEmp.email}
                onChange={(e) => setEditingEmp({ ...editingEmp, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Department"
                value={editingEmp.department}
                onChange={(e) => setEditingEmp({ ...editingEmp, department: e.target.value })}
                required
              />
              <Input
                label="Designation"
                value={editingEmp.designation}
                onChange={(e) => setEditingEmp({ ...editingEmp, designation: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">System Role</label>
                <select
                  value={editingEmp.role}
                  onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value as UserRole })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={editingEmp.status}
                  onChange={(e) => setEditingEmp({ ...editingEmp, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Salary Structure Adjustments</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Basic Pay ($)"
                  type="number"
                  value={editingEmp.salary.basicPay}
                  onChange={(e) => {
                    const basic = Number(e.target.value);
                    const net = basic + editingEmp.salary.hra + editingEmp.salary.allowances - editingEmp.salary.deductions;
                    setEditingEmp({ ...editingEmp, salary: { ...editingEmp.salary, basicPay: basic, netSalary: net } });
                  }}
                />
                <Input
                  label="Allowances ($)"
                  type="number"
                  value={editingEmp.salary.allowances}
                  onChange={(e) => {
                    const allow = Number(e.target.value);
                    const net = editingEmp.salary.basicPay + editingEmp.salary.hra + allow - editingEmp.salary.deductions;
                    setEditingEmp({ ...editingEmp, salary: { ...editingEmp.salary, allowances: allow, netSalary: net } });
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setEditingEmp(null)}>
                Cancel
              </Button>
              <Button type="submit">Save All Employee Details</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Employee"
        description="Create employee profile and generate portal credentials"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
          <Input label="Employee ID" value={newEmpId} onChange={(e) => setNewEmpId(e.target.value)} required />
          <Input label="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <Input label="Work Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Department" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} required />
            <Input label="Designation" value={newDesignation} onChange={(e) => setNewDesignation(e.target.value)} required />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
