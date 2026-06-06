'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';
import { MultimodalUploader } from './MultimodalUploader';
import { ModelSelector } from './ModelSelector';
import type { AiMode } from '@/types';
import { MODEL_OPTIONS_BY_MODE } from '@/types';

interface UploadedFile {
  file: File;
  preview: string | null;
  extractedText: string | null;
  isUploading: boolean;
  fileName: string;
  url?: string;
}

interface ChatInputProps {
  aiMode: AiMode;
}

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

  // Reset selected model when aiMode changes
  useEffect(() => {
    setSelectedModel(MODEL_OPTIONS_BY_MODE[aiMode][0].value);
  }, [aiMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleRemoveFile = useCallback(() => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setFileContext(null);
  }, [uploadedFile]);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    if (uploadedFile?.isUploading) return;

    // Track whether this is a new chat (no activeSessionId yet)
    const isNewChat = !activeSessionId;

    const fileUrl = uploadedFile?.url || uploadedFile?.preview || null;
    const fileName = uploadedFile?.fileName || null;
    const fileType = uploadedFile?.file.type || null;

    // Clear input immediately (optimistic)
    setMessage('');
    setFileContext(null);
    setUploadedFile(null);

    // sendMessage returns the resolved chatId (or null on error)
    const chatId = await sendMessage({
      message: trimmed,
      ai_mode: aiMode,
      file_context: fileContext,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      model_choice: selectedModel,
    });

    // If this was a new chat and we got a chatId back, navigate to it
    // so the URL reflects the active session
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

  const canSend = message.trim().length > 0 && !isSending && !uploadedFile?.isUploading;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg transition-shadow focus-within:shadow-xl focus-within:border-gray-300">
        {/* File Preview Area (appears above input) */}
        <AnimatePresence>
          {uploadedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pt-3 flex border-b border-gray-100">
                <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-2 flex items-center gap-2 mb-3 max-w-[280px] group">
                  {/* Thumbnail / Icon */}
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt="preview"
                      className="h-10 w-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                  {/* File Info */}
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {uploadedFile.fileName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {uploadedFile.isUploading ? 'Uploading...' : 'Ready'}
                    </p>
                  </div>
                  {/* Close Button */}
                  <button
                    onClick={handleRemoveFile}
                    className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Row */}
        <div className="flex items-end gap-2 p-3">
          {/* File Upload */}
          <div className="relative shrink-0 self-end pb-0.5">
            <MultimodalUploader
              onFileReady={(text) => setFileContext(text)}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
            />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about medicine, herbs, or chemistry..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none leading-relaxed max-h-40"
          />

          {/* Model Selector */}
          <ModelSelector
            aiMode={aiMode}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={cn(
              'shrink-0 p-2.5 rounded-xl transition-all duration-200 cursor-pointer',
              canSend
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-2">
        MedBot AI can make mistakes. Verify important medical information with professionals.
      </p>
    </div>
  );
}
