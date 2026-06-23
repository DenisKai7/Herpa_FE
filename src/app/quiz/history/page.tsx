'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Trophy } from 'lucide-react';
import { quizApi } from '@/lib/api/quiz';
import type { QuizHistoryEntry } from '@/types/quiz';

function formatDateIndonesia(isoString?: string | null): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}.${minutes}`;
  } catch {
    return isoString;
  }
}

export default function QuizHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await quizApi.getHistory();
        if (!cancelled) setHistory(data);
      } catch (error) {
        console.warn('Quiz history unavailable:', error);
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <button onClick={() => router.push('/quiz')} className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kuis
        </button>
        <span className="font-bold">Riwayat Quiz</span>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">Memuat riwayat...</div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <Clock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <h2 className="text-lg font-bold">Belum ada riwayat quiz.</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Selesaikan sesi quiz untuk melihat progres pengerjaan di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const score = item.score ?? 0;
              const accuracy = score;
              const isActive = item.status === 'active';
              const isCompleted = item.status === 'completed';
              const statusLabel = isActive ? 'Belum selesai' : isCompleted ? 'Selesai' : item.status ?? 'Selesai';
              const actionLabel = isActive ? 'Lanjutkan' : 'Review';
              const target = isActive
                ? `/quiz/session?session_id=${encodeURIComponent(item.id)}`
                : `/quiz/summary?session_id=${encodeURIComponent(item.id)}`;
              const displayDate = formatDateIndonesia(item.date ?? item.created_at);
              return (
                <div key={item.id ?? index} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{displayDate}</p>
                    <h3 className="font-bold">{item.topic_title ?? item.topic_id ?? 'Topik Quiz'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Level {item.level_number ?? 1} · {statusLabel}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">Skor {accuracy}%</span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                      <Trophy className="h-4 w-4" /> {item.xp_earned ?? 0} XP
                    </span>
                    <button onClick={() => router.push(target)} className="rounded-xl bg-gray-900 px-4 py-2 font-bold text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-white">
                      {actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
