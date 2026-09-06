import React from 'react';
import './StatusIndicator.css';

/**
 * StatusIndicator — compact live status with pulse dot
 * status: 'operational' | 'warning' | 'error' | 'inactive'
 */
const StatusIndicator = ({ status = 'operational', label, compact = false }) => {
  const labels = {
    operational: label || 'Operational',
    warning:     label || 'Degraded',
    error:       label || 'Error',
    inactive:    label || 'Inactive',
  };

  return (
    <div className={`status-indicator status-indicator--${status} ${compact ? 'status-indicator--compact' : ''}`}>
      <span className="status-indicator__dot" />
      <span className="status-indicator__label">{labels[status]}</span>
    </div>
  );
};

export default StatusIndicator;
