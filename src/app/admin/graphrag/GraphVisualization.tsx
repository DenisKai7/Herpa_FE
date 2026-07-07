'use client';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { GraphVisualizationData, GraphSchema } from '@/types/admin';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphVisualizationProps {
  data: GraphVisualizationData;
  schema: GraphSchema | null;
  onNodeClick: (nodeId: number) => void;
  onExpand: (nodeId: number) => void;
}

// Default label colors — will be extended dynamically from schema
const BASE_COLORS: Record<string, string> = {
  Herb: '#22c55e',
  Compound: '#3b82f6',
  TraditionalUse: '#f59e0b',
  PreparationMethod: '#f97316',
  SafetyWarning: '#ef4444',
  Source: '#14b8a6',
  Benefit: '#8b5cf6',
  Symptom: '#ec4899',
  Family: '#f43f5e',
  UsageGuideline: '#06b6d4',
  PlantPart: '#a855f7',
  StorageGuideline: '#6366f1',
  MythFact: '#d946ef',
  QualityStandard: '#0ea5e9',
  ClinicalGuideline: '#10b981',
  Audience: '#84cc16',
  DrugInteraction: '#dc2626',
  Contraindication: '#b91c1c',
  PharmacokineticProfile: '#7c3aed',
  ResearchTopic: '#2563eb',
  Claim: '#ca8a04',
  Evidence: '#059669',
  PopulationRisk: '#e11d48',
  Formulation: '#9333ea',
  ProteinTarget: '#0891b2',
  ToxicityCategory: '#be123c',
  SymptomAlias: '#db2777',
};

