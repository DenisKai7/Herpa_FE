'use client';

import { useState, useCallback } from 'react';
import { adminApi } from '@/lib/api/admin';
import type {
  GraphDashboardStats,
  GraphSchema,
  GraphNode,
  GraphRelationship,
  GraphVisualizationData,
} from '@/types/admin';

export function useGraphRAG() {
  const [dashboard, setDashboard] = useState<GraphDashboardStats | null>(null);
  const [schema, setSchema] = useState<GraphSchema | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [nodesTotal, setNodesTotal] = useState(0);
  const [relationships, setRelationships] = useState<GraphRelationship[]>([]);
  const [relationshipsTotal, setRelationshipsTotal] = useState(0);
  const [graphData, setGraphData] = useState<GraphVisualizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getGraphDashboard();
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchema = useCallback(async () => {
    try {
      const data = await adminApi.getGraphSchema();
      setSchema(data);
    } catch {
      // silent
    }
  }, []);

  const fetchNodes = useCallback(async (params?: { limit?: number; offset?: number }) => {
    setLoading(true);
    try {
      const data = await adminApi.getGraphNodes(params);
      setNodes(data.nodes);
      setNodesTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRelationships = useCallback(async (params?: { limit?: number; offset?: number }) => {
    setLoading(true);
    try {
      const data = await adminApi.getGraphRelationships(params);
      setRelationships(data.relationships);
      setRelationshipsTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGraphData = useCallback(async (params?: { limit?: number }) => {
    setLoading(true);
    try {
      const data = await adminApi.getGraphVisualization(params);
      console.log('[GraphRAG] Graph data received:', {
        nodes: data.nodes.length,
        edges: data.edges.length,
        labels: [...new Set(data.nodes.flatMap((n) => n.labels))],
        edgeTypes: [...new Set(data.edges.map((e) => e.type))],
      });
      setGraphData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNode = useCallback(async (payload: { label: string; properties: Record<string, unknown> }) => {
    setActionLoading(true);
    try {
      const node = await adminApi.createGraphNode(payload);
      return node;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateNode = useCallback(async (id: number, properties: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const node = await adminApi.updateGraphNode(id, properties);
      return node;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteNode = useCallback(async (id: number) => {
    setActionLoading(true);
    try {
      await adminApi.deleteGraphNode(id);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const createRelationship = useCallback(async (payload: {
    source_id: number;
    target_id: number;
    rel_type: string;
    properties?: Record<string, unknown>;
  }) => {
    setActionLoading(true);
    try {
      const rel = await adminApi.createGraphRelationship(payload);
      return rel;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteRelationship = useCallback(async (id: number) => {
    setActionLoading(true);
    try {
      await adminApi.deleteGraphRelationship(id);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const searchNodes = useCallback(async (query: string, label?: string) => {
    try {
      const results = await adminApi.searchGraphNodes(query, label);
      return results;
    } catch {
      return [];
    }
  }, []);

  const expandNode = useCallback(async (nodeId: number, depth?: number) => {
    setActionLoading(true);
    try {
      const data = await adminApi.expandGraphNode(nodeId, depth);
      return data;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
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
  };
}
