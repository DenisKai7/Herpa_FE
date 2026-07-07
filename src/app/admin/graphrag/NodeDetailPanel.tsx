'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import type { GraphNode, GraphRelationship } from '@/types/admin';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const skip = new Set(['__neo4j_id', '__labels']);
  const props = Object.entries(node).filter(([k]) => !skip.has(k));

  return (
    <Modal isOpen={!!node} onClose={onClose} title="Node Detail" className="max-w-2xl">
      <div className="space-y-4">
        {/* Labels */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Labels</p>
          <div className="flex gap-1.5 flex-wrap">
            {node.__labels.map((l) => (
              <span
                key={l}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* ID */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Neo4j ID</p>
          <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{node.__neo4j_id}</p>
        </div>

        {/* Properties */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Properties</p>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Key</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {props.length > 0 ? (
                  props.map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{key}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100 break-all">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                      No properties
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
