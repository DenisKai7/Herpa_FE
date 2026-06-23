'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle2, HelpCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { QuestionRenderer } from '@/components/quiz/questions/QuestionRenderer';
import { formatCorrectAnswer, parseMatchingQuestion } from '@/components/quiz/questions/MatchingQuestionRenderer';
import { resolveShortAnswerCorrectText } from '@/components/quiz/questions/ShortAnswerQuestionRenderer';
import { resolveCaseStudyCorrectText } from '@/components/quiz/questions/CaseStudyQuestionRenderer';
import { useQuizStore } from '@/hooks/useQuizStore';
import { getHttpStatus } from '@/lib/api/quiz';
import { cn } from '@/lib/utils';

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

function hasDuplicatePrompts(questions: { question: string }[]) {
  const prompts = questions.map((q) => q.question.trim().toLowerCase());
  return new Set(prompts).size !== prompts.length;
}

const playSoundEffect = (type: 'correct' | 'incorrect') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type === 'correct' ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(type === 'correct' ? 523.25 : 150, now);
    osc.frequency.linearRampToValueAtTime(type === 'correct' ? 880 : 100, now + 0.3);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (error) {
    console.error('Audio synthesis failed', error);
  }
};

export default function QuizSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const topicId = searchParams.get('topic_id') ?? '';
  const levelNumber = Number(searchParams.get('level') ?? '1');
  const {
    questions,
    currentIndex,
    selectedAnswer,
    matchingAnswer,
    isChecked,
    answers,
    selectAnswer,
    setMatchingAnswer,
    checkAnswer,
    nextQuestion,
    cancelSession,
    isSessionActive,
    isSessionComplete,
    startSession,
  } = useQuizStore();
  const [hasStartedTransition, setHasStartedTransition] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(sessionId));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBackendSession() {
      if (!sessionId) return;
      setIsLoadingSession(true);
      try {
        await startSession(topicId || '', levelNumber, sessionId);
      } catch (error) {
        console.warn('Load quiz session failed:', error);
        toast.error('Session quiz tidak ditemukan. Silakan mulai ulang level.');
        router.push('/quiz');
      } finally {
        if (!cancelled) setIsLoadingSession(false);
      }
    }

    loadBackendSession();
    return () => {
      cancelled = true;
    };
  }, [levelNumber, router, sessionId, startSession, topicId]);

  useEffect(() => {
    if (!sessionId && !isSessionActive && !isSessionComplete) {
      router.push('/quiz');
    }
  }, [isSessionActive, isSessionComplete, router, sessionId]);

  useEffect(() => {
    if (isSessionComplete) {
      router.push('/quiz/summary');
    }
  }, [isSessionComplete, router]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && questions.length > 0 && hasDuplicatePrompts(questions)) {
      console.warn('Quiz session contains duplicate question prompts', questions);
    }
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion ? answers.find((answer) => answer.questionId === currentQuestion.id) : undefined;
  const isCorrect = currentRecord?.isCorrect;
  const currentQuestionType = currentQuestion?.question_type ?? 'multiple_choice';
  const parsedMatching = currentQuestionType === 'matching' && currentQuestion ? parseMatchingQuestion(currentQuestion) : null;
  const progressPercent = questions.length > 0 ? Math.round((currentIndex / questions.length) * 100) : 0;

  const isAnswerValid = () => {
    if (!currentQuestion) return false;
    const qtype = currentQuestion.question_type ?? 'multiple_choice';
    if (qtype === 'matching') {
      const { leftItems } = parseMatchingQuestion(currentQuestion);
      return leftItems.length > 0 && leftItems.every((item) => Boolean(matchingAnswer[item.key]));
    }
    if (qtype === 'case_based' || qtype === 'case_study') {
      return Boolean(selectedAnswer && selectedAnswer.trim().length >= 10);
    }
    return Boolean(selectedAnswer && selectedAnswer.trim());
  };

  const handleCheck = async () => {
    if (!isAnswerValid() || isChecked || !currentQuestion || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await checkAnswer();
      const latestRecord = useQuizStore.getState().answers.find((answer) => answer.questionId === currentQuestion.id);
      playSoundEffect(latestRecord?.isCorrect ? 'correct' : 'incorrect');
    } catch (error) {
      console.warn('Submit answer failed:', error);
      const status = getHttpStatus(error);
      const isQuestionNotInAttempt = (error as { question_not_in_attempt?: boolean })?.question_not_in_attempt;
      if (isQuestionNotInAttempt) {
        toast.error('Session quiz tidak sinkron. Silakan mulai ulang level.');
        router.push('/quiz');
      } else if (status === 404) {
        toast.error('Session quiz tidak ditemukan. Silakan mulai ulang level.');
        router.push('/quiz');
      } else if (status === 400) {
        toast('Quiz sudah selesai. Mengalihkan ke summary.', { icon: 'ℹ️' });
        router.push('/quiz/summary');
      } else {
        toast.error('Jawaban belum tersimpan. Coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    await nextQuestion();
    setHasStartedTransition(true);
    window.setTimeout(() => setHasStartedTransition(false), 300);
  };

  const handleCancel = () => {
    cancelSession();
    router.push('/quiz');
  };

  if (isLoadingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">Memuat sesi kuis...</div>;
  }

  if (!currentQuestion) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">Sesi quiz tidak memiliki soal.</div>;
  }

  if ((currentQuestion.question_type ?? 'multiple_choice') === 'multiple_choice' && currentQuestion.options.length === 0) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-rose-500 dark:bg-gray-950">Soal belum memiliki pilihan jawaban.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      <header className="mx-auto flex w-full max-w-4xl shrink-0 items-center justify-between gap-6 px-6 py-6">
        <button onClick={handleCancel} className="cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-900 dark:hover:text-gray-200">
          <X className="h-6 w-6" />
        </button>
        <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-gray-100 shadow-inner dark:bg-gray-800">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>
        <span className="whitespace-nowrap text-sm font-bold text-gray-400">{currentIndex + 1} / {questions.length}</span>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 pb-36 pt-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: hasStartedTransition ? 50 : 0 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="space-y-8">
            <div className="space-y-4">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <HelpCircle className="h-4 w-4" />
                Pertanyaan {currentIndex + 1} · {(currentQuestion.question_type ?? 'multiple_choice').replace(/_/g, ' ')}
              </span>
              {currentQuestionType !== 'matching' && <h2 className="text-xl font-bold leading-relaxed md:text-2xl">{currentQuestion.question}</h2>}
            </div>
            <QuestionRenderer question={currentQuestion} selectedAnswer={selectedAnswer} matchingAnswer={matchingAnswer} isChecked={isChecked} onSelect={selectAnswer} onMatchingChange={setMatchingAnswer} isSubmitting={isSubmitting} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={cn('sticky bottom-0 z-40 w-full shrink-0 border-t py-6 transition-colors duration-300', isChecked ? (isCorrect ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20') : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900')}>
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex-1">
            {isChecked ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-rose-500" />}
                  <span className={cn('whitespace-pre-line text-sm font-black', isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
                    {isCorrect
                      ? 'Keren! Jawaban Anda Benar'
                      : currentQuestionType === 'matching' && parsedMatching
                        ? `Jawaban Tepat:\n${formatCorrectAnswer(currentQuestion.correct_answer, parsedMatching.leftItems, parsedMatching.rightItems, currentQuestion.formatted_correct_answer)}`
                        : currentQuestionType === 'short_answer'
                          ? `Jawaban Tepat: ${resolveShortAnswerCorrectText(currentQuestion)}`
                          : (currentQuestionType === 'case_based' || currentQuestionType === 'case_study')
                            ? `Jawaban Tepat: ${resolveCaseStudyCorrectText(currentQuestion)}`
                            : `Jawaban Tepat: ${String(currentQuestion.correct_answer ?? '-')}`}
                  </span>
                </div>
                <p className="max-w-xl text-xs leading-relaxed text-gray-600 dark:text-gray-300">{currentQuestion.explanation}</p>
              </motion.div>
            ) : (
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                {currentQuestionType === 'matching' && !isAnswerValid()
                  ? 'Lengkapi semua pasangan terlebih dahulu.'
                  : (currentQuestionType === 'case_based' || currentQuestionType === 'case_study') && !isAnswerValid()
                    ? 'Tulis jawaban minimal 10 karakter untuk memeriksa hasil.'
                    : 'Isi atau pilih jawaban untuk memeriksa hasil.'}
              </p>
            )}
          </div>
          {!isChecked ? (
            <button onClick={handleCheck} disabled={!isAnswerValid() || isSubmitting} className={cn('w-full cursor-pointer rounded-2xl px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider shadow-lg transition-all duration-200 md:w-auto', isAnswerValid() && !isSubmitting ? 'bg-blue-600 text-white shadow-blue-500/20 hover:scale-[1.02] hover:bg-blue-700' : 'cursor-not-allowed bg-gray-100 text-gray-400 shadow-none dark:bg-gray-800')}>
              {isSubmitting ? 'Memeriksa...' : 'Periksa'}
            </button>
          ) : (
            <button onClick={handleNext} className={cn('flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg transition-all duration-200 hover:scale-[1.02] md:w-auto', isCorrect ? 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700' : 'bg-rose-600 shadow-rose-500/20 hover:bg-rose-700')}>
              <span>Lanjut</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
