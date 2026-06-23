'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Stethoscope, FlaskConical, Leaf } from 'lucide-react';

export interface QuickMenu {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  agentMode: string;
  systemContext: string;
  responseLanguage: string;
  defaultPrompt: string;
}

const quickMenus: QuickMenu[] = [
  {
    id: 'medical_knowledge',
    title: 'Pengetahuan Medis',
    description: 'Jelaskan mekanisme kerja Metformin',
    icon: <Stethoscope className="h-5 w-5 text-blue-500" />,
    agentMode: 'medical',
    systemContext: 'medical_knowledge',
    responseLanguage: 'id',
    defaultPrompt: 'Jelaskan mekanisme kerja Metformin secara sederhana dan mudah dipahami.',
  },
  {
    id: 'herbal_medicine',
    title: 'Obat Herbal',
    description: 'Apa khasiat tanaman kunyit?',
    icon: <Leaf className="h-5 w-5 text-green-500" />,
    agentMode: 'herbal',
    systemContext: 'herbal_medicine',
    responseLanguage: 'id',
    defaultPrompt: 'Apa saja khasiat tanaman kunyit, senyawa aktifnya, manfaatnya, dan hal yang perlu diperhatikan dari sisi keamanan?',
  },
  {
    id: 'chemistry',
    title: 'Kimia',
    description: 'Jelaskan struktur dan fungsi asam amino',
    icon: <FlaskConical className="h-5 w-5 text-purple-500" />,
    agentMode: 'chemistry',
    systemContext: 'chemistry',
    responseLanguage: 'id',
    defaultPrompt: 'Jelaskan struktur dan fungsi asam amino secara sederhana, disertai contoh.',
  },
  {
    id: 'quiz_me',
    title: 'Kuis Saya',
    description: 'Buat kuis tentang farmakologi kardiovaskular',
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    agentMode: 'quiz',
    systemContext: 'quiz_generator',
    responseLanguage: 'id',
    defaultPrompt: 'Buatkan kuis pilihan ganda tentang farmakologi kardiovaskular sebanyak 5 soal, lengkap dengan jawaban benar dan pembahasannya.',
  },
];

interface Props {
  activeAgentMode?: string;
  onSuggestionClick?: (menu: QuickMenu) => void;
}

export function WelcomeScreen({ activeAgentMode, onSuggestionClick }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hello! I&apos;m MedBot AI
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto">
          Your intelligent assistant for medical, herbal, and chemistry education. Ask me anything or try a suggestion below.
        </p>

        {activeAgentMode && activeAgentMode !== 'general' && (
          <p className="mb-4 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Mode aktif: {quickMenus.find((m) => m.agentMode === activeAgentMode)?.title ?? activeAgentMode}
          </p>
        )}

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {quickMenus.map((menu, i) => {
            const isActive = activeAgentMode === menu.agentMode;
            return (
              <motion.button
                key={menu.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                onClick={() => onSuggestionClick?.(menu)}
                aria-label={`${menu.title}: ${menu.description}`}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all text-left shadow-sm hover:shadow-md cursor-pointer group ${
                  isActive
                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b] hover:bg-gray-100/50 dark:hover:bg-[#2b394e] hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">{menu.icon}</div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {menu.title}
                  </p>
                  <p className={`text-sm leading-snug transition-colors ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                    {menu.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
