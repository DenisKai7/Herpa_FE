'use client';

import React, { useEffect, useRef } from 'react';
import { MessageSkeleton } from '@/components/ui/Spinner';
import { TypingIndicator } from './TypingIndicator';
import { useChatStore } from '@/hooks/useChatStore';
import { MessageBubble } from './MessageBubble';

export function ChatStream() {
  const { messages, isLoadingMessages, isSending } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (isLoadingMessages) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-2">
      {messages.map((msg, index) => (
        <MessageBubble key={msg.id} message={msg} index={index} />
      ))}
      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
