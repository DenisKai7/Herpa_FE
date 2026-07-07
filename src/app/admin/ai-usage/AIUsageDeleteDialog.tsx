'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface AIUsageDeleteDialogProps {
  selectedIds: number[];
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function AIUsageDeleteDialog({ selectedIds, onClose, onConfirm, isLoading }: AIUsageDeleteDialogProps) {
  return (
    <Modal isOpen={selectedIds.length > 0} onClose={onClose} title="Hapus Log AI Usage">
      <div className="space-y-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Anda akan menghapus <span className="font-bold text-gray-800 dark:text-gray-200">{selectedIds.length}</span> log AI usage.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
            Hapus
          </Button>
        </div>
      </div>
    </Modal>
  );
}
