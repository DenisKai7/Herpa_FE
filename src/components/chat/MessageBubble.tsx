'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FileText, ZoomIn, X, Download, ExternalLink, Database } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { InteractiveQuiz } from '@/components/quiz/InteractiveQuiz';
import type { ChatMessage, QuizData, ChatSource, GraphFact } from '@/types';

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
    let atts: unknown = anyMsg.attachments;
    if (typeof atts === 'string') {
      try {
        atts = JSON.parse(atts) as unknown;
      } catch {
        atts = null;
      }
    }
    if (Array.isArray(atts) && atts.length > 0) {
      const att = atts[0] as Record<string, unknown>;
      const url = (att.file_url || att.url) as string | undefined;
      if (url) {
        return {
          url,
          name: (att.file_name || att.filename || url.split('/').pop()?.split('?')[0] || 'Attached file') as string,
          type: (att.file_type || att.content_type || att.type || (url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf')) as string,
          size: (att.file_size || att.size) as number | undefined,
        };
      }
    } else if (atts && typeof atts === 'object') {
      const attsObj = atts as Record<string, unknown>;
      const url = (attsObj.file_url || attsObj.url) as string | undefined;
      if (url) {
        return {
          url,
          name: (attsObj.file_name || attsObj.filename || url.split('/').pop()?.split('?')[0] || 'Attached file') as string,
          type: (attsObj.file_type || attsObj.content_type || attsObj.type || (url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf')) as string,
          size: (attsObj.file_size || attsObj.size) as number | undefined,
        };
      }
    }
  }

  // 3. metadata field (can be JSON object or stringified JSON)
  const meta = message.metadata;
  if (meta) {
    let m: unknown = meta;
    if (typeof m === 'string') {
      try {
        m = JSON.parse(m) as unknown;
      } catch {
        m = null;
      }
    }
    if (m && typeof m === 'object') {
      const mObj = m as Record<string, unknown>;
      const urlVal = (mObj.file_url || mObj.url) as string | undefined;
      if (urlVal) {
        return {
          url: urlVal,
          name: (mObj.file_name || mObj.filename || urlVal.split('/').pop()?.split('?')[0] || 'Attached file') as string,
          type: (mObj.file_type || mObj.content_type || mObj.type || (urlVal.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image/jpeg' : 'application/pdf')) as string,
          size: (mObj.file_size || mObj.size) as number | undefined,
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

function dedupeSources(sources: ChatSource[]): ChatSource[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = s.source_id || s.identifier || s.title || s.url || JSON.stringify(s);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function SourcesPanel({ sources, graphFacts }: { sources?: ChatSource[]; graphFacts?: GraphFact[] }) {
  const hasSources = sources && sources.length > 0;
  const hasFacts = graphFacts && graphFacts.length > 0;
  if (!hasSources && !hasFacts) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      {hasSources && (
        <div className="mb-2">
          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
            Sumber ({dedupeSources(sources!).length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dedupeSources(sources!).slice(0, 6).map((src, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
              >
                {src.url ? (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-2.5 h-2.5" />
                    {src.title || src.identifier || 'Sumber'}
                  </a>
                ) : (
                  <>
                    <Database className="w-2.5 h-2.5" />
                    {src.title || src.identifier || 'Knowledge Graph'}
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      {hasFacts && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
            Fakta Knowledge Graph ({graphFacts!.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {graphFacts!.slice(0, 4).map((fact, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800"
              >
                {fact.subject} → {fact.object}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
                className="relative mt-2 max-w-[220px] rounded-xl border border-gray-880 bg-[#151922] overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-gray-700 shadow-md group"
              >
                <img src={attachment.url} alt="Medical attachment" className="w-full h-auto max-h-40 object-contain block p-1" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white/90" />
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

          {/* Sources & Graph Facts (AI messages only) */}
          {!isUser && message.metadata && (
            <SourcesPanel
              sources={(message.metadata as Record<string, unknown>).sources as ChatSource[] | undefined}
              graphFacts={(message.metadata as Record<string, unknown>).graph_facts as GraphFact[] | undefined}
            />
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
      {activeLightboxUrl && (
        <div
          onClick={() => setActiveLightboxUrl(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
        >
          <button className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/80 border border-gray-850 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img
            src={activeLightboxUrl}
            alt="Fullscreen preview visual"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
