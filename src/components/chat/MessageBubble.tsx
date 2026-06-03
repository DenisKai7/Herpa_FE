'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FileText, ZoomIn, X, Download } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { InteractiveQuiz } from '@/components/quiz/InteractiveQuiz';
import type { ChatMessage, QuizData } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

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

const extractAttachment = (message: ChatMessage) => {
  if (message.role !== 'user') return null;

  // 1. Direct file_url on message
  if (message.file_url) {
    const url = message.file_url;
    return {
      url,
      name: message.file_name || url.split('/').pop()?.split('?')[0] || 'Attached file',
      type: message.file_type || (url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf'),
      size: message.file_size || undefined,
    };
  }

  // 2. attachments array or object
  const anyMsg = message as unknown as Record<string, unknown>;
  if (anyMsg.attachments) {
    let atts = anyMsg.attachments;
    if (typeof atts === 'string') {
      try {
        atts = JSON.parse(atts);
      } catch {
        atts = null;
      }
    }
    if (Array.isArray(atts) && atts.length > 0) {
      const att = atts[0];
      const url = att.file_url || att.url;
      if (url) {
        return {
          url,
          name: att.file_name || att.filename || url.split('/').pop()?.split('?')[0] || 'Attached file',
          type: att.file_type || att.content_type || att.type || (url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf'),
          size: att.file_size || att.size || undefined,
        };
      }
    } else if (atts && typeof atts === 'object') {
      const url = atts.file_url || atts.url;
      if (url) {
        return {
          url,
          name: atts.file_name || atts.filename || url.split('/').pop()?.split('?')[0] || 'Attached file',
          type: atts.file_type || atts.content_type || atts.type || (url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf'),
          size: atts.file_size || atts.size || undefined,
        };
      }
    }
  }

  // 3. metadata field (can be JSON object or stringified JSON)
  const meta = message.metadata;
  if (meta) {
    let m = meta as unknown as Record<string, unknown>;
    if (typeof m === 'string') {
      try {
        m = JSON.parse(m);
      } catch {
        m = null;
      }
    }
    if (m) {
      const urlVal = m.file_url || m.url;
      if (urlVal) {
        return {
          url: urlVal,
          name: m.file_name || m.filename || urlVal.split('/').pop()?.split('?')[0] || 'Attached file',
          type: m.file_type || m.content_type || m.type || (urlVal.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf'),
          size: m.file_size || m.size || undefined,
        };
      }
    }
  }

  return null;
};

const sanitizeContent = (content: string) => {
  if (!content) return '';
  // Strip markdown pattern like [Attached medical file](blob:...) or similar
  let sanitized = content.replace(/\[Attached medical file\]\((blob:.*?|http.*?)\)/gi, '');
  // Strip plain text matches like [Attached medical file]
  sanitized = sanitized.replace(/\[Attached medical file\]/gi, '');
  return sanitized.trim();
};

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const quizData = getInlineQuizData(message);
  const attachment = extractAttachment(message);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  // Esc key closure for Lightbox popup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePreviewUrl(null);
      }
    };
    if (activePreviewUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePreviewUrl]);

  return (
    <>
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
              <div
                onClick={() => setActivePreviewUrl(attachment.url)}
                className="relative max-w-[240px] max-h-[180px] rounded-xl border border-gray-800 bg-[#161A23] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02] shadow-md group"
              >
                <img
                  src={attachment.url}
                  alt="Chat attachment"
                  className="w-full h-full object-cover max-h-[180px]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white/80" />
                </div>
              </div>
            ) : (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 max-w-md p-3 rounded-xl bg-[#1A1F2C] border border-gray-800 my-2 hover:bg-[#242A38] transition-colors duration-200 cursor-pointer text-decoration-none group"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate group-hover:text-blue-400 transition-colors">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <div className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors shrink-0">
                  <Download className="w-4 h-4" />
                </div>
              </a>
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
                {sanitizeContent(message.content)}
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

      {/* Full-Screen Image Lightbox Popup Component */}
      <AnimatePresence>
        {activePreviewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePreviewUrl(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[999] flex items-center justify-center animate-fade-in"
          >
            {/* Explicit Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePreviewUrl(null);
              }}
              className="absolute top-4 right-4 p-2 cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </button>

            {/* Image Presentation */}
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={activePreviewUrl}
              alt="Lightbox Preview"
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
