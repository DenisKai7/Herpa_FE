'use client';

import React from 'react';
import {
  Database,
  GitBranch,
  Tag,
  Leaf,
  FlaskConical,
  BookOpen,
  Beaker,
  ShieldAlert,
  FileText,
  Activity,
  Heart,
  Timer,
} from 'lucide-react';
import type { GraphDashboardStats } from '@/types/admin';

interface GraphDashboardProps {
  stats: GraphDashboardStats;
}

const statCards = [
  { key: 'total_nodes', label: 'Total Nodes', icon: Database, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
  { key: 'total_relationships', label: 'Total Relationships', icon: GitBranch, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
  { key: 'total_labels', label: 'Total Labels', icon: Tag, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
  { key: 'herb_count', label: 'Herbs', icon: Leaf, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
  { key: 'compound_count', label: 'Compounds', icon: FlaskConical, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
  { key: 'traditional_use_count', label: 'Traditional Uses', icon: BookOpen, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
  { key: 'preparation_method_count', label: 'Preparation Methods', icon: Beaker, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/20' },
  { key: 'safety_warning_count', label: 'Safety Warnings', icon: ShieldAlert, color: 'text-red-600 bg-red-50 dark:bg-red-950/20' },
  { key: 'source_count', label: 'Sources', icon: FileText, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20' },
  { key: 'symptom_count', label: 'Symptoms', icon: Activity, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/20' },
  { key: 'family_count', label: 'Families', icon: Heart, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20' },
] as const;

export function GraphDashboard({ stats }: GraphDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof GraphDashboardStats];
          return (
            <div
              key={card.key}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm"
            >
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-2 ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value as number}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
            </div>
          );
        })}

        {/* Neo4j Latency card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-2 text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20">
            <Timer className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {stats.neo4j_latency_ms?.toFixed(1) ?? '-'}ms
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Neo4j Latency</p>
        </div>
      </div>
    </div>
  );
}
