'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/hooks/useChatStore';
import { MultimodalUploader } from './MultimodalUploader';
import type { AiMode } from '@/types';

interface UploadedFile {
  file: File;
  preview: string | null;
  extractedText: string | null;
  isUploading: boolean;
  fileName: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    if (uploadedFile?.isUploading) return;

    // Clear input immediately (optimistic)
    setMessage('');
    setFileContext(null);
    setUploadedFile(null);

    // Track whether this is a new chat (no activeSessionId yet)
    const isNewChat = !activeSessionId;

    // sendMessage returns the resolved chatId (or null on error)
    const chatId = await sendMessage({
      message: trimmed,
      ai_mode: aiMode,
      file_context: fileContext,
    });

    // If this was a new chat and we got a chatId back, navigate to it
    // so the URL reflects the active session
    if (isNewChat && chatId && pathname === '/') {
      router.push(`/?chat=${chatId}`, { scroll: false });
    }
  }, [message, isSending, uploadedFile, aiMode, fileContext, sendMessage, activeSessionId, pathname, router]);

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

        {/* Input Row */}
        <div className="flex items-end gap-2 p-3">
          {/* File Upload */}
          <div className="relative shrink-0 self-end pb-0.5">
            <MultimodalUploader
              onFileReady={(text) => setFileContext(text)}
              onClear={() => setFileContext(null)}
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
