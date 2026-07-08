'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import type { QuizModule } from '@/types/admin';

interface Props {
  modules: QuizModule[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  onEdit: (module: QuizModule) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export default function ModuleTable({ modules, total, limit, offset, onPageChange, onEdit, onDelete, onCreate }: Props) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Modules</p>
        <button
          onClick={onCreate}
          className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors cursor-pointer"
        >
          + Add Module
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Description</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Sort Order</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium max-w-[200px] truncate">{m.title}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[300px] truncate">{m.description || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    m.is_active
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                  }`}>
                    {m.is_active ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{m.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(m)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer" title="Edit">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onDelete(m.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer" title="Hapus">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada modul.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {offset + 1}–{Math.min(offset + limit, total)} dari {total.toLocaleString()} modul
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onPageChange(offset - limit)} disabled={offset === 0}>Sebelumnya</Button>
            <Button variant="secondary" size="sm" onClick={() => onPageChange(offset + limit)} disabled={offset + limit >= total}>Selanjutnya</Button>
          </div>
        </div>
      )}
    </div>
  );
}
