'use client';

import React, { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UploadedFile {
  file: File;
  preview: string | null;
  extractedText: string | null;
  isUploading: boolean;
  fileName: string;
  url?: string;
}

interface MultimodalUploaderProps {
  onFileReady: (extractedText: string) => void;
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
        url: response.url || `/api/files/download/${response.file_id}`,
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
    </div>
  );
}
