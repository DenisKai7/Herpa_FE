'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestion as QuizQuestionType } from '@/types';

interface QuizCardProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  isLocked: boolean;
  isFlagged: boolean;
  showHint: boolean;
  flaggedQuestions: Record<number, boolean>;
  onSelectAnswer: (optionLabel: string) => void;
  onToggleFlag: () => void;
  onToggleHint: () => void;
}

export function QuizCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isLocked,
  isFlagged,
  showHint,
  flaggedQuestions,
  onSelectAnswer,
  onToggleFlag,
  onToggleHint,
}: QuizCardProps) {
  const isCorrect = selectedAnswer === question.correct_answer;

  const getOptionStyle = (optionLabel: string) => {
    if (!isLocked) {
      return selectedAnswer === optionLabel
        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
        : 'border-gray-800/80 hover:border-blue-500/40 bg-[#181C25]/60 hover:bg-[#1E2330] text-gray-300';
    }

    // Locked States
    if (optionLabel === question.correct_answer) {
      return 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
    }

    if (optionLabel === selectedAnswer && !isCorrect) {
      return 'bg-red-500/10 border-red-500 text-red-400';
    }

    return 'border-gray-900 bg-gray-950/20 text-gray-500 opacity-40 cursor-not-allowed';
  };

  // Extracts hint from first sentence or safe fallback
  const explanation = question.explanation;
  const pembahasan = (question as unknown as Record<string, unknown>).pembahasan as string | undefined;
  const hintText = React.useMemo(() => {
    const rawExplanation = explanation || pembahasan;

    // Normalize array to string if backend aggregates data inside brackets
    let text = "";
    if (Array.isArray(rawExplanation)) {
      text = rawExplanation.join(" ").trim();
    } else if (typeof rawExplanation === "string") {
      text = rawExplanation.trim();
    }

    // Fallback layer if content is completely empty or not a string
    if (!text) {
      return 'Gunakan data senyawa aktif yang terkandung pada objek tanaman ini.';
    }

    const sentences = text.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    return firstSentence && firstSentence.length > 5
      ? `${firstSentence}.`
      : 'Gunakan data senyawa aktif yang terkandung pada objek tanaman ini.';
  }, [explanation, pembahasan]);

  return (
    <div className="space-y-5">
      {/* Upper Utility Header & Progress */}
      <div className="flex items-center justify-between gap-4">
        {/* Hint System Toggle (Top Left) */}
        <button
          onClick={onToggleHint}
          disabled={isLocked}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer disabled:cursor-not-allowed',
            showHint
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm'
              : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 disabled:opacity-40 disabled:hover:bg-transparent'
          )}
        >
          <Lightbulb className={cn('w-3.5 h-3.5 text-amber-400', !isLocked && 'animate-pulse')} />
          <span>Hint</span>
        </button>

        {/* Progress and Flag (Top Right) */}
        <div className="flex items-center gap-4">
          {/* Progress Indicator Bubbles */}
          <div className="flex gap-1.5 flex-wrap items-center">
            {Array.from({ length: totalQuestions }).map((_, i) => {
              const isCurrent = i === questionIndex;
              const hasFlag = flaggedQuestions[i];

              return (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 w-6 rounded-full transition-all duration-300',
                    hasFlag
                      ? 'bg-amber-500 shadow-sm shadow-amber-500/20'
                      : i < questionIndex
                      ? 'bg-indigo-500/60'
                      : isCurrent
                      ? 'bg-indigo-500'
                      : 'bg-gray-800'
                  )}
                />
              );
            })}
          </div>

          {/* Ragu-ragu Button */}
          <button
            onClick={onToggleFlag}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer',
              isFlagged
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-sm'
                : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
            )}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Ragu-ragu</span>
          </button>
        </div>
      </div>

      {/* Interactive Micro-drawer Hint View */}
      <AnimatePresence>
        {showHint && !isLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-xs text-amber-300/90 leading-relaxed shadow-inner">
              <span className="font-semibold block mb-1">Clue/Petunjuk:</span>
              {hintText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Question Display */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
          Pertanyaan {questionIndex + 1} dari {totalQuestions}
        </div>
        <h3 className="text-base font-semibold text-gray-100 leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Options Container */}
      <div className="space-y-2.5">
        {question.options.map((option, index) => {
          const optionLabel = typeof option === 'object' && option !== null ? option.label : String(option);
          const badgeLabel = typeof option === 'object' && option !== null && option.label
            ? option.label.slice(0, 1).toUpperCase()
            : String.fromCharCode(65 + index);
          const textNode = typeof option === 'object' && option !== null ? option.text || option.label : String(option);

          const isSelected = selectedAnswer === optionLabel;
          const isCorrectOption = optionLabel === question.correct_answer;

          return (
            <button
              key={`${optionLabel}-${index}`}
              onClick={() => onSelectAnswer(optionLabel)}
              disabled={isLocked}
              className={cn(
                'flex items-center gap-4 w-full p-4 text-left rounded-xl border transition-all duration-200',
                'disabled:cursor-default',
                !isLocked && 'cursor-pointer',
                getOptionStyle(optionLabel)
              )}
            >
              {/* Left Circular Isolated Badge Token */}
              <div
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium shrink-0 transition-colors border',
                  isLocked
                    ? isCorrectOption
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                      : isSelected
                      ? 'bg-red-500/20 border-red-400 text-red-400'
                      : 'bg-gray-900 border-gray-800 text-gray-600'
                    : isSelected
                    ? 'bg-blue-500/20 border-blue-400 text-blue-400'
                    : 'bg-gray-800 border-gray-700 text-gray-300'
                )}
              >
                {isLocked && isCorrectOption ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isLocked && isSelected && !isCorrect ? (
                  <XCircle className="h-4 w-4 text-red-400" />
                ) : (
                  badgeLabel
                )}
              </div>

              {/* Right Clean Isolated Main Text Node Description */}
              <div className="text-sm font-normal leading-relaxed">
                {textNode}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dual-Layer Comparative Explanation Container */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="bg-[#181C25] border border-gray-800 rounded-2xl p-5 mt-6 space-y-4 animate-slide-down">
              {/* Header Zone */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-800/50">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="text-emerald-500 h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold text-emerald-400">Jawaban Tepat!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-500 h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold text-red-400">Jawaban Kurang Tepat</span>
                  </>
                )}
              </div>

              {/* Dynamic Text Realization */}
              <div className="space-y-3 text-xs leading-relaxed text-gray-300">
                {!isCorrect && (
                  <p className="text-red-400/90 font-medium">
                    Mengapa pilihan Anda salah: Pilihan yang Anda pilih tidak sesuai dengan data fitokimia/medis tanaman ini.
                  </p>
                )}
                <p className="text-gray-300">
                  <span className="font-semibold text-gray-200">Pembahasan Ilmiah:</span>{' '}
                  {question.explanation || 'Tidak ada pembahasan detail untuk pertanyaan ini.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
