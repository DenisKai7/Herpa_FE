'use client';

import React, { useState, useEffect } from 'react';
import type { RecommendationFilters as FiltersType } from './useRecommendations';

interface Props {
  filters: FiltersType;
  onFilterChange: (filters: FiltersType) => void;
}

const inputClass =
  'w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900 dark:text-gray-100 transition-colors';

export default function RecommendationFilters({ filters, onFilterChange }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      onFilterChange({ ...filters, search: search || undefined, offset: 0 });
    }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<FiltersType>) =>
    onFilterChange({ ...filters, ...patch, offset: 0 });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari complaint / user ID..."
          className={inputClass}
        />

        <select
          value={filters.status ?? ''}
          onChange={(e) => update({ status: e.target.value || undefined })}
          className={inputClass}
        >
          <option value="">Semua Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="no_result">No Result</option>
        </select>

        <input
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => update({ date_from: e.target.value || undefined })}
          className={inputClass}
        />

        <input
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => update({ date_to: e.target.value || undefined })}
          className={inputClass}
        />
      </div>
    </div>
  );
}
