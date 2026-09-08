import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNode.css';

const RISK_CLASSES = {
  low:      'graph-node--low',
  medium:   'graph-node--medium',
  high:     'graph-node--high',
  critical: 'graph-node--critical',
};

const CustomNode = memo(({ data, selected }) => {
  const riskClass = RISK_CLASSES[data.risk] || RISK_CLASSES.low;

  return (
    <div className={`graph-node ${riskClass} ${selected ? 'graph-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top}    className="graph-node__handle" />
      <Handle type="source" position={Position.Bottom} className="graph-node__handle" />
      <div className="graph-node__inner">
        <div className="graph-node__dot" />
        <div className="graph-node__label">{data.label}</div>
      </div>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
