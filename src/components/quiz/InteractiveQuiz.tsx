'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Trophy,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Check,
  X,
  Bookmark,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { QuizCard } from './QuizCard';
import { Button } from '@/components/ui/Button';
import type { QuizData, QuizQuestion } from '@/types';
import { cn } from '@/lib/utils';

interface ExtendedQuizData extends QuizData {
  analisis_performa?: {
    sorotan?: string[];
    area_fokus?: string[];
  };
}

interface InteractiveQuizProps {
  quizData: ExtendedQuizData;
}

/**
 * Normalizes incoming quiz data to handle variant backend payloads.
 * Supports both Indonesian backend keys (daftar_soal, pertanyaan, opsi_jawaban, dll.)
 * and English keys (questions, question, options, etc.).
 */
function normalizeQuestions(quizData: unknown): QuizQuestion[] {
  if (!quizData || typeof quizData !== 'object') return [];

  const data = quizData as Record<string, unknown>;

  // Root wrapper keys fallback
  const raw = data.daftar_soal ?? data.questions ?? data.quiz ?? data.items ?? [];

  if (!Array.isArray(raw)) return [];

  const getAlphabetLabel = (index: number) => String.fromCharCode(65 + index);

  const getCleanOptionLabel = (value: unknown, index: number) => {
    if (typeof value !== 'string') return getAlphabetLabel(index);
    const label = value.trim();
    if (!label) return getAlphabetLabel(index);
    if (label.length > 12 || label.split(/\s+/).length > 2) return getAlphabetLabel(index);
    return label.toUpperCase();
  };

  const getOptionText = (value: unknown) => {
    if (typeof value === 'string') return value;
    if (value == null) return '';
    return String(value);
  };

  return raw
    .map((q, questionIndex) => {
      if (q == null || typeof q !== 'object') return null;

      const item = q as Record<string, unknown>;

      // Question item object property safety fallbacks
      const questionText = (item.pertanyaan ?? item.question) as string | undefined;
      const optionChoices = (item.opsi_jawaban ?? item.options) as unknown[];
      const correctAnswer = item.jawaban_benar ?? item.answer ?? item.correct_answer;
      const explanationText = (item.pembahasan ?? item.explanation) as string | undefined;

      // Validate required fields
      if (typeof questionText !== 'string' || questionText.trim() === '') return null;
      if (!Array.isArray(optionChoices) || optionChoices.length === 0) return null;

      // Normalize choices to a strict { label, text } structure
      const normalizedOptions = optionChoices.map((opt, index) => {
        const fallbackLabel = getAlphabetLabel(index);

        if (opt && typeof opt === 'object') {
          const option = opt as Record<string, unknown>;
          return {
            label: getCleanOptionLabel(option.label, index),
            text: getOptionText(option.text ?? option.value ?? option.answer ?? option.label),
          };
        }

        return {
          label: fallbackLabel,
          text: getOptionText(opt),
        };
      });

      // Map Correct Answer to match the option labels correctly
      let normalizedCorrectAnswer = '';
      if (typeof correctAnswer === 'number') {
        normalizedCorrectAnswer = getAlphabetLabel(correctAnswer);
      } else if (typeof correctAnswer === 'string') {
        const cleanAnswer = correctAnswer.trim();
        // Check if correct answer matches any option label or text
        const matchedOpt = normalizedOptions.find(
          (o) => o.label.toUpperCase() === cleanAnswer.toUpperCase() || o.text === cleanAnswer
        );
        normalizedCorrectAnswer = matchedOpt ? matchedOpt.label : cleanAnswer;
      }

      return {
        id: questionIndex,
        question: questionText,
        options: normalizedOptions,
        correct_answer: normalizedCorrectAnswer,
        explanation: explanationText ?? '',
      } as QuizQuestion;
    })
    .filter((q): q is QuizQuestion => q !== null);
}

