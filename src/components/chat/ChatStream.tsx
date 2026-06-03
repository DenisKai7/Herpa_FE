'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FileText } from 'lucide-react';
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

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'PDF Document';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const isImageFile = (type?: string, url?: string) => {
  if (type) return type.startsWith('image/');
  if (url) return /\.(jpeg|jpg|gif|png|webp|svg)/i.test(url);
  return false;
};

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

  const attachment = (() => {
    if (!isUser || !message) return null;
    const directUrl = message.file_url;
    if (directUrl) {
      return {
        url: directUrl,
        name: message.file_name || 'Attached file',
        type: message.file_type || (directUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf'),
        size: message.file_size || undefined,
      };
    }
    const meta = message.metadata;
    if (meta) {
      const m = meta as Record<string, unknown>;
      const urlVal = (m.file_url || m.url) as string | undefined;
      if (urlVal) {
        return {
          url: urlVal,
          name: (m.file_name || m.filename || 'Attached file') as string,
          type: (m.file_type || m.content_type || m.type || (urlVal.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf')) as string,
          size: (m.file_size || m.size) as number | undefined,
        };
      }
    }
    return null;
  })();

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

        {/* Attachment Preview (above message content) */}
        {attachment && (
          isImageFile(attachment.type, attachment.url) ? (
            <div className="relative max-w-sm rounded-2xl overflow-hidden border border-gray-800/80 bg-[#181C25]/40 my-2 group transition-all duration-200 hover:border-gray-750">
              <img src={attachment.url} alt="Attached medical file" className="max-h-60 w-auto object-cover rounded-2xl" />
            </div>
          ) : (
            <div className="flex items-center gap-3 max-w-md p-3 rounded-xl bg-[#1A1F2C] border border-gray-800 my-2 hover:bg-[#242A38] transition-colors duration-200">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{attachment.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(attachment.size)}</p>
              </div>
            </div>
          )
        )}

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