// Generate color for unknown labels
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 65%, 55%)`;
}

function getNodeColor(labels: string[], dynamicColors: Record<string, string>): string {
  for (const label of labels) {
    if (dynamicColors[label]) return dynamicColors[label];
  }
  return '#6b7280';
}

// Edge type colors
const EDGE_COLORS: Record<string, string> = {
  HAS_COMPOUND: '#3b82f6',
  USED_FOR: '#f59e0b',
  BELONGS_TO: '#f43f5e',
  HAS_TRADITIONAL_USE: '#f59e0b',
  HAS_PREPARATION: '#f97316',
  HAS_WARNING: '#ef4444',
  VERIFIED_BY: '#14b8a6',
  HAS_PROTEIN_TARGET: '#0891b2',
  HAS_TOXICITY: '#be123c',
  MAY_HELP_WITH: '#22c55e',
  HAS_CLAIM: '#ca8a04',
  SUPPORTED_BY: '#059669',
  HAS_INTERACTION: '#dc2626',
  HAS_CONTRAINDICATION: '#b91c1c',
};

function getEdgeColor(type: string): string {
  return EDGE_COLORS[type] || '#94a3b8';
}

export function GraphVisualization({ data, schema, onNodeClick, onExpand }: GraphVisualizationProps) {
  const fgRef = useRef<any>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<number>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Build dynamic color map from schema + base colors
  const labelColors = useMemo(() => {
    const colors = { ...BASE_COLORS };
    if (schema?.labels) {
      for (const label of schema.labels) {
        if (!colors[label]) {
          colors[label] = hashColor(label);
        }
      }
    }
    return colors;
  }, [schema]);

  // Build graph data with string keys to avoid React duplicate key issues
  const graphData = useMemo(() => ({
    nodes: data.nodes.map((n) => ({
      id: String(n.id),
      _numericId: n.id,
      name: n.name,
      labels: n.labels,
      color: getNodeColor(n.labels, labelColors),
    })),
    links: data.edges.map((e, i) => ({
      id: String(e.id ?? `edge-${i}`),
      source: String(e.source),
      target: String(e.target),
      type: e.type,
      color: getEdgeColor(e.type),
      source_name: e.source_name,
      target_name: e.target_name,
    })),
  }), [data, labelColors]);

  // Build legend from actual data labels (not hardcoded)
  const legendLabels = useMemo(() => {
    const seen = new Map<string, string>();
    for (const node of graphData.nodes) {
      for (const label of node.labels) {
        if (!seen.has(label)) {
          seen.set(label, node.color);
        }
      }
    }
    return Array.from(seen.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [graphData.nodes]);

  // Force configuration
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-300).distanceMax(300);
      fgRef.current.d3Force('link').distance(120);
      fgRef.current.d3Force('collision', (fgRef.current.d3Force('collision') || { radius: () => {} }).radius?.(20));
    }
  }, [graphData]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = graphData.nodes.filter((n) =>
      n.name.toLowerCase().includes(q) ||
      n.labels.some((l) => l.toLowerCase().includes(q))
    ).slice(0, 10);
    setSearchResults(results);
  }, [searchQuery, graphData.nodes]);

  // Focus on a specific node
  const focusNode = useCallback((nodeId: string) => {
    const node = graphData.nodes.find((n) => n.id === nodeId);
    if (node && fgRef.current) {
      fgRef.current.centerAt(node._numericId ? undefined : 0, undefined, 1000);
      // Zoom to node
      const zoom = fgRef.current.zoom();
      if (zoom < 2) {
        fgRef.current.zoom(2, 1000);
      }
      // Highlight neighbors
      const neighbors = new Set<number>();
      const links = new Set<string>();
      neighbors.add(Number(nodeId));
      for (const link of graphData.links) {
        if (link.source === nodeId || link.target === nodeId) {
          neighbors.add(Number(link.source));
          neighbors.add(Number(link.target));
          links.add(link.id);
        }
      }
      setHighlightNodes(neighbors);
      setHighlightLinks(links);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [graphData]);

  // Handle node hover
  const handleNodeHover = useCallback((node: any) => {
    if (node) {
      setHoverNode(node);
      const neighbors = new Set<number>();
      const links = new Set<string>();
      neighbors.add(Number(node.id));
      for (const link of graphData.links) {
        if (link.source === node.id || link.target === node.id) {
          neighbors.add(Number(link.source));
          neighbors.add(Number(link.target));
          links.add(link.id);
        }
      }
      setHighlightNodes(neighbors);
      setHighlightLinks(links);
    } else {
      setHoverNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [graphData.links]);

  // Node click
  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node._numericId || Number(node.id));
  }, [onNodeClick]);

  // Node double-click = expand
  const handleNodeDoubleClick = useCallback((node: any) => {
    onExpand(node._numericId || Number(node.id));
  }, [onExpand]);

  // Custom node rendering
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const radius = 8;
    const isHighlight = highlightNodes.size === 0 || highlightNodes.has(Number(node.id));

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = isHighlight ? (node.color || '#6b7280') : '#d1d5db40';
    ctx.fill();
    ctx.strokeStyle = hoverNode?.id === node.id ? '#1f2937' : '#ffffff80';
    ctx.lineWidth = hoverNode?.id === node.id ? 2 : 1;
    ctx.stroke();

    // Label
    if (isHighlight) {
      const fontSize = Math.max(8, 12 / globalScale);
      ctx.font = `600 ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1f2937';
      const label = node.name || String(node.id);
      ctx.fillText(label.length > 20 ? label.slice(0, 18) + '...' : label, node.x, node.y - radius - 6);
    }
  }, [highlightNodes, hoverNode]);

  // Custom edge rendering with arrows
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlight = highlightLinks.size === 0 || highlightLinks.has(link.id);
    const opacity = isHighlight ? 0.8 : 0.15;

    const sx = typeof link.source === 'object' ? link.source.x : 0;
    const sy = typeof link.source === 'object' ? link.source.y : 0;
    const tx = typeof link.target === 'object' ? link.target.x : 0;
    const ty = typeof link.target === 'object' ? link.target.y : 0;

    // Edge line
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = isHighlight ? (link.color || '#94a3b8') : '#d1d5db20';
    ctx.lineWidth = isHighlight ? 1.5 : 0.5;
    ctx.globalAlpha = opacity;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Arrow
    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 20) {
      const arrowLen = 6;
      const arrowAngle = Math.PI / 6;
      const midX = sx + dx * 0.7;
      const midY = sy + dy * 0.7;
      const angle = Math.atan2(dy, dx);

      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - arrowLen * Math.cos(angle - arrowAngle),
        midY - arrowLen * Math.sin(angle - arrowAngle)
      );
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - arrowLen * Math.cos(angle + arrowAngle),
        midY - arrowLen * Math.sin(angle + arrowAngle)
      );
      ctx.strokeStyle = isHighlight ? (link.color || '#94a3b8') : '#d1d5db20';
      ctx.lineWidth = isHighlight ? 1.5 : 0.5;
      ctx.globalAlpha = opacity;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Edge label (only when highlighted or zoomed in)
    if (isHighlight && globalScale > 0.5) {
      const mx = (sx + tx) / 2;
      const my = (sy + ty) / 2;
      const fontSize = Math.max(6, 8 / globalScale);
      ctx.font = `500 ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isHighlight ? '#374151' : '#9ca3af80';
      ctx.globalAlpha = opacity;
      ctx.fillText(link.type || '', mx, my - 4);
      ctx.globalAlpha = 1;
    }
  }, [highlightLinks]);

  // Edge hover
  const linkCanvasObjectPointerEvents = useCallback(() => 'none', []);

  if (!data.nodes.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">No graph data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Toolbar */}
      <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => focusNode(node.id)}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{node.name}</span>
                  <span className="text-gray-400 ml-auto">{node.labels[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span>{data.nodes.length} nodes</span>
          <span>•</span>
          <span>{data.edges.length} edges</span>
        </div>

        {/* Controls */}
        <button
          onClick={() => fgRef.current?.zoomToFit(400, 50)}
          className="px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-800 rounded cursor-pointer"
        >
          Fit
        </button>
        <button
          onClick={() => {
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            setHoverNode(null);
          }}
          className="px-2 py-1 text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-800 rounded cursor-pointer"
        >
          Reset
        </button>

        {/* Legend */}
        <div className="flex items-center gap-1.5 flex-wrap ml-auto">
          {legendLabels.slice(0, 8).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
          {legendLabels.length > 8 && (
            <span className="text-[10px] text-gray-400">+{legendLabels.length - 8} more</span>
          )}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoverNode && (
        <div className="absolute top-16 right-4 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-3 min-w-[180px]">
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{hoverNode.name}</p>
          <div className="flex gap-1 mt-1">
            {hoverNode.labels.map((l: string) => (
              <span key={l} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {l}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">ID: {hoverNode.id}</p>
          <p className="text-[10px] text-gray-400">Click for details • Double-click to expand</p>
        </div>
      )}

      {/* Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeRightClick={(node: any) => handleNodeDoubleClick(node)}
        onNodeHover={handleNodeHover}
        width={undefined}
        height={500}
        backgroundColor="transparent"
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        cooldownTicks={150}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}
