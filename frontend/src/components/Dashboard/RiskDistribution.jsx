import React from 'react';
import { riskDistribution } from '../../data/mockData';
import './RiskDistribution.css';

const RiskDistribution = () => {
  const total = riskDistribution.reduce((s, r) => s + r.count, 0);

  return (
    <div className="risk-dist">
      {/* Stacked bar */}
      <div className="risk-dist__bar">
        {riskDistribution.map(item => (
          <div
            key={item.label}
            className="risk-dist__bar-segment"
            style={{
              width: `${item.percentage}%`,
              background: item.color,
            }}
            title={`${item.label}: ${item.percentage}%`}
          />
        ))}
      </div>

      {/* Categories */}
      <div className="risk-dist__categories">
        {riskDistribution.map(item => (
          <div key={item.label} className="risk-dist__category">
            <div className="risk-dist__cat-header">
              <span className="risk-dist__cat-dot" style={{ background: item.color }} />
              <span className="risk-dist__cat-label">{item.label}</span>
            </div>
            <div className="risk-dist__cat-count">
              {item.count.toLocaleString()}
            </div>
            <div className="risk-dist__cat-pct">{item.percentage}%</div>
          </div>
        ))}
      </div>

      <div className="risk-dist__total">
        Total analyzed: <span>{total.toLocaleString()}</span> accounts
      </div>
    </div>
  );
};

export default RiskDistribution;
