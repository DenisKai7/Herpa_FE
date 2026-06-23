'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ChatStream } from '@/components/chat/ChatStream';
import { ChatInput } from '@/components/chat/ChatInput';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useChatStore } from '@/hooks/useChatStore';
import { Spinner } from '@/components/ui/Spinner';
import type { AiMode } from '@/types';
import type { QuickMenu } from '@/components/chat/WelcomeScreen';

export default function HomePage() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();
  const { activeSessionId, messages, isSending, fetchSessions } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiMode, setAiMode] = useState<AiMode>('umum');
  const [activeAgentMode, setActiveAgentMode] = useState<string>('general');
  const [activeSystemContext, setActiveSystemContext] = useState<string>('general');
  const [responseLanguage, setResponseLanguage] = useState<string>('id');
  const [chatInputSetMessage, setChatInputSetMessage] = useState<((msg: string) => void) | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  // Fetch sessions when user is authenticated
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  const handleChatInputReady = useCallback((setMsg: (msg: string) => void) => {
    setChatInputSetMessage(() => setMsg);
  }, []);

  const handleQuickMenuClick = useCallback((menu: QuickMenu) => {
    setActiveAgentMode(menu.agentMode);
    setActiveSystemContext(menu.systemContext);
    setResponseLanguage(menu.responseLanguage || 'id');
    if (chatInputSetMessage) {
      chatInputSetMessage(menu.defaultPrompt);
    }
  }, [chatInputSetMessage]);

  // Loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading MedBot AI...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Show ChatStream if there are messages OR if we're actively sending
  const hasMessages = messages.length > 0 || isSending;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#030712] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header aiMode={aiMode} onAiModeChange={setAiMode} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#030712] transition-colors duration-200">
          {/* Chat Messages or Welcome */}
          <div className="flex-1 overflow-y-auto">
            {hasMessages ? <ChatStream /> : <WelcomeScreen activeAgentMode={activeAgentMode} onSuggestionClick={handleQuickMenuClick} />}
          </div>

          {/* Chat Input */}
          <ChatInput aiMode={aiMode} agentMode={activeAgentMode} systemContext={activeSystemContext} responseLanguage={responseLanguage} onReady={handleChatInputReady} />
        </main>
      </div>
    </div>
  );
}
