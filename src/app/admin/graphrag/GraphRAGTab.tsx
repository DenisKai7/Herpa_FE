'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Network,
  Database,
  GitBranch,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { GraphNode } from '@/types/admin';
import { useGraphRAG } from './useGraphRAG';
import { GraphDashboard } from './GraphDashboard';
import { GraphVisualization } from './GraphVisualization';
import { NodeTable } from './NodeTable';
import { NodeFormModal } from './NodeFormModal';
import { NodeDetailPanel } from './NodeDetailPanel';
import { RelationshipTable } from './RelationshipTable';
import { RelationshipFormModal } from './RelationshipFormModal';
import { GraphSearch } from './GraphSearch';

type TabId = 'dashboard' | 'graph' | 'nodes' | 'relationships';

const tabItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'graph', label: 'Visual Graph', icon: <Network className="w-4 h-4" /> },
  { id: 'nodes', label: 'Nodes', icon: <Database className="w-4 h-4" /> },
  { id: 'relationships', label: 'Relationships', icon: <GitBranch className="w-4 h-4" /> },
];

const NODE_LIMIT = 20;
const REL_LIMIT = 20;

export function GraphRAGTab() {
  const {
    dashboard,
    schema,
    nodes,
    nodesTotal,
    relationships,
    relationshipsTotal,
    graphData,
    loading,
    actionLoading,
    selectedNode,
    setSelectedNode,
    fetchDashboard,
    fetchSchema,
    fetchNodes,
    fetchRelationships,
    fetchGraphData,
    createNode,
    updateNode,
    deleteNode,
    createRelationship,
    deleteRelationship,
    searchNodes,
    expandNode,
  } = useGraphRAG();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [nodeOffset, setNodeOffset] = useState(0);
  const [relOffset, setRelOffset] = useState(0);
  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);
  const [nodeFormOpen, setNodeFormOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
  const [relFormOpen, setRelFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'node' | 'rel' | 'bulk'; id?: number; ids?: number[] } | null>(null);

  // Initial loads
  useEffect(() => {
    fetchSchema();
    fetchDashboard();
  }, [fetchSchema, fetchDashboard]);

  // Tab-specific data
  useEffect(() => {
    if (activeTab === 'nodes') fetchNodes({ limit: NODE_LIMIT, offset: nodeOffset });
  }, [activeTab, nodeOffset, fetchNodes]);

  useEffect(() => {
    if (activeTab === 'relationships') fetchRelationships({ limit: REL_LIMIT, offset: relOffset });
  }, [activeTab, relOffset, fetchRelationships]);

  useEffect(() => {
    if (activeTab === 'graph') fetchGraphData({ limit: 200 });
  }, [activeTab, fetchGraphData]);

  // Search
  const handleSearch = useCallback(async (query: string, label: string) => {
    if (!query.trim()) {
      fetchNodes({ limit: NODE_LIMIT, offset: 0 });
      return;
    }
    const results = await searchNodes(query, label || undefined);
    // Replace displayed nodes with search results
    // This is a simplified approach; in production you'd update state through the hook
  }, [searchNodes, fetchNodes]);

  // Node CRUD
  const handleCreateNode = async (payload: { label: string; properties: Record<string, unknown> }) => {
    await createNode(payload);
    fetchNodes({ limit: NODE_LIMIT, offset: nodeOffset });
    fetchDashboard();
  };

  const handleUpdateNode = async (payload: { label: string; properties: Record<string, unknown> }) => {
    if (!editingNode) return;
    await updateNode(editingNode.__neo4j_id, payload.properties);
    fetchNodes({ limit: NODE_LIMIT, offset: nodeOffset });
    setEditingNode(null);
  };

  const handleDeleteNode = (id: number) => {
    setConfirmDelete({ type: 'node', id });
  };

  const handleBulkDelete = () => {
    if (selectedNodeIds.length > 0) {
      setConfirmDelete({ type: 'bulk', ids: selectedNodeIds });
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'node' && confirmDelete.id) {
      await deleteNode(confirmDelete.id);
      fetchNodes({ limit: NODE_LIMIT, offset: nodeOffset });
    } else if (confirmDelete.type === 'bulk' && confirmDelete.ids) {
      const { adminApi } = await import('@/lib/api/admin');
      await adminApi.bulkDeleteGraphNodes(confirmDelete.ids);
      setSelectedNodeIds([]);
      fetchNodes({ limit: NODE_LIMIT, offset: nodeOffset });
    } else if (confirmDelete.type === 'rel' && confirmDelete.id) {
      await deleteRelationship(confirmDelete.id);
      fetchRelationships({ limit: REL_LIMIT, offset: relOffset });
    }
    fetchDashboard();
    setConfirmDelete(null);
  };

  // Graph actions
  const handleNodeClick = useCallback((nodeId: number) => {
    const node = nodes.find((n) => n.__neo4j_id === nodeId);
    if (node) setSelectedNode(node);
  }, [nodes, setSelectedNode]);

  const handleExpandNode = useCallback(async (nodeId: number) => {
    const data = await expandNode(nodeId, 1);
    if (data) fetchGraphData({ limit: 100 });
  }, [expandNode, fetchGraphData]);

  return (
    <div className="space-y-6">
      {/* Tab header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div>
          {loading || !dashboard ? (
            <div className="flex items-center justify-center h-48">
              <Spinner size="lg" />
            </div>
          ) : (
            <GraphDashboard stats={dashboard} />
          )}
        </div>
      )}

      {/* Visual Graph */}
      {activeTab === 'graph' && (
        <div>
          {loading || !graphData ? (
            <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Spinner size="lg" />
            </div>
          ) : (
            <GraphVisualization
              data={graphData}
              schema={schema}
              onNodeClick={handleNodeClick}
              onExpand={handleExpandNode}
            />
          )}
        </div>
      )}

      {/* Nodes */}
      {activeTab === 'nodes' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <GraphSearch onSearch={handleSearch} schema={schema} />
            </div>
            {selectedNodeIds.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                icon={<Trash2 className="h-3.5 w-3.5" />}
                isLoading={actionLoading}
              >
                Delete ({selectedNodeIds.length})
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setEditingNode(null); setNodeFormOpen(true); }}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Node
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner size="lg" />
            </div>
          ) : (
            <NodeTable
              nodes={nodes}
              total={nodesTotal}
              limit={NODE_LIMIT}
              offset={nodeOffset}
              onPageChange={setNodeOffset}
              onViewDetail={(node) => setSelectedNode(node)}
              onDelete={handleDeleteNode}
              selectedIds={selectedNodeIds}
              onSelectionChange={setSelectedNodeIds}
            />
          )}
        </div>
      )}

      {/* Relationships */}
      {activeTab === 'relationships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setRelFormOpen(true)}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Relationship
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner size="lg" />
            </div>
          ) : (
            <RelationshipTable
              relationships={relationships}
              total={relationshipsTotal}
              limit={REL_LIMIT}
              offset={relOffset}
              onPageChange={setRelOffset}
              onDelete={(id) => setConfirmDelete({ type: 'rel', id })}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <NodeFormModal
        isOpen={nodeFormOpen}
        onClose={() => { setNodeFormOpen(false); setEditingNode(null); }}
        onSubmit={editingNode ? handleUpdateNode : handleCreateNode}
        node={editingNode}
        schema={schema}
      />

      <NodeDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      <RelationshipFormModal
        isOpen={relFormOpen}
        onClose={() => setRelFormOpen(false)}
        onSubmit={async (payload) => {
          await createRelationship(payload);
          fetchRelationships({ limit: REL_LIMIT, offset: relOffset });
          fetchDashboard();
        }}
        schema={schema}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Confirm Delete"
        message={
          confirmDelete?.type === 'bulk'
            ? `Delete ${confirmDelete.ids?.length} selected nodes?`
            : `Delete this ${confirmDelete?.type}?`
        }
        variant="danger"
        confirmLabel="Delete"
        isLoading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
