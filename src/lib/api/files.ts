import apiClient from './client';
import type { FileUploadResponse } from '@/types';

export const filesApi = {
  upload: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileUploadResponse>('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for large files
    });
    return response.data;
  },
};
