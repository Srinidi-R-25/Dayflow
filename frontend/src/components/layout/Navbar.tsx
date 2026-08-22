'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, employee, role, switchRole, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifications = user ? api.getNotifications(user.employeeId) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href={role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20">
            D
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Dayflow</span>
            <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">HRMS</span>
          </div>
        </Link>
      </div>

      {/* Center Role Toggle Quick Switcher */}
      <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/80">
        <button
          onClick={() => switchRole('EMPLOYEE')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            role === 'EMPLOYEE'
              ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Employee View
        </button>
        <button
          onClick={() => switchRole('ADMIN')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            role === 'ADMIN'
              ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin / HR View
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{unreadCount} new</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 my-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/notifications"
                onClick={() => setShowNotifMenu(false)}
                className="block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 pt-1"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {employee?.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={employee.name}
                className="h-8 w-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-800"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs dark:bg-indigo-950 dark:text-indigo-300">
                {employee?.name ? employee.name[0] : 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{employee?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{role === 'ADMIN' ? 'HR Admin' : 'Employee'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{employee?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{employee?.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserIcon className="h-4 w-4 text-slate-500" />
                View Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
