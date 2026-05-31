'use client';

import React, { useState, useEffect } from 'react';
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

export default function HomePage() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();
  const { activeSessionId, messages, fetchSessions } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiMode, setAiMode] = useState<AiMode>('umum');

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

  const hasMessages = activeSessionId && messages.length > 0;

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header aiMode={aiMode} onAiModeChange={setAiMode} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages or Welcome */}
          <div className="flex-1 overflow-y-auto">
            {hasMessages ? <ChatStream /> : <WelcomeScreen />}
          </div>

          {/* Chat Input */}
          <ChatInput aiMode={aiMode} />
        </main>
      </div>
    </div>
  );
}
