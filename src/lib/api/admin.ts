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
  AIUsageListParams,
  AIUsageListResponse,
  AIUsageDetail,
  AIUsageDashboardStats,
  AIUsageChartsData,
  GraphDashboardStats,
  GraphSchema,
  GraphNode,
  GraphRelationship,
  GraphVisualizationData,
  RecommendationSession,
  RecommendationDashboardStats,
  RecommendationChartsData,
  QuizModule,
  QuizLevel,
  QuizQuestion,
  QuizDashboardStats,
} from '@/types/admin';

// ── Types for CRUD ──

export interface UserListParams {
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  sort_dir?: string;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  instansi?: string;
  role: 'admin' | 'user';
}

export interface UpdateUserPayload {
  full_name?: string;
  instansi?: string;
  role?: 'admin' | 'user';
  account_status?: 'active' | 'suspended';
}

export const adminApi = {
  // --- Existing endpoints (preserved) ---
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await apiClient.get<AdminAnalytics>('/api/admin/analytics', { silent: true });
    return response.data;
  },

  getUsers: async (params?: UserListParams): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>('/api/admin/users', { params, silent: true });
    return response.data;
  },

  updateUserRole: async (data: UpdateUserRoleRequest): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>('/api/admin/users/role', data);
    return response.data;
  },

  // --- CRUD endpoints ---

  createUser: async (payload: CreateUserPayload): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>('/api/admin/users', payload);
    return response.data;
  },

  updateUser: async (userId: string, payload: UpdateUserPayload): Promise<AdminUser> => {
    const response = await apiClient.patch<AdminUser>(`/api/admin/users/${userId}`, payload);
    return response.data;
  },

  deleteUser: async (userId: string, reason?: string): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${userId}`, { data: reason ? { reason } : undefined });
  },

  restoreUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/api/admin/users/${userId}/restore`);
  },

  resetPassword: async (userId: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/api/admin/users/${userId}/reset-password`, { new_password: newPassword });
  },

  getUserDetail: async (userId: string): Promise<AdminUser> => {
    const response = await apiClient.get<AdminUser>(`/api/v1/admin/users/${userId}`, { silent: true });
    return response.data;
  },

  // --- Existing analytics endpoints ---

  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const response = await apiClient.get<SystemHealthResponse>('/api/admin/health', { silent: true });
    return response.data;
  },

  getGraphStats: async (): Promise<GraphStatsResponse> => {
    const response = await apiClient.get<GraphStatsResponse>('/api/admin/graph-stats', { silent: true });
    return response.data;
  },

  getModelUsage: async (): Promise<ModelUsageResponse> => {
    const response = await apiClient.get<ModelUsageResponse>('/api/admin/model-usage', { silent: true });
    return response.data;
  },

  getRecommendationAnalytics: async (): Promise<RecommendationAnalyticsResponse> => {
    const response = await apiClient.get<RecommendationAnalyticsResponse>('/api/admin/recommendation-analytics', { silent: true });
    return response.data;
  },

  getQuizAnalytics: async (): Promise<QuizAnalyticsResponse> => {
    const response = await apiClient.get<QuizAnalyticsResponse>('/api/admin/quiz-analytics', { silent: true });
    return response.data;
  },

  getStorageStats: async (): Promise<StorageStatsResponse> => {
    const response = await apiClient.get<StorageStatsResponse>('/api/admin/storage-stats', { silent: true });
    return response.data;
  },

  getRecentErrors: async (params?: { limit?: number; unresolved_only?: boolean }): Promise<ErrorLogResponse> => {
    const response = await apiClient.get<ErrorLogResponse>('/api/admin/errors', {
      params: { limit: params?.limit ?? 50, unresolved_only: params?.unresolved_only ?? true },
      silent: true,
    });
    return response.data;
  },

  // --- AI Usage Management ---

  getAIUsageLogs: async (params?: AIUsageListParams): Promise<AIUsageListResponse> => {
    const response = await apiClient.get<AIUsageListResponse>('/api/admin/ai-usage', { params, silent: true });
    return response.data;
  },

  getAIUsageDetail: async (id: number): Promise<AIUsageDetail> => {
    const response = await apiClient.get<AIUsageDetail>(`/api/admin/ai-usage/${id}`, { silent: true });
    return response.data;
  },

  deleteAIUsageLog: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/ai-usage/${id}`);
  },

  bulkDeleteAIUsage: async (ids: number[]): Promise<{ deleted_count: number }> => {
    const response = await apiClient.delete<{ deleted_count: number }>('/api/admin/ai-usage/bulk', { data: { ids } });
    return response.data;
  },

  deleteAIUsageByFilter: async (filter: {
    user_id?: string;
    persona?: string;
    model_name?: string;
    endpoint?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
  }): Promise<{ deleted_count: number }> => {
    const response = await apiClient.post<{ deleted_count: number }>('/api/admin/ai-usage/delete-by-filter', filter);
    return response.data;
  },

  getAIUsageDashboard: async (params?: { date_from?: string; date_to?: string }): Promise<AIUsageDashboardStats> => {
    const response = await apiClient.get<AIUsageDashboardStats>('/api/admin/ai-usage/dashboard', { params, silent: true });
    return response.data;
  },

  getAIUsageCharts: async (params?: { days?: number; date_from?: string; date_to?: string }): Promise<AIUsageChartsData> => {
    const response = await apiClient.get<AIUsageChartsData>('/api/admin/ai-usage/charts', { params, silent: true });
    return response.data;
  },

  exportAIUsageCSV: async (params?: AIUsageListParams): Promise<Blob> => {
    const response = await apiClient.get('/api/admin/ai-usage/export/csv', { params, responseType: 'blob' });
    return response.data;
  },

  exportAIUsageExcel: async (params?: AIUsageListParams): Promise<Blob> => {
    const response = await apiClient.get('/api/admin/ai-usage/export/excel', { params, responseType: 'blob' });
    return response.data;
  },

  exportAIUsagePDF: async (params?: AIUsageListParams): Promise<Blob> => {
    const response = await apiClient.get('/api/admin/ai-usage/export/pdf', { params, responseType: 'blob' });
    return response.data;
  },

  // --- GraphRAG Management ---

  getGraphDashboard: async (): Promise<GraphDashboardStats> => {
    const response = await apiClient.get<GraphDashboardStats>('/api/admin/graphrag/dashboard', { silent: true });
    return response.data;
  },

  getGraphSchema: async (): Promise<GraphSchema> => {
    const response = await apiClient.get<GraphSchema>('/api/admin/graphrag/schema', { silent: true });
    return response.data;
  },

  getGraphNodes: async (params?: { label?: string; search?: string; limit?: number; offset?: number; sort?: string; sort_dir?: string }): Promise<{ nodes: GraphNode[]; total: number; limit: number; offset: number }> => {
    const response = await apiClient.get('/api/admin/graphrag/nodes', { params, silent: true });
    return response.data;
  },

  getGraphNode: async (nodeId: number): Promise<GraphNode> => {
    const response = await apiClient.get<GraphNode>(`/api/admin/graphrag/nodes/${nodeId}`, { silent: true });
    return response.data;
  },

  createGraphNode: async (payload: { label: string; properties: Record<string, unknown> }): Promise<GraphNode> => {
    const response = await apiClient.post<GraphNode>('/api/admin/graphrag/nodes', payload);
    return response.data;
  },

  updateGraphNode: async (nodeId: number, properties: Record<string, unknown>): Promise<GraphNode> => {
    const response = await apiClient.put<GraphNode>(`/api/admin/graphrag/nodes/${nodeId}`, { properties });
    return response.data;
  },

  deleteGraphNode: async (nodeId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/graphrag/nodes/${nodeId}`);
  },

  bulkDeleteGraphNodes: async (nodeIds: number[]): Promise<{ deleted_count: number }> => {
    const response = await apiClient.post<{ deleted_count: number }>('/api/admin/graphrag/nodes/bulk-delete', { node_ids: nodeIds });
    return response.data;
  },

  getGraphRelationships: async (params?: { source_id?: number; target_id?: number; rel_type?: string; limit?: number; offset?: number }): Promise<{ relationships: GraphRelationship[]; total: number; limit: number; offset: number }> => {
    const response = await apiClient.get('/api/admin/graphrag/relationships', { params, silent: true });
    return response.data;
  },

  createGraphRelationship: async (payload: { source_id: number; target_id: number; rel_type: string; properties?: Record<string, unknown> }): Promise<GraphRelationship> => {
    const response = await apiClient.post<GraphRelationship>('/api/admin/graphrag/relationships', payload);
    return response.data;
  },

  deleteGraphRelationship: async (relId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/graphrag/relationships/${relId}`);
  },

  searchGraphNodes: async (q: string, label?: string, limit?: number): Promise<GraphNode[]> => {
    const response = await apiClient.get<GraphNode[]>('/api/admin/graphrag/search', { params: { q, label, limit }, silent: true });
    return response.data;
  },

  getGraphVisualization: async (params?: { limit?: number; label?: string }): Promise<GraphVisualizationData> => {
    const response = await apiClient.get<GraphVisualizationData>('/api/admin/graphrag/graph', { params, silent: true });
    return response.data;
  },

  expandGraphNode: async (nodeId: number, depth?: number): Promise<GraphVisualizationData> => {
    const response = await apiClient.get<GraphVisualizationData>(`/api/admin/graphrag/graph/expand/${nodeId}`, { params: { depth }, silent: true });
    return response.data;
  },

  exportGraphJSON: async (params?: { label?: string; limit?: number }): Promise<unknown> => {
    const response = await apiClient.get('/api/admin/graphrag/export/json', { params });
    return response.data;
  },

  exportGraphCSV: async (params?: { label?: string; limit?: number }): Promise<Blob> => {
    const response = await apiClient.get('/api/admin/graphrag/export/csv', { params, responseType: 'blob' });
    return response.data;
  },

  // --- Admin Recommendations ---

  getRecommendationSessions: async (params?: { limit?: number; offset?: number; search?: string; status?: string; date_from?: string; date_to?: string; sort?: string; sort_dir?: string }): Promise<{ sessions: RecommendationSession[]; total: number; limit: number; offset: number }> => {
    const response = await apiClient.get('/api/admin/recommendations', { params, silent: true });
    return response.data;
  },

  getRecommendationDetail: async (sessionId: string): Promise<RecommendationSession> => {
    const response = await apiClient.get<RecommendationSession>(`/api/admin/recommendations/${sessionId}`, { silent: true });
    return response.data;
  },

  deleteRecommendationSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/recommendations/${sessionId}`);
  },

  getRecommendationDashboard: async (): Promise<RecommendationDashboardStats> => {
    const response = await apiClient.get<RecommendationDashboardStats>('/api/admin/recommendations/dashboard', { silent: true });
    return response.data;
  },

  getRecommendationCharts: async (): Promise<RecommendationChartsData> => {
    const response = await apiClient.get<RecommendationChartsData>('/api/admin/recommendations/charts', { silent: true });
    return response.data;
  },

  exportRecommendationsCSV: async (): Promise<Blob> => {
    const response = await apiClient.get('/api/admin/recommendations/export/csv', { responseType: 'blob' });
    return response.data;
  },

  // --- Admin Quiz ---

  getQuizDashboard: async (): Promise<QuizDashboardStats> => {
    const response = await apiClient.get<QuizDashboardStats>('/api/admin/quiz/dashboard', { silent: true });
    return response.data;
  },

  getQuizModules: async (params?: { limit?: number; offset?: number; search?: string }): Promise<{ modules: QuizModule[]; total: number; limit: number; offset: number }> => {
    const response = await apiClient.get('/api/admin/quiz/modules', { params, silent: true });
    return response.data;
  },

  createQuizModule: async (data: { title: string; description?: string; subject_id?: string }): Promise<QuizModule> => {
    const response = await apiClient.post<QuizModule>('/api/admin/quiz/modules', data);
    return response.data;
  },

  updateQuizModule: async (moduleId: string, data: Partial<QuizModule>): Promise<QuizModule> => {
    const response = await apiClient.put<QuizModule>(`/api/admin/quiz/modules/${moduleId}`, data);
    return response.data;
  },

  deleteQuizModule: async (moduleId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/quiz/modules/${moduleId}`);
  },

  getQuizLevels: async (params?: { module_id?: string; limit?: number; offset?: number }): Promise<{ levels: QuizLevel[]; total: number; limit: number; offset: number }> => {
    const response = await apiClient.get('/api/admin/quiz/levels', { params, silent: true });
    return response.data;
  },

  createQuizLevel: async (data: { module_id: string; title: string; level_number?: number; passing_score?: number; xp_reward?: number }): Promise<QuizLevel> => {
    const response = await apiClient.post<QuizLevel>('/api/admin/quiz/levels', data);
    return response.data;
  },

  updateQuizLevel: async (levelId: string, data: Partial<QuizLevel>): Promise<QuizLevel> => {
    const response = await apiClient.put<QuizLevel>(`/api/admin/quiz/levels/${levelId}`, data);
    return response.data;
  },

  deleteQuizLevel: async (levelId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/quiz/levels/${levelId}`);
  },

  getQuizQuestions: async (params?: { level_id?: string; limit?: number; offset?: number; search?: string }): Promise<{ questions: QuizQuestion[]; total: number; limit: number; offset: number }> => {
    const response = await apiClient.get('/api/admin/quiz/questions', { params, silent: true });
    return response.data;
  },

  getQuizQuestion: async (questionId: string): Promise<QuizQuestion> => {
    const response = await apiClient.get<QuizQuestion>(`/api/admin/quiz/questions/${questionId}`, { silent: true });
    return response.data;
  },

  createQuizQuestion: async (data: { level_id: string; prompt: string; question_type?: string; explanation?: string; difficulty?: number; options?: Array<{ option_key: string; label: string; is_correct: boolean }> }): Promise<QuizQuestion> => {
    const response = await apiClient.post<QuizQuestion>('/api/admin/quiz/questions', data);
    return response.data;
  },

  updateQuizQuestion: async (questionId: string, data: Partial<QuizQuestion>): Promise<QuizQuestion> => {
    const response = await apiClient.put<QuizQuestion>(`/api/admin/quiz/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuizQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/quiz/questions/${questionId}`);
  },
};
