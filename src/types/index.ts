// ============================================================
// Medical AI Platform — TypeScript Types & Interfaces
// Aligned with FastAPI Pydantic schemas
// ============================================================

// --- Enums ---

export type AiMode = 'tenaga_medis' | 'peneliti' | 'pelajar' | 'umum';

export type UserRole = 'user' | 'admin' | 'pelajar';

export type MessageRole = 'user' | 'ai';

// --- Auth ---

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

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  instansi: string;
  provinsi: string;
  kota: string;
  created_at: string;
}

export interface UpdateProfileRequest {
  username?: string;
  full_name?: string;
  email?: string;
  instansi?: string;
  provinsi?: string;
  kota?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// --- Chat ---

export interface ChatSession {
  id: string;
  title: string;
  is_pinned: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
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
  model_choice?: string | null;
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

export interface ChatResponse {
  chat_id: string;
  intent: string;
  response: string;
  quiz_data: QuizData | null;
}

export interface RenameChatRequest {
  title: string;
}

export interface ShareChatResponse {
  message: string;
  is_public: boolean;
  public_url: string | null;
}

export interface SharedChatData {
  title: string;
  created_at: string;
  messages: ChatMessage[];
}

// --- Quiz ---

export interface QuizData {
  questions: QuizQuestion[];
  topic: string;
  difficulty: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correct_answer: string;
  explanation: string;
}

export interface QuizOption {
  label: string;
  text: string;
}

// --- File Upload ---

export interface FileUploadResponse {
  file_id: string;
  filename: string;
  extracted_text: string;
  content_type: string;
  url?: string;
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
  full_name: string;
  role: UserRole;
  instansi: string;
  created_at: string;
}

// --- API Error ---

export interface ApiError {
  detail: string;
  status_code: number;
}
