import React from 'react';
import { cn } from '@/lib/utils';
import { AttendanceStatus, LeaveStatus, LeaveType } from '@/lib/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  status?: AttendanceStatus | LeaveStatus | LeaveType | string;
}

export function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'PRESENT':
      case 'APPROVED':
      case 'PAID':
      case 'ACTIVE':
        computedVariant = 'success';
        break;
      case 'HALF_DAY':
      case 'PENDING':
      case 'SICK':
        computedVariant = 'warning';
        break;
      case 'ABSENT':
      case 'REJECTED':
      case 'UNPAID':
      case 'INACTIVE':
        computedVariant = 'danger';
        break;
      case 'LEAVE':
        computedVariant = 'info';
        break;
      default:
        computedVariant = 'secondary';
    }
  }

  const variantStyles = {
    default: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variantStyles[computedVariant],
        className
      )}
      {...props}
    >
      {children || status}
    </span>
  );
}
