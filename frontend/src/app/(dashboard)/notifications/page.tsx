'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCircle2, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [, setTick] = useState(0);

  if (!user) return null;

  const notifs = api.getNotifications(user.employeeId);

  const handleMarkRead = (id: string) => {
    api.markNotificationAsRead(id);
    setTick(t => t + 1);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'ALERT': return <ShieldAlert className="h-5 w-5 text-rose-500" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications Center</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Stay updated on leave approvals, payroll credits, and system announcements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            All Notifications
          </CardTitle>
          <CardDescription>Chronological activity timeline</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
          {notifs.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No notifications found.</p>
          ) : (
            notifs.map((n) => (
              <div key={n.id} className={`py-4 flex items-start gap-4 transition-colors ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/20 px-3 rounded-xl' : ''}`}>
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</h3>
                    <span className="text-[10px] text-slate-400">{formatDate(n.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                </div>
                {!n.read && (
                  <Button size="sm" variant="ghost" onClick={() => handleMarkRead(n.id)} className="text-xs text-indigo-600 shrink-0">
                    Mark Read
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
