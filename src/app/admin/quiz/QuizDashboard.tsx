'use client';

import React from 'react';
import {
  BookOpen,
  Layers,
  HelpCircle,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Trophy,
  Users,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { QuizDashboardStats } from '@/types/admin';

interface Props {
  stats: QuizDashboardStats;
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const fmt = (v: unknown, d = 0): string => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '0';
  return d > 0 ? n.toFixed(d) : n.toLocaleString();
};

const statCards = (s: QuizDashboardStats) => [
  { label: 'Total Modules', value: fmt(s?.total_modules), icon: <BookOpen className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
  { label: 'Total Levels', value: fmt(s?.total_levels), icon: <Layers className="h-5 w-5" />, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
  { label: 'Total Questions', value: fmt(s?.total_questions), icon: <HelpCircle className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
  { label: 'Total Attempts', value: fmt(s?.total_attempts), icon: <BarChart3 className="h-5 w-5" />, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20' },
  { label: 'Completion Rate', value: `${fmt(s?.completion_rate ? s.completion_rate * 100 : 0, 1)}%`, icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  { label: 'Avg Score', value: `${fmt(s?.avg_score, 1)}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
  { label: 'Highest Score', value: `${fmt(s?.highest_score, 1)}%`, icon: <Trophy className="h-5 w-5" />, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20' },
  { label: 'Active Users Today', value: fmt(s?.active_users_today), icon: <Users className="h-5 w-5" />, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20' },
  { label: 'Published Modules', value: fmt(s?.published_modules), icon: <FileCheck className="h-5 w-5" />, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/20' },
];

const cardClass = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm';
const chartCardClass = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm';
const chartTitleClass = 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3';

export default function QuizDashboard({ stats }: Props) {
  const byModule = stats?.by_module ?? [];
  const byDifficulty = stats?.by_difficulty ?? [];
  const dailyAttempts = stats?.daily_attempts ?? [];

  const difficultyLabels: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert' };
  const difficultyData = byDifficulty.map((d) => ({
    ...d,
    name: difficultyLabels[d.difficulty] ?? `Level ${d.difficulty}`,
  }));

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Questions per Module Bar Chart */}
        <div className={chartCardClass}>
          <p className={chartTitleClass}>Questions per Module</p>
          {byModule.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byModule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="module" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-xs text-gray-400">No data available</div>
          )}
        </div>

        {/* By Difficulty Pie Chart */}
        <div className={chartCardClass}>
          <p className={chartTitleClass}>By Difficulty</p>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={difficultyData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {difficultyData.map((_, i) => (
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

        {/* Daily Attempts Line Chart */}
        <div className={chartCardClass}>
          <p className={chartTitleClass}>Daily Attempts</p>
          {dailyAttempts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyAttempts}>
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
      </div>
    </div>
  );
}
