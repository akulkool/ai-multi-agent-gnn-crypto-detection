import React, { useEffect, useMemo, useState } from 'react';

import MetricCard from '../components/shared/MetricCard';
import SectionHeader from '../components/shared/SectionHeader';
import NetworkGraph from '../components/Dashboard/NetworkGraph';
import RiskDistribution from '../components/Dashboard/RiskDistribution';
import MultiAgentPanel from '../components/Dashboard/MultiAgentPanel';
import StatusIndicator from '../components/shared/StatusIndicator';
import NetworkPattern from '../assets/NetworkPattern';

import {
  getRiskSummary,
} from '../services/api';

import './Dashboard.css';


// ============================================================
// SUPPORTED SYMBOLS
// ============================================================

const SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
];


// ============================================================
// SAFE NUMBER
// ============================================================

function safeNumber(value, fallback = 0) {

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


// ============================================================
// FORMAT NUMBER
// ============================================================

function formatNumber(value) {

  return safeNumber(value).toLocaleString(
    'en-US'
  );
}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTimestamp(timestamp) {

  if (!timestamp) {
    return 'Waiting for data...';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );
}


// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [riskData, setRiskData] = useState({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);


  // ==========================================================
  // FETCH LIVE DATA
  // ==========================================================

  const fetchRiskData = async () => {

    try {

      const response = await getRiskSummary();

      if (
        !response ||
        !response.data
      ) {

        throw new Error(
          'Invalid response received from API'
        );
      }

      setRiskData(
        response.data
      );

      setLastUpdated(
        new Date()
      );

      setError(null);

    } catch (err) {

      console.error(
        'CryptoTradeGuard API error:',
        err
      );

      setError(
        err.message ||
        'Unable to connect to CryptoTradeGuard API'
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL FETCH + AUTO REFRESH
  // ==========================================================

  useEffect(() => {

    fetchRiskData();

    // Refresh every 10 seconds
    const interval = setInterval(
      fetchRiskData,
      10000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const cryptoResults = useMemo(() => {

    return SYMBOLS
      .map(symbol => riskData[symbol])
      .filter(Boolean);

  }, [riskData]);


  // ==========================================================
  // MARKET STATISTICS
  // ==========================================================

  const marketStats = useMemo(() => {

    const total = cryptoResults.length;

    if (total === 0) {

      return {
        averageRisk: 0,
        suspicious: 0,
        highRisk: 0,
        anomalies: 0,
        low: 0,
        medium: 0,
        high: 0,
      };
    }


    const riskScores = cryptoResults.map(
      item =>
        safeNumber(
          item.final_risk_score
        )
    );


    const averageRisk =
      riskScores.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / total;


    const suspicious =
      cryptoResults.filter(
        item =>
          safeNumber(
            item.final_risk_score
          ) >= 50
      ).length;


    const highRisk =
      cryptoResults.filter(
        item =>
          String(
            item.final_risk_level
          ).toUpperCase() === 'HIGH'
      ).length;


    const anomalies =
      cryptoResults.filter(
        item =>
          item.anomaly === true ||
          String(
            item.anomaly
          ).toLowerCase() === 'true'
      ).length;


    const low =
      cryptoResults.filter(
        item =>
          String(
            item.final_risk_level
          ).toUpperCase() === 'LOW'
      ).length;


    const medium =
      cryptoResults.filter(
        item =>
          String(
            item.final_risk_level
          ).toUpperCase() === 'MEDIUM'
      ).length;


    const high =
      cryptoResults.filter(
        item =>
          String(
            item.final_risk_level
          ).toUpperCase() === 'HIGH'
      ).length;


    return {

      averageRisk,

      suspicious,

      highRisk,

      anomalies,

      low,

      medium,

      high,

    };

  }, [cryptoResults]);


  // ==========================================================
  // LATEST TIMESTAMP
  // ==========================================================

  const latestTimestamp = useMemo(() => {

    if (cryptoResults.length === 0) {
      return null;
    }

    const timestamps =
      cryptoResults
        .map(
          item =>
            new Date(
              item.timestamp
            )
        )
        .filter(
          date =>
            !Number.isNaN(
              date.getTime()
            )
        );

    if (timestamps.length === 0) {
      return null;
    }

    return new Date(
      Math.max(
        ...timestamps.map(
          date =>
            date.getTime()
        )
      )
    );

  }, [cryptoResults]);


  // ==========================================================
  // AGENT AVERAGES
  // ==========================================================

  const agentScores = useMemo(() => {

    if (cryptoResults.length === 0) {

      return {
        volume: 0,
        price: 0,
        timing: 0,
        wash_trading: 0,
      };
    }


    const total = cryptoResults.length;


    const volume =
      cryptoResults.reduce(
        (sum, item) =>
          sum +
          safeNumber(
            item.agent_scores?.volume
          ),
        0
      ) / total;


    const price =
      cryptoResults.reduce(
        (sum, item) =>
          sum +
          safeNumber(
            item.agent_scores?.price
          ),
        0
      ) / total;


    const timing =
      cryptoResults.reduce(
        (sum, item) =>
          sum +
          safeNumber(
            item.agent_scores?.timing
          ),
        0
      ) / total;


    const washTrading =
      cryptoResults.reduce(
        (sum, item) =>
          sum +
          safeNumber(
            item.agent_scores?.wash_trading
          ),
        0
      ) / total;


    return {

      volume,

      price,

      timing,

      wash_trading:
        washTrading,

    };

  }, [cryptoResults]);


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (
    loading &&
    cryptoResults.length === 0
  ) {

    return (

      <div className="dashboard">

        <div className="dashboard__hero">

          <NetworkPattern
            opacity={0.025}
          />

          <div className="dashboard__hero-content">

            <div className="dashboard__hero-eyebrow">

              <StatusIndicator
                status="operational"
                label="Connecting..."
              />

            </div>

            <h1 className="dashboard__hero-title">
              Crypto Market Surveillance
            </h1>

            <p className="dashboard__hero-sub">
              Connecting to live CryptoTradeGuard
              detection services...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // DASHBOARD
  // ==========================================================

  return (

    <div className="dashboard">

      {/* ====================================================
          HERO
      ==================================================== */}

      <div className="dashboard__hero">

        <NetworkPattern
          opacity={0.025}
        />

        <div className="dashboard__hero-content">

          <div className="dashboard__hero-eyebrow">

            <StatusIndicator
              status={
                error
                  ? "warning"
                  : "operational"
              }
              label={
                error
                  ? "API Warning"
                  : "Live Monitoring"
              }
            />

            <span className="dashboard__hero-divider">
              ·
            </span>

            <span className="dashboard__hero-meta">

              {formatTimestamp(
                latestTimestamp ||
                lastUpdated
              )}

            </span>

          </div>


          <h1 className="dashboard__hero-title">
            Crypto Market Surveillance
          </h1>


          <p className="dashboard__hero-sub">
            Monitor transaction networks and
            investigate suspicious trading behavior
            in real time.
          </p>


          {error && (

            <p
              style={{
                marginTop: '12px',
                color: 'var(--red-500)',
                fontSize: '13px',
              }}
            >
              API: {error}
            </p>

          )}

        </div>

      </div>


      <div className="dashboard__body">


        {/* ==================================================
            01 / MARKET OVERVIEW
        ================================================== */}

        <section className="dashboard__section">

          <SectionHeader
            index="01"
            label="Market Overview"
            tight
          />


          <div className="dashboard__metrics-grid">


            <MetricCard

              label="Assets Monitored"

              value={formatNumber(
                cryptoResults.length
              )}

              meta="Live Binance markets"

            />


            <MetricCard

              label="Suspicious Assets"

              value={formatNumber(
                marketStats.suspicious
              )}

              meta="Risk score ≥ 50"

              accent="red"

            />


            <MetricCard

              label="High-Risk Assets"

              value={formatNumber(
                marketStats.highRisk
              )}

              meta="Currently HIGH risk"

              accent="red"

            />


            <MetricCard

              label="ML Anomalies"

              value={formatNumber(
                marketStats.anomalies
              )}

              meta="Isolation Forest"

              accent="amber"

            />


            <MetricCard

              label="Average Risk Score"

              value={
                marketStats.averageRisk.toFixed(
                  2
                )
              }

              meta="Across monitored assets"

              accent="amber"

            />


            <MetricCard

              label="Detection Engine"

              value="4 Agents"

              meta="Volume · Price · Timing · Wash"

            />

          </div>

        </section>


        {/* ==================================================
            LIVE CRYPTO STATUS
        ================================================== */}

        <section className="dashboard__section">

          <SectionHeader
            index="02"
            label="Live Market Risk"
            subtitle="Real-time AI surveillance results from Binance market data."
            action={
              <div className="dashboard__graph-stats">

                <span>
                  {cryptoResults.length} markets
                </span>

                <span>·</span>

                <span>
                  Auto-refresh 10s
                </span>

              </div>
            }
          />


          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >

            {SYMBOLS.map(symbol => {

              const item =
                riskData[symbol];

              if (!item) {

                return (

                  <div
                    key={symbol}
                    className="dashboard__panel"
                    style={{
                      padding: '20px',
                    }}
                  >

                    <strong>
                      {symbol}
                    </strong>

                    <p
                      style={{
                        color:
                          'var(--text-muted)',
                        marginTop: '8px',
                      }}
                    >
                      Waiting for live data...
                    </p>

                  </div>

                );
              }


              const score =
                safeNumber(
                  item.final_risk_score
                );


              const level =
                String(
                  item.final_risk_level ||
                  'LOW'
                ).toUpperCase();


              const signals =
                item.signals || [];


              return (

                <div
                  key={symbol}
                  className="dashboard__panel"
                  style={{
                    padding: '20px',
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >

                    <strong
                      style={{
                        fontSize: '16px',
                      }}
                    >
                      {symbol}
                    </strong>


                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding:
                          '4px 9px',
                        borderRadius:
                          '999px',
                        border:
                          '1px solid var(--border-default)',
                      }}
                    >
                      {level}
                    </span>

                  </div>


                  <div
                    style={{
                      display: 'flex',
                      alignItems:
                        'baseline',
                      gap: '8px',
                      marginBottom: '10px',
                    }}
                  >

                    <span
                      style={{
                        fontSize: '30px',
                        fontWeight: 700,
                      }}
                    >
                      {score.toFixed(2)}
                    </span>

                    <span
                      style={{
                        color:
                          'var(--text-muted)',
                        fontSize: '12px',
                      }}
                    >
                      risk score
                    </span>

                  </div>


                  <div
                    style={{
                      color:
                        'var(--text-muted)',
                      fontSize: '12px',
                      lineHeight: 1.6,
                    }}
                  >

                    {signals.length > 0
                      ? `${signals.length} suspicious signals detected`
                      : 'No suspicious signals detected'
                    }

                  </div>


                  <div
                    style={{
                      marginTop: '14px',
                      fontSize: '11px',
                      color:
                        'var(--text-muted)',
                    }}
                  >

                    Updated{' '}

                    {formatTimestamp(
                      item.timestamp
                    )}

                  </div>

                </div>

              );

            })}

          </div>

        </section>


        {/* ==================================================
            03 / NETWORK ANALYSIS
        ================================================== */}

        <section className="dashboard__section">

          <SectionHeader
            index="03"
            label="Network Analysis"
            subtitle="Click a node to open account investigation. Animated edges indicate suspicious transactions."
            action={
              <div className="dashboard__graph-stats">

                <span>
                  Live AI Detection
                </span>

              </div>
            }
          />

          <NetworkGraph />

        </section>


        {/* ==================================================
            04 / RISK DISTRIBUTION + MULTI AGENT
        ================================================== */}

        <div className="dashboard__bottom-grid">


          <section className="dashboard__section">

            <SectionHeader
              index="04"
              label="Risk Distribution"
              tight
            />

            <div className="dashboard__panel">

              <RiskDistribution />

            </div>

          </section>


          <section className="dashboard__section">

            <SectionHeader
              index="05"
              label="Multi-Agent Analysis"
              tight
            />

            <div className="dashboard__panel">

              <MultiAgentPanel />

            </div>

          </section>


        </div>


        {/* ==================================================
            LIVE AGENT SUMMARY
        ================================================== */}

        <section className="dashboard__section">

          <SectionHeader
            index="06"
            label="Live Agent Intelligence"
            subtitle="Average agent scores across currently monitored cryptocurrency markets."
            tight
          />


          <div className="dashboard__metrics-grid">


            <MetricCard

              label="Volume Agent"

              value={
                agentScores.volume.toFixed(
                  1
                )
              }

              meta="Average score"

            />


            <MetricCard

              label="Price Agent"

              value={
                agentScores.price.toFixed(
                  1
                )
              }

              meta="Average score"

            />


            <MetricCard

              label="Timing Agent"

              value={
                agentScores.timing.toFixed(
                  1
                )
              }

              meta="Average score"

            />


            <MetricCard

              label="Wash Trading Agent"

              value={
                agentScores.wash_trading.toFixed(
                  1
                )
              }

              meta="Average score"

              accent="amber"

            />

          </div>

        </section>


      </div>

    </div>
  );
};


export default Dashboard;