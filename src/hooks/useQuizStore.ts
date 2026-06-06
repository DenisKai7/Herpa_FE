import { create } from 'zustand';

// ─── 16 Chemistry Topics ─────────────────────────────────────────
export interface ChemistryTopic {
  id: string;
  name: string;
  icon: string;
  description: string;
  questionCount: number;
  status: 'belum_mulai' | 'sedang_dikerjakan' | 'selesai';
  progress: number; // 0-100
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

// ─── Quiz Question Types ─────────────────────────────────────────
export interface QuizSessionQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
}

export interface QuizAnswerRecord {
  questionId: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // ms per question
}

// ─── Quiz Session State ──────────────────────────────────────────
interface QuizState {
  // Topic selection
  topics: ChemistryTopic[];
  selectedTopicId: string | null;

  // Session
  questions: QuizSessionQuestion[];
  currentIndex: number;
  selectedAnswer: string | null;
  isChecked: boolean;
  answers: QuizAnswerRecord[];
  sessionStartTime: number | null;
  questionStartTime: number | null;
  isSessionActive: boolean;
  isSessionComplete: boolean;

  // Actions
  selectTopic: (topicId: string) => void;
  startSession: (questions: QuizSessionQuestion[]) => void;
  selectAnswer: (label: string) => void;
  checkAnswer: () => void;
  nextQuestion: () => void;
  cancelSession: () => void;
  resetSession: () => void;
  getSessionDuration: () => number;
  updateTopicProgress: (topicId: string, score: number, total: number) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  topics: CHEMISTRY_TOPICS,
  selectedTopicId: null,

  questions: [],
  currentIndex: 0,
  selectedAnswer: null,
  isChecked: false,
  answers: [],
  sessionStartTime: null,
  questionStartTime: null,
  isSessionActive: false,
  isSessionComplete: false,

  selectTopic: (topicId) => set({ selectedTopicId: topicId }),

  startSession: (questions) =>
    set({
      questions,
      currentIndex: 0,
      selectedAnswer: null,
      isChecked: false,
      answers: [],
      sessionStartTime: Date.now(),
      questionStartTime: Date.now(),
      isSessionActive: true,
      isSessionComplete: false,
    }),

  selectAnswer: (label) => {
    const { isChecked } = get();
    if (isChecked) return;
    set({ selectedAnswer: label });
  },

  checkAnswer: () => {
    const { selectedAnswer, questions, currentIndex, answers, questionStartTime } = get();
    if (!selectedAnswer || !questions[currentIndex]) return;

    const q = questions[currentIndex];
    const isCorrect = selectedAnswer === q.correct_answer;
    const timeSpent = questionStartTime ? Date.now() - questionStartTime : 0;

    const record: QuizAnswerRecord = {
      questionId: q.id,
      selectedAnswer,
      correctAnswer: q.correct_answer,
      isCorrect,
      timeSpent,
    };

    set({
      isChecked: true,
      answers: [...answers, record],
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        selectedAnswer: null,
        isChecked: false,
        questionStartTime: Date.now(),
      });
    } else {
      set({ isSessionComplete: true, isSessionActive: false });
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
    }),

  getSessionDuration: () => {
    const { sessionStartTime } = get();
    if (!sessionStartTime) return 0;
    return Date.now() - sessionStartTime;
  },

  updateTopicProgress: (topicId, score, total) => {
    const { topics } = get();
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    set({
      topics: topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              progress: Math.max(t.progress, pct),
              bestScore: t.bestScore !== null ? Math.max(t.bestScore, pct) : pct,
              status: pct >= 70 ? 'selesai' : 'sedang_dikerjakan',
            }
          : t
      ),
    });
  },
}));
