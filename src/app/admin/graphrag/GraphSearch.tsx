'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import type { GraphSchema } from '@/types/admin';

interface GraphSearchProps {
  onSearch: (query: string, label: string) => void;
  schema: GraphSchema | null;
}

export function GraphSearch({ onSearch, schema }: GraphSearchProps) {
  const [query, setQuery] = useState('');
  const [label, setLabel] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(query, label);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, label, onSearch]);

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>
      <select
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
      >
        <option value="">All Labels</option>
        {schema?.labels.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
    </div>
  );
}
