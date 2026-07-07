'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { AIUsageDetail } from '@/types/admin';

interface AIUsageDetailModalProps {
  logId: number | null;
  onClose: () => void;
}

const fieldClass = 'text-xs text-gray-500 dark:text-gray-400';
const valueClass = 'text-sm text-gray-900 dark:text-gray-100 font-medium';

export function AIUsageDetailModal({ logId, onClose }: AIUsageDetailModalProps) {
  const [detail, setDetail] = useState<AIUsageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (logId === null) {
      setDetail(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    adminApi
      .getAIUsageDetail(logId)
      .then(setDetail)
      .catch((err) => setError(err?.message || 'Gagal memuat detail'))
      .finally(() => setIsLoading(false));
  }, [logId]);

  return (
    <Modal isOpen={logId !== null} onClose={onClose} title="Detail AI Usage Log" className="max-w-2xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-8">{error}</p>
      ) : detail ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Key fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {([
              ['ID', detail.id],
              ['User ID', detail.user_id ?? '-'],
              ['Request ID', detail.request_id ?? '-'],
              ['Model', detail.model_name],
              ['Provider', detail.provider],
              ['Persona', detail.persona ?? '-'],
              ['Endpoint', detail.endpoint ?? '-'],
              ['Latency', `${(detail.latency_ms / 1000).toFixed(2)}s`],
              ['Status', detail.success ? 'Success' : 'Error'],
              ['Error Code', detail.error_code ?? '-'],
              ['Token Input', detail.input_tokens.toLocaleString()],
              ['Token Output', detail.output_tokens.toLocaleString()],
              ['Total Token', (detail.input_tokens + detail.output_tokens).toLocaleString()],
              ['Timestamp', new Date(detail.created_at).toLocaleString('id-ID')],
            ] as const).map(([label, value]) => (
              <div key={label}>
                <p className={fieldClass}>{label}</p>
                <p className={valueClass}>{String(value)}</p>
              </div>
            ))}
          </div>

          {/* Prompt */}
          {detail.prompt_text && (
            <div>
              <p className={fieldClass + ' mb-1'}>Prompt</p>
              <pre className="max-h-48 overflow-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                <code>{detail.prompt_text}</code>
              </pre>
            </div>
          )}

          {/* Response */}
          {detail.response_text && (
            <div>
              <p className={fieldClass + ' mb-1'}>Response</p>
              <pre className="max-h-48 overflow-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                <code>{detail.response_text}</code>
              </pre>
            </div>
          )}

          {/* Retrieval Context */}
          {detail.retrieval_context != null && (
            <div>
              <p className={fieldClass + ' mb-1'}>Retrieval Context</p>
              <pre className="max-h-48 overflow-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                <code>{JSON.stringify(detail.retrieval_context, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
