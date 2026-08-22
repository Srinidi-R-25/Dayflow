'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  User, 
  Briefcase, 
  DollarSign, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  CheckCircle,
  Building,
  ShieldCheck,
  Camera
} from 'lucide-react';

export default function ProfilePage() {
  const { employee, role, refreshUserData } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(employee?.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!employee) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...employee,
      phone,
      address,
      avatarUrl: avatarUrl || employee.avatarUrl,
    };
    api.updateEmployee(updated);
    refreshUserData();
    setIsEditOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const userDocuments = api.getDocuments(employee.employeeId);

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <img
              src={employee.avatarUrl}
              alt={employee.name}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
            />
            <button
              onClick={() => setIsEditOpen(true)}
              className="absolute bottom-1 right-1 rounded-full bg-indigo-600 p-2 text-white shadow-md hover:bg-indigo-700 transition-transform group-hover:scale-105"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{employee.name}</h1>
              <Badge status={employee.status}>{employee.status}</Badge>
            </div>

            <p className="text-sm text-indigo-200 font-medium">
              {employee.designation} • <span className="text-white">{employee.department}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-indigo-400" /> {employee.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-indigo-400" /> {employee.phone}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-indigo-400" /> Joined {formatDate(employee.joiningDate)}</span>
            </div>
          </div>

          <Button
            onClick={() => setIsEditOpen(true)}
            variant="secondary"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs gap-1.5 shrink-0"
          >
            <Edit3 className="h-4 w-4" /> Edit Limited Profile
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Grid of Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Personal & Contact Details
            </CardTitle>
            <CardDescription>Fields editable by employee are marked below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-400 font-medium">Employee ID</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Full Name</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-400 font-medium">Phone Number <span className="text-indigo-600 dark:text-indigo-400 font-normal">(Editable)</span></p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.phone}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Work Email</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.email}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Residential Address <span className="text-indigo-600 dark:text-indigo-400 font-normal">(Editable)</span></p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                {employee.address}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Job & Organizational Details
            </CardTitle>
            <CardDescription>Managed by HR Admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-400 font-medium">Department</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.department}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Designation</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.designation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-400 font-medium">System Role</p>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{employee.role}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Joining Date</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(employee.joiningDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-400 font-medium">Employment Status</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge status={employee.status}>{employee.status}</Badge>
                <span className="text-[11px] text-slate-500">Full-Time Regular</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Structure (Read-only for employee) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Salary Structure Breakdown
            </CardTitle>
            <CardDescription>Monthly compensation schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Basic Salary</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(employee.salary.basicPay)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">House Rent Allowance (HRA)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(employee.salary.hra)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">Special Allowances</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(employee.salary.allowances)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600 dark:text-rose-400">
              <span className="font-medium">Deductions (Tax & Benefits)</span>
              <span className="font-bold">-{formatCurrency(employee.salary.deductions)}</span>
            </div>
            <div className="flex justify-between py-3 rounded-lg bg-indigo-50/70 p-3 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200">
              <span className="font-bold text-sm">Monthly Net Pay</span>
              <span className="font-black text-base">{formatCurrency(employee.salary.netSalary)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Employment Documents
            </CardTitle>
            <CardDescription>Verified records & contracts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{doc.title}</p>
                    <p className="text-[10px] text-slate-400">{doc.category} • {doc.size}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">Download</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Information"
        description="Section 3.3.2 rule: Employees can update phone number, address, and avatar."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Residential Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <Input
            label="Profile Picture URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
