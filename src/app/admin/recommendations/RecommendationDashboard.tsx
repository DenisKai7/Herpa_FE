'use client';

import React from 'react';
import {
  Activity,
  Layers,
  CalendarDays,
  CalendarRange,
  Calendar,
  CheckCircle,
  XCircle,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { RecommendationDashboardStats, RecommendationChartsData } from '@/types/admin';

interface Props {
  stats: RecommendationDashboardStats;
  charts: RecommendationChartsData;
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

/** Safe number formatter — handles undefined, null, NaN */
const fmt = (v: unknown, decimals = 0): string => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '0';
  return decimals > 0 ? n.toFixed(decimals) : n.toLocaleString();
};

const statCards = (s: RecommendationDashboardStats) => [
  { label: 'Total Sessions', value: fmt(s?.total_sessions), icon: <Activity className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
  { label: 'Total Results', value: fmt(s?.total_results), icon: <Layers className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
  { label: 'Today', value: fmt(s?.sessions_today), icon: <CalendarDays className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
  { label: 'This Week', value: fmt(s?.sessions_this_week), icon: <CalendarRange className="h-5 w-5" />, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
  { label: 'This Month', value: fmt(s?.sessions_this_month), icon: <Calendar className="h-5 w-5" />, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20' },
  { label: 'Success Rate', value: `${fmt(s?.success_rate ? s.success_rate * 100 : 0, 1)}%`, icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  { label: 'Failure Rate', value: `${fmt(s?.failure_rate ? s.failure_rate * 100 : 0, 1)}%`, icon: <XCircle className="h-5 w-5" />, color: 'text-red-600 bg-red-50 dark:bg-red-950/20' },
  { label: 'Avg Latency', value: `${fmt(s?.avg_latency_ms ? s.avg_latency_ms / 1000 : 0, 2)}s`, icon: <Timer className="h-5 w-5" />, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20' },
];

const cardClass = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm';
const chartCardClass = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm';
const chartTitleClass = 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3';

export default function RecommendationDashboard({ stats, charts }: Props) {
  // Safe chart data with defaults
  const dailySessions = charts?.daily_sessions ?? [];
  const topHerbs = (charts?.top_herbs ?? []).slice(0, 8);
  const byPersona = charts?.by_persona ?? [];
  const successVsFailed = charts?.success_vs_failed ?? { success: 0, failed: 0, no_result: 0 };

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards(stats).map((card) => (
          <div key={card.label} className={cardClass}>
            <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center mb-3', card.color)}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Sessions Line Chart */}
        <div className={chartCardClass}>
          <p className={chartTitleClass}>Daily Sessions</p>
          {dailySessions.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailySessions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-xs text-gray-400">No data available</div>
          )}
        </div>

        {/* Top Herbs Bar Chart */}
        <div className={chartCardClass}>
          <p className={chartTitleClass}>Top Herbs</p>
          {topHerbs.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topHerbs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="herb" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-xs text-gray-400">No data available</div>
          )}
        </div>

        {/* By Persona Pie Chart */}
        <div className={chartCardClass}>
          <p className={chartTitleClass}>By Persona</p>
          {byPersona.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byPersona} dataKey="count" nameKey="persona" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {byPersona.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-xs text-gray-400">No data available</div>
          )}
        </div>

        {/* Success vs Failed Donut Chart */}
        <div className={chartCardClass}>
          <p className={chartTitleClass}>Success vs Failed</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Success', value: successVsFailed.success ?? 0 },
                  { name: 'Failed', value: successVsFailed.failed ?? 0 },
                  { name: 'No Result', value: successVsFailed.no_result ?? 0 },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
