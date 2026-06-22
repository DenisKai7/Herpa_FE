// --- Chat extended types ---
// Re-exports from index.ts for backward compatibility, plus new types.

import type { Persona } from './persona';
import type { ModelMode } from './model';

export type { ChatSession, ChatMessage, ChatRequest, ChatResponse, RenameChatRequest, ShareChatResponse, SharedChatData } from './index';

// --- Extended chat request with persona and model_mode ---
export interface ChatRequestV2 {
  message: string;
  chat_id?: string | null;
  persona?: Persona;
  model_mode?: ModelMode;
  file_context?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  attachment_id?: string | null;
  request_id?: string;
}

// --- Chat source / citation ---
export interface ChatSource {
  source_id?: string;
  identifier?: string;
  title?: string;
  url?: string;
  type?: string;
  relevance_score?: number;
  snippet?: string;
}

// --- Graph fact from knowledge graph ---
export interface GraphFact {
  subject?: string;
  predicate?: string;
  object?: string;
  confidence?: number;
  source?: string;
}

// --- Retrieval metadata ---
export interface RetrievalMetadata {
  query?: string;
  sources_count?: number;
  graph_facts_count?: number;
  model_mode?: ModelMode;
  persona?: Persona;
  latency_ms?: number;
}

// --- Extended chat message metadata ---
export interface ChatMessageMetadataV2 {
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
  retrieval_metadata?: RetrievalMetadata;
  model_metadata?: {
    model_mode?: ModelMode;
    persona?: Persona;
    tokens_used?: number;
    latency_ms?: number;
  };
  safety_note?: string;
}

// --- Streaming stage ---
export type StreamingStage =
  | 'searching_graph'
  | 'building_context'
  | 'calling_model'
  | 'checking_safety'
  | 'preparing_answer'
  | 'done';

export const STREAMING_STAGE_LABELS: Record<StreamingStage, string> = {
  searching_graph: 'Mencari data knowledge graph...',
  building_context: 'Menyusun konteks...',
  calling_model: 'Memanggil model...',
  checking_safety: 'Memeriksa keamanan...',
  preparing_answer: 'Menyiapkan jawaban...',
  done: 'Selesai',
};

// --- Uploaded file (deduplicated) ---
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
  attachmentId?: string;
  extractedText?: string;
}
