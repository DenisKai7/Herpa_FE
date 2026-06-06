'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore, ChemistryTopic } from '@/hooks/useQuizStore';
import { getQuestionsForTopic } from '@/lib/quizData';
import { Home, Trophy, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuizDashboard() {
  const router = useRouter();
  const { topics, selectTopic, startSession } = useQuizStore();

  const handleStartQuiz = (topic: ChemistryTopic) => {
    selectTopic(topic.id);
    const questions = getQuestionsForTopic(topic.id);
    startSession(questions);
    router.push('/quiz/session');
  };

  // Status mapping to Indonesian user-friendly text
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'selesai':
        return 'Selesai';
      case 'sedang_dikerjakan':
        return 'Sedang Dikerjakan';
      default:
        return 'Belum Mulai';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Kuis Kimia MedBot AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Peta Pembelajaran Micro-Learning</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Chat</span>
        </button>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Welcome Hero / Stats Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold">Selamat Datang di Arena Kuis!</h2>
            <p className="text-blue-100 max-w-md text-sm md:text-base">
              Latih pemahaman Kimia Medis kamu dengan kuis interaktif Duolingo-style. Pilih topik di bawah untuk memulai.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-2xl flex flex-col items-center">
              <Trophy className="h-6 w-6 text-amber-300 mb-1" />
              <span className="text-2xl font-bold">
                {topics.filter((t) => t.status === 'selesai').length}
              </span>
              <span className="text-xs text-blue-100">Topik Selesai</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-2xl flex flex-col items-center">
              <BookOpen className="h-6 w-6 text-blue-300 mb-1" />
              <span className="text-2xl font-bold">{topics.length}</span>
              <span className="text-xs text-blue-100">Total Topik</span>
            </div>
          </div>
        </div>

        {/* Milestone Tree / Path Description */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Perjalanan Belajarmu</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selesaikan ke-16 topik kimia dasar hingga terapan berikut untuk menguji pemahaman teoritis Anda.
          </p>
        </div>

        {/* 16 Topics Grid Map */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.map((topic, index) => {
            const isCompleted = topic.status === 'selesai';
            const isProgressing = topic.status === 'sedang_dikerjakan';

            return (
              <div
                key={topic.id}
                onClick={() => handleStartQuiz(topic)}
                className={cn(
                  'relative rounded-2xl border bg-white dark:bg-gray-900 p-5 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:-translate-y-1',
                  isCompleted
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/10 dark:bg-emerald-950/10'
                    : isProgressing
                    ? 'border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-950/10'
                    : 'border-gray-200 dark:border-gray-800'
                )}
              >
                {/* Node Milestone Connector Line (Optional Visual styling) */}
                <div className="absolute top-4 left-4 text-2xl bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  {topic.icon}
                </div>

                {/* Progress Circle in top right */}
                <div className="absolute top-5 right-5 w-8 h-8">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200 dark:text-gray-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={cn(
                        isCompleted
                          ? 'text-emerald-500'
                          : 'text-blue-500'
                      )}
                      strokeWidth="3.5"
                      strokeDasharray={`${topic.progress}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
                    {topic.progress}%
                  </div>
                </div>

                {/* Topic Info */}
                <div className="mt-14 space-y-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    Topik {index + 1}
                  </span>
                  <h4 className="font-bold text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {topic.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                {/* Footer Tag */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider',
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : isProgressing
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {getStatusLabel(topic.status)}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Mulai <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
