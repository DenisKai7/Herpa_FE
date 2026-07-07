'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray' | 'purple';

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800',
  red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
  gray: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800',
  purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800',
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'gray', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border', variantStyles[variant], className)}>
      {children}
    </span>
  );
}

const statusMap = { active: { variant: 'green' as const, label: 'Aktif' }, suspended: { variant: 'yellow' as const, label: 'Ditangguhkan' }, deleted: { variant: 'red' as const, label: 'Dihapus' } };

export function StatusBadge({ status }: { status: 'active' | 'suspended' | 'deleted' }) {
  const { variant, label } = statusMap[status] ?? statusMap.active;
  return <Badge variant={variant}>{label}</Badge>;
}

export function RoleBadge({ role }: { role: 'admin' | 'user' }) {
  return <Badge variant={role === 'admin' ? 'purple' : 'gray'}>{role}</Badge>;
}
