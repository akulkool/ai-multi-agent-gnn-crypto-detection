import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorState.css';

const ErrorState = ({ title = 'Something went wrong', description, onRetry }) => (
  <div className="error-state">
    <div className="error-state__icon">
      <AlertTriangle size={20} strokeWidth={1.5} />
    </div>
    <div className="error-state__title">{title}</div>
    {description && <p className="error-state__desc">{description}</p>}
    {onRetry && (
      <button className="error-state__retry" onClick={onRetry}>
        <RefreshCw size={13} />
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;
