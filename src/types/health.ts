// --- Health check types ---

import type { ServiceStatus } from './common';

export type { ServiceStatus } from './common';

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

export const SERVICE_LABELS: Record<string, string> = {
  fastapi: 'FastAPI',
  supabase: 'Supabase',
  neo4j: 'Neo4j GraphRAG',
  minio: 'MinIO Storage',
  llm_text: 'LLM Text Model',
  llm_vlm: 'VLM Model',
};

export function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'ok': return 'text-green-500';
    case 'degraded': return 'text-yellow-500';
    case 'down': return 'text-red-500';
    default: return 'text-gray-400';
  }
}

export function getStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case 'ok': return 'Berjalan';
    case 'degraded': return 'Terdegradasi';
    case 'down': return 'Tidak tersedia';
    default: return 'Tidak diketahui';
  }
}
