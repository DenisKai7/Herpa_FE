'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { QuizModule } from '@/types/admin';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; is_active?: boolean }) => Promise<boolean>;
  module?: QuizModule | null;
}

export default function ModuleFormModal({ isOpen, onClose, onSubmit, module }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (module) {
        setTitle(module.title);
        setDescription(module.description || '');
        setIsActive(module.is_active);
      } else {
        setTitle('');
        setDescription('');
        setIsActive(true);
      }
    }
  }, [isOpen, module]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit({ title: title.trim(), description: description.trim() || undefined, is_active: isActive });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={module ? 'Edit Module' : 'Create Module'} className="max-w-lg">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Title</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Module title"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Module description"
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="module-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700"
          />
          <label htmlFor="module-active" className="text-xs text-gray-700 dark:text-gray-300">Active</label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" size="sm" isLoading={submitting} onClick={handleSubmit} disabled={!title.trim()}>
            {module ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
