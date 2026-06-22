// --- Common shared types ---

export type ServiceStatus = 'ok' | 'degraded' | 'down' | 'unknown';

export type SafetyStatus =
  | 'safe'
  | 'limited'
  | 'caution'
  | 'conditional'
  | 'unsafe'
  | 'excluded'
  | 'unknown';

export type EvidenceStatus =
  | 'clinical'
  | 'source_available'
  | 'claim_available'
  | 'traditional'
  | 'limited'
  | 'unavailable';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'unverified'
  | 'rejected'
  | 'unavailable';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiErrorResponse {
  detail?: string | { message?: string; [key: string]: unknown };
  message?: string;
  error?: string;
  status_code?: number;
}
