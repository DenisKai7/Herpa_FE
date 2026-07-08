// --- Admin extended types ---
import type { ServiceStatus } from './common';
import type { UserRole } from './index';

// Re-export base admin types
export type { AdminAnalytics, AdminUser, UpdateUserRoleRequest } from './index';

// --- System Health ---
export interface ServiceHealthDetail {
  status: ServiceStatus;
  latency_ms?: number;
  message?: string;
  version?: string;
  last_checked?: string;
}

export interface SystemHealthResponse {
  overall: ServiceStatus;
  services: {
    fastapi: ServiceHealthDetail;
    supabase: ServiceHealthDetail;
    neo4j: ServiceHealthDetail;
    minio: ServiceHealthDetail;
    llm_text: ServiceHealthDetail;
    llm_vlm?: ServiceHealthDetail;
  };
}

// --- GraphRAG Stats ---
export interface GraphStatsResponse {
  herb_count: number;
  compound_count: number;
  traditional_use_count: number;
  preparation_method_count: number;
  usage_guideline_count: number;
  safety_warning_count: number;
  source_count: number;
  fulltext_index_status: ServiceStatus;
  neo4j_latency_ms: number;
  last_enrichment_at?: string;
}

// --- AI Model Usage ---
export interface ModelUsageEntry {
  model_mode: string;
  persona: string;
  request_count: number;
  avg_latency_ms: number;
  total_tokens: number;
  error_count: number;
  date: string;
}

export interface ModelUsageResponse {
  entries: ModelUsageEntry[];
  total_requests: number;
  avg_latency_ms: number;
  error_rate: number;
}

// --- Recommendation Analytics ---
export interface RecommendationAnalyticsResponse {
  total_sessions: number;
  top_complaints: Array<{ complaint: string; count: number }>;
  top_herbs: Array<{ herb: string; count: number }>;
  no_result_rate: number;
  avg_latency_ms: number;
  failure_rate: number;
  common_warnings: Array<{ warning: string; count: number }>;
}

// --- Quiz Analytics ---
export interface QuizAnalyticsResponse {
  total_sessions: number;
  completion_rate: number;
  avg_score: number;
  top_weak_topics: Array<{ topic: string; avg_score: number }>;
  daily_active_learners: number;
}

// --- Storage Stats ---
export interface StorageBucketStats {
  name: string;
  object_count: number;
  size_bytes: number;
}

export interface StorageStatsResponse {
  status: ServiceStatus;
  buckets: StorageBucketStats[];
  total_size_bytes: number;
  failed_uploads: number;
}

// --- Error Log ---
export interface ErrorLogEntry {
  id: string;
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  created_at: string;
  resolved: boolean;
}

export interface ErrorLogResponse {
  errors: ErrorLogEntry[];
  total: number;
  unresolved_count: number;
}

// --- AI Usage Management ---
export interface AIUsageLog {
  id: number;
  user_id: string | null;
  request_id: string | null;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  success: boolean;
  error_code: string | null;
  persona: string | null;
  endpoint: string | null;
  provider: string;
  created_at: string;
}

export interface AIUsageListParams {
  limit?: number;
  offset?: number;
  search?: string;
  user_id?: string;
  persona?: string;
  model_name?: string;
  endpoint?: string;
  provider?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  sort_dir?: string;
}

