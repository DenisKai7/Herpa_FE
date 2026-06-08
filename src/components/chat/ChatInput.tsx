'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';
import { filesApi } from '@/lib/api/files';
import { MultimodalUploader } from './MultimodalUploader';
import { ModelSelector } from './ModelSelector';
import type { AiMode, AttachmentStatus } from '@/types';
import { MODEL_OPTIONS_BY_MODE } from '@/types';

interface UploadedFile {
  file: File;
  preview: string | null;
  extractedText: string | null;
  isUploading: boolean;
  status: AttachmentStatus;
  attachmentId?: string;
  fileName: string;
  url?: string;
  error?: string;
}

interface ChatInputProps {
  aiMode: AiMode;
}

const ATTACHMENT_STATUS_LABELS: Record<AttachmentStatus, string> = {
  uploading: 'Mengunggah...',
  queued: 'Menunggu pemrosesan...',
  processing: 'Membaca gambar...',
  completed: 'Siap digunakan',
  failed: 'Gagal diproses · Coba lagi',
};

export function ChatInput({ aiMode }: ChatInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { sendMessage, isSending, activeSessionId } = useChatStore();
  const [message, setMessage] = useState('');
  const [fileContext, setFileContext] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedModel, setSelectedModel] = useState(
    () => MODEL_OPTIONS_BY_MODE[aiMode][0].value
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSelectedModel(MODEL_OPTIONS_BY_MODE[aiMode][0].value);
  }, [aiMode]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [message]);

  useEffect(() => {
    const attachmentId = uploadedFile?.attachmentId;
    if (!attachmentId || uploadedFile.status === 'completed' || uploadedFile.status === 'failed') {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const status = await filesApi.getStatus(attachmentId);
        if (cancelled) return;
        setUploadedFile((prev) => {
          if (!prev || prev.attachmentId !== attachmentId) return prev;
          return {
            ...prev,
            status: status.processing_status,
            isUploading: false,
            extractedText: status.extracted_text || prev.extractedText,
            error: status.error?.message,
          };
        });
        if (status.processing_status === 'completed') {
          setFileContext(status.extracted_text || null);
        }
      } catch {
        if (!cancelled) {
          setUploadedFile((prev) => prev && prev.attachmentId === attachmentId
            ? { ...prev, status: 'failed', isUploading: false, error: 'Gagal membaca status OCR.' }
            : prev);
        }
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [uploadedFile?.attachmentId, uploadedFile?.status]);

  const handleRemoveFile = useCallback(() => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setFileContext(null);
  }, [uploadedFile]);

  const handleRetryFile = useCallback(async () => {
    if (!uploadedFile?.attachmentId) return;
    try {
      const status = await filesApi.retry(uploadedFile.attachmentId);
      setUploadedFile((prev) => prev ? {
        ...prev,
        status: status.processing_status,
        isUploading: false,
        error: undefined,
      } : prev);
      setFileContext(null);
    } catch {
      toast.error('Gagal mencoba ulang OCR.');
    }
  }, [uploadedFile?.attachmentId]);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    if (uploadedFile && uploadedFile.status !== 'completed') {
      toast.error('Lampiran belum siap. Tunggu OCR selesai atau hapus lampiran.');
      return;
    }

    const isNewChat = !activeSessionId;
    const fileUrl = uploadedFile?.url || uploadedFile?.preview || null;
    const fileName = uploadedFile?.fileName || null;
    const fileType = uploadedFile?.file.type || null;
    const attachmentId = uploadedFile?.attachmentId || null;

    setMessage('');
    setFileContext(null);
    setUploadedFile(null);

    const chatId = await sendMessage({
      message: trimmed,
      ai_mode: aiMode,
      file_context: attachmentId ? null : fileContext,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      attachment_id: attachmentId,
      model_choice: selectedModel,
    });

    if (isNewChat && chatId && pathname === '/') {
      router.push(`/?chat=${chatId}`, { scroll: false });
    }
  }, [message, isSending, uploadedFile, aiMode, selectedModel, fileContext, sendMessage, activeSessionId, pathname, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const attachmentReady = !uploadedFile || uploadedFile.status === 'completed';
  const canSend = message.trim().length > 0 && !isSending && attachmentReady;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      <div className="relative bg-slate-50 border border-slate-200 dark:bg-[#1e293b] dark:border-slate-800 rounded-2xl shadow-lg transition-shadow focus-within:shadow-xl focus-within:border-slate-350 dark:focus-within:border-slate-700">
        <AnimatePresence>
          {uploadedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pt-3 flex border-b border-gray-150 dark:border-gray-800">
                <div className="relative bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl p-2 flex items-center gap-2 mb-3 max-w-[340px] group">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt="preview"
                      className="h-10 w-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pr-10">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                      {uploadedFile.fileName}
                    </p>
                    <p className={cn(
                      'text-[10px]',
                      uploadedFile.status === 'failed' ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                    )}>
                      {ATTACHMENT_STATUS_LABELS[uploadedFile.status]}
                    </p>
                  </div>
                  {uploadedFile.status === 'failed' && uploadedFile.attachmentId && (
                    <button
                      type="button"
                      onClick={handleRetryFile}
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
                      title="Coba lagi"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    title="Hapus attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2 p-3">
          <div className="relative shrink-0 self-end pb-0.5">
            <MultimodalUploader
              onFileReady={(text) => setFileContext(text)}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
            />
          </div>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about medicine, herbs, or chemistry..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none leading-relaxed max-h-40"
          />

          <ModelSelector
            aiMode={aiMode}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              'shrink-0 p-2.5 rounded-xl transition-all duration-200 cursor-pointer',
              canSend
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2">
        MedBot AI can make mistakes. Verify important medical information with professionals.
      </p>
    </div>
  );
}
