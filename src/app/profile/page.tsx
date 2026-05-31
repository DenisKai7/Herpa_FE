'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Spinner } from '@/components/ui/Spinner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const infoItems = [
    { icon: <Mail className="h-4 w-4" />, label: 'Email', value: user.email },
    { icon: <Building2 className="h-4 w-4" />, label: 'Instansi', value: user.instansi || '—' },
    { icon: <MapPin className="h-4 w-4" />, label: 'Lokasi', value: [user.kota, user.provinsi].filter(Boolean).join(', ') || '—' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Bergabung', value: new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          {/* Avatar + Name */}
          <div className="px-6 py-8 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-3xl mb-4">
              {user.full_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mt-2 capitalize">
              {user.role}
            </span>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-6 py-4">
                <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
