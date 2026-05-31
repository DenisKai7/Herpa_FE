'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { QuizQuestion as QuizQuestionType } from '@/types';

interface QuizCardProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

export function QuizCard({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
  isLast,
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const isCorrect = selectedOption === question.correct_answer;

  const handleSelect = (label: string) => {
    if (isRevealed) return;
    setSelectedOption(label);
    setIsRevealed(true);
    onAnswer(label === question.correct_answer);
  };

  const getOptionStyle = (label: string) => {
    if (!isRevealed) {
      return selectedOption === label
        ? 'border-blue-400 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }
    if (label === question.correct_answer) {
      return 'border-green-400 bg-green-50';
    }
    if (label === selectedOption && !isCorrect) {
      return 'border-red-400 bg-red-50';
    }
    return 'border-gray-100 bg-gray-50/50 opacity-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 w-6 rounded-full transition-colors',
                i < questionIndex
                  ? 'bg-blue-500'
                  : i === questionIndex
                  ? 'bg-blue-400'
                  : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-gray-900 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => handleSelect(option.label)}
            disabled={isRevealed}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer disabled:cursor-default',
              getOptionStyle(option.label)
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center h-7 w-7 rounded-lg text-sm font-semibold shrink-0 transition-colors',
                isRevealed && option.label === question.correct_answer
                  ? 'bg-green-500 text-white'
                  : isRevealed && option.label === selectedOption && !isCorrect
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {isRevealed && option.label === question.correct_answer ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : isRevealed && option.label === selectedOption && !isCorrect ? (
                <XCircle className="h-4 w-4" />
              ) : (
                option.label
              )}
            </span>
            <span className="text-sm text-gray-700 flex-1">{option.text}</span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'p-4 rounded-xl border text-sm leading-relaxed',
                isCorrect
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              )}
            >
              <p className="font-semibold mb-1">
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p>{question.explanation}</p>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={onNext} icon={<ChevronRight className="h-4 w-4" />}>
                {isLast ? 'See Results' : 'Next'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
