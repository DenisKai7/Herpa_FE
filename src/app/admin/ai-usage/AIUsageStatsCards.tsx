'use client';

import React from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  Users,
  AlertTriangle,
  Timer,
  Cpu,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIUsageDashboardStats } from '@/types/admin';

interface AIUsageStatsCardsProps {
  stats: AIUsageDashboardStats | null;
  isLoading?: boolean;
}

const cards = (s: AIUsageDashboardStats) => [
  {
    label: 'Total Requests',
    value: s.total_requests.toLocaleString(),
    icon: <Activity className="h-5 w-5" />,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
  },
  {
    label: 'Total Token Input',
    value: s.total_tokens_input.toLocaleString(),
    icon: <ArrowDownToLine className="h-5 w-5" />,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    label: 'Total Token Output',
    value: s.total_tokens_output.toLocaleString(),
    icon: <ArrowUpFromLine className="h-5 w-5" />,
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20',
  },
  {
    label: 'Total Tokens',
    value: s.total_tokens.toLocaleString(),
    icon: <Layers className="h-5 w-5" />,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
  },
  {
    label: 'Active Users',
    value: s.active_users.toLocaleString(),
    icon: <Users className="h-5 w-5" />,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20',
  },
  {
    label: 'Error Rate',
    value: `${(s.error_rate * 100).toFixed(2)}%`,
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-red-600 bg-red-50 dark:bg-red-950/20',
  },
  {
    label: 'Avg Latency',
    value: `${(s.avg_latency_ms / 1000).toFixed(2)}s`,
    icon: <Timer className="h-5 w-5" />,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20',
  },
  {
    label: 'Active Models',
    value: s.active_models.toLocaleString(),
    icon: <Cpu className="h-5 w-5" />,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20',
  },
  {
    label: 'Active Personas',
    value: s.active_personas.toLocaleString(),
    icon: <UserCheck className="h-5 w-5" />,
    color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/20',
  },
];

export function AIUsageStatsCards({ stats, isLoading }: AIUsageStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(stats ? cards(stats) : Array(9).fill(null)).map((card, i) => (
        <div
          key={card?.label ?? i}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
        >
          {isLoading || !card ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="h-7 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ) : (
            <>
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center mb-3', card.color)}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
