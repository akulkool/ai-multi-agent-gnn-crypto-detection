import React from 'react';
import { agentResults } from '../../data/mockData';
import './MultiAgentPanel.css';

const AgentModule = ({ agent, type }) => {
  const statusColor = agent.status === 'active' ? 'var(--amber-500)'
                    : agent.status === 'completed' ? 'var(--risk-low)'
                    : 'var(--text-muted)';

  return (
    <div className={`agent-module agent-module--${type}`}>
      <div className="agent-module__header">
        <div className="agent-module__name">{agent.name}</div>
        <div className="agent-module__status" style={{ color: statusColor }}>
          <span className="agent-module__status-dot" style={{ background: statusColor }} />
          {agent.status}
        </div>
      </div>
      <div className="agent-module__role">{agent.role}</div>
      <div className="agent-module__scores">
        <div className="agent-module__score-item">
          <span className="agent-module__score-label">Score</span>
          <span className="agent-module__score-value">{agent.score}</span>
        </div>
        <div className="agent-module__score-item">
          <span className="agent-module__score-label">Confidence</span>
          <span className="agent-module__score-value">{agent.confidence}%</span>
        </div>
      </div>
      <ul className="agent-module__findings">
        {agent.findings.slice(0, 2).map((f, i) => (
          <li key={i} className="agent-module__finding">{f}</li>
        ))}
      </ul>
    </div>
  );
};

const MultiAgentPanel = () => (
  <div className="multi-agent-panel">
    {/* Flow diagram */}
    <div className="multi-agent-panel__flow">
      <div className="multi-agent-panel__flow-input">
        <span>Transaction Graph Data</span>
      </div>

      <div className="multi-agent-panel__flow-arrow" />

      {/* Two agents */}
      <div className="multi-agent-panel__agents">
        <AgentModule agent={agentResults.structural} type="structural" />

        <div className="multi-agent-panel__flow-connector">
          <div className="multi-agent-panel__connector-line" />
          <div className="multi-agent-panel__connector-label">Independent Analysis</div>
          <div className="multi-agent-panel__connector-line" />
        </div>

        <AgentModule agent={agentResults.behavioral} type="behavioral" />
      </div>

      <div className="multi-agent-panel__flow-arrow" />

      {/* Fusion */}
      <AgentModule agent={agentResults.fusion} type="fusion" />

      <div className="multi-agent-panel__flow-arrow" />

      <div className="multi-agent-panel__flow-result">
        <span className="multi-agent-panel__result-label">Final Risk Assessment</span>
        <span className="multi-agent-panel__result-score">82 / 100</span>
        <span className="multi-agent-panel__result-class">HIGH — Potential Wash Trading</span>
      </div>
    </div>
  </div>
);

export default MultiAgentPanel;
