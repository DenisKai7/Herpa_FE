import { create } from 'zustand';
import { getQuizProgressSafe, getQuizTopicsSafe, quizApi } from '@/lib/api/quiz';

export interface ChemistryTopic {
  id: string;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
  status: 'belum_mulai' | 'sedang_dikerjakan' | 'selesai';
  progress: number;
  bestScore: number | null;
}

export const CHEMISTRY_TOPICS: ChemistryTopic[] = [
  { id: 'struktur-atom', name: 'Struktur Atom', icon: '⚛️', description: 'Model atom, konfigurasi elektron, bilangan kuantum', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'tabel-periodik', name: 'Tabel Periodik', icon: '📊', description: 'Golongan, periode, sifat periodik unsur', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'ikatan-kimia', name: 'Ikatan Kimia', icon: '🔗', description: 'Ikatan ionik, kovalen, logam, gaya antar molekul', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'stoikiometri', name: 'Stoikiometri', icon: '⚖️', description: 'Mol, massa molar, pereaksi pembatas', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'termokimia', name: 'Termokimia', icon: '🔥', description: 'Entalpi, hukum Hess, kalor reaksi', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'laju-reaksi', name: 'Laju Reaksi', icon: '⏱️', description: 'Faktor laju, orde reaksi, teori tumbukan', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'kesetimbangan', name: 'Kesetimbangan Kimia', icon: '⚡', description: 'Tetapan kesetimbangan, prinsip Le Chatelier', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'asam-basa', name: 'Asam & Basa', icon: '🧪', description: 'pH, pOH, titrasi, larutan penyangga', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'larutan', name: 'Larutan & Koloid', icon: '💧', description: 'Kelarutan, sifat koligatif, sistem koloid', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'elektrokimia', name: 'Elektrokimia', icon: '🔋', description: 'Sel volta, sel elektrolisis, potensial elektroda', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'kimia-organik', name: 'Kimia Organik', icon: '🧬', description: 'Hidrokarbon, gugus fungsi, isomeri', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'polimer', name: 'Polimer', icon: '🔩', description: 'Polimerisasi adisi & kondensasi, jenis polimer', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'redoks', name: 'Reaksi Redoks', icon: '♻️', description: 'Bilangan oksidasi, penyetaraan redoks', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'kimia-lingkungan', name: 'Kimia Lingkungan', icon: '🌍', description: 'Pencemaran, efek rumah kaca, pengolahan limbah', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'kimia-inti', name: 'Kimia Inti & Radioaktif', icon: '☢️', description: 'Peluruhan radioaktif, fisi, fusi nuklir', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
  { id: 'kimia-terapan', name: 'Kimia Terapan', icon: '🏭', description: 'Kimia pangan, obat, material, dan industri', questionCount: 10, status: 'belum_mulai', progress: 0, bestScore: null },
];

export interface QuizSessionQuestion {
  id: number;
  backend_id?: string;
  question: string;
  options: { id?: string; option_key?: string; label: string; text: string }[];
  correct_answer: unknown;
  explanation: string;
  question_type?: 'multiple_choice' | 'matching' | 'true_false' | 'short_answer' | 'case_based' | 'case_study';
  matching_pairs?: { left: unknown; right: unknown }[];
  matching_left_items?: unknown;
  matching_right_items?: unknown;
  metadata?: unknown;
  formatted_correct_answer?: string | string[];
  accepted_answers?: string[];
  case_context?: string;
  level_number?: number;
  level_id?: string;
}

export interface QuizAnswerRecord {
  questionId: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizState {
  topics: ChemistryTopic[];
  selectedTopicId: string | null;
  totalXp: number;
  level: number;
  streakDays: number;
  isLoading: boolean;
  sessionId: string | null;
  questions: QuizSessionQuestion[];
  currentIndex: number;
  selectedAnswer: string | null;
  matchingAnswer: Record<string, string>;
  isChecked: boolean;
  answers: QuizAnswerRecord[];
  sessionStartTime: number | null;
  questionStartTime: number | null;
  isSessionActive: boolean;
  isSessionComplete: boolean;
  fetchProgress: () => Promise<void>;
  selectTopic: (topicId: string) => void;
  startSession: (topicId: string, levelNumber?: number, sessionId?: string) => Promise<void>;
  selectAnswer: (label: string) => void;
  setMatchingAnswer: (key: string, value: string) => void;
  checkAnswer: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  cancelSession: () => void;
  resetSession: () => void;
  getSessionDuration: () => number;
  updateTopicProgress: (topicId: string, score: number, total: number) => Promise<void>;
}

function normalizeOption(option: unknown, index: number) {
  if (typeof option === 'string') {
    const label = option.charAt(0) || String.fromCharCode(65 + index);
    const text = option.includes(':') ? option.split(':').slice(1).join(':').trim() : option.trim();
    return { id: label, option_key: label, label, text };
  }

  if (option && typeof option === 'object') {
    const data = option as Record<string, unknown>;
    const optionKey = String(data.option_key ?? data.key ?? data.label ?? String.fromCharCode(65 + index));
    return {
      id: String(data.id ?? optionKey),
      option_key: optionKey,
      label: optionKey,
      text: String(data.text ?? data.value ?? data.label ?? ''),
    };
  }

  const label = String.fromCharCode(65 + index);
  return { id: label, option_key: label, label, text: String(option ?? '') };
}

export const useQuizStore = create<QuizState>((set, get) => ({
  topics: CHEMISTRY_TOPICS,
  selectedTopicId: null,
  totalXp: 0,
  level: 1,
  streakDays: 0,
  isLoading: false,
  sessionId: null,
  questions: [],
  currentIndex: 0,
  selectedAnswer: null,
  matchingAnswer: {},
  isChecked: false,
  answers: [],
  sessionStartTime: null,
  questionStartTime: null,
  isSessionActive: false,
  isSessionComplete: false,

  fetchProgress: async () => {
    set({ isLoading: true });
    try {
      const [progressResult, topicsResult] = await Promise.all([
        getQuizProgressSafe(),
        getQuizTopicsSafe(),
      ]);

      set((state) => {
        const updatedTopics = state.topics.map((localTopic) => {
          const match = topicsResult.topics.find((t) => t.id === localTopic.id);
          if (!match) return localTopic;
          return {
            ...localTopic,
            progress: match.progress ?? localTopic.progress,
            bestScore: match.best_score ?? localTopic.bestScore,
            status: (match.status === 'completed' ? 'selesai' : match.status === 'in_progress' ? 'sedang_dikerjakan' : 'belum_mulai') as ChemistryTopic['status'],
          };
        });

        return {
          topics: topicsResult.backendAvailable && topicsResult.topics.length > 0 ? updatedTopics : state.topics,
          totalXp: progressResult.data.total_xp,
          level: progressResult.data.level,
          streakDays: progressResult.data.current_streak ?? progressResult.data.streak_days ?? 0,
          isLoading: false,
        };
      });
    } catch (error) {
      console.warn('Quiz backend unavailable, using local fallback:', error);
      set({ totalXp: 0, level: 1, streakDays: 0, isLoading: false });
    }
  },

  selectTopic: (topicId) => set({ selectedTopicId: topicId }),

  startSession: async (topicId, levelNumber = 1, existingSessionId) => {
    set({ isLoading: true, selectedTopicId: topicId });
    try {
      const session = existingSessionId
        ? await quizApi.getSession(existingSessionId)
        : await quizApi.startSession({ topic_id: topicId, level_number: levelNumber, question_count: 10 });

      const convertedQuestions: QuizSessionQuestion[] = (session.questions || []).map((q, idx) => {
        const options = (q.options || []).map(normalizeOption);
        return {
          id: idx + 1,
          backend_id: q.id,
          question: q.prompt,
          options,
          correct_answer: '',
          explanation: q.explanation || '',
          question_type: q.question_type ?? (q as { type?: QuizSessionQuestion['question_type'] }).type ?? 'multiple_choice',
          matching_pairs: q.matching_pairs ?? undefined,
          matching_left_items: (q as { matching_left_items?: unknown }).matching_left_items,
          matching_right_items: (q as { matching_right_items?: unknown }).matching_right_items,
          metadata: (q as { metadata?: unknown }).metadata,
          formatted_correct_answer: (q as { formatted_correct_answer?: string | string[] }).formatted_correct_answer,
          accepted_answers: q.accepted_answers?.map(String),
          level_number: session.level_number ?? levelNumber,
          level_id: q.level_id,
        };
      });

      set({
        sessionId: session.id,
        questions: convertedQuestions,
        currentIndex: 0,
        selectedAnswer: null,
        matchingAnswer: {},
        isChecked: false,
        answers: [],
        sessionStartTime: Date.now(),
        questionStartTime: Date.now(),
        isSessionActive: true,
        isSessionComplete: false,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Backend quiz session failed:', error);
      set({
        sessionId: null,
        questions: [],
        currentIndex: 0,
        selectedAnswer: null,
        isChecked: false,
        answers: [],
        sessionStartTime: null,
        questionStartTime: null,
        isSessionActive: false,
        isSessionComplete: false,
        isLoading: false,
      });
      throw error;
    }
  },

  selectAnswer: (label) => {
    if (get().isChecked) return;
    set({ selectedAnswer: label });
  },

  setMatchingAnswer: (key, value) => {
    if (get().isChecked) return;
    set((state) => ({
      matchingAnswer: {
        ...state.matchingAnswer,
        [key]: value,
      },
    }));
  },

  checkAnswer: async () => {
    const { selectedAnswer, matchingAnswer, questions, currentIndex, answers, questionStartTime, sessionId } = get();
    if (!questions[currentIndex] || !sessionId) return;

    const q = questions[currentIndex];
    const qtype = q.question_type ?? 'multiple_choice';
    const timeSpent = questionStartTime ? Date.now() - questionStartTime : 0;

    const payload: {
      question_id: string;
      elapsed_ms: number;
      selected_option_id?: string;
      matching_answer?: Record<string, string>;
      answer_text?: string;
    } = {
      question_id: String(q.backend_id ?? q.id),
      elapsed_ms: timeSpent,
    };

    let userAnsString = '';

    if (qtype === 'multiple_choice' || qtype === 'true_false') {
      if (!selectedAnswer) return;
      const selectedOption = q.options.find(
        (option) => option.label === selectedAnswer || option.option_key === selectedAnswer || option.id === selectedAnswer
      );
      if (!selectedOption?.id) throw new Error('Pilihan jawaban tidak valid.');
      payload.selected_option_id = selectedOption.id;
      userAnsString = selectedAnswer;
    } else if (qtype === 'matching') {
      if (Object.keys(matchingAnswer).length === 0) {
        throw new Error('Harap cocokkan semua pasangan sebelum memeriksa.');
      }
      payload.matching_answer = matchingAnswer;
      userAnsString = JSON.stringify(matchingAnswer);
    } else if (qtype === 'short_answer' || qtype === 'case_based' || qtype === 'case_study') {
      if (!selectedAnswer || !selectedAnswer.trim()) return;
      payload.answer_text = selectedAnswer;
      userAnsString = selectedAnswer;
    }

    const result = await quizApi.submitAnswer(sessionId, payload);
    if (result.backend_unavailable) throw new Error('Session quiz tidak ditemukan. Silakan mulai ulang level.');
    if (result.question_not_in_attempt) throw Object.assign(new Error('Session quiz tidak sinkron. Silakan mulai ulang level.'), { question_not_in_attempt: true });

    const correctAnswer = (qtype === 'matching' || qtype === 'short_answer' || qtype === 'case_study') ? result.correct_answer : String(result.correct_option_key ?? result.correct_answer ?? '');
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...q,
      correct_answer: correctAnswer,
      formatted_correct_answer: result.formatted_correct_answer,
      explanation: result.explanation ?? q.explanation,
    };

    const record: QuizAnswerRecord = {
      questionId: q.id,
      selectedAnswer: userAnsString,
      correctAnswer: typeof correctAnswer === 'string' ? correctAnswer : JSON.stringify(correctAnswer ?? ''),
      isCorrect: result.is_correct ?? result.correct,
      timeSpent,
    };

    set({
      isChecked: true,
      answers: [...answers, record],
      questions: updatedQuestions,
      currentIndex: result.current_question_index != null ? Math.max(0, Math.min(currentIndex, result.current_question_index - 1)) : currentIndex,
      isSessionComplete: Boolean(result.is_completed ?? result.session_completed),
      totalXp: result.xp_earned ? get().totalXp + result.xp_earned : get().totalXp,
    });
  },

  nextQuestion: async () => {
    const { currentIndex, questions, sessionId, answers, selectedTopicId } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, selectedAnswer: null, matchingAnswer: {}, isChecked: false, questionStartTime: Date.now() });
      return;
    }

    set({ isSessionComplete: true, isSessionActive: false });
    if (sessionId) {
      try {
        const summary = await quizApi.getSessionSummary(sessionId);
        set({ totalXp: get().totalXp + (summary.xp_earned ?? 0), streakDays: summary.streak_count ?? get().streakDays });
      } catch {
        // Ignore summary fetch error for local navigation.
      }
    } else if (selectedTopicId) {
      const correctCount = answers.filter((a) => a.isCorrect).length;
      await get().updateTopicProgress(selectedTopicId, correctCount, questions.length);
    }
  },

  cancelSession: () =>
    set({
      isSessionActive: false,
      isSessionComplete: false,
      questions: [],
      currentIndex: 0,
      selectedAnswer: null,
      matchingAnswer: {},
      isChecked: false,
      answers: [],
      sessionStartTime: null,
      questionStartTime: null,
      sessionId: null,
    }),

  resetSession: () =>
    set({
      isSessionActive: false,
      isSessionComplete: false,
      questions: [],
      currentIndex: 0,
      selectedAnswer: null,
      matchingAnswer: {},
      isChecked: false,
      answers: [],
      sessionStartTime: null,
      questionStartTime: null,
      selectedTopicId: null,
      sessionId: null,
    }),

  getSessionDuration: () => {
    const { sessionStartTime } = get();
    if (!sessionStartTime) return 0;
    return Date.now() - sessionStartTime;
  },

  updateTopicProgress: async (topicId, score, total) => {
    const { topics } = get();
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    set({
      topics: topics.map((t) =>
        t.id === topicId
          ? { ...t, progress: Math.max(t.progress, pct), bestScore: t.bestScore !== null ? Math.max(t.bestScore, pct) : pct, status: pct >= 70 ? 'selesai' : 'sedang_dikerjakan' }
          : t
      ),
    });
  },
}));
