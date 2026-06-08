import apiClient from './client';
import type { AttachmentStatusResponse, FileUploadResponse } from '@/types';

export const filesApi = {
  upload: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileUploadResponse>('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  getStatus: async (attachmentId: string): Promise<AttachmentStatusResponse> => {
    const response = await apiClient.get<AttachmentStatusResponse>(`/api/files/${attachmentId}/status`);
    return response.data;
  },

  retry: async (attachmentId: string): Promise<AttachmentStatusResponse> => {
    const response = await apiClient.post<AttachmentStatusResponse>(`/api/files/${attachmentId}/retry`);
    return response.data;
  },
};
