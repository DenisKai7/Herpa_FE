'use client';

import React, { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { AttachmentStatus } from '@/types';

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

interface MultimodalUploaderProps {
  onFileReady: (extractedText: string) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (file: UploadedFile | null | ((prev: UploadedFile | null) => UploadedFile | null)) => void;
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

    const preview = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;

    setUploadedFile({
      file,
      preview,
      extractedText: null,
      isUploading: true,
      status: 'uploading',
      fileName: file.name,
    });

    try {
      const response = await filesApi.upload(file);
      const attachment = response.attachment;
      setUploadedFile({
        file,
        preview,
        extractedText: response.extracted_text || null,
        isUploading: false,
        status: attachment?.processing_status || 'queued',
        attachmentId: attachment?.id,
        fileName: file.name,
        url: attachment?.preview_url || response.url || (response.file_id ? `/api/files/download/${response.file_id}` : undefined),
      });
      if (response.extracted_text) {
        onFileReady(response.extracted_text);
      }
    } catch {
      setUploadedFile((prev) => prev ? { ...prev, isUploading: false, status: 'failed', error: 'Upload gagal.' } : null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
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
