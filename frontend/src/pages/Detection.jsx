import React, { useState } from 'react';
import { Search, Play, ChevronRight, X } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';
import RiskBadge from '../components/shared/RiskBadge';
import NetworkPattern from '../assets/NetworkPattern';
import { detectionSample } from '../data/mockData';
import './Detection.css';

const PIPELINE_STAGES = [
  { id: 'ingest',     label: 'Data Ingestion',      desc: 'Loading transaction data and graph structure' },
  { id: 'graph',      label: 'Graph Construction',   desc: 'Building transaction network from raw data' },
  { id: 'structural', label: 'Structural Analysis',  desc: 'Structural Agent analyzing graph topology' },
  { id: 'behavioral', label: 'Behavioral Analysis',  desc: 'Behavioral Agent analyzing trading patterns' },
  { id: 'fusion',     label: 'Fusion Layer',         desc: 'Combining agent signals for final assessment' },
  { id: 'result',     label: 'Risk Assessment',      desc: 'Generating detection result and evidence' },
];

const EVIDENCE_SEVERITY = {
  critical: { color: 'var(--red-500)',  bg: 'var(--red-subtle)',   border: 'var(--red-subtle-border)' },
  high:     { color: 'var(--risk-high)',bg: 'rgba(249,115,22,.08)',border: 'rgba(249,115,22,.2)' },
  medium:   { color: 'var(--amber-500)',bg: 'var(--amber-subtle)', border: 'var(--amber-subtle-border)' },
};

