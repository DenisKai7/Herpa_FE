'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  MessageSquare,
  MessagesSquare,
  Activity,
  ArrowLeft,
  Shield,
  Cpu,
  Database,
  Leaf,
  GraduationCap,
  HardDrive,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Spinner, Skeleton } from '@/components/ui/Spinner';
import type { AdminAnalytics } from '@/types';
import type {
  SystemHealthResponse,
  GraphStatsResponse,
  RecommendationAnalyticsResponse,
  QuizAnalyticsResponse,
  StorageStatsResponse,
  ErrorLogEntry,
} from '@/types/admin';
import { cn } from '@/lib/utils';
import { UsersTab } from './users/UsersTab';
import { AIUsageTab } from './ai-usage/AIUsageTab';

type TabId =
  | 'overview'
  | 'users'
  | 'ai_usage'
  | 'graphrag'
  | 'recommendations'
  | 'quiz'
  | 'storage'
  | 'errors';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Overview states
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // GraphRAG states
  const [graphStats, setGraphStats] = useState<GraphStatsResponse | null>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  // Recommendations states
  const [recAnalytics, setRecAnalytics] = useState<RecommendationAnalyticsResponse | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Quiz states
  const [quizAnalytics, setQuizAnalytics] = useState<QuizAnalyticsResponse | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Storage states
  const [storageStats, setStorageStats] = useState<StorageStatsResponse | null>(null);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Errors log states
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);
  const [errorsError, setErrorsError] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Protect admin route
  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [isInitialized, user, router]);

  // Fetch Overview Data (Analytics + Health)
  const fetchOverviewData = useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
    }

    try {
      const healthData = await adminApi.getSystemHealth();
      setHealth(healthData);
    } catch (err) {
      console.error('Failed to load system health:', err);
      // Fallback local health detection / offline representation
      setHealth({
        overall: 'degraded',
        services: {
          fastapi: { status: 'ok', message: 'Connected' },
          supabase: { status: 'ok', message: 'Connected' },
          neo4j: { status: 'unknown', message: 'Not checkable' },
          minio: { status: 'unknown', message: 'Not checkable' },
          llm_text: { status: 'ok', message: 'llama.cpp active' },
        },
      });
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  // Fetch GraphRAG stats
  const fetchGraphStatsData = useCallback(async () => {
    setIsLoadingGraph(true);
    setGraphError(null);
    try {
      const data = await adminApi.getGraphStats();
      setGraphStats(data);
    } catch (err: any) {
      setGraphError(err?.response?.data?.detail || err.message || 'Endpoint not implemented');
    } finally {
      setIsLoadingGraph(false);
    }
  }, []);

  // Fetch Recommendations analytics
  const fetchRecData = useCallback(async () => {
    setIsLoadingRec(true);
    setRecError(null);
    try {
      const data = await adminApi.getRecommendationAnalytics();
      setRecAnalytics(data);
    } catch (err: any) {
      setRecError(err?.response?.data?.detail || err.message || 'Endpoint not implemented');
    } finally {
      setIsLoadingRec(false);
    }
  }, []);

  // Fetch Quiz analytics
  const fetchQuizData = useCallback(async () => {
    setIsLoadingQuiz(true);
    setQuizError(null);
    try {
      const data = await adminApi.getQuizAnalytics();
      setQuizAnalytics(data);
    } catch (err: any) {
      setQuizError(err?.response?.data?.detail || err.message || 'Endpoint not implemented');
    } finally {
      setIsLoadingQuiz(false);
    }
  }, []);

  // Fetch Storage stats
  const fetchStorageData = useCallback(async () => {
    setIsLoadingStorage(true);
    setStorageError(null);
    try {
      const data = await adminApi.getStorageStats();
      setStorageStats(data);
    } catch (err: any) {
      setStorageError(err?.response?.data?.detail || err.message || 'Endpoint not implemented');
    } finally {
      setIsLoadingStorage(false);
    }
  }, []);

  // Fetch Error Logs
  const fetchErrorsData = useCallback(async () => {
    setIsLoadingErrors(true);
    setErrorsError(null);
    try {
      const data = await adminApi.getRecentErrors();
      setErrorLogs(data.errors || []);
    } catch (err: any) {
      setErrorsError(err?.response?.data?.detail || err.message || 'Endpoint not implemented');
    } finally {
      setIsLoadingErrors(false);
    }
  }, []);

  // Dispatch data loading based on active tab
  useEffect(() => {
    if (user?.role !== 'admin') return;

    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'graphrag') {
      fetchGraphStatsData();
    } else if (activeTab === 'recommendations') {
      fetchRecData();
    } else if (activeTab === 'quiz') {
      fetchQuizData();
    } else if (activeTab === 'storage') {
      fetchStorageData();
    } else if (activeTab === 'errors') {
      fetchErrorsData();
    }
  }, [
    activeTab,
    user,
    fetchOverviewData,
    fetchGraphStatsData,
    fetchRecData,
    fetchQuizData,
    fetchStorageData,
    fetchErrorsData,
  ]);

  if (!isInitialized || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const tabItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'ai_usage', label: 'AI Usage', icon: <Cpu className="w-4 h-4" /> },
    { id: 'graphrag', label: 'GraphRAG', icon: <Database className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Leaf className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'errors', label: 'Errors', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const renderHealthBadge = (status?: string) => {
    const s = status || 'unknown';
    const config: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
      ok: { label: 'Berjalan', bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-700 dark:text-green-400 border-green-200 dark:border-green-800', icon: <CheckCircle className="w-3.5 h-3.5" /> },
      degraded: { label: 'Degraded', bg: 'bg-yellow-50 dark:bg-yellow-950/20', text: 'text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      down: { label: 'Mati', bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', icon: <XCircle className="w-3.5 h-3.5" /> },
      unknown: { label: 'Tidak Diketahui', bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    };
    const c = config[s] || config.unknown;
    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', c.bg, c.text)}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#030712] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">HERPA Admin Dashboard</h1>
            </div>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'overview') fetchOverviewData();
              else if (activeTab === 'graphrag') fetchGraphStatsData();
              else if (activeTab === 'recommendations') fetchRecData();
              else if (activeTab === 'quiz') fetchQuizData();
              else if (activeTab === 'storage') fetchStorageData();
              else if (activeTab === 'errors') fetchErrorsData();
            }}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Refresh Tab"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs Select */}
        <div className="flex overflow-x-auto gap-1.5 pb-2 mb-6 border-b border-gray-250 dark:border-gray-800 scrollbar-none">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: analytics?.total_users ?? 0, icon: <UsersIcon className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
                    { label: 'Total Messages', value: analytics?.total_messages ?? 0, icon: <MessageSquare className="h-5 w-5" />, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
                    { label: 'Total Chats', value: analytics?.total_chats ?? 0, icon: <MessagesSquare className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
                    { label: 'Active Today', value: analytics?.active_users_today ?? 0, icon: <Activity className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
                  ].map((card) => (
                    <div key={card.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                      {isLoadingOverview ? (
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-7 w-12" />
                        </div>
                      ) : (
                        <>
                          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center mb-3', card.color)}>
                            {card.icon}
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* System Health Section */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Status Layanan & Health Check</h3>
                  {isLoadingOverview ? (
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {health?.services &&
                        Object.entries(health.services).map(([key, service]) => (
                          <div key={key} className="flex items-center justify-between p-3.5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-950/20">
                            <div>
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">{key.replace('_', ' ')}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{service.message || 'Running smoothly'}</p>
                            </div>
                            {renderHealthBadge(service.status)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && <UsersTab />}

            {/* AI USAGE TAB */}
            {activeTab === 'ai_usage' && <AIUsageTab />}

            {/* GRAPHRAG TAB */}
            {activeTab === 'graphrag' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Statistik Pengetahuan GraphRAG (Neo4j)</h3>
                {isLoadingGraph ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : graphError ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    Data belum tersedia atau service sedang offline.
                  </p>
                ) : graphStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Herbs/Tanaman', value: graphStats.herb_count },
                        { label: 'Senyawa Aktif', value: graphStats.compound_count },
                        { label: 'Penggunaan Tradisional', value: graphStats.traditional_use_count },
                        { label: 'Metode Pengolahan', value: graphStats.preparation_method_count },
                      ].map((item) => (
                        <div key={item.label} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.label}</p>
                          <p className="text-xl font-bold mt-1">{item.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Latensi Neo4j Query:</span>
                        <span className="font-semibold">{graphStats.neo4j_latency_ms} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status Indeks Fulltext:</span>
                        <span>{renderHealthBadge(graphStats.fulltext_index_status)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Belum ada data knowledge graph.</p>
                )}
              </div>
            )}

            {/* RECOMMENDATIONS TAB */}
            {activeTab === 'recommendations' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Statistik Pencarian Herbal</h3>
                {isLoadingRec ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : recError ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    Data belum tersedia atau service sedang offline.
                  </p>
                ) : recAnalytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Total Sesi Analisis</p>
                        <p className="text-xl font-bold mt-1">{recAnalytics.total_sessions}</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">No-Result Rate</p>
                        <p className="text-xl font-bold mt-1">{(recAnalytics.no_result_rate * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Gagal (Exception)</p>
                        <p className="text-xl font-bold mt-1">{(recAnalytics.failure_rate * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Keluhan Paling Sering</h4>
                        <div className="space-y-2">
                          {recAnalytics.top_complaints?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{item.complaint}</span>
                              <span className="text-gray-500">{item.count} kali</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Herbal Paling Sering Direkomendasikan</h4>
                        <div className="space-y-2">
                          {recAnalytics.top_herbs?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{item.herb}</span>
                              <span className="text-gray-500">{item.count} kali</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Belum ada statistik rekomendasi.</p>
                )}
              </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Statistik Kuis Kimia</h3>
                {isLoadingQuiz ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : quizError ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    Data belum tersedia atau service sedang offline.
                  </p>
                ) : quizAnalytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Total Kuis Selesai</p>
                        <p className="text-xl font-bold mt-1">{quizAnalytics.total_sessions}</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Completion Rate</p>
                        <p className="text-xl font-bold mt-1">{(quizAnalytics.completion_rate * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Rata-rata Nilai</p>
                        <p className="text-xl font-bold mt-1">{quizAnalytics.avg_score.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Siswa Harian Aktif</p>
                        <p className="text-xl font-bold mt-1">{quizAnalytics.daily_active_learners}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Materi Terlemah (Rata-rata Nilai Terendah)</h4>
                      <div className="space-y-2">
                        {quizAnalytics.top_weak_topics?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{item.topic}</span>
                            <span className="text-red-500 font-semibold">{item.avg_score.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Belum ada statistik kuis.</p>
                )}
              </div>
            )}

            {/* STORAGE TAB */}
            {activeTab === 'storage' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Statistik Penyimpanan Dokumen & Avatar (MinIO)</h3>
                {isLoadingStorage ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : storageError ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    Data belum tersedia atau service sedang offline.
                  </p>
                ) : storageStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Total Ukuran Storage</p>
                        <p className="text-xl font-bold mt-1">{(storageStats.total_size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Gagal Diunggah</p>
                        <p className="text-xl font-bold mt-1">{storageStats.failed_uploads}</p>
                      </div>
                      <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/20">
                        <p className="text-xs text-gray-400">Status MinIO</p>
                        <div className="mt-1">{renderHealthBadge(storageStats.status)}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Buckets Penyimpanan</h4>
                      <div className="space-y-3">
                        {storageStats.buckets && storageStats.buckets.length > 0 ? (
                          storageStats.buckets.map((bucket) => (
                            <div key={bucket.name} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-950/20 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{bucket.name.replace('-', ' ')}</span>
                                <span className="text-[10px] text-gray-400">{bucket.object_count} File</span>
                              </div>
                              <div className="flex justify-between text-gray-500">
                                <span>Ukuran Terpakai:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{(bucket.size_bytes / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-6">Belum ada data detail.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Belum ada statistik storage.</p>
                )}
              </div>
            )}

            {/* ERRORS LOG TAB */}
            {activeTab === 'errors' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Log Kesalahan Sistem Terbaru</h3>
                {isLoadingErrors ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : errorsError ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    Data belum tersedia atau service sedang offline.
                  </p>
                ) : errorLogs.length > 0 ? (
                  <div className="space-y-3">
                    {errorLogs.map((log) => (
                      <div key={log.id} className="p-3.5 border border-red-100 dark:border-red-950/20 bg-red-50/30 dark:bg-red-950/10 rounded-xl text-xs flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-red-700 dark:text-red-400">{log.code}</p>
                          <p className="text-gray-600 dark:text-gray-300">{log.message}</p>
                          <div className="flex gap-2.5 text-[10px] text-gray-400 pt-0.5">
                            <span>Sumber: {log.source}</span>
                            <span>•</span>
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">Tidak ada kesalahan sistem terdeteksi baru-baru ini.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
