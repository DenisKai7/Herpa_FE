'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Stethoscope, Share2, AlertCircle } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { InteractiveQuiz } from '@/components/quiz/InteractiveQuiz';
import type { ChatMessage, QuizData, SharedChatData } from '@/types';

function getInlineQuizData(message: ChatMessage): QuizData | null {
  if (message.quiz_data) return message.quiz_data;
  if (message.role !== 'ai' || typeof message.content !== 'string') return null;

  const content = message.content.trim();
  if (!content.startsWith('{')) return null;
  if (!content.includes('daftar_soal') && !content.includes('topik') && !content.includes('questions')) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const quizData = parsed as Record<string, unknown>;
    if (quizData.daftar_soal || quizData.questions) {
      return quizData as unknown as QuizData;
    }
  } catch {
    // Not valid quiz JSON. Render as normal markdown text.
  }

  return null;
}

export default function SharedChatPage() {
  const params = useParams();
  const shareId = params.id as string;

  const [chatData, setChatData] = useState<SharedChatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const data = await chatApi.getSharedChat(shareId);
        setChatData(data);
      } catch {
        setError('This shared chat is no longer available or the link is invalid.');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchSharedChat();
    }
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error || !chatData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Chat Not Found</h1>
          <p className="text-sm text-gray-500">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">{chatData.title}</h1>
              <p className="text-[11px] text-gray-400">Shared conversation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Share2 className="h-3.5 w-3.5" />
            <span>Read-only</span>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-2">
        {chatData.messages.map((msg, index) => {
          const quizData = getInlineQuizData(msg);

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.5) }}
              className="flex gap-3 py-3"
            >
              <Avatar type={msg.role} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 mb-1">
                  {msg.role === 'user' ? 'User' : 'MedBot AI'}
                </p>
                {quizData ? (
                  <InteractiveQuiz quizData={quizData} />
                ) : (
                  <div className="prose prose-sm prose-gray max-w-none text-gray-800 leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-medium text-gray-600">MedBot AI</span> · Medical, Herbal &amp; Chemistry Education Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
