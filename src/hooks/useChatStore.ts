import { create } from 'zustand';
import type { ChatSession, ChatMessage, ChatRequest } from '@/types';
import { chatApi } from '@/lib/api/chat';
import toast from 'react-hot-toast';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Session actions
  fetchSessions: () => Promise<void>;
  startNewChat: () => void;
  setActiveSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, title: string) => Promise<void>;
  pinSession: (sessionId: string) => Promise<void>;
  shareSession: (sessionId: string) => Promise<string | null>;

  // Message actions
  sendMessage: (data: ChatRequest) => Promise<string | null>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isLoadingSessions: false,
  isLoadingMessages: false,
  isSending: false,

  fetchSessions: async () => {
    set({ isLoadingSessions: true });
    try {
      const sessions = await chatApi.getSessions();
      set({ sessions, isLoadingSessions: false });
    } catch {
      set({ isLoadingSessions: false });
    }
  },

  startNewChat: () => {
    set({ activeSessionId: null, messages: [] });
  },

  setActiveSession: async (sessionId: string) => {
    set({ activeSessionId: sessionId, isLoadingMessages: true, messages: [] });
    try {
      const messages = await chatApi.getMessages(sessionId);
      set({ messages, isLoadingMessages: false });
    } catch {
      set({ isLoadingMessages: false });
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await chatApi.deleteSession(sessionId);
      set((state) => {
        const sessions = state.sessions.filter((s) => s.id !== sessionId);
        const activeSessionId =
          state.activeSessionId === sessionId ? null : state.activeSessionId;
        return {
          sessions,
          activeSessionId,
          messages: activeSessionId === null ? [] : state.messages,
        };
      });
      toast.success('Chat deleted.');
    } catch {
      // Error toast already handled by interceptor
    }
  },

  renameSession: async (sessionId: string, title: string) => {
    try {
      await chatApi.renameChat(sessionId, { title });
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, title } : s
        ),
      }));
      toast.success('Chat renamed.');
    } catch {
      // Error toast already handled by interceptor
    }
  },

  pinSession: async (sessionId: string) => {
    try {
      const session = get().sessions.find((s) => s.id === sessionId);
      const newPinned = !(session?.is_pinned ?? false);
      await chatApi.pinChat(sessionId, newPinned);
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, is_pinned: newPinned } : s
        ),
      }));
      toast.success(newPinned ? 'Chat pinned.' : 'Chat unpinned.');
    } catch {
      // Error toast already handled by interceptor
    }
  },

  shareSession: async (sessionId: string) => {
    try {
      const response = await chatApi.shareChat(sessionId, true);
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId
            ? { ...s, is_public: true }
            : s
        ),
      }));
      toast.success('Share link created!');
      return response.public_url ?? null;
    } catch {
      return null;
    }
  },

  sendMessage: async (data: ChatRequest) => {
    const { activeSessionId } = get();

    // Optimistic: add user message immediately
    const tempChatId = activeSessionId || `temp-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      chat_id: tempChatId,
      role: 'user',
      content: data.message,
      quiz_data: null,
      file_context: data.file_context || null,
      created_at: new Date().toISOString(),
      metadata: data.file_url ? {
        file_url: data.file_url,
        file_name: data.file_name || undefined,
        file_type: data.file_type || undefined,
      } : null,
      file_url: data.file_url || null,
      file_name: data.file_name || null,
      file_type: data.file_type || null,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isSending: true,
    }));

    try {
      // Pass chat_id in the request body (backend expects it there)
      const requestWithChatId = { ...data, chat_id: activeSessionId };
      const response = await chatApi.sendMessage(activeSessionId, requestWithChatId);

      // If this was a new chat, the backend returns the new chat_id
      const newChatId = response.chat_id || activeSessionId;
      const isNewSession = newChatId && newChatId !== activeSessionId;

      if (isNewSession) {
        set({ activeSessionId: newChatId });
        // Await the sessions refresh so the sidebar updates immediately
        await get().fetchSessions();
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        chat_id: newChatId || tempChatId,
        role: 'ai',
        content: response.response,
        quiz_data: response.quiz_data ?? null,
        file_context: null,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isSending: false,
      }));

      // Return the chat_id so the caller can handle routing
      return newChatId || null;
    } catch {
      set({ isSending: false });
      return null;
    }
  },

  clearMessages: () => {
    set({ messages: [], activeSessionId: null });
  },
}));
