import React from 'react';
import MetricCard from '../components/shared/MetricCard';
import SectionHeader from '../components/shared/SectionHeader';
import NetworkGraph from '../components/Dashboard/NetworkGraph';
import RiskDistribution from '../components/Dashboard/RiskDistribution';
import MultiAgentPanel from '../components/Dashboard/MultiAgentPanel';
import StatusIndicator from '../components/shared/StatusIndicator';
import NetworkPattern from '../assets/NetworkPattern';
import { dashboardStats } from '../data/mockData';
import './Dashboard.css';

const Dashboard = () => (
  <div className="dashboard">
    {/* ── PAGE HERO ──────────────────────────────────────────── */}
    <div className="dashboard__hero">
      <NetworkPattern opacity={0.025} />
      <div className="dashboard__hero-content">
        <div className="dashboard__hero-eyebrow">
          <StatusIndicator status="operational" label="Live Monitoring" />
          <span className="dashboard__hero-divider">·</span>
          <span className="dashboard__hero-meta">
            {new Date(dashboardStats.lastUpdated).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        <h1 className="dashboard__hero-title">Crypto Market Surveillance</h1>
        <p className="dashboard__hero-sub">
          Monitor transaction networks and investigate suspicious trading behavior in real time.
        </p>
      </div>
    </div>

    <div className="dashboard__body">

      {/* ── 01 / METRICS ─────────────────────────────────────── */}
      <section className="dashboard__section">
        <SectionHeader
          index="01"
          label="Market Overview"
          tight
        />
        <div className="dashboard__metrics-grid">
          <MetricCard
            label="Transactions Analyzed"
            value={dashboardStats.transactionsAnalyzed.toLocaleString()}
            delta={dashboardStats.transactionsDelta}
            deltaPositive
            meta="Rolling 30-day window"
          />
          <MetricCard
            label="Suspicious Transactions"
            value={dashboardStats.suspiciousTransactions.toLocaleString()}
            delta={dashboardStats.suspiciousDelta}
            deltaPositive={false}
            meta="Flagged by detection model"
            accent="red"
          />
          <MetricCard
            label="High-Risk Accounts"
            value={dashboardStats.highRiskAccounts}
            delta={dashboardStats.highRiskDelta}
            deltaPositive={false}
            meta="Active in past 24h"
            accent="red"
          />
          <MetricCard
            label="Detected Groups"
            value={dashboardStats.detectedGroups}
            delta={dashboardStats.detectedGroupsDelta}
            deltaPositive={false}
            meta="Coordinated clusters"
            accent="amber"
          />
          <MetricCard
            label="Avg Risk Score"
            value={dashboardStats.averageRiskScore}
            meta="Network-wide average"
            accent="amber"
          />
          <MetricCard
            label="Model Confidence"
            value={`${dashboardStats.modelConfidence}%`}
            meta="GNN detection accuracy"
          />
        </div>
      </section>

      {/* ── 02 / NETWORK GRAPH ───────────────────────────────── */}
      <section className="dashboard__section">
        <SectionHeader
          index="02"
          label="Network Analysis"
          subtitle="Click a node to open account investigation. Animated edges indicate suspicious transactions."
          action={
            <div className="dashboard__graph-stats">
              <span>{dashboardStats.graphNodes.toLocaleString()} nodes</span>
              <span>·</span>
              <span>{dashboardStats.graphEdges.toLocaleString()} edges</span>
            </div>
          }
        />
        <NetworkGraph />
      </section>

      {/* ── 03 / RISK DISTRIBUTION + MULTI-AGENT ─────────────── */}
      <div className="dashboard__bottom-grid">
        <section className="dashboard__section">
          <SectionHeader index="03" label="Risk Distribution" tight />
          <div className="dashboard__panel">
            <RiskDistribution />
          </div>
        </section>

        <section className="dashboard__section">
          <SectionHeader index="04" label="Multi-Agent Analysis" tight />
          <div className="dashboard__panel">
            <MultiAgentPanel />
          </div>
        </section>
      </div>

    </div>
  </div>
);

export default Dashboard;
