import { create } from 'zustand';
import { getQuizProgressSafe, getQuizTopicsSafe, quizApi, getHttpStatus } from '@/lib/api/quiz';
import { getQuestionsForTopicLevel } from '@/lib/quizData';
import { checkAnswerLocally } from '@/lib/quizLocalChecker';

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
  question: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  question_type?: 'multiple_choice' | 'matching' | 'true_false' | 'short_answer' | 'case_based';
  matching_pairs?: { left: string; right: string }[];
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
    return { label, text };
  }

  if (option && typeof option === 'object') {
    const data = option as Record<string, unknown>;
    return {
      label: String(data.label ?? data.key ?? String.fromCharCode(65 + index)),
      text: String(data.text ?? data.value ?? data.label ?? ''),
    };
  }

  return { label: String.fromCharCode(65 + index), text: String(option ?? '') };
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
          question: q.prompt,
          options,
          correct_answer: String(q.correct_answer ?? q.explanation?.match(/Jawaban benar: ([A-D])/i)?.[1] ?? options[0]?.label ?? 'A'),
          explanation: q.explanation || '',
          question_type: q.question_type ?? (q as { type?: QuizSessionQuestion['question_type'] }).type ?? 'multiple_choice',
          matching_pairs: q.matching_pairs ?? undefined,
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
        isChecked: false,
        answers: [],
        sessionStartTime: Date.now(),
        questionStartTime: Date.now(),
        isSessionActive: true,
        isSessionComplete: false,
        isLoading: false,
      });
    } catch (error) {
      if (getHttpStatus(error) !== 404) {
        console.warn('Backend quiz session failed, falling back to local quiz:', error);
      }
      set({
        sessionId: null,
        questions: getQuestionsForTopicLevel(topicId, levelNumber),
        currentIndex: 0,
        selectedAnswer: null,
        isChecked: false,
        answers: [],
        sessionStartTime: Date.now(),
        questionStartTime: Date.now(),
        isSessionActive: true,
        isSessionComplete: false,
        isLoading: false,
      });
    }
  },

  selectAnswer: (label) => {
    if (get().isChecked) return;
    set({ selectedAnswer: label });
  },

  checkAnswer: async () => {
    const { selectedAnswer, questions, currentIndex, answers, questionStartTime, sessionId } = get();
    if (!selectedAnswer || !questions[currentIndex]) return;

    const q = questions[currentIndex];
    let result = checkAnswerLocally(q, selectedAnswer);
    const timeSpent = questionStartTime ? Date.now() - questionStartTime : 0;

    if (sessionId) {
      try {
        const backendResult = await quizApi.submitAnswer(sessionId, { question_id: String(q.id), answer: selectedAnswer });
        result = backendResult.backend_unavailable ? result : backendResult;
      } catch (err) {
        console.warn('Submit answer failed, using local checker:', err);
      }
    }

    const record: QuizAnswerRecord = {
      questionId: q.id,
      selectedAnswer,
      correctAnswer: String(result.correct_answer ?? q.correct_answer),
      isCorrect: result.correct,
      timeSpent,
    };

    set({ isChecked: true, answers: [...answers, record] });
  },

  nextQuestion: async () => {
    const { currentIndex, questions, sessionId, answers, selectedTopicId } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, selectedAnswer: null, isChecked: false, questionStartTime: Date.now() });
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
