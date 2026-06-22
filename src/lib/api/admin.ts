import apiClient from './client';
import type { AdminAnalytics, AdminUser, UpdateUserRoleRequest } from '@/types';
import type {
  SystemHealthResponse,
  GraphStatsResponse,
  ModelUsageResponse,
  RecommendationAnalyticsResponse,
  QuizAnalyticsResponse,
  StorageStatsResponse,
  ErrorLogResponse,
} from '@/types/admin';

export const adminApi = {
  // --- Existing endpoints (preserved) ---
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await apiClient.get<AdminAnalytics>('/api/admin/analytics');
    return response.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>('/api/admin/users');
    return response.data;
  },

  updateUserRole: async (data: UpdateUserRoleRequest): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>('/api/admin/users/role', data);
    return response.data;
  },

  // --- New endpoints ---

  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const response = await apiClient.get<SystemHealthResponse>('/api/admin/health');
    return response.data;
  },

  getGraphStats: async (): Promise<GraphStatsResponse> => {
    const response = await apiClient.get<GraphStatsResponse>('/api/admin/graph-stats');
    return response.data;
  },

  getModelUsage: async (): Promise<ModelUsageResponse> => {
    const response = await apiClient.get<ModelUsageResponse>('/api/admin/model-usage');
    return response.data;
  },

  getRecommendationAnalytics: async (): Promise<RecommendationAnalyticsResponse> => {
    const response = await apiClient.get<RecommendationAnalyticsResponse>('/api/admin/recommendation-analytics');
    return response.data;
  },

  getQuizAnalytics: async (): Promise<QuizAnalyticsResponse> => {
    const response = await apiClient.get<QuizAnalyticsResponse>('/api/admin/quiz-analytics');
    return response.data;
  },

  getStorageStats: async (): Promise<StorageStatsResponse> => {
    const response = await apiClient.get<StorageStatsResponse>('/api/admin/storage-stats');
    return response.data;
  },

  getRecentErrors: async (params?: { limit?: number; unresolved_only?: boolean }): Promise<ErrorLogResponse> => {
    const response = await apiClient.get<ErrorLogResponse>('/api/admin/errors', {
      params: { limit: params?.limit ?? 50, unresolved_only: params?.unresolved_only ?? true },
    });
    return response.data;
  },
};
