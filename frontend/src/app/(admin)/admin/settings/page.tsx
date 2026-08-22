'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, Shield, Bell, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HR System Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Organization policies, working hours, and approval rules
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>System policies updated successfully!</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Company Workday & Shift Rules
          </CardTitle>
          <CardDescription>Configure standard shift hours and attendance parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4 max-w-md text-xs">
            <Input label="Standard Daily Work Hours" defaultValue="8.5" />
            <Input label="Standard Shift Start Time" defaultValue="09:00 AM" />
            <Input label="Standard Shift End Time" defaultValue="05:30 PM" />
            <Input label="Default Annual Paid Leave Days" defaultValue="15" />
            <Button type="submit">Save System Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
