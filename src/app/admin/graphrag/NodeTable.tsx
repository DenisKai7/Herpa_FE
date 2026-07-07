'use client';

import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import type { GraphNode } from '@/types/admin';

interface NodeTableProps {
  nodes: GraphNode[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  onViewDetail: (node: GraphNode) => void;
  onDelete: (id: number) => void;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export function NodeTable({
  nodes,
  total,
  limit,
  offset,
  onPageChange,
  onViewDetail,
  onDelete,
  selectedIds,
  onSelectionChange,
}: NodeTableProps) {
  const toggleAll = () => {
    if (selectedIds.length === nodes.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(nodes.map((n) => n.__neo4j_id));
    }
  };

  const toggleOne = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getPreview = (node: GraphNode) => {
    const skip = new Set(['__neo4j_id', '__labels']);
    const keys = Object.keys(node).filter((k) => !skip.has(k)).slice(0, 3);
    return keys.map((k) => `${k}: ${String(node[k]).slice(0, 30)}`).join(', ');
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
                  checked={nodes.length > 0 && selectedIds.length === nodes.length}
                  onChange={toggleAll}
                  className="rounded border-gray-300 dark:border-gray-700"
                />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Labels</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500">Properties</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {nodes.map((node, index) => (
              <tr
                key={`node-${node.__neo4j_id}-${index}`}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(node.__neo4j_id)}
                    onChange={() => toggleOne(node.__neo4j_id)}
                    className="rounded border-gray-300 dark:border-gray-700"
                  />
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono">
                  {node.__neo4j_id}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {node.__labels.map((l) => (
                      <span
                        key={l}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                  {(node.name as string) || '-'}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                  {getPreview(node)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onViewDetail(node)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                      title="View detail"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(node.__neo4j_id)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {nodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No nodes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <Pagination total={total} limit={limit} offset={offset} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
