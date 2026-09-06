import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './MetricCard.css';

const MetricCard = ({
  label,
  value,
  delta,
  deltaPositive,
  meta,
  accent, // 'red' | 'amber' | 'none'
  mono = false,
  size = 'default', // 'default' | 'large'
}) => {
  const accentClass = accent === 'red' ? 'metric-card--red'
                    : accent === 'amber' ? 'metric-card--amber'
                    : '';

  return (
    <div className={`metric-card ${accentClass} ${size === 'large' ? 'metric-card--large' : ''}`}>
      <div className="metric-card__label">{label}</div>
      <div className={`metric-card__value ${mono ? 'mono' : ''}`}>
        {value}
      </div>
      {delta && (
        <div className={`metric-card__delta ${deltaPositive ? 'metric-card__delta--pos' : 'metric-card__delta--neg'}`}>
          {deltaPositive ? <TrendingUp size={11} /> : deltaPositive === false ? <TrendingDown size={11} /> : <Minus size={11} />}
          <span>{delta}</span>
        </div>
      )}
      {meta && <div className="metric-card__meta">{meta}</div>}
    </div>
  );
};

export default MetricCard;
