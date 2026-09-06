import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Network, AlertTriangle, ShieldAlert } from 'lucide-react';
import DetailsDrawer from '../shared/DetailsDrawer';
import RiskBadge from '../shared/RiskBadge';
import { networkEdges } from '../../data/mockData';
import './NodeDrawer.css';

const RISK_LABEL = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

const NodeDrawer = ({ node, open, onClose }) => {
  const navigate = useNavigate();

  if (!node) return null;

  const connectedEdges = networkEdges.filter(
    e => e.source === node.id || e.target === node.id
  );
  const suspiciousEdges = connectedEdges.filter(e => e.suspicious);

  return (
    <DetailsDrawer
      open={open}
      onClose={onClose}
      title="Account Investigation"
      subtitle={node.label}
      width={380}
    >
      {/* Risk overview */}
      <div className="node-drawer__risk-block">
        <div className="node-drawer__risk-score-row">
          <div>
            <div className="node-drawer__field-label">Risk Classification</div>
            <RiskBadge risk={node.risk} />
          </div>
          <div className="node-drawer__risk-score">
            <div className="node-drawer__field-label">Risk Score</div>
            <span className={`node-drawer__score node-drawer__score--${node.risk}`}>
              {node.risk === 'critical' ? '94' : node.risk === 'high' ? '76' : node.risk === 'medium' ? '48' : '12'}
            </span>
          </div>
        </div>
      </div>

      {/* Account fields */}
      <div className="node-drawer__fields">
        <div className="node-drawer__field">
          <span className="node-drawer__field-label">Account ID</span>
          <span className="node-drawer__field-value mono">{node.label}</span>
        </div>
        <div className="node-drawer__field">
          <span className="node-drawer__field-label">Transaction Count</span>
          <span className="node-drawer__field-value">{node.txCount} transactions</span>
        </div>
        <div className="node-drawer__field">
          <span className="node-drawer__field-label">Connected Accounts</span>
          <span className="node-drawer__field-value">{connectedEdges.length}</span>
        </div>
        <div className="node-drawer__field">
          <span className="node-drawer__field-label">Suspicious Relationships</span>
          <span className={`node-drawer__field-value ${suspiciousEdges.length > 0 ? 'node-drawer__field-value--red' : ''}`}>
            {suspiciousEdges.length}
          </span>
        </div>
      </div>

      {/* Agent findings */}
      {(node.risk === 'high' || node.risk === 'critical') && (
        <div className="node-drawer__findings">
          <div className="node-drawer__findings-header">
            <ShieldAlert size={13} />
            Agent Findings
          </div>
          <div className="node-drawer__finding">
            <AlertTriangle size={11} style={{ color: 'var(--red-400)', flexShrink: 0 }} />
            Participates in circular transaction loop with {suspiciousEdges.length} counterpart{suspiciousEdges.length !== 1 ? 's' : ''}.
          </div>
          <div className="node-drawer__finding">
            <AlertTriangle size={11} style={{ color: 'var(--amber-500)', flexShrink: 0 }} />
            Transaction timing pattern deviates significantly from baseline.
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="node-drawer__actions">
        <button
          className="node-drawer__action-btn node-drawer__action-btn--primary"
          onClick={() => { navigate('/detection'); onClose(); }}
        >
          <ShieldAlert size={14} />
          Run Detection
        </button>
        <button
          className="node-drawer__action-btn"
          onClick={() => { navigate('/transactions'); onClose(); }}
        >
          <ExternalLink size={14} />
          View Transactions
        </button>
      </div>
    </DetailsDrawer>
  );
};

export default NodeDrawer;
