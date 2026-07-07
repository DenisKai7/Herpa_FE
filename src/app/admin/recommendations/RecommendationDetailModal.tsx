'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import type { RecommendationSession } from '@/types/admin';

interface Props {
  session: RecommendationSession | null;
  onClose: () => void;
}

const fieldClass = 'text-xs text-gray-500 dark:text-gray-400';
const valueClass = 'text-sm text-gray-900 dark:text-gray-100 font-medium';

export default function RecommendationDetailModal({ session, onClose }: Props) {
  return (
    <Modal isOpen={session !== null} onClose={onClose} title="Detail Sesi Rekomendasi" className="max-w-2xl">
      {session && (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Key fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {([
              ['Session ID', session.id],
              ['User ID', session.user_id ?? '-'],
              ['Persona', session.persona || '-'],
              ['Status', session.status],
              ['Results Count', session.results_count],
              ['Created At', new Date(session.created_at).toLocaleString('id-ID')],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <p className={fieldClass}>{label}</p>
                <p className={valueClass}>{String(value)}</p>
              </div>
            ))}
          </div>

          {/* Complaint */}
          <div>
            <p className={fieldClass + ' mb-1'}>Complaint</p>
            <pre className="max-h-32 overflow-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              <code>{session.complaint}</code>
            </pre>
          </div>

          {/* Results */}
          {session.results && session.results.length > 0 && (
            <div>
              <p className={fieldClass + ' mb-2'}>Hasil Rekomendasi</p>
              <div className="space-y-2">
                {session.results.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.local_name}</p>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        {(r.relevance_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{r.scientific_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Plant ID: {r.plant_id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
