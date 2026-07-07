'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import type {
  AIUsageLog,
  AIUsageListParams,
  AIUsageDashboardStats,
  AIUsageChartsData,
} from '@/types/admin';

export function useAIUsage() {
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<AIUsageDashboardStats | null>(null);
  const [chartsData, setChartsData] = useState<AIUsageChartsData | null>(null);
  const [filters, setFilters] = useState<AIUsageListParams>({ limit: 10, offset: 0 });

  const fetchLogs = useCallback(async (p?: AIUsageListParams) => {
    const merged = p ? { ...filters, ...p } : filters;
    if (p) setFilters(merged);
    setLoading(true);
    try {
      const res = await adminApi.getAIUsageLogs(merged);
      setLogs(res.logs);
      setTotal(res.total);
    } catch {
      toast.error('Gagal memuat log AI usage.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchDashboard = useCallback(async (params?: { date_from?: string; date_to?: string }) => {
    try {
      const data = await adminApi.getAIUsageDashboard(params);
      setDashboardStats(data);
    } catch {
      toast.error('Gagal memuat dashboard stats.');
    }
  }, []);

  const fetchCharts = useCallback(async (params?: { days?: number; date_from?: string; date_to?: string }) => {
    try {
      const data = await adminApi.getAIUsageCharts(params);
      setChartsData(data);
    } catch {
      toast.error('Gagal memuat data charts.');
    }
  }, []);

  const deleteLog = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.deleteAIUsageLog(id);
      toast.success('Log berhasil dihapus.');
      await fetchLogs();
      return true;
    } catch {
      toast.error('Gagal menghapus log.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchLogs]);

  const bulkDelete = useCallback(async (ids: number[]): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await adminApi.bulkDeleteAIUsage(ids);
      toast.success(`${res.deleted_count} log berhasil dihapus.`);
      await fetchLogs();
      return true;
    } catch {
      toast.error('Gagal menghapus log.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchLogs]);

  const deleteByFilter = useCallback(async (filter: {
    user_id?: string;
    persona?: string;
    model_name?: string;
    endpoint?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
  }): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await adminApi.deleteAIUsageByFilter(filter);
      toast.success(`${res.deleted_count} log berhasil dihapus.`);
      await fetchLogs();
      return true;
    } catch {
      toast.error('Gagal menghapus log.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchLogs]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = useCallback(async (params?: AIUsageListParams) => {
    try {
      const blob = await adminApi.exportAIUsageCSV(params);
      downloadBlob(blob, 'ai-usage-export.csv');
      toast.success('Export CSV berhasil.');
    } catch {
      toast.error('Gagal export CSV.');
    }
  }, []);

  const exportExcel = useCallback(async (params?: AIUsageListParams) => {
    try {
      const blob = await adminApi.exportAIUsageExcel(params);
      downloadBlob(blob, 'ai-usage-export.xlsx');
      toast.success('Export Excel berhasil.');
    } catch {
      toast.error('Gagal export Excel.');
    }
  }, []);

  const exportPDF = useCallback(async (params?: AIUsageListParams) => {
    try {
      const blob = await adminApi.exportAIUsagePDF(params);
      downloadBlob(blob, 'ai-usage-export.pdf');
      toast.success('Export PDF berhasil.');
    } catch {
      toast.error('Gagal export PDF.');
    }
  }, []);

  return {
    logs, total, loading, actionLoading,
    dashboardStats, chartsData, filters,
    fetchLogs, fetchDashboard, fetchCharts,
    deleteLog, bulkDelete, deleteByFilter,
    exportCSV, exportExcel, exportPDF,
  };
}
