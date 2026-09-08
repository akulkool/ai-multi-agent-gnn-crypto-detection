import React from 'react';
import './RiskBadge.css';

const riskConfig = {
  LOW:      { label: 'LOW',      cls: 'risk-badge--low'     },
  MEDIUM:   { label: 'MEDIUM',   cls: 'risk-badge--medium'  },
  HIGH:     { label: 'HIGH',     cls: 'risk-badge--high'    },
  CRITICAL: { label: 'CRITICAL', cls: 'risk-badge--critical'},
};

const RiskBadge = ({ risk, score, size = 'default' }) => {
  const level = (typeof risk === 'string' ? risk : '').toUpperCase();
  const config = riskConfig[level] || riskConfig.LOW;

  return (
    <span className={`risk-badge ${config.cls} ${size === 'sm' ? 'risk-badge--sm' : ''}`}>
      <span className="risk-badge__dot" />
      {score !== undefined ? `${score}` : config.label}
    </span>
  );
};

export default RiskBadge;
