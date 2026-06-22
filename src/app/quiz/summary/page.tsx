'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/hooks/useQuizStore';
import { Trophy, CheckCircle2, XCircle, ArrowRight, RefreshCw, BookOpen, AlertCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuizSummary() {
  const router = useRouter();
  const {
    questions,
    answers,
    selectedTopicId,
    getSessionDuration,
    updateTopicProgress,
    resetSession,
  } = useQuizStore();

  // Protect route
  useEffect(() => {
    if (questions.length === 0 || answers.length === 0) {
      router.push('/quiz');
    }
  }, [questions, answers, router]);

  // Calculations
  const score = useMemo(() => answers.filter((a) => a.isCorrect).length, [answers]);
  const totalQuestions = questions.length;
  const accuracyRate = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const durationMs = useMemo(() => getSessionDuration(), [getSessionDuration]);
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 100);
    const mins = Math.floor(totalSecs / 600);
    const secs = Math.floor((totalSecs % 600) / 10);
    const tenths = totalSecs % 10;
    return mins > 0 ? `${mins}m ${secs}.${tenths}s` : `${secs}.${tenths}s`;
  };

  // Run only once on mount to persist scores
  useEffect(() => {
    if (selectedTopicId && totalQuestions > 0) {
      updateTopicProgress(selectedTopicId, score, totalQuestions);
    }
  }, [selectedTopicId, score, totalQuestions, updateTopicProgress]);

  const handleFinish = () => {
    resetSession();
    router.push('/quiz');
  };

  // Performance Analysis Insights
  const insights = useMemo(() => {
    const wrongCount = totalQuestions - score;
    if (wrongCount === 0) {
      return {
        weakSpot: 'Tidak Ada / Sempurna!',
        suggestion: 'Luar biasa! Kamu telah menguasai seluruh soal kuis ini dengan sempurna. Cobalah untuk mengambil tantangan topik lainnya untuk memperluas pemahaman akademismu!',
        level: 'Sangat Baik'
      };
    } else if (accuracyRate >= 70) {
      return {
        weakSpot: 'Detail Reaksi & Konstanta Kimia',
        suggestion: 'Pemahaman umum kamu sangat kuat. Namun, kamu perlu lebih berhati-hati pada konseptual detail, mekanisme penemuan, atau detail stoikiometrik. Ulas kembali visualisasi struktur molekul.',
        level: 'Baik'
      };
    } else {
      return {
        weakSpot: 'Konsep Dasar & Hukum Teoretis',
        suggestion: 'Kamu memiliki beberapa miskonsepsi pada hukum dasar atau formula. Fokuskan belajar mandiri pada rangkuman pembahasan di bawah, lalu coba ulangi kuis untuk menaikkan skor kelulusan.',
        level: 'Butuh Ulasan'
      };
    }
  }, [score, totalQuestions, accuracyRate]);

  if (questions.length === 0 || answers.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 flex flex-col">
      {/* Header bar */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
        <span className="font-bold text-base flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Hasil Sesi Kuis</span>
        </span>
        <button
          onClick={handleFinish}
          className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Selesai</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </header>

      {/* Main Stats and Review View */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-10">

        {/* Gamified summary success screen */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center space-y-6 shadow-md">
          <div className="mx-auto h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 animate-bounce">
            <Trophy className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black">Kamu Berhasil Menyelesaikan Kuis!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kerja bagus! Evaluasi hasil pengerjaan di bawah untuk memantapkan pemahaman kimia kamu.
            </p>
          </div>

          {/* Core Stats Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Skor</span>
              <span className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">
                {score} / {totalQuestions}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Akurasi</span>
              <span className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {accuracyRate}%
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Durasi</span>
              <span className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                {formatTime(durationMs)}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights Card Widget */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-950/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-100">Rekomendasi Pemantapan Akademis</h3>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80">
                Analisis otomatis berdasarkan pola jawaban salah kamu.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Titik Kelemahan</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{insights.weakSpot}</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Status Kelayakan</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{insights.level}</p>
              </div>
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 dark:text-indigo-200/90 leading-relaxed font-medium">
                {insights.suggestion}
              </p>
            </div>
          </div>
        </div>

        {/* Review Sheet Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold tracking-tight">Tinjauan Hasil Pertanyaan</h3>
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const record = answers.find((a) => a.questionId === q.id);
              const userChoice = record?.selectedAnswer;
              const isCorrect = record?.isCorrect;

              // Find option texts
              const userOpt = q.options.find((o) => o.label === userChoice);
              const correctOpt = q.options.find((o) => o.label === q.correct_answer);

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
                >
                  {/* Top Header Card Info */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase">
                      Pertanyaan {idx + 1} · {(q.question_type ?? 'multiple_choice').replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Benar</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4.5 w-4.5 text-rose-500" />
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Salah</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Question Title */}
                  <p className="font-bold text-sm md:text-base leading-relaxed text-gray-800 dark:text-gray-100">
                    {q.question}
                  </p>

                  {/* Answers comparative sheet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* User's selection */}
                    <div
                      className={cn(
                        'p-4 rounded-xl border flex flex-col gap-1',
                        isCorrect
                          ? 'border-emerald-100 bg-emerald-50/15 dark:border-emerald-950/30'
                          : 'border-rose-100 bg-rose-50/15 dark:border-rose-950/30'
                      )}
                    >
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Pilihan Kamu</span>
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                        )}
                      >
                        ({userOpt?.label || '?'}) {userOpt?.text || '-'}
                      </p>
                    </div>

                    {/* Correct selection (Show if different) */}
                    {!isCorrect && (
                      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/15 dark:border-emerald-950/30 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-sans">Kunci Jawaban</span>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          ({correctOpt?.label}) {correctOpt?.text}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Explanation drawer */}
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl space-y-1 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pembahasan</span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel bottom */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={async () => {
              // Reload session for same topic
              if (selectedTopicId) {
                const { selectTopic, startSession } = useQuizStore.getState();
                selectTopic(selectedTopicId);
                await startSession(selectedTopicId);
                router.push('/quiz/session');
              }
            }}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Ulangi Kuis</span>
          </button>
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
          >
            <span>Daftar Topik</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
