// --- Profile types ---
import type { Persona } from './persona';
import type { ModelMode } from './model';

export type { User, UpdateProfileRequest, ChangePasswordRequest } from './index';

// --- Extended profile update request ---
export interface UpdateProfileRequestV2 {
  username?: string;
  full_name?: string;
  email?: string;
  nama?: string;
  instansi?: string;
  provinsi?: string;
  kota?: string;
  default_persona?: Persona;
  default_model_mode?: ModelMode;
  answer_style_preference?: string;
}

// --- Usage summary ---
export interface UsageSummary {
  total_chats: number;
  total_messages: number;
  total_recommendations: number;
  total_quizzes: number;
  member_since: string;
  last_active: string;
}