export interface AIUsageListResponse {
  logs: AIUsageLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface AIUsageDetail {
  id: number;
  user_id: string | null;
  request_id: string | null;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  success: boolean;
  error_code: string | null;
  persona: string | null;
  endpoint: string | null;
  provider: string;
  prompt_text: string | null;
  response_text: string | null;
  retrieval_context: unknown;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AIUsageDashboardStats {
  total_requests: number;
  total_tokens_input: number;
  total_tokens_output: number;
  total_tokens: number;
  active_users: number;
  error_rate: number;
  avg_latency_ms: number;
  active_models: number;
  active_personas: number;
}

export interface AIUsageChartsData {
  daily_requests: Array<{ date: string; requests: number }>;
  daily_tokens: Array<{ date: string; tokens: number }>;
  by_persona: Array<{ persona: string; count: number }>;
  by_model: Array<{ model: string; count: number }>;
  hourly_heatmap: Array<{ hour: number; count: number }>;
  top_users: Array<{ user_id: string; count: number }>;
  top_endpoints: Array<{ endpoint: string; count: number }>;
  error_analytics: {
    by_endpoint: Array<{ endpoint: string; errors: number }>;
    by_model: Array<{ model: string; errors: number }>;
    by_day: Array<{ date: string; errors: number }>;
  };
  latency_stats: {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
  };
  cost_estimation: {
    total_tokens: number;
    total_latency_ms: number;
    throughput_tokens_per_sec: number;
    provider: string;
  };
}

// --- GraphRAG Management ---
export interface GraphDashboardStats {
  status: string;
  total_nodes: number;
  total_relationships: number;
  total_labels: number;
  herb_count: number;
  compound_count: number;
  traditional_use_count: number;
  preparation_method_count: number;
  usage_guideline_count: number;
  safety_warning_count: number;
  source_count: number;
  benefit_count: number;
  symptom_count: number;
  family_count: number;
  neo4j_latency_ms: number;
}

export interface GraphSchema {
  labels: string[];
  relationship_types: string[];
  properties: string[];
}

export interface GraphNode {
  __neo4j_id: number;
  __labels: string[];
  [key: string]: unknown;
}

export interface GraphRelationship {
  rel_id: number;
  rel_type: string;
  properties: Record<string, unknown>;
  source_id: number;
  source_labels: string[];
  source_name: string;
  target_id: number;
  target_labels: string[];
  target_name: string;
}

export interface GraphVisualizationData {
  nodes: Array<{ id: number; labels: string[]; name: string }>;
  edges: Array<{ id?: number; source: number; target: number; type: string; source_name?: string; target_name?: string }>;
}

// --- Admin Recommendations ---
export interface RecommendationSession {
  id: string;
  user_id: string;
  complaint: string;
  persona: string;
  status: string;
  results_count: number;
  created_at: string;
  input?: unknown;
  results?: Array<{
    id: string;
    plant_id: string;
    local_name: string;
    scientific_name: string;
    relevance_score: number;
    result: unknown;
  }>;
}

export interface RecommendationDashboardStats {
  total_sessions: number;
  total_results: number;
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
  success_rate: number;
  failure_rate: number;
  no_result_rate: number;
  avg_latency_ms: number;
  top_complaints: Array<{ complaint: string; count: number }>;
  top_herbs: Array<{ herb: string; count: number }>;
  by_persona: Array<{ persona: string; count: number }>;
  daily: Array<{ date: string; count: number }>;
}

export interface RecommendationChartsData {
  daily_sessions: Array<{ date: string; count: number }>;
  by_persona: Array<{ persona: string; count: number }>;
  top_herbs: Array<{ herb: string; count: number }>;
  top_complaints: Array<{ complaint: string; count: number }>;
  success_vs_failed: { success: number; failed: number; no_result: number };
  hourly_heatmap: Array<{ hour: number; count: number }>;
}

// --- Admin Quiz ---
export interface QuizModule {
  id: string;
  title: string;
  description: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  quiz_subjects?: { id: string; title: string; slug: string };
}

export interface QuizLevel {
  id: string;
  module_id: string;
  title: string;
  level_number: number;
  passing_score: number;
  xp_reward: number;
  quiz_modules?: { id: string; title: string };
}

export interface QuizQuestionOption {
  id: string;
  option_key: string;
  label: string;
  is_correct: boolean;
  sort_order: number;
}

export interface QuizQuestion {
  id: string;
  level_id: string;
  prompt: string;
  question_type: string;
  explanation: string;
  correct_answer: unknown;
  difficulty: number;
  is_active: boolean;
  quiz_question_options?: QuizQuestionOption[];
}

export interface QuizDashboardStats {
  total_modules: number;
  total_levels: number;
  total_questions: number;
  total_attempts: number;
  completed_attempts: number;
  completion_rate: number;
  avg_score: number;
  highest_score: number;
  lowest_score: number;
  active_users_today: number;
  published_modules: number;
  draft_modules: number;
  by_module: Array<{ module: string; count: number }>;
  by_difficulty: Array<{ difficulty: number; count: number }>;
  daily_attempts: Array<{ date: string; count: number }>;
}
