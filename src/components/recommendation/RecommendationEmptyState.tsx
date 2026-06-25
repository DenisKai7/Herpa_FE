'use client';

import React from 'react';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';

interface RecommendationEmptyStateProps {
  suggestedTerms?: string[];
  onSuggestedClick: (term: string) => void;
  onReset: () => void;
}

const DEFAULT_SUGGESTED_TERMS = [
  'sariawan',
  'luka mulut',
  'iritasi tenggorokan',
  'tenggorokan panas',
];

export function RecommendationEmptyState({
  suggestedTerms,
  onSuggestedClick,
  onReset,
}: RecommendationEmptyStateProps) {
  const terms = (suggestedTerms && suggestedTerms.length > 0) ? suggestedTerms : DEFAULT_SUGGESTED_TERMS;

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-sm mx-auto my-6">
      <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          Belum ditemukan rekomendasi herbal
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Sistem kami belum mendeteksi kecocokan keluhan Anda di database ramuan terstandar. Cobalah mencari menggunakan istilah lain di bawah ini.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
          Rekomendasi Kata Kunci
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {terms.map((term, index) => (
            <button
              key={`suggested-term-${term}-${index}`}
              type="button"
              onClick={() => onSuggestedClick(term)}
              className="text-xs font-semibold px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-850 rounded-full transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          Ubah Keluhan
        </button>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:underline cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Cari Ulang
        </button>
      </div>
    </div>
  );
}
