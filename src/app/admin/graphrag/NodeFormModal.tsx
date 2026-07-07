'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { GraphNode, GraphSchema } from '@/types/admin';

interface NodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { label: string; properties: Record<string, unknown> }) => Promise<void>;
  node?: GraphNode | null;
  schema: GraphSchema | null;
}

export function NodeFormModal({ isOpen, onClose, onSubmit, node, schema }: NodeFormModalProps) {
  const [label, setLabel] = useState<string>('');
  const [properties, setProperties] = useState<Array<{ key: string; value: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (node) {
        setLabel(node.__labels[0] || '');
        const skip = new Set(['__neo4j_id', '__labels']);
        const entries = Object.entries(node)
          .filter(([k]) => !skip.has(k))
          .map(([key, value]) => ({ key, value: String(value) }));
        setProperties(entries.length > 0 ? entries : [{ key: '', value: '' }]);
      } else {
        setLabel('');
        setProperties([{ key: '', value: '' }]);
      }
    }
  }, [isOpen, node]);

  const addProperty = () => setProperties([...properties, { key: '', value: '' }]);
  const removeProperty = (i: number) => setProperties(properties.filter((_, idx) => idx !== i));
  const updateProperty = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...properties];
    next[i] = { ...next[i], [field]: val };
    setProperties(next);
  };

  const handleSubmit = async () => {
    if (!label) return;
    setSubmitting(true);
    try {
      const props: Record<string, unknown> = {};
      for (const { key, value } of properties) {
        if (key.trim()) props[key.trim()] = value;
      }
      await onSubmit({ label, properties: props });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={node ? 'Edit Node' : 'Create Node'} className="max-w-lg">
      <div className="space-y-4">
        {/* Label */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Label</p>
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Pilih Label</option>
            {schema?.labels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Properties */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Properties</p>
            <button
              onClick={addProperty}
              className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {properties.map((prop, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="key"
                  value={prop.key}
                  onChange={(e) => updateProperty(i, 'key', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="text"
                  placeholder="value"
                  value={prop.value}
                  onChange={(e) => updateProperty(i, 'value', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                {properties.length > 1 && (
                  <button
                    onClick={() => removeProperty(i)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={submitting}
            onClick={handleSubmit}
            disabled={!label}
          >
            {node ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
