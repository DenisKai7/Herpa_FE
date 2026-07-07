'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api/admin';
import type { GraphNode, GraphSchema } from '@/types/admin';

interface RelationshipFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    source_id: number;
    target_id: number;
    rel_type: string;
    properties?: Record<string, unknown>;
  }) => Promise<void>;
  sourceId?: number;
  targetId?: number;
  schema: GraphSchema | null;
}

export function RelationshipFormModal({
  isOpen,
  onClose,
  onSubmit,
  sourceId,
  targetId,
  schema,
}: RelationshipFormModalProps) {
  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [sourceResults, setSourceResults] = useState<GraphNode[]>([]);
  const [targetResults, setTargetResults] = useState<GraphNode[]>([]);
  const [selectedSource, setSelectedSource] = useState<GraphNode | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<GraphNode | null>(null);
  const [relType, setRelType] = useState('');
  const [properties, setProperties] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSourceQuery('');
      setTargetQuery('');
      setSourceResults([]);
      setTargetResults([]);
      setSelectedSource(null);
      setSelectedTarget(null);
      setRelType('');
      setProperties([{ key: '', value: '' }]);

      if (sourceId) {
        adminApi.getGraphNode(sourceId).then((n) => {
          setSelectedSource(n);
          setSourceQuery((n.name as string) || `#${n.__neo4j_id}`);
        }).catch(() => {});
      }
      if (targetId) {
        adminApi.getGraphNode(targetId).then((n) => {
          setSelectedTarget(n);
          setTargetQuery((n.name as string) || `#${n.__neo4j_id}`);
        }).catch(() => {});
      }
    }
  }, [isOpen, sourceId, targetId]);

  const searchSource = useCallback(async (q: string) => {
    if (q.length < 2) { setSourceResults([]); return; }
    try {
      const results = await adminApi.searchGraphNodes(q);
      setSourceResults(results);
    } catch { setSourceResults([]); }
  }, []);

  const searchTarget = useCallback(async (q: string) => {
    if (q.length < 2) { setTargetResults([]); return; }
    try {
      const results = await adminApi.searchGraphNodes(q);
      setTargetResults(results);
    } catch { setTargetResults([]); }
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => searchSource(sourceQuery), 300);
    return () => clearTimeout(t);
  }, [sourceQuery, searchSource]);

  useEffect(() => {
    const t = setTimeout(() => searchTarget(targetQuery), 300);
    return () => clearTimeout(t);
  }, [targetQuery, searchTarget]);

  const addProperty = () => setProperties([...properties, { key: '', value: '' }]);
  const removeProperty = (i: number) => setProperties(properties.filter((_, idx) => idx !== i));
  const updateProperty = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...properties];
    next[i] = { ...next[i], [field]: val };
    setProperties(next);
  };

  const handleSubmit = async () => {
    if (!selectedSource || !selectedTarget || !relType.trim()) return;
    setSubmitting(true);
    try {
      const props: Record<string, unknown> = {};
      for (const { key, value } of properties) {
        if (key.trim()) props[key.trim()] = value;
      }
      await onSubmit({
        source_id: selectedSource.__neo4j_id,
        target_id: selectedTarget.__neo4j_id,
        rel_type: relType.trim(),
        properties: Object.keys(props).length > 0 ? props : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const renderSearchResults = (
    results: GraphNode[],
    select: (n: GraphNode) => void,
    clear: () => void
  ) => {
    if (results.length === 0) return null;
    return (
      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
        {results.map((n) => (
          <button
            key={n.__neo4j_id}
            onClick={() => {
              select(n);
              clear();
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {(n.name as string) || `#${n.__neo4j_id}`}
            </span>
            <span className="ml-2 text-gray-400">{n.__labels.join(', ')}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Relationship" className="max-w-lg">
      <div className="space-y-4">
        {/* Source */}
        <div className="relative">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Source Node</p>
          {selectedSource ? (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {(selectedSource.name as string) || `#${selectedSource.__neo4j_id}`}
              </span>
              <span className="text-gray-400">{selectedSource.__labels.join(', ')}</span>
              <button
                onClick={() => { setSelectedSource(null); setSourceQuery(''); }}
                className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer"
              >
                &times;
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search source node..."
                value={sourceQuery}
                onChange={(e) => setSourceQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {renderSearchResults(
                sourceResults,
                setSelectedSource,
                () => { setSourceResults([]); setSourceQuery(''); }
              )}
            </>
          )}
        </div>

        {/* Target */}
        <div className="relative">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Target Node</p>
          {selectedTarget ? (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {(selectedTarget.name as string) || `#${selectedTarget.__neo4j_id}`}
              </span>
              <span className="text-gray-400">{selectedTarget.__labels.join(', ')}</span>
              <button
                onClick={() => { setSelectedTarget(null); setTargetQuery(''); }}
                className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer"
              >
                &times;
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search target node..."
                value={targetQuery}
                onChange={(e) => setTargetQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {renderSearchResults(
                targetResults,
                setSelectedTarget,
                () => { setTargetResults([]); setTargetQuery(''); }
              )}
            </>
          )}
        </div>

        {/* Relationship Type */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Relationship Type</p>
          {schema?.relationship_types.length ? (
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select type...</option>
              {schema.relationship_types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="e.g. CONTAINS, TREATS"
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          )}
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
            disabled={!selectedSource || !selectedTarget || !relType.trim()}
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
