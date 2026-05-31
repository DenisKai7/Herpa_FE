'use client';

import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface AvatarProps {
  type: 'user' | 'ai';
  className?: string;
}

export function Avatar({ type, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center h-8 w-8 rounded-full shrink-0',
        type === 'user'
          ? 'bg-blue-100 text-blue-600'
          : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white',
        className
      )}
    >
      {type === 'user' ? (
        <User className="h-4 w-4" />
      ) : (
        <Bot className="h-4 w-4" />
      )}
    </div>
  );
}
