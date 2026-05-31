'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Shield,
  ChevronDown,
  Stethoscope,
  GraduationCap,
  FlaskConical,
  Users,
} from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { AiMode } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  aiMode: AiMode;
  onAiModeChange: (mode: AiMode) => void;
}

const AI_MODES: { value: AiMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'tenaga_medis',
    label: 'Tenaga Medis',
    icon: <Stethoscope className="h-4 w-4" />,
    description: 'For healthcare professionals',
  },
  {
    value: 'peneliti',
    label: 'Peneliti',
    icon: <FlaskConical className="h-4 w-4" />,
    description: 'For researchers',
  },
  {
    value: 'pelajar',
    label: 'Pelajar',
    icon: <GraduationCap className="h-4 w-4" />,
    description: 'For students',
  },
  {
    value: 'umum',
    label: 'Umum',
    icon: <Users className="h-4 w-4" />,
    description: 'General public',
  },
];

export function Header({ aiMode, onAiModeChange }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const currentMode = AI_MODES.find((m) => m.value === aiMode) || AI_MODES[0];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: App Branding */}
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Stethoscope className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-gray-800 hidden sm:inline">
          MedBot AI
        </span>
      </div>

      {/* Center: AI Persona Selector */}
      <div className="flex items-center">
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm">
              <span className="text-blue-600">{currentMode.icon}</span>
              <span className="text-sm font-medium text-gray-700">
                {currentMode.label}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </div>
          }
          align="left"
          items={AI_MODES.map((mode) => ({
            label: mode.label,
            icon: (
              <span
                className={cn(
                  'text-gray-500',
                  aiMode === mode.value && 'text-blue-600'
                )}
              >
                {mode.icon}
              </span>
            ),
            onClick: () => onAiModeChange(mode.value),
          }))}
        />
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center gap-2">
        {user?.role === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}
        <Dropdown
          trigger={
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
              {user?.full_name?.charAt(0).toUpperCase() || '?'}
            </div>
          }
          items={[
            {
              label: 'Sign out',
              icon: <LogOut className="h-4 w-4" />,
              onClick: handleLogout,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
}
