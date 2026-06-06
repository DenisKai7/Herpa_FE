'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/hooks/useQuizStore';
import { X, CheckCircle2, AlertTriangle, Play, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple Synth sound generator using Web Audio API
const playSoundEffect = (type: 'correct' | 'incorrect') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'correct') {
      // Correct answer: Upward major chord sound
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.3); // E6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } else {
      // Incorrect answer: Low flat minor buzz sound
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.error('Audio synthesis failed', e);
  }
};

export default function QuizSession() {
  const router = useRouter();
  const {
    questions,
    currentIndex,
    selectedAnswer,
    isChecked,
    answers,
    selectAnswer,
    checkAnswer,
    nextQuestion,
    cancelSession,
    isSessionActive,
    isSessionComplete,
    selectedTopicId,
  } = useQuizStore();

  const [hasStartedTransition, setHasStartedTransition] = useState(false);

  // Protection redirect
  useEffect(() => {
    if (!isSessionActive && !isSessionComplete) {
      router.push('/quiz');
    }
  }, [isSessionActive, isSessionComplete, router]);

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round((currentIndex / questions.length) * 100);

  const handleOptionClick = (label: string) => {
    if (isChecked) return;
    selectAnswer(label);
  };

  const handleCheck = () => {
    if (!selectedAnswer || isChecked) return;
    checkAnswer();

    // Determine correct/incorrect instant feedback sound
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    playSoundEffect(isCorrect ? 'correct' : 'incorrect');
  };

  const handleNext = () => {
    nextQuestion();
    setHasStartedTransition(true);
    // Reset transition flag
    setTimeout(() => setHasStartedTransition(false), 300);
  };

  const handleCancel = () => {
    cancelSession();
    router.push('/quiz');
  };

  // If session is complete, route to summary
  useEffect(() => {
    if (isSessionComplete) {
      router.push('/quiz/summary');
    }
  }, [isSessionComplete, router]);

  const currentRecord = answers.find(a => a.questionId === currentQuestion.id);
  const isCorrect = currentRecord?.isCorrect;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex flex-col justify-between">
      {/* Top Header Navigation bar */}
      <header className="max-w-4xl w-full mx-auto px-6 py-6 flex items-center justify-between gap-6 shrink-0">
        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Progress bar container */}
        <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner relative">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Questions index marker */}
        <span className="text-sm font-bold text-gray-400 whitespace-nowrap">
          {currentIndex + 1} / {questions.length}
        </span>
      </header>

      {/* Main Single Question Session Area */}
      <main className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: hasStartedTransition ? 50 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-8"
          >
            {/* Question Text block */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" />
                Pertanyaan {currentIndex + 1}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Option blocks */}
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.label;
                const isOptCorrect = option.label === currentQuestion.correct_answer;

                return (
                  <button
                    key={option.label}
                    onClick={() => handleOptionClick(option.label)}
                    disabled={isChecked}
                    className={cn(
                      'flex items-center gap-4 w-full p-5 text-left rounded-2xl border-2 transition-all duration-200 font-medium relative',
                      'disabled:cursor-default',
                      !isChecked && 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-900/30',
                      isChecked
                        ? isOptCorrect
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/10'
                          : isSelected
                          ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-sm shadow-rose-500/10'
                          : 'border-gray-200 dark:border-gray-800 opacity-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-md shadow-blue-500/10 scale-[1.01]'
                        : 'border-gray-200 dark:border-gray-800'
                    )}
                  >
                    {/* Circle Badge Indicator */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border-2 shrink-0 transition-all duration-200',
                        isChecked
                          ? isOptCorrect
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isSelected
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-transparent border-gray-300 dark:border-gray-700 text-gray-400'
                          : isSelected
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-400'
                      )}
                    >
                      {option.label}
                    </div>

                    {/* Text description */}
                    <span className="text-sm md:text-base">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Persistent Bar */}
      <footer
        className={cn(
          'w-full border-t py-6 transition-colors duration-300 shrink-0 sticky bottom-0 z-40',
          isChecked
            ? isCorrect
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'
              : 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50'
            : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800'
        )}
      >
        <div className="max-w-2xl w-full mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            {isChecked ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                        Keren! Jawaban Anda Benar
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                      <span className="text-sm font-black text-rose-700 dark:text-rose-400">
                        Jawaban Tepat: {currentQuestion.correct_answer}
                      </span>
                    </>
                  )}
                </div>
                {/* Explanation text block */}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal max-w-xl">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                Pilih satu jawaban di atas untuk memeriksa jawaban Anda.
              </p>
            )}
          </div>

          {/* Action button */}
          <div>
            {!isChecked ? (
              <button
                onClick={handleCheck}
                disabled={!selectedAnswer}
                className={cn(
                  'w-full md:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg',
                  selectedAnswer
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-blue-500/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                )}
              >
                Periksa
              </button>
            ) : (
              <button
                onClick={handleNext}
                className={cn(
                  'w-full md:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg',
                  isCorrect
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] shadow-emerald-500/20'
                    : 'bg-rose-600 text-white hover:bg-rose-700 hover:scale-[1.02] shadow-rose-500/20'
                )}
              >
                <span>Lanjut</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
