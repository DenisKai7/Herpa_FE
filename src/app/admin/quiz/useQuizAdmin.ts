'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api/admin';
import type {
  QuizModule,
  QuizLevel,
  QuizQuestion,
  QuizDashboardStats,
} from '@/types/admin';

const DEFAULT_DASHBOARD: QuizDashboardStats = {
  total_modules: 0,
  total_levels: 0,
  total_questions: 0,
  total_attempts: 0,
  completed_attempts: 0,
  completion_rate: 0,
  avg_score: 0,
  highest_score: 0,
  lowest_score: 0,
  active_users_today: 0,
  published_modules: 0,
  draft_modules: 0,
  by_module: [],
  by_difficulty: [],
  daily_attempts: [],
};

export function useQuizAdmin() {
  // Dashboard
  const [dashboard, setDashboard] = useState<QuizDashboardStats>(DEFAULT_DASHBOARD);

  // Modules
  const [modules, setModules] = useState<QuizModule[]>([]);
  const [modulesTotal, setModulesTotal] = useState(0);

  // Levels
  const [levels, setLevels] = useState<QuizLevel[]>([]);
  const [levelsTotal, setLevelsTotal] = useState(0);

  // Questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsTotal, setQuestionsTotal] = useState(0);

  // Loading
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetchers ──

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await adminApi.getQuizDashboard();
      setDashboard({ ...DEFAULT_DASHBOARD, ...data });
    } catch {
      toast.error('Gagal memuat dashboard quiz.');
    }
  }, []);

  const fetchModules = useCallback(async (params?: { limit?: number; offset?: number; search?: string }) => {
    setLoading(true);
    try {
      const res = await adminApi.getQuizModules(params);
      setModules(res.modules);
      setModulesTotal(res.total);
    } catch {
      toast.error('Gagal memuat modul.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLevels = useCallback(async (params?: { module_id?: string; limit?: number; offset?: number }) => {
    setLoading(true);
    try {
      const res = await adminApi.getQuizLevels(params);
      setLevels(res.levels);
      setLevelsTotal(res.total);
    } catch {
      toast.error('Gagal memuat level.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (params?: { level_id?: string; limit?: number; offset?: number; search?: string }) => {
    setLoading(true);
    try {
      const res = await adminApi.getQuizQuestions(params);
      setQuestions(res.questions);
      setQuestionsTotal(res.total);
    } catch {
      toast.error('Gagal memuat soal.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Module CRUD ──

  const createModule = useCallback(async (data: { title: string; description?: string; subject_id?: string }): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.createQuizModule(data);
      toast.success('Modul berhasil dibuat.');
      return true;
    } catch {
      toast.error('Gagal membuat modul.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateModule = useCallback(async (id: string, data: Partial<QuizModule>): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.updateQuizModule(id, data);
      toast.success('Modul berhasil diperbarui.');
      return true;
    } catch {
      toast.error('Gagal memperbarui modul.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteModule = useCallback(async (id: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.deleteQuizModule(id);
      toast.success('Modul berhasil dihapus.');
      return true;
    } catch {
      toast.error('Gagal menghapus modul.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  // ── Level CRUD ──

  const createLevel = useCallback(async (data: { module_id: string; title: string; level_number?: number; passing_score?: number; xp_reward?: number }): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.createQuizLevel(data);
      toast.success('Level berhasil dibuat.');
      return true;
    } catch {
      toast.error('Gagal membuat level.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateLevel = useCallback(async (id: string, data: Partial<QuizLevel>): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.updateQuizLevel(id, data);
      toast.success('Level berhasil diperbarui.');
      return true;
    } catch {
      toast.error('Gagal memperbarui level.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteLevel = useCallback(async (id: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.deleteQuizLevel(id);
      toast.success('Level berhasil dihapus.');
      return true;
    } catch {
      toast.error('Gagal menghapus level.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  // ── Question CRUD ──

  const createQuestion = useCallback(async (data: { level_id: string; prompt: string; question_type?: string; explanation?: string; difficulty?: number; options?: Array<{ option_key: string; label: string; is_correct: boolean }> }): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.createQuizQuestion(data);
      toast.success('Soal berhasil dibuat.');
      return true;
    } catch {
      toast.error('Gagal membuat soal.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateQuestion = useCallback(async (id: string, data: Partial<QuizQuestion>): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.updateQuizQuestion(id, data);
      toast.success('Soal berhasil diperbarui.');
      return true;
    } catch {
      toast.error('Gagal memperbarui soal.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (id: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      await adminApi.deleteQuizQuestion(id);
      toast.success('Soal berhasil dihapus.');
      return true;
    } catch {
      toast.error('Gagal menghapus soal.');
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    dashboard,
    modules, modulesTotal,
    levels, levelsTotal,
    questions, questionsTotal,
    loading, actionLoading,
    fetchDashboard, fetchModules, fetchLevels, fetchQuestions,
    createModule, updateModule, deleteModule,
    createLevel, updateLevel, deleteLevel,
    createQuestion, updateQuestion, deleteQuestion,
  };
}
