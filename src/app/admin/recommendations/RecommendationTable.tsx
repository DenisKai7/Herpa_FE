'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import type { RecommendationSession } from '@/types/admin';

interface Props {
  sessions: RecommendationSession[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  onViewDetail: (session: RecommendationSession) => void;
  onDelete: (sessionId: string) => void;
}

const statusBadge = (status: string) => {
  const cls =
    status === 'success'
      ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
      : status === 'failed'
      ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
      : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      {status}
    </span>
  );
};

export default function RecommendationTable({
  sessions,
  total,
  limit,
  offset,
  onPageChange,
  onViewDetail,
  onDelete,
}: Props) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-500">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Complaint</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Persona</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Results</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Created At</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 max-w-[120px] truncate">{s.id}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-[200px] truncate">{s.complaint}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.persona || '-'}</td>
                <td className="px-4 py-3 text-center">{statusBadge(s.status)}</td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{s.results_count}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(s.created_at).toLocaleString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetail(s)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                      title="Detail"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
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
            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data sesi rekomendasi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {offset + 1}–{Math.min(offset + limit, total)} dari {total.toLocaleString()} sesi
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onPageChange(offset - limit)} disabled={offset === 0}>
              Sebelumnya
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onPageChange(offset + limit)} disabled={offset + limit >= total}>
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
