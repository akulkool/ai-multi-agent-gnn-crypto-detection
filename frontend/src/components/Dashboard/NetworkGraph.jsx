import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from '../Graph/CustomNode';
import GraphLegend from '../Graph/GraphLegend';
import NodeDrawer from './NodeDrawer';
import { networkNodes, networkEdges } from '../../data/mockData';
import './NetworkGraph.css';

const nodeTypes = { custom: CustomNode };

const toFlowNodes = (nodes) =>
  nodes.map(n => ({
    id: n.id,
    type: 'custom',
    position: { x: n.x * 1.2, y: n.y * 1.2 },
    data: { label: n.label, risk: n.risk, txCount: n.txCount },
  }));

const toFlowEdges = (edges) =>
  edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.suspicious,
    style: {
      stroke: e.suspicious ? 'var(--red-700)' : 'var(--border-strong)',
      strokeWidth: e.suspicious ? 1.5 : 1,
      opacity: 0.8,
    },
    label: e.suspicious ? `${e.amount} ETH` : undefined,
    labelStyle: {
      fill: 'var(--text-muted)',
      fontSize: 9,
      fontFamily: 'JetBrains Mono',
    },
    labelBgStyle: {
      fill: 'var(--surface-1)',
      fillOpacity: 0.9,
    },
    markerEnd: {
      type: 'arrowclosed',
      color: e.suspicious ? 'var(--red-700)' : 'var(--border-strong)',
      width: 8,
      height: 8,
    },
  }));

const NetworkGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(networkNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(networkEdges));
  const [selectedNode, setSelectedNode] = useState(null);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);

  const visibleEdges = useMemo(() => {
    if (!suspiciousOnly) return edges;
    return edges.map(e => ({
      ...e,
      hidden: !e.animated,
    }));
  }, [edges, suspiciousOnly]);

  const onNodeClick = useCallback((_event, node) => {
    const original = networkNodes.find(n => n.id === node.id);
    setSelectedNode(original || null);
  }, []);

  return (
    <div className="network-graph">
      {/* Controls bar */}
      <div className="network-graph__toolbar">
        <span className="network-graph__label">
          <span className="network-graph__label-dot" />
          Transaction Network
        </span>
        <div className="network-graph__toolbar-actions">
          <button
            className={`network-graph__filter-btn ${suspiciousOnly ? 'network-graph__filter-btn--active' : ''}`}
            onClick={() => setSuspiciousOnly(s => !s)}
          >
            Suspicious Only
          </button>
          <div className="network-graph__stats">
            <span>{networkNodes.length} nodes</span>
            <span>·</span>
            <span>{networkEdges.length} edges</span>
          </div>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="network-graph__canvas">
        <ReactFlow
          nodes={nodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={2}
          attributionPosition="bottom-right"
          style={{ background: 'var(--bg-deep)' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={32}
            size={1}
            color="var(--border-subtle)"
          />
          <Controls
            showInteractive={false}
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: 6,
            }}
          />
          <MiniMap
            nodeColor={(node) => {
              const risk = node.data?.risk;
              if (risk === 'critical') return 'var(--red-500)';
              if (risk === 'high')     return 'var(--risk-high)';
              if (risk === 'medium')   return 'var(--amber-600)';
              return 'var(--node-normal)';
            }}
            maskColor="rgba(11,12,14,0.7)"
            style={{
              background: 'var(--surface-0)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <GraphLegend />

      {/* Node investigation drawer */}
      <NodeDrawer
        node={selectedNode}
        open={!!selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default NetworkGraph;
