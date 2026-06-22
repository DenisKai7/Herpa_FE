// --- Quiz types (backend-driven + local fallback) ---

export type QuizQuestionType =
  | 'multiple_choice'
  | 'matching'
  | 'true_false'
  | 'short_answer'
  | 'case_based';

export type QuizTopicStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizSessionStatus = 'active' | 'completed' | 'abandoned' | string;

export type QuizLevel = {
  id: string;
  topic_id: string;
  level_number: number;
  title: string;
  description?: string | null;
  quiz_type: QuizQuestionType;
  xp_reward?: number;
  passing_score?: number;
  is_locked?: boolean;
  is_completed?: boolean;
  progress?: number;
};

export type QuizTopic = {
  id: string;
  title: string;
  description?: string | null;
  order_index?: number;
  icon?: string | null;
  progress?: number;
  highest_level_completed?: number;
  current_level?: number;
  status?: QuizTopicStatus;
  levels?: QuizLevel[];
  level?: number;
  mastery_score?: number;
  question_count?: number;
  best_score?: number;
};

export type QuizProgress = {
  total_xp: number;
  level: number;
  completed_topics: number;
  completed_levels?: number;
  current_streak?: number;
  topic_progress?: unknown[];
  streak_days?: number;
  topics_completed?: number;
  topics_in_progress?: number;
  mastery_scores?: Record<string, number>;
};

export type QuizQuestion = {
  id: string;
  topic_id: string;
  level_id: string;
  question_type: QuizQuestionType;
  prompt: string;
  options?: Array<{ id: string; text: string } | string>;
  matching_pairs?: Array<{ left: string; right: string }>;
  correct_answer?: unknown;
  accepted_answers?: unknown[];
  difficulty?: string;
  explanation?: string | null;
};

export type QuizQuestionBE = QuizQuestion & {
  type?: QuizQuestionType;
};

export type QuizSession = {
  id: string;
  topic_id: string;
  level_id: string;
  level_number?: number;
  status: QuizSessionStatus;
  score: number;
  total_questions: number;
  current_question_index: number;
  questions: QuizQuestion[];
  started_at?: string;
  completed_at?: string;
};

export type SubmitAnswerResult = {
  correct: boolean;
  correct_answer?: unknown;
  explanation?: string | null;
  score_delta?: number;
  xp_delta?: number;
  session_completed?: boolean;
  session_score?: number;
  correct_count?: number;
  wrong_count?: number;
  total_questions?: number;
  next_question_index?: number | null;
  passed?: boolean | null;
  next_level_unlocked?: boolean;
  backend_unavailable?: boolean;
};

export type QuizAnswerResult = SubmitAnswerResult;

export interface QuizSessionSummary {
  session_id: string;
  topic_id: string;
  level_id?: string;
  level_number?: number;
  score: number;
  total: number;
  accuracy: number;
  duration_seconds: number;
  xp_earned: number;
  streak_count: number;
  level_up: boolean;
  new_level?: number;
  passed?: boolean;
  next_level_unlocked?: boolean;
  weak_areas?: string[];
}

export interface QuizHistoryEntry {
  id: string;
  date?: string;
  created_at?: string;
  topic_id?: string;
  topic_title?: string;
  level_number?: number;
  score?: number;
  total_questions?: number;
  xp_earned?: number;
  status?: string;
}

export interface QuizLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_xp: number;
  level: number;
  streak_days: number;
}