export function InteractiveQuiz({ quizData }: InteractiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Global State Dictionary Scheme
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [lockedQuestions, setLockedQuestions] = useState<Record<number, boolean>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});

  // Defensive structural normalization
  const actualQuestions = useMemo(() => normalizeQuestions(quizData), [quizData]);
  const totalQuestions = actualQuestions.length;

  const topic = quizData?.topic ?? 'Kuis Medis';
  const difficulty = quizData?.difficulty ?? 'Menengah';

  // Calculate final score based on locked correct answers
  const score = useMemo(() => {
    return actualQuestions.reduce((acc, q, index) => {
      const chosen = selectedAnswers[index];
      const isCorrect = chosen === q.correct_answer;
      return isCorrect ? acc + 1 : acc;
    }, 0);
  }, [actualQuestions, selectedAnswers]);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Dynamically resolve performance analysis with robust, highly detailed fallbacks
  const analysisData = useMemo(() => {
    const rawData = quizData as any;
    const analysis = rawData?.analisis_performa ?? rawData?.analisisPerforma ?? rawData?.performance_analysis ?? rawData?.performanceAnalysis;

    const sorotan = analysis?.sorotan ?? analysis?.highlights ?? analysis?.highlight;
    const areaFokus = analysis?.area_fokus ?? analysis?.areaFokus ?? analysis?.focus_areas ?? analysis?.focusAreas;

    if (Array.isArray(sorotan) && Array.isArray(areaFokus)) {
      return {
        sorotan: sorotan.filter((item): item is string => typeof item === 'string'),
        area_fokus: areaFokus.filter((item): item is string => typeof item === 'string'),
      };
    }

    // High-quality clinical theme diagnostic feedback based on score percentage
    if (percentage >= 80) {
      return {
        sorotan: [
          'Akurasi pengerjaan Anda sangat tinggi, menunjukkan penguasaan materi klinis yang luar biasa.',
          'Sangat kuat dalam mengidentifikasi gejala klinis utama dan mekanisme aksi farmakologi.',
          'Kemampuan interpretasi diagnostik dan pemecahan masalah kasus pasien sudah tergolong solid.'
        ],
        area_fokus: [
          'Pertahankan performa ini dengan memperdalam kasus-kasus klinis langka atau skenario kedaruratan.',
          'Eksplorasi literatur jurnal medis terbaru terkait panduan terapi (guideline) mutakhir.',
          'Bagikan metode belajar Anda atau coba tantang diri dengan kesulitan kuis yang lebih tinggi.'
        ]
      };
    } else if (percentage >= 50) {
      return {
        sorotan: [
          'Memiliki dasar pengetahuan medis yang baik pada sebagian besar konsep patofisiologi.',
          'Berhasil mengidentifikasi beberapa alternatif terapi obat dengan tepat.',
          'Mampu membedakan terminologi klinis standar secara memadai.'
        ],
        area_fokus: [
          'Tingkatkan ketelitian dalam memahami kontraindikasi obat dan efek samping spesifik.',
          'Pelajari kembali soal-soal yang salah terutama pada bagian diagnosis banding.',
          'Sempatkan membaca rangkuman pembahasan kuis untuk memantapkan pemahaman teoritis.'
        ]
      };
    } else {
      return {
        sorotan: [
          'Menunjukkan komitmen belajar yang baik dengan menyelesaikan seluruh rangkaian kuis medis.',
          'Berhasil mengidentifikasi konsep anatomi dasar dengan benar.',
          'Telah berupaya menganalisis skenario kasus dengan sungguh-sungguh.'
        ],
        area_fokus: [
          'Prioritaskan pemahaman konsep-konsep inti farmakoterapi dan interaksi obat dasar.',
          'Gunakan panduan belajar terpersonalisasi untuk meninjau materi patologi sistemik.',
          'Coba ulas kembali pembahasan setiap pertanyaan kuis ini sebelum mengambil kuis baru.'
        ]
      };
    }
  }, [quizData, percentage]);

  // Handlers
  const handleSelectAnswer = (optionLabel: string) => {
    if (lockedQuestions[currentIndex]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionLabel,
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleToggleHint = () => {
    if (lockedQuestions[currentIndex]) return;
    setShowHints((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleLockOrNext = () => {
    const isLocked = lockedQuestions[currentIndex];
    const hasSelection = selectedAnswers[currentIndex] !== undefined;

    if (!hasSelection) return;

    if (!isLocked) {
      // Lock current question
      setLockedQuestions((prev) => ({
        ...prev,
        [currentIndex]: true,
      }));
    } else {
      // Move to next question or finish
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setIsFinished(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFinished(false);
    setSelectedAnswers({});
    setLockedQuestions({});
    setFlaggedQuestions({});
    setShowHints({});
    setShowAnalysis(false);
  };

  // Safe empty state
  if (!actualQuestions || totalQuestions === 0) {
    return (
      <div className="p-6 text-center bg-[#0F131E] border border-gray-800 rounded-2xl max-w-md mx-auto my-4 shadow-xl">
        <div className="text-lg font-semibold text-gray-200 mb-2">Materi Perlu Diperinci</div>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          Sistem tidak menemukan materi spesifik untuk topik tersebut. Silakan masukkan kata kunci tanaman obat atau materi kimia yang ingin diujikan.
        </p>
        <div className="text-xs text-blue-400 bg-blue-500/5 border border-blue-500/10 px-3 py-2 rounded-xl inline-block">
          Contoh: &quot;Buatkan kuis 3 soal tentang khasiat daun sambiloto&quot;
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, totalQuestions - 1);
  const currentQuestion = actualQuestions[safeIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto my-4"
    >
      <div className="bg-[#0F131C] rounded-2xl border border-gray-800/80 shadow-2xl overflow-hidden">
        {/* Gemini Dark Aesthetic Header */}
        <div className="px-6 py-5 bg-[#181C25]/40 border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100 tracking-wide">Kuis Medis: {topic}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalQuestions} Pertanyaan &bull; {difficulty}
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!isFinished && currentQuestion ? (
              <div className="space-y-6">
                <QuizCard
                  question={currentQuestion}
                  questionIndex={safeIndex}
                  totalQuestions={totalQuestions}
                  selectedAnswer={selectedAnswers[safeIndex]}
                  isLocked={lockedQuestions[safeIndex]}
                  isFlagged={flaggedQuestions[safeIndex]}
                  showHint={showHints[safeIndex]}
                  flaggedQuestions={flaggedQuestions}
                  onSelectAnswer={handleSelectAnswer}
                  onToggleFlag={handleToggleFlag}
                  onToggleHint={handleToggleHint}
                />

                {/* Advanced Navigation Bar */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-800/60">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="border border-gray-800 hover:bg-gray-800/60 disabled:hover:bg-transparent text-gray-400 disabled:text-gray-600 disabled:opacity-40 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Kembali
                  </button>

                  <Button
                    onClick={handleLockOrNext}
                    disabled={selectedAnswers[currentIndex] === undefined}
                    variant={lockedQuestions[currentIndex] ? 'secondary' : 'primary'}
                    className={cn(
                      'rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200',
                      !lockedQuestions[currentIndex] && 'bg-blue-600 hover:bg-blue-700 text-white border-none'
                    )}
                  >
                    {lockedQuestions[currentIndex]
                      ? currentIndex === totalQuestions - 1
                        ? 'Lihat Hasil Kuis'
                        : 'Pertanyaan Berikutnya'
                      : 'Kunci Jawaban'}
                  </Button>
                </div>
              </div>
            ) : isFinished ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="py-4 text-left"
              >
                {/* 1. Header Title */}
                <h3 className="text-xl font-medium text-slate-200 mb-6 text-left">
                  Anda berhasil! Kuis selesai.
                </h3>

                {/* 2. Metrics Grid (3-Column Layout) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* Card 1: Skor */}
                  <div className="bg-[#181C25] border border-gray-800/60 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skor</span>
                      <Trophy className="h-4.5 w-4.5 text-amber-400" />
                    </div>
                    <div className="text-3xl font-semibold text-slate-100">
                      {score}/{totalQuestions}
                    </div>
                  </div>

                  {/* Card 2: Akurasi */}
                  <div className="bg-[#181C25] border border-gray-800/60 rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Akurasi</span>
                      <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                    </div>
                    <div className="text-3xl font-semibold text-slate-100">
                      {percentage}%
                    </div>
                  </div>

                  {/* Card 3: Detail Tally */}
                  <div className="bg-[#181C25] border border-gray-800/60 rounded-2xl p-5 flex flex-col justify-center min-h-[110px]">
                    <div className="space-y-1.5 text-xs font-medium">
                      <div className="flex items-center justify-between text-emerald-400">
                        <div className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" />
                          <span>Benar</span>
                        </div>
                        <span>{score}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-400">
                        <div className="flex items-center gap-1.5">
                          <X className="h-3.5 w-3.5" />
                          <span>Salah</span>
                        </div>
                        <span>{totalQuestions - score}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Bookmark className="h-3.5 w-3.5" />
                          <span>Dilewati</span>
                        </div>
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Expandable "Analisis Performa Saya" Panel */}
                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    {!showAnalysis ? (
                      <motion.div
                        key="collapsed-analysis-banner"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#181C25] border border-gray-800/60 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-[#004D7A]/20 border border-[#004D7A]/40 flex items-center justify-center shrink-0">
                            <Sparkles className="h-5 w-5 text-[#A6E1FF]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-200">
                              Keunggulan dan Area yang Perlu Ditingkatkan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-lg">
                              Analisis kecerdasan buatan terhadap pengerjaan kuis Anda untuk mengoptimalkan efisiensi belajar mandiri.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAnalysis(true)}
                          className="bg-[#004D7A] hover:bg-[#0066A3] text-[#A6E1FF] text-sm px-4 py-2 rounded-full font-medium transition-all shrink-0 cursor-pointer focus:outline-none whitespace-nowrap self-end md:self-center"
                        >
                          Analisis performa saya
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="expanded-analysis-dashboard"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="bg-[#181C25] border border-gray-800/60 rounded-2xl p-5 space-y-6"
                      >
                        {/* Expandable Header */}
                        <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                            <h4 className="text-sm font-semibold text-slate-200">Analisis Performa Saya</h4>
                          </div>
                          <button
                            onClick={() => setShowAnalysis(false)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2.5 py-1 rounded-lg hover:bg-blue-500/10 transition-all cursor-pointer focus:outline-none"
                          >
                            Tutup Analisis
                          </button>
                        </div>

                        {/* List Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Sorotan Section */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800/40">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              Sorotan
                            </h5>
                            <ul className="space-y-3 pl-1">
                              {analysisData.sorotan.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs text-slate-300 leading-relaxed pb-3 border-b border-slate-800/20 last:border-0 last:pb-0"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Area Fokus Section */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800/40">
                              <Bookmark className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                              Area fokus
                            </h5>
                            <ul className="space-y-3 pl-1">
                              {analysisData.area_fokus.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs text-slate-300 leading-relaxed pb-3 border-b border-slate-800/20 last:border-0 last:pb-0"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. "Teruslah Belajar" Micro-Cards Grid */}
                <div className="mt-8">
                  <h4 className="text-base font-medium text-slate-300 mb-4">Teruslah Belajar</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card A: Kartu Tanya Jawab */}
                    <div className="bg-[#181C25]/40 border border-gray-800/50 rounded-2xl p-4 flex gap-4 items-start hover:border-gray-800/80 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Bookmark className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-200">Kartu Tanya Jawab</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Ulas kembali pertanyaan kuis ini dengan format flashcard interaktif untuk melatih retensi memori jangka panjang.
                        </p>
                      </div>
                    </div>

                    {/* Card B: Panduan belajar */}
                    <div className="bg-[#181C25]/40 border border-gray-800/50 rounded-2xl p-4 flex gap-4 items-start hover:border-gray-800/80 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-200">Panduan belajar</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Dapatkan ringkasan materi medis terpersonalisasi yang dirancang khusus berdasarkan jawaban salah kuis Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Bottom Row Action Navigation Bar */}
                <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-gray-800/40">
                  <button
                    onClick={() => {
                      setIsFinished(false);
                      setCurrentIndex(0);
                    }}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 cursor-pointer px-3 py-2 transition-colors focus:outline-none"
                  >
                    Tinjau kuis
                  </button>
                  <button
                    onClick={handleRestart}
                    className="bg-[#AEC6FF] hover:bg-[#C2D5FF] text-[#002D6C] text-sm px-5 py-2.5 rounded-full font-semibold transition-colors focus:outline-none cursor-pointer"
                  >
                    Pertanyaan lainnya
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
