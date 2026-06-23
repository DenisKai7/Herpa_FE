import apiClient from './client';
import type {
  QuizProgress,
  QuizTopic,
  QuizSession,
  SubmitAnswerResult,
  QuizSessionSummary,
  QuizLeaderboardEntry,
  QuizHistoryEntry,
} from '@/types/quiz';

export type QuizProgressResult = {
  data: QuizProgress;
  backendAvailable: boolean;
};

export function getHttpStatus(error: unknown): number | null {
  const err = error as {
    response?: { status?: number };
    status?: number;
    cause?: { status?: number };
  };

  return err?.response?.status ?? err?.status ?? err?.cause?.status ?? null;
}

export const fallbackQuizProgress: QuizProgress = {
  total_xp: 0,
  level: 1,
  completed_topics: 0,
  completed_levels: 0,
  current_streak: 0,
  topic_progress: [],
  streak_days: 0,
  topics_completed: 0,
  topics_in_progress: 0,
  mastery_scores: {},
};

function normalizeProgress(data: Partial<QuizProgress> & {
  totalXp?: number;
  completedTopics?: number;
  completed_topics?: number;
  streak?: number;
}): QuizProgress {
  const completedTopics = data.completed_topics ?? data.topics_completed ?? data.completedTopics ?? 0;
  const streak = data.current_streak ?? data.streak_days ?? data.streak ?? 0;

  return {
    total_xp: data.total_xp ?? data.totalXp ?? 0,
    level: data.level ?? 1,
    completed_topics: completedTopics,
    completed_levels: data.completed_levels ?? 0,
    current_streak: streak,
    topic_progress: data.topic_progress ?? [],
    streak_days: streak,
    topics_completed: completedTopics,
    topics_in_progress: data.topics_in_progress ?? 0,
    mastery_scores: data.mastery_scores ?? {},
  };
}

export type QuizDashboard = {
  progress: QuizProgress;
  topics: QuizTopic[];
  active_sessions?: QuizHistoryEntry[];
};

