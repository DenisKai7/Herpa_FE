'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, RotateCcw } from 'lucide-react';
import { QuizCard } from './QuizCard';
import { Button } from '@/components/ui/Button';
import type { QuizData } from '@/types';
import { cn } from '@/lib/utils';

interface InteractiveQuizProps {
  quizData: QuizData;
}

export function InteractiveQuiz({ quizData }: InteractiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const { questions, topic, difficulty } = quizData;

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-xl mx-auto my-4"
    >
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Quiz Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Quiz: {topic}</h3>
              <p className="text-xs text-gray-500">
                {questions.length} questions · {difficulty}
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <QuizCard
                key={currentIndex}
                question={questions[currentIndex]}
                questionIndex={currentIndex}
                totalQuestions={questions.length}
                onAnswer={handleAnswer}
                onNext={handleNext}
                isLast={currentIndex === questions.length - 1}
              />
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center space-y-5 py-4"
              >
                <div className="flex justify-center">
                  <div
                    className={cn(
                      'h-20 w-20 rounded-full flex items-center justify-center',
                      percentage >= 80
                        ? 'bg-green-100'
                        : percentage >= 50
                        ? 'bg-amber-100'
                        : 'bg-red-100'
                    )}
                  >
                    <Trophy
                      className={cn(
                        'h-10 w-10',
                        percentage >= 80
                          ? 'text-green-600'
                          : percentage >= 50
                          ? 'text-amber-600'
                          : 'text-red-600'
                      )}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {percentage >= 80
                      ? 'Excellent!'
                      : percentage >= 50
                      ? 'Good effort!'
                      : 'Keep learning!'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    You scored{' '}
                    <span className="font-semibold text-gray-900">
                      {score}/{questions.length}
                    </span>{' '}
                    ({percentage}%)
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRestart}
                  icon={<RotateCcw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
