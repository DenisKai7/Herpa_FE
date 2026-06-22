'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  HerbalCandidate,
  HerbEnrichmentDetail,
} from '@/lib/api/herbalRecommendation';
import { DetailTab } from '@/hooks/useHerbalRecommendation';
import { HerbalDetailTabs } from './HerbalDetailTabs';

interface HerbalDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: HerbalCandidate | null;
  detail: HerbEnrichmentDetail | null;
  detailLoading: boolean;
  detailError?: string;
  activeTab: DetailTab;
  setActiveTab: (tab: DetailTab) => void;
}

export function HerbalDetailDrawer({
  isOpen,
  onClose,
  candidate,
  detail,
  detailLoading,
  detailError,
  activeTab,
  setActiveTab,
}: HerbalDetailDrawerProps) {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg md:max-w-xl h-full bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col focus:outline-none"
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-gray-150 dark:border-gray-800 pb-4 mb-4 shrink-0">
          <div>
            <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-gray-100 leading-tight">
              {candidate.local_name}
            </h3>
            <p className="text-xs text-gray-400 italic mt-0.5">
              {candidate.scientific_name || 'Nama ilmiah belum tersedia'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-hidden">
          <HerbalDetailTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            candidate={candidate}
            detail={detail}
            detailLoading={detailLoading}
            detailError={detailError}
          />
        </div>
      </motion.div>
    </div>
  );
}
