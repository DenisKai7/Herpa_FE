'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Shield,
  ChevronDown,
  Stethoscope,
  GraduationCap,
  FlaskConical,
  Users,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useThemeStore } from '@/hooks/useThemeStore';
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

// ─── User Dropdown (self-contained, outside Header) ────────────────
function UserDropdown() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/login');
  };

  const initials = user?.full_name?.charAt(0).toUpperCase() || '?';

  return (
    <div ref={ref} className="relative inline-block">
      {/* ── Trigger: Avatar + Username ──────────────────────── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full',
          'border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-800',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'transition-all duration-200 shadow-sm cursor-pointer'
        )}
      >
        {/* Avatar circle */}
        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm shrink-0">
          {initials}
        </div>
        {/* Username */}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline max-w-[120px] truncate">
          {user?.full_name || 'User'}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* ── Dropdown Panel ──────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute right-0 z-50 mt-2 w-64',
              'rounded-2xl bg-white dark:bg-gray-800',
              'border border-gray-100 dark:border-gray-700',
              'shadow-lg py-2'
            )}
          >
            {/* ─ User Info Header ─ */}
            <div className="px-4 py-3 mb-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {user?.email || ''}
              </p>
            </div>

            <hr className="my-1 border-gray-100 dark:border-gray-700" />

            {/* ─ Item 1: Edit Profile ─ */}
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile edit (placeholder — adapt route as needed)
                router.push('/profile');
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm',
                'text-gray-600 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-700/60',
                'transition-colors duration-150 cursor-pointer'
              )}
            >
              <User className="h-4 w-4" />
              Edit Profile
            </button>

            {/* ─ Item 2: Dark Mode Toggle ─ */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm',
                'text-gray-600 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-700/60',
                'transition-colors duration-150 cursor-pointer'
              )}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="flex-1 text-left">Dark Mode</span>
              {/* Mini toggle indicator */}
              <div
                className={cn(
                  'relative w-9 h-5 rounded-full transition-colors duration-200',
                  theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    theme === 'dark' && 'translate-x-4'
                  )}
                />
              </div>
            </button>

            {/* ─ Divider ─ */}
            <hr className="my-1 border-gray-100 dark:border-gray-700" />

            {/* ─ Item 3: Sign Out ─ */}
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium',
                'text-red-600 dark:text-red-400',
                'hover:bg-red-50 dark:hover:bg-red-500/10',
                'rounded-b-2xl',
                'transition-colors duration-150 cursor-pointer'
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────
export function Header({ aiMode, onAiModeChange }: HeaderProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  const currentMode = AI_MODES.find((m) => m.value === aiMode) || AI_MODES[0];

  return (
    <header className="h-14 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 transition-colors duration-200">
      {/* Left: App Branding */}
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Stethoscope className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100 hidden sm:inline">
          MedBot AI
        </span>
      </div>

      {/* Center: AI Persona Selector */}
      <div className="flex items-center">
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              <span className="text-blue-600 dark:text-blue-400">{currentMode.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
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
                  'text-gray-500 dark:text-gray-400',
                  aiMode === mode.value && 'text-blue-600 dark:text-blue-400'
                )}
              >
                {mode.icon}
              </span>
            ),
            onClick: () => onAiModeChange(mode.value),
          }))}
          menuClassName="dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Right: Admin button + User Menu */}
      <div className="flex items-center gap-2">
        {user?.role === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}
        <UserDropdown />
      </div>
    </header>
  );
}
