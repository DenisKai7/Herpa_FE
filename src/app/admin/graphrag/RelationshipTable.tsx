'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import type { GraphRelationship } from '@/types/admin';

interface RelationshipTableProps {
  relationships: GraphRelationship[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  onDelete: (id: number) => void;
}

export function RelationshipTable({
  relationships,
  total,
  limit,
  offset,
  onPageChange,
  onDelete,
}: RelationshipTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Source</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Target</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Properties</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {relationships.map((rel, index) => (
              <tr key={`rel-${rel.rel_id}-${index}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{rel.source_name}</span>
                    <span className="ml-1.5 text-[10px] text-gray-400 font-mono">#{rel.source_id}</span>
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {rel.source_labels.map((l) => (
                      <span key={l} className="text-[10px] text-gray-400">{l}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {rel.rel_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{rel.target_name}</span>
                    <span className="ml-1.5 text-[10px] text-gray-400 font-mono">#{rel.target_id}</span>
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {rel.target_labels.map((l) => (
                      <span key={l} className="text-[10px] text-gray-400">{l}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                  {Object.keys(rel.properties).length > 0
                    ? Object.entries(rel.properties)
                        .slice(0, 2)
                        .map(([k, v]) => `${k}: ${String(v).slice(0, 20)}`)
                        .join(', ')
                    : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(rel.rel_id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {relationships.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No relationships found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <Pagination total={total} limit={limit} offset={offset} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
