'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  Bell, 
  Settings, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Building2,
  ShieldCheck,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  const employeeLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', href: '/profile', icon: User },
    { label: 'Attendance', href: '/attendance', icon: Clock },
    { label: 'Leave Requests', href: '/leave', icon: Calendar },
    { label: 'Payroll & Salary', href: '/payroll', icon: DollarSign },
    { label: 'My Documents', href: '/documents', icon: FileText },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminLinks = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Employee Management', href: '/admin/employees', icon: Users },
    { label: 'Attendance Monitoring', href: '/admin/attendance', icon: Clock },
    { label: 'Leave Approvals', href: '/admin/leaves', icon: CheckSquare },
    { label: 'Payroll Control', href: '/admin/payroll', icon: DollarSign },
    { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { label: 'HR Settings', href: '/admin/settings', icon: Settings },
  ];

  const currentLinks = role === 'ADMIN' ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-2 py-3 mb-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
              D
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Dayflow HRMS</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Banner */}
        <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-950 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2">
            {role === 'ADMIN' ? (
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            )}
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              {role === 'ADMIN' ? 'HR / Admin Portal' : 'Employee Portal'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 dark:bg-indigo-500'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Dayflow HRMS v1.0.0</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Every workday, perfectly aligned.</p>
        </div>
      </aside>
    </>
  );
}
