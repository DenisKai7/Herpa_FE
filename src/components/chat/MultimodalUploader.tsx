'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, X, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UploadedFile {
  file: File;
  preview: string | null;
  extractedText: string | null;
  isUploading: boolean;
  fileName: string;
}

interface MultimodalUploaderProps {
  onFileReady: (extractedText: string) => void;
  onClear: () => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (file: UploadedFile | null) => void;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export function MultimodalUploader({
  onFileReady,
  onClear,
  uploadedFile,
  setUploadedFile,
}: MultimodalUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Please use images or PDFs.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Max 10MB.');
      return;
    }

    // Create preview
    const preview = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;

    setUploadedFile({
      file,
      preview,
      extractedText: null,
      isUploading: true,
      fileName: file.name,
    });

    try {
      const response = await filesApi.upload(file);
      setUploadedFile({
        file,
        preview,
        extractedText: response.extracted_text,
        isUploading: false,
        fileName: file.name,
      });
      onFileReady(response.extracted_text);
    } catch {
      setUploadedFile(null);
      // Error toast handled by interceptor
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    onClear();
  };

  return (
    <div>
      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!!uploadedFile}
        className={cn(
          'p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        title="Attach file"
      >
        <Paperclip className="h-5 w-5" />
      </button>

      {/* File Preview Pill */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm max-w-[280px]">
              {/* Thumbnail / Icon */}
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt="preview"
                  className="h-10 w-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {uploadedFile.fileName}
                </p>
                <p className="text-[10px] text-gray-400">
                  {uploadedFile.isUploading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Ready'
                  )}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={handleRemove}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
