'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Avatar } from '@/components/ui/Avatar';
import { MessageSkeleton } from '@/components/ui/Spinner';
import { InteractiveQuiz } from '@/components/quiz/InteractiveQuiz';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/hooks/useChatStore';
import type { ChatMessage, QuizData } from '@/types';

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

export function ChatStream() {
  const { messages, isLoadingMessages, isSending } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (isLoadingMessages) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-2">
      {messages.map((msg, index) => (
        <MessageBubble key={msg.id} message={msg} index={index} />
      ))}
      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message, index }: { message: ChatMessage; index: number }) {
  const isUser = message.role === 'user';
  const quizData = getInlineQuizData(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="flex gap-3 py-3"
    >
      <Avatar type={message.role} />
      <div className="flex-1 min-w-0">
        {/* Role Label */}
        <p className="text-xs font-medium text-gray-400 mb-1">
          {isUser ? 'You' : 'MedBot AI'}
        </p>

        {/* Quiz Interception */}
        {quizData ? (
          <InteractiveQuiz quizData={quizData} />
        ) : (
          /* Markdown Content */
          <div className="prose prose-sm prose-gray max-w-none text-gray-800 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom code block styling
                pre: ({ children, ...props }) => (
                  <pre
                    className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-xs my-3"
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                code: ({ children, className, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-md text-xs font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // Clean table styles
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-3 rounded-xl border border-gray-200">
                    <table className="min-w-full text-sm" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th className="bg-gray-50 px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="px-3 py-2 border-b border-gray-100" {...props}>
                    {children}
                  </td>
                ),
                // Link styling
                a: ({ children, ...props }) => (
                  <a className="text-blue-600 hover:text-blue-700 underline decoration-blue-300" {...props}>
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* File context indicator */}
        {message.file_context && (
          <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
            📎 Includes attached file context
          </p>
        )}
      </div>
    </motion.div>
  );
}
