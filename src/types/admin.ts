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
