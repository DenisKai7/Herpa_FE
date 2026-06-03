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
  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  // Esc key closure for Lightbox popup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxUrl(null);
      }
    };
    if (activeLightboxUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLightboxUrl]);

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
                onClick={() => setActiveLightboxUrl(attachment.url)}
                className="relative mt-2 max-w-[200px] rounded-xl border border-gray-850 bg-[#161920] overflow-hidden cursor-pointer transition-all duration-250 hover:scale-[1.02] hover:border-gray-700 shadow-md group"
              >
                <img
                  src={attachment.url}
                  alt="Uploaded compound asset"
                  className="w-full h-auto max-h-40 object-contain block p-1"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white/95" />
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
        {activeLightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxUrl(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          >
            {/* Circular Exit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightboxUrl(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Presentation */}
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={activeLightboxUrl}
              alt="Fullscreen preview"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl select-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
