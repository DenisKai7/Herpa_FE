'use client';

import React, { useState } from 'react';
import type { AIUsageLog } from '@/types/admin';
import { Button } from '@/components/ui/Button';

interface AIUsageTableProps {
  logs: AIUsageLog[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  onViewDetail: (id: number) => void;
  onDelete: (id: number) => void;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export function AIUsageTable({
  logs,
  total,
  limit,
  offset,
  onPageChange,
  onViewDetail,
  onDelete,
  selectedIds,
  onSelectionChange,
}: AIUsageTableProps) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(logs.map((l) => l.id));
    }
  };

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left px-4 py-3">
                <input
                  type="checkbox"
                  checked={logs.length > 0 && selectedIds.length === logs.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Waktu</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Model</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Persona</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Endpoint</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Token Input</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Token Output</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Latency</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(log.id)}
                    onChange={() => toggleSelect(log.id)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{log.model_name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.persona || '-'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.endpoint || '-'}</td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatTokens(log.input_tokens)}</td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatTokens(log.output_tokens)}</td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {log.latency_ms >= 1000 ? `${(log.latency_ms / 1000).toFixed(1)}s` : `${log.latency_ms}ms`}
                </td>
                <td className="px-4 py-3 text-center">
                  {log.success ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                      Error
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetail(log.id)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                      title="Detail"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(log.id)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data AI usage.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {offset + 1}–{Math.min(offset + limit, total)} dari {total.toLocaleString()} log
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(offset - limit)}
              disabled={offset === 0}
            >
              Sebelumnya
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(offset + limit)}
              disabled={offset + limit >= total}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
