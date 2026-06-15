import apiClient from './client';
import type {
  ChatSession,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  RenameChatRequest,
  ShareChatResponse,
  SharedChatData,
} from '@/types';

export const chatApi = {
  // --- Session Management ---
  getSessions: async (): Promise<ChatSession[]> => {
    const response = await apiClient.get<{ chats: ChatSession[] }>('/api/chat/list');
    return response.data.chats;
  },

  deleteSession: async (chatId: string): Promise<void> => {
    await apiClient.delete(`/api/chat/${chatId}`);
  },

  // --- Messages ---
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<{ messages: ChatMessage[] }>(`/api/chat/${chatId}/messages`);
    return response.data.messages;
  },

  sendMessage: async (chatId: string | null, data: ChatRequest, config?: object): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/api/chat/message', data, config);
    return response.data;
  },

  sendMessageStream: async (data: ChatRequest): Promise<Response> => {
    const response = await apiClient.post('/api/chat/message/stream', data, {
      responseType: 'stream',
    });
    return response.data;
  },

  // --- Chat Actions ---
  renameChat: async (chatId: string, data: RenameChatRequest): Promise<ChatSession> => {
    const response = await apiClient.patch<ChatSession>(`/api/chat/${chatId}/rename`, data);
    return response.data;
  },

  pinChat: async (chatId: string, is_pinned: boolean): Promise<ChatSession> => {
    const response = await apiClient.patch<ChatSession>(`/api/chat/${chatId}/pin`, { is_pinned });
    return response.data;
  },

  shareChat: async (chatId: string, is_public: boolean): Promise<ShareChatResponse> => {
    const response = await apiClient.patch<ShareChatResponse>(`/api/chat/${chatId}/share`, { is_public });
    return response.data;
  },

  // --- Public Share ---
  getSharedChat: async (shareId: string): Promise<SharedChatData> => {
    const response = await apiClient.get<SharedChatData>(`/api/chat/public/${shareId}`);
    return response.data;
  },
};
