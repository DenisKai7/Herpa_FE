'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap, History, Home, Trophy, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { QuizTopicCard } from '@/components/quiz/QuizTopicCard';
import { getHttpStatus, quizApi } from '@/lib/api/quiz';
import type { QuizLevel, QuizProgress, QuizTopic } from '@/types/quiz';

export default function QuizDashboard() {
  const router = useRouter();
  const [progress, setProgress] = useState<QuizProgress>({ total_xp: 0, level: 1, completed_topics: 0, completed_levels: 0, current_streak: 0, topic_progress: [] });
  const [topics, setTopics] = useState<QuizTopic[]>([]);
  const [quizBackendAvailable, setQuizBackendAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuizData() {
      const dashboard = await quizApi.getDashboard();
      if (!cancelled) {
        setProgress(dashboard.progress);
        setTopics(dashboard.topics);
        setQuizBackendAvailable(true);
      }
    }

    loadQuizData().catch((error) => {
      console.warn('Quiz data load failed:', error);
      if (!cancelled) {
        setTopics([]);
        setQuizBackendAvailable(false);
        toast.error('Data quiz tidak dapat dimuat dari database.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStartLevel = async (topic: QuizTopic, level: QuizLevel) => {
    if (level.is_locked || level.is_unlocked === false) {
      toast(`Selesaikan Level ${Math.max(1, level.level_number - 1)} terlebih dahulu.`, { icon: '🔒' });
      return;
    }

    try {
      const session = await quizApi.startSession({ level_id: level.id });
      router.push(`/quiz/session?session_id=${encodeURIComponent(session.id)}&topic_id=${encodeURIComponent(topic.id)}&level=${level.level_number}`);
    } catch (error) {
      console.warn('Backend quiz session failed:', error);
      if (getHttpStatus(error) === 404) {
        toast.error('Level quiz tidak ditemukan atau belum memiliki soal.');
      } else {
        toast.error('Gagal memulai quiz. Coba lagi.');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Kuis Kimia MedBot AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Peta Pembelajaran Micro-Learning</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/quiz/history')} className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
            <History className="h-4 w-4" />
            <span>History</span>
          </button>
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
            <Home className="h-4 w-4" />
            <span>Kembali ke Chat</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-6 pb-16 pt-28">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-extrabold md:text-3xl">Selamat Datang di Arena Kuis!</h2>
            <p className="max-w-md text-sm text-blue-100 md:text-base">Pilih topik dan level 1–5. Seluruh soal dimuat dari database quiz terbaru.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex min-w-[80px] flex-col items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <Zap className="mb-0.5 h-5 w-5 text-yellow-300" />
              <span className="text-xl font-bold">{progress.total_xp}</span>
              <span className="text-[10px] text-blue-100">Total XP</span>
            </div>
            <div className="flex min-w-[80px] flex-col items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <Trophy className="mb-0.5 h-5 w-5 text-amber-300" />
              <span className="text-xl font-bold">Level {progress.level}</span>
              <span className="text-[10px] text-blue-100">Level Anda</span>
            </div>
            <div className="flex min-w-[80px] flex-col items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <BookOpen className="mb-0.5 h-5 w-5 text-blue-300" />
              <span className="text-xl font-bold">{progress.completed_topics ?? progress.topics_completed ?? 0}</span>
              <span className="text-[10px] text-blue-100">Topik Selesai</span>
            </div>
          </div>
        </div>

        {quizBackendAvailable === false && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            Data quiz tidak dapat dimuat dari database. Coba refresh atau jalankan backend terlebih dahulu.
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Perjalanan Belajarmu</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Setiap topik memiliki Level 1–5: Pilihan Ganda, Mencocokkan, Benar/Salah, Jawaban Singkat, dan Studi Kasus.</p>
        </div>

        {topics.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            Belum ada topik quiz dari database.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic, index) => (
              <QuizTopicCard key={topic.id} topic={topic} index={index} onStartLevel={handleStartLevel} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
