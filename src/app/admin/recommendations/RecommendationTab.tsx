'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRecommendations } from './useRecommendations';
import RecommendationDashboard from './RecommendationDashboard';
import RecommendationTable from './RecommendationTable';
import RecommendationDetailModal from './RecommendationDetailModal';
import RecommendationFilters from './RecommendationFilters';
import type { RecommendationSession } from '@/types/admin';
import type { RecommendationFilters as HookFilters } from './useRecommendations';

const LIMIT = 20;

export default function RecommendationTab() {
  const {
    sessions, total, loading,
    dashboardStats, chartsData,
    fetchSessions, fetchDashboard, fetchCharts,
    deleteSession, exportCSV,
  } = useRecommendations();

  const [detailSession, setDetailSession] = useState<RecommendationSession | null>(null);
  const [offset, setOffset] = useState(0);

  const [filters, setFilters] = useState<HookFilters>({
    limit: LIMIT,
    offset: 0,
    sort: 'created_at',
    sort_dir: 'desc',
  });

  const reload = useCallback((overrides?: Partial<HookFilters>) => {
    const params = { ...filters, ...overrides };
    fetchSessions(params);
  }, [filters, fetchSessions]);

  useEffect(() => {
    reload();
    fetchDashboard();
    fetchCharts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { reload(); }, [filters]);

  const handleFilterChange = (newFilters: HookFilters) => {
    setFilters({ ...newFilters, limit: LIMIT, offset: 0 });
    setOffset(0);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    reload({ offset: newOffset });
  };

  const handleDelete = async (sessionId: string) => {
    const ok = await deleteSession(sessionId);
    if (ok) reload();
  };

  return (
    <div className="space-y-4">
      {/* Dashboard Stats + Charts */}
      {dashboardStats && chartsData && (
        <div className="space-y-4">
          {/* Stats cards always visible */}
          <RecommendationDashboard stats={dashboardStats} charts={chartsData} />
        </div>
      )}

      {/* Filters */}
      <RecommendationFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Toolbar */}
      <div className="flex items-center justify-end">
        <button
          onClick={exportCSV}
          className="px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
        >
          Export CSV
        </button>
      </div>

      {/* Data Table */}
      <RecommendationTable
        sessions={sessions}
        total={total}
        limit={LIMIT}
        offset={offset}
        onPageChange={handlePageChange}
        onViewDetail={setDetailSession}
        onDelete={handleDelete}
      />

      {/* Detail Modal */}
      <RecommendationDetailModal session={detailSession} onClose={() => setDetailSession(null)} />
    </div>
  );
}
