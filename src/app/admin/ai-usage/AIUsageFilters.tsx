'use client';

import React from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import type { AIUsageListParams } from '@/types/admin';

interface AIUsageFiltersProps {
  filters: AIUsageListParams;
  onFilterChange: (filters: AIUsageListParams) => void;
}

const selectClass =
  'w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-purple-500 text-gray-900 dark:text-gray-100 transition-colors';

export function AIUsageFilters({ filters, onFilterChange }: AIUsageFiltersProps) {
  const update = (patch: Partial<AIUsageListParams>) =>
    onFilterChange({ ...filters, ...patch });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <SearchInput
          value={filters.search ?? ''}
          onChange={(v) => update({ search: v || undefined })}
          placeholder="Cari request ID / user ID..."
        />

        {/* Date From */}
        <input
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => update({ date_from: e.target.value || undefined })}
          className={selectClass}
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => update({ date_to: e.target.value || undefined })}
          className={selectClass}
        />

        {/* Persona */}
        <input
          type="text"
          placeholder="Persona"
          value={filters.persona ?? ''}
          onChange={(e) => update({ persona: e.target.value || undefined })}
          className={selectClass}
        />

        {/* Model Name */}
        <input
          type="text"
          placeholder="Model Name"
          value={filters.model_name ?? ''}
          onChange={(e) => update({ model_name: e.target.value || undefined })}
          className={selectClass}
        />

        {/* Endpoint */}
        <input
          type="text"
          placeholder="Endpoint"
          value={filters.endpoint ?? ''}
          onChange={(e) => update({ endpoint: e.target.value || undefined })}
          className={selectClass}
        />

        {/* Status */}
        <select
          value={filters.status ?? ''}
          onChange={(e) => update({ status: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">Semua Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>

        {/* Sort */}
        <select
          value={filters.sort ?? ''}
          onChange={(e) => update({ sort: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">Urutkan</option>
          <option value="created_at">Tanggal</option>
          <option value="latency_ms">Latency</option>
          <option value="input_tokens">Token Input</option>
          <option value="output_tokens">Token Output</option>
        </select>

        {/* Sort Direction */}
        <select
          value={filters.sort_dir ?? 'desc'}
          onChange={(e) => update({ sort_dir: e.target.value })}
          className={selectClass}
        >
          <option value="desc">Terbaru</option>
          <option value="asc">Terlama</option>
        </select>
      </div>
    </div>
  );
}
