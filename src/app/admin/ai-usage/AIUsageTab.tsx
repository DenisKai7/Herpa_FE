'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAIUsage } from './useAIUsage';
import { AIUsageStatsCards } from './AIUsageStatsCards';
import AIUsageCharts from './AIUsageCharts';
import { AIUsageTable } from './AIUsageTable';
import { AIUsageFilters } from './AIUsageFilters';
import { AIUsageDetailModal } from './AIUsageDetailModal';
import { AIUsageExportButton } from './AIUsageExportButton';
import { AIUsageDeleteDialog } from './AIUsageDeleteDialog';
import type { AIUsageListParams } from '@/types/admin';

const LIMIT = 20;

export function AIUsageTab() {
  const {
    logs, total, loading, actionLoading,
    dashboardStats, chartsData,
    fetchLogs, fetchDashboard, fetchCharts,
    deleteLog, bulkDelete,
    exportCSV, exportExcel, exportPDF,
  } = useAIUsage();

  const [chartsOpen, setChartsOpen] = useState(true);
  const [detailLogId, setDetailLogId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);

  const [filters, setFilters] = useState<AIUsageListParams>({
    limit: LIMIT,
    offset: 0,
    sort: 'created_at',
    sort_dir: 'desc',
  });

  const reload = useCallback((overrides?: Partial<AIUsageListParams>) => {
    const params = { ...filters, ...overrides };
    fetchLogs(params);
  }, [filters, fetchLogs]);

  useEffect(() => {
    reload();
    fetchDashboard();
    fetchCharts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { reload(); }, [filters]);

  const handleFilterChange = (newFilters: AIUsageListParams) => {
    setFilters({ ...newFilters, limit: LIMIT, offset: 0 });
    setOffset(0);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    reload({ offset: newOffset });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const ok = await bulkDelete(selectedIds);
    if (ok) {
      setSelectedIds([]);
      reload();
    }
  };

  const handleSingleDelete = async (id: number) => {
    const ok = await deleteLog(id);
    if (ok) reload();
  };

  return (
    <div className="space-y-4">
      {/* Dashboard Stats */}
      {dashboardStats && <AIUsageStatsCards stats={dashboardStats} />}

      {/* Charts (collapsible) */}
      {chartsData && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={() => setChartsOpen(!chartsOpen)}
          >
            <span>Charts & Analytics</span>
            <svg className={`w-4 h-4 transition-transform ${chartsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {chartsOpen && (
            <div className="px-4 pb-4">
              <AIUsageCharts data={chartsData} />
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <AIUsageFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-xs text-purple-700 dark:text-purple-300">
              <span>{selectedIds.length} item dipilih</span>
              <button
                className="text-red-600 dark:text-red-400 hover:underline font-medium cursor-pointer"
                onClick={handleBulkDelete}
                disabled={actionLoading}
              >
                Hapus Terpilih
              </button>
            </div>
          )}
        </div>
        <AIUsageExportButton
          filters={filters}
          onExport={(type) => {
            if (type === 'csv') exportCSV(filters);
            else if (type === 'excel') exportExcel(filters);
            else exportPDF(filters);
          }}
          isLoading={actionLoading}
        />
      </div>

      {/* Data Table */}
      <AIUsageTable
        logs={logs}
        total={total}
        limit={LIMIT}
        offset={offset}
        onPageChange={handlePageChange}
        onViewDetail={setDetailLogId}
        onDelete={handleSingleDelete}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Detail Modal */}
      <AIUsageDetailModal logId={detailLogId} onClose={() => setDetailLogId(null)} />

      {/* Delete Dialog */}
      <AIUsageDeleteDialog
        selectedIds={selectedIds}
        onClose={() => setSelectedIds([])}
        onConfirm={handleBulkDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}