const Detection = () => {
  const [query, setQuery]       = useState('');
  const [stage, setStage]       = useState(null);   // null | 0..5 | 'done'
  const [result, setResult]     = useState(null);
  const [running, setRunning]   = useState(false);

  const handleRun = () => {
    if (running) return;
    setResult(null);
    setRunning(true);
    setStage(0);

    PIPELINE_STAGES.forEach((_, i) => {
      setTimeout(() => {
        setStage(i);
        if (i === PIPELINE_STAGES.length - 1) {
          setTimeout(() => {
            setStage('done');
            setResult(detectionSample);
            setRunning(false);
          }, 700);
        }
      }, i * 850);
    });
  };

  const handleClear = () => {
    setQuery('');
    setStage(null);
    setResult(null);
    setRunning(false);
  };

  return (
    <div className="detection">
      {/* Hero */}
      <div className="detection__hero">
        <NetworkPattern opacity={0.02} />
        <div className="detection__hero-content">
          <p className="detection__hero-eyebrow">01 / AI Detection Center</p>
          <h1 className="detection__hero-title">Investigate Suspicious Activity</h1>
          <p className="detection__hero-sub">
            Graph-based multi-agent analysis for wash trading and coordinated pattern detection.
          </p>
        </div>
      </div>

      <div className="detection__body">

        {/* Search + Run */}
        <div className="detection__search-panel">
          <div className="detection__search-row">
            <div className="detection__search-input-wrap">
              <Search size={15} className="detection__search-icon" />
              <input
                className="detection__search-input"
                type="text"
                placeholder="Enter wallet address or transaction ID…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRun()}
              />
              {query && (
                <button className="detection__search-clear" onClick={handleClear}>
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              className={`detection__run-btn ${running ? 'detection__run-btn--running' : ''}`}
              onClick={handleRun}
              disabled={running}
            >
              <Play size={14} fill="currentColor" />
              {running ? 'Analyzing…' : 'Run Detection'}
            </button>
          </div>
          <div className="detection__search-hint">
            Try: <button className="detection__hint-btn" onClick={() => setQuery('0x7f3a...4d2b')}>0x7f3a...4d2b</button>
            &nbsp;·&nbsp;
            <button className="detection__hint-btn" onClick={() => setQuery('0x4b8d...7e1a')}>0x4b8d...7e1a</button>
          </div>
        </div>

        {/* Pipeline */}
        {stage !== null && (
          <div className="detection__pipeline-section">
            <SectionHeader index="02" label="Analysis Pipeline" tight />
            <div className="detection__pipeline">
              {PIPELINE_STAGES.map((s, i) => {
                const isDone    = stage === 'done' || (typeof stage === 'number' && i < stage);
                const isActive  = typeof stage === 'number' && i === stage;
                const isPending = typeof stage === 'number' && i > stage;
                return (
                  <div key={s.id} className={`pipeline-stage ${isActive ? 'pipeline-stage--active' : ''} ${isDone ? 'pipeline-stage--done' : ''} ${isPending ? 'pipeline-stage--pending' : ''}`}>
                    <div className="pipeline-stage__number">
                      {isDone ? '✓' : String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="pipeline-stage__info">
                      <div className="pipeline-stage__label">{s.label}</div>
                      {isActive && <div className="pipeline-stage__desc">{s.desc}</div>}
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <ChevronRight size={14} className="pipeline-stage__arrow" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="detection__result-section">
            <SectionHeader index="03" label="Detection Result" tight />

            {/* Risk score card */}
            <div className="detection__result-card">
              <div className="detection__result-score-col">
                <div className="detection__result-score-label">Risk Score</div>
                <div className={`detection__result-score detection__result-score--${result.riskLabel.toLowerCase()}`}>
                  {result.riskScore}
                  <span className="detection__result-score-denom">/100</span>
                </div>
                <RiskBadge risk={result.riskLabel} />
              </div>
              <div className="detection__result-meta-col">
                <div className="detection__result-meta-item">
                  <span className="detection__result-meta-label">Classification</span>
                  <span className="detection__result-meta-value">{result.classification}</span>
                </div>
                <div className="detection__result-meta-item">
                  <span className="detection__result-meta-label">Analyzed Account</span>
                  <span className="detection__result-meta-value mono">{result.query}</span>
                </div>
                <div className="detection__result-meta-item">
                  <span className="detection__result-meta-label">Analysis Timestamp</span>
                  <span className="detection__result-meta-value mono">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="detection__result-meta-item">
                  <span className="detection__result-meta-label">Fusion Confidence</span>
                  <span className="detection__result-meta-value">{result.fusion.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Agent scores */}
            <div className="detection__agents-row">
              {['structural', 'behavioral', 'fusion'].map(key => {
                const a = result[key];
                return (
                  <div key={key} className={`detection__agent-card ${key === 'fusion' ? 'detection__agent-card--fusion' : ''}`}>
                    <div className="detection__agent-name">{a.name}</div>
                    <div className="detection__agent-role">{a.role}</div>
                    <div className="detection__agent-score">{a.score}</div>
                    <div className="detection__agent-conf">{a.confidence}% confidence</div>
                    <ul className="detection__agent-findings">
                      {a.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Evidence */}
            <SectionHeader index="04" label="Detection Evidence" tight />
            <div className="detection__evidence">
              {result.evidence.map(ev => {
                const sev = EVIDENCE_SEVERITY[ev.severity] || EVIDENCE_SEVERITY.medium;
                return (
                  <div
                    key={ev.id}
                    className="detection__evidence-item"
                    style={{
                      borderLeft: `3px solid ${sev.color}`,
                      background: sev.bg,
                      border: `1px solid ${sev.border}`,
                      borderLeftColor: sev.color,
                    }}
                  >
                    <div className="detection__evidence-header">
                      <span className="detection__evidence-type" style={{ color: sev.color }}>
                        {ev.type}
                      </span>
                      <span className="detection__evidence-severity"
                        style={{ color: sev.color, borderColor: sev.border, background: sev.bg }}>
                        {ev.severity}
                      </span>
                    </div>
                    <p className="detection__evidence-desc">{ev.description}</p>
                    <div className="detection__evidence-metric mono">{ev.metric}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {stage === null && (
          <div className="detection__idle">
            <div className="detection__idle-graphic">
              <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="80">
                <circle cx="60" cy="40" r="12" stroke="var(--border-strong)" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="6"  stroke="var(--border-default)" strokeWidth="1" />
                <circle cx="100" cy="20" r="6" stroke="var(--border-default)" strokeWidth="1" />
                <circle cx="20" cy="60" r="6"  stroke="var(--border-default)" strokeWidth="1" />
                <circle cx="100" cy="60" r="6" stroke="var(--border-default)" strokeWidth="1" />
                <line x1="26" y1="23" x2="50" y2="35" stroke="var(--border-subtle)" strokeWidth="1" />
                <line x1="94" y1="23" x2="70" y2="35" stroke="var(--border-subtle)" strokeWidth="1" />
                <line x1="26" y1="57" x2="50" y2="45" stroke="var(--border-subtle)" strokeWidth="1" />
                <line x1="94" y1="57" x2="70" y2="45" stroke="var(--border-subtle)" strokeWidth="1" />
              </svg>
            </div>
            <div className="detection__idle-title">No Analysis Running</div>
            <p className="detection__idle-desc">Enter a wallet address or transaction ID and run detection to begin multi-agent GNN analysis.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Detection;
