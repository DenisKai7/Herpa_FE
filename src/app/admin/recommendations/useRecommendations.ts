'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import type {
  RecommendationSession,
  RecommendationDashboardStats,
  RecommendationChartsData,
} from '@/types/admin';

export interface RecommendationFilters {
  limit: number;
  offset: number;
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  sort_dir?: string;
}

export function useRecommendations() {
  const [sessions, setSessions] = useState<RecommendationSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<RecommendationDashboardStats | null>(null);
  const [chartsData, setChartsData] = useState<RecommendationChartsData | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({ limit: 10, offset: 0 });

  const fetchSessions = useCallback(async (p?: RecommendationFilters) => {
    const merged = p ? { ...filters, ...p } : filters;
    if (p) setFilters(merged);
    setLoading(true);
    try {
      const res = await adminApi.getRecommendationSessions(merged);
      setSessions(res.sessions);
      setTotal(res.total);
    } catch {
      toast.error('Gagal memuat sesi rekomendasi.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const DEFAULT_DASHBOARD: RecommendationDashboardStats = {
    total_sessions: 0, total_results: 0, sessions_today: 0, sessions_this_week: 0,
    sessions_this_month: 0, success_rate: 0, failure_rate: 0, no_result_rate: 0,
    avg_latency_ms: 0, top_complaints: [], top_herbs: [], by_persona: [], daily: [],
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await adminApi.getRecommendationDashboard();
      // Merge with defaults to ensure all fields exist
      setDashboardStats({ ...DEFAULT_DASHBOARD, ...data });
    } catch {
      toast.error('Gagal memuat dashboard stats.');
    }
  }, []);

  const DEFAULT_CHARTS: RecommendationChartsData = {
    daily_sessions: [], by_persona: [], top_herbs: [], top_complaints: [],
    success_vs_failed: { success: 0, failed: 0, no_result: 0 }, hourly_heatmap: [],
  };

  const fetchCharts = useCallback(async () => {
    try {
      const data = await adminApi.getRecommendationCharts();
      setChartsData({ ...DEFAULT_CHARTS, ...data });
    } catch {
      toast.error('Gagal memuat data charts.');
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.deleteRecommendationSession(sessionId);
      toast.success('Sesi rekomendasi berhasil dihapus.');
      await fetchSessions();
      return true;
    } catch {
      toast.error('Gagal menghapus sesi.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [fetchSessions]);

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

  const exportCSV = useCallback(async () => {
    try {
      const blob = await adminApi.exportRecommendationsCSV();
      downloadBlob(blob, 'recommendations-export.csv');
      toast.success('Export CSV berhasil.');
    } catch {
      toast.error('Gagal export CSV.');
    }
  }, []);

  return {
    sessions, total, loading, actionLoading,
    dashboardStats, chartsData, filters,
    fetchSessions, fetchDashboard, fetchCharts,
    deleteSession, exportCSV,
  };
}
