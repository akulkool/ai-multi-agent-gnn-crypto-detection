import React from 'react';
import './GraphLegend.css';

const LEGEND_ITEMS = [
  { label: 'Normal Account',   color: 'var(--node-normal)',   type: 'circle' },
  { label: 'Medium Risk',      color: 'var(--amber-600)',     type: 'circle' },
  { label: 'High Risk',        color: 'var(--risk-high)',     type: 'circle' },
  { label: 'Critical / Suspicious', color: 'var(--red-500)', type: 'circle' },
  { label: 'Normal Transaction',    color: 'var(--border-strong)', type: 'line' },
  { label: 'Suspicious Transaction', color: 'var(--red-700)', type: 'line' },
];

const GraphLegend = () => (
  <div className="graph-legend">
    {LEGEND_ITEMS.map(item => (
      <div key={item.label} className="graph-legend__item">
        {item.type === 'circle' ? (
          <span className="graph-legend__dot" style={{ background: item.color }} />
        ) : (
          <span className="graph-legend__line" style={{ background: item.color }} />
        )}
        <span className="graph-legend__label">{item.label}</span>
      </div>
    ))}
  </div>
);

export default GraphLegend;
