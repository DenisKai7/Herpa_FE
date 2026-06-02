'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, RotateCcw, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { QuizCard } from './QuizCard';
import { Button } from '@/components/ui/Button';
import type { QuizData, QuizQuestion } from '@/types';
import { cn } from '@/lib/utils';

interface InteractiveQuizProps {
  quizData: QuizData;
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
      <div className="bg-[#0B0F19] rounded-2xl border border-gray-800/80 shadow-2xl overflow-hidden">
        {/* Gemini Dark Aesthetic Header */}
        <div className="px-6 py-5 bg-[#0F131E]/60 border-b border-gray-800/80 flex items-center justify-between">
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
                className="text-center space-y-6 py-6"
              >
                <div className="flex justify-center">
                  <div
                    className={cn(
                      'h-24 w-24 rounded-3xl flex items-center justify-center border transition-all duration-300',
                      percentage >= 80
                        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                        : percentage >= 50
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5'
                        : 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/5'
                    )}
                  >
                    <Trophy
                      className={cn(
                        'h-12 w-12',
                        percentage >= 80
                          ? 'text-emerald-400'
                          : percentage >= 50
                          ? 'text-amber-400'
                          : 'text-red-400'
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-100 tracking-wide">
                    {percentage >= 80
                      ? 'Luar Biasa!'
                      : percentage >= 50
                      ? 'Usaha yang Bagus!'
                      : 'Terus Belajar!'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Anda menjawab dengan benar{' '}
                    <span className="font-semibold text-gray-200">
                      {score} dari {totalQuestions}
                    </span>{' '}
                    pertanyaan ({percentage}%)
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="secondary"
                    onClick={handleRestart}
                    className="border border-gray-800 hover:bg-gray-800/80 text-gray-300 rounded-xl px-6 py-2.5 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" /> Ulangi Kuis
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
