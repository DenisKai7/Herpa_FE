// --- User & Auth ---

export type UserRole = 'admin' | 'user';
export type AccountStatus = 'active' | 'suspended' | 'deleted';
export type AiMode = 'tenaga_medis' | 'peneliti' | 'pelajar' | 'umum';
export type MessageRole = 'user' | 'ai';

export interface User {
  id: string;
  email: string;
  username?: string;
  nama?: string;
  full_name?: string;
  role: UserRole;
  instansi?: string;
  provinsi?: string;
  kota?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  nama: string;
  instansi: string;
  provinsi: string;
  kota: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// --- Chat ---

export interface QuizOptionSchema {
  label: string;
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOptionSchema[];
  correct_answer?: string;
  explanation?: string;
}

export interface QuizData {
  title?: string;
  topic?: string;
  difficulty?: string;
  questions?: QuizQuestion[];
  daftar_soal?: QuizQuestion[];
  analisis_performa?: {
    sorotan?: string[];
    area_fokus?: string[];
  };
  [key: string]: unknown;
}

export interface ChatSession {
  id: string;
  title: string;
  is_pinned: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedChatData {
  title: string;
  messages: ChatMessage[];
}

export interface ChatSource {
  source_id?: string;
  identifier?: string;
  title?: string;
  url?: string;
  type?: string;
  relevance_score?: number;
  snippet?: string;
}

export interface GraphFact {
  subject?: string;
  predicate?: string;
  object?: string;
  confidence?: number;
  source?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  metadata?: {
    is_quiz?: boolean;
    intent?: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
    sources?: ChatSource[];
    graph_facts?: GraphFact[];
    claims?: string[];
    evidence?: string[];
    retrieval_metadata?: Record<string, unknown>;
    model_metadata?: Record<string, unknown>;
    safety_note?: string;
  } | null;
  quiz_data: QuizData | null;
  file_context: string | null;
  created_at: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
}

export interface ChatRequest {
  message: string;
  ai_mode: AiMode;
  chat_id?: string | null;
  file_context?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  attachment_id?: string | null;
  model_choice?: string | null;
  // New fields for backend v2 (backward compatible — old fields still sent)
  persona?: string | null;
  model_mode?: string | null;
  request_id?: string;
  agent_mode?: string | null;
  system_context?: string | null;
  response_language?: string | null;
}

// --- Model Selection ---

export interface ModelOption {
  label: string;
  value: string;
}

export const MODEL_OPTIONS_BY_MODE: Record<AiMode, ModelOption[]> = {
  tenaga_medis: [
    { label: 'Fast Medium', value: 'fast' },
    { label: 'Thinking High', value: 'thinking' },
  ],
  peneliti: [
    { label: 'Fast Medium', value: 'fast' },
    { label: 'Thinking High', value: 'thinking' },
  ],
  pelajar: [
    { label: 'Fast Medium', value: 'fast' },
    { label: 'Thinking High', value: 'thinking' },
  ],
  umum: [
    { label: 'Fast Medium', value: 'fast' },
    { label: 'Thinking High', value: 'thinking' },
  ],
};

// --- Quiz ---

export interface QuizOption {
  label: string;
  text: string;
}

// --- File Upload ---

export type AttachmentStatus = 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';

export interface AttachmentInfo {
  id: string;
  filename: string;
  stored_filename?: string;
  mime_type?: string;
  preview_url?: string | null;
  processing_status: AttachmentStatus;
  detected_type?: string;
  verification_status?: string;
  confidence?: number;
}

export interface FileUploadResponse {
  file_id?: string;
  filename: string;
  extracted_text: string;
  content_type?: string;
  url?: string;
  success?: boolean;
  attachment?: AttachmentInfo;
  context?: {
    extracted_text?: string;
    summary?: string;
    warnings?: string[];
  };
}

export interface AttachmentStatusResponse {
  attachment_id: string;
  processing_status: AttachmentStatus;
  progress: number;
  verification_status: string;
  confidence: number;
  extracted_text?: string;
  detected_type?: string;
  retryable?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

// --- Admin ---

export interface AdminAnalytics {
  total_users: number;
  total_messages: number;
  total_chats: number;
  active_users_today: number;
  messages_today: number;
}

export interface UpdateUserRoleRequest {
  user_id: string;
  role: UserRole;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  username?: string | null;
  role: UserRole;
  persona: string | null;
  account_status: AccountStatus;
  instansi: string | null;
  provinsi?: string | null;
  kota?: string | null;
  last_active_at: string | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

// --- API Error ---

export interface ApiError {
  detail: string;
  status_code: number;
}

// --- Profile ---

export interface UpdateProfileRequest {
  username?: string;
  full_name?: string;
  email?: string;
  nama?: string;
  instansi?: string;
  provinsi?: string;
  kota?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// --- Chat API ---

export interface ChatResponse {
  chat_id: string;
  response: string;
  quiz_data?: QuizData | null;
  message?: ChatMessage;
}

export interface RenameChatRequest {
  title: string;
}

export interface ShareChatResponse {
  share_id: string;
  is_public: boolean;
  public_url?: string;
}