export const quizApi = {
  async getDashboard(): Promise<QuizDashboard> {
    const response = await apiClient.get<QuizDashboard>('/api/quiz/dashboard', { silent: true });
    return {
      progress: normalizeProgress(response.data.progress),
      topics: response.data.topics ?? [],
      active_sessions: response.data.active_sessions ?? [],
    };
  },

  async getDashboardSafe(localTopics: QuizTopic[] = []): Promise<QuizDashboard & { backendAvailable: boolean }> {
    try {
      const dashboard = await this.getDashboard();
      return { ...dashboard, backendAvailable: true };
    } catch (error) {
      if (getHttpStatus(error) !== 404) {
        console.warn('Quiz dashboard unavailable:', error);
      }
      return { progress: fallbackQuizProgress, topics: localTopics, active_sessions: [], backendAvailable: false };
    }
  },

  async getProgress(): Promise<QuizProgress> {
    const response = await apiClient.get<QuizProgress>('/api/quiz/progress', { silent: true });
    return normalizeProgress(response.data);
  },

  async getProgressSafe(): Promise<QuizProgressResult> {
    try {
      return { data: await this.getProgress(), backendAvailable: true };
    } catch (error) {
      if (getHttpStatus(error) !== 404) {
        console.warn('Quiz progress unavailable:', error);
      }
      return { data: fallbackQuizProgress, backendAvailable: false };
    }
  },

  async getTopics(): Promise<QuizTopic[]> {
    const response = await apiClient.get<{ topics: QuizTopic[] } | QuizTopic[]>('/api/quiz/topics', { silent: true });
    const data = response.data;
    if (data && typeof data === 'object' && 'topics' in data && Array.isArray(data.topics)) {
      return data.topics;
    }
    return Array.isArray(data) ? data : [];
  },

  async getTopicsSafe(localTopics: QuizTopic[]): Promise<{
    topics: QuizTopic[];
    backendAvailable: boolean;
  }> {
    try {
      const topics = await this.getTopics();
      if (topics.length > 0) return { topics, backendAvailable: true };
      return { topics: localTopics, backendAvailable: false };
    } catch (error) {
      if (getHttpStatus(error) !== 404) {
        console.warn('Quiz topics backend unavailable, using local topics:', error);
      }
      return { topics: localTopics, backendAvailable: false };
    }
  },

  async getTopicDetail(topicId: string): Promise<QuizTopic> {
    const response = await apiClient.get<QuizTopic>(`/api/quiz/topics/${encodeURIComponent(topicId)}`, { silent: true });
    return response.data;
  },

  async startSession(payload: {
    topic_id?: string;
    level_id?: string;
    level_number?: number;
    difficulty?: string;
    question_count?: number;
  } | string): Promise<QuizSession> {
    const body = typeof payload === 'string' ? { topic_id: payload } : payload;
    const response = await apiClient.post<QuizSession>('/api/quiz/sessions', body, { silent: true });
    return response.data;
  },

  async getSession(sessionId: string): Promise<QuizSession> {
    const response = await apiClient.get<QuizSession>(`/api/quiz/sessions/${encodeURIComponent(sessionId)}`, { silent: true });
    return response.data;
  },

  async submitAnswer(
    sessionId: string,
    payloadOrQuestionId: { question_id: string; selected_option_id?: string | null; matching_answer?: Record<string, string>; elapsed_ms?: number; answer?: unknown } | string,
    answer?: unknown
  ): Promise<SubmitAnswerResult> {
    const payload = typeof payloadOrQuestionId === 'string'
      ? { question_id: payloadOrQuestionId, answer, elapsed_ms: 0 }
      : { elapsed_ms: 0, ...payloadOrQuestionId };

    try {
      const response = await apiClient.post<SubmitAnswerResult>(
        `/api/quiz/sessions/${encodeURIComponent(sessionId)}/answer`,
        payload,
        { silent: true }
      );
      return response.data;
    } catch (error) {
      const status = getHttpStatus(error);
      if (status === 409) {
        // QUESTION_NOT_IN_ATTEMPT — session out of sync with DB
        return {
          correct: false,
          correct_answer: null,
          explanation: null,
          score_delta: 0,
          xp_delta: 0,
          session_completed: false,
          session_score: 0,
          backend_unavailable: false,
          question_not_in_attempt: true,
        };
      }
      if (status === 404) {
        return {
          correct: false,
          correct_answer: null,
          explanation: 'Endpoint submit jawaban quiz belum tersedia. Mode lokal digunakan sementara.',
          score_delta: 0,
          xp_delta: 0,
          session_completed: false,
          session_score: 0,
          backend_unavailable: true,
        };
      }

      throw error;
    }
  },

  async getSummary(sessionId: string): Promise<QuizSessionSummary> {
    const response = await apiClient.get<QuizSessionSummary>(
      `/api/quiz/sessions/${encodeURIComponent(sessionId)}/summary`,
      { silent: true }
    );
    return response.data;
  },

  async getSessionSummary(sessionId: string): Promise<QuizSessionSummary> {
    return this.getSummary(sessionId);
  },

  async getHistory(): Promise<QuizHistoryEntry[]> {
    const response = await apiClient.get<{ history: QuizHistoryEntry[] } | QuizHistoryEntry[]>('/api/quiz/history', { silent: true });
    const data = response.data;
    if (data && typeof data === 'object' && 'history' in data && Array.isArray(data.history)) {
      return data.history;
    }
    return Array.isArray(data) ? data : [];
  },

  async getLeaderboard(): Promise<QuizLeaderboardEntry[]> {
    const response = await apiClient.get<{ leaderboard: QuizLeaderboardEntry[] } | QuizLeaderboardEntry[]>('/api/quiz/leaderboard', { silent: true });
    const data = response.data;
    if (data && typeof data === 'object' && 'leaderboard' in data && Array.isArray(data.leaderboard)) {
      return data.leaderboard;
    }
    return Array.isArray(data) ? data : [];
  },
};

export async function getQuizProgressSafe(): Promise<QuizProgressResult> {
  return quizApi.getProgressSafe();
}

export async function getQuizTopicsSafe(): Promise<{
  topics: QuizTopic[];
  backendAvailable: boolean;
}> {
  return quizApi.getTopicsSafe([]);
}
