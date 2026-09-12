import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import SectionHeader from '../components/shared/SectionHeader';
import MetricCard from '../components/shared/MetricCard';
import RiskBadge from '../components/shared/RiskBadge';
import StatusIndicator from '../components/shared/StatusIndicator';

import NetworkPattern from '../assets/NetworkPattern';

import {
  getRiskSummary,
} from '../services/api';


// ============================================================
// CONSTANTS
// ============================================================

const SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
];

const AGENTS = [
  {
    key: 'volume',
    label: 'Volume Agent',
  },
  {
    key: 'price',
    label: 'Price Agent',
  },
  {
    key: 'timing',
    label: 'Timing Agent',
  },
  {
    key: 'wash_trading',
    label: 'Wash Trading Agent',
  },
];


// ============================================================
// HELPERS
// ============================================================

const safeNumber = (
  value,
  fallback = 0
) => {

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};


const isAnomaly = (
  value
) => {

  return (
    value === true ||
    String(value).toLowerCase() === 'true'
  );

};


const formatSignal = (
  signal
) => {

  return String(signal || '')
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );

};


const formatTimestamp = (
  timestamp
) => {

  if (!timestamp) {
    return 'Waiting for data...';
  }

  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

};


// ============================================================
// ANALYTICS
// ============================================================

const Analytics = () => {

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [
    riskData,
    setRiskData,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);


  // ----------------------------------------------------------
  // FETCH DATA
  // ----------------------------------------------------------

  const fetchAnalytics = async () => {

    try {

      const response =
        await getRiskSummary();


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


      setError(
        null
      );

    } catch (
      err
    ) {

      console.error(
        'Analytics API error:',
        err
      );


      setError(
        err.message ||
        'Unable to connect to CryptoTradeGuard API'
      );

    } finally {

      setLoading(
        false
      );

    }

  };


  // ----------------------------------------------------------
  // INITIAL LOAD + AUTO REFRESH
  // ----------------------------------------------------------

  useEffect(() => {

    fetchAnalytics();


    const interval =
      setInterval(
        fetchAnalytics,
        10000
      );


    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  // ----------------------------------------------------------
  // VALID RESULTS
  // ----------------------------------------------------------

  const cryptoResults =
    useMemo(() => {

      return SYMBOLS
        .map(
          symbol =>
            riskData[symbol]
        )
        .filter(Boolean);

    }, [
      riskData
    ]);


  // ==========================================================
  // MARKET STATISTICS
  // ==========================================================

  const marketStats =
    useMemo(() => {

      const total =
        cryptoResults.length;


      if (!total) {

        return {
          averageRisk: 0,
          highestRisk: null,
          suspicious: 0,
          anomalies: 0,
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
          totalSignals: 0,
          washSignals: 0,
        };

      }


      const averageRisk =
        cryptoResults.reduce(
          (
            sum,
            item
          ) =>
            sum +
            safeNumber(
              item.final_risk_score
            ),
          0
        ) / total;


      const highestRisk =
        cryptoResults.reduce(
          (
            highest,
            item
          ) => {

            if (!highest) {
              return item;
            }

            return safeNumber(
              item.final_risk_score
            ) >
            safeNumber(
              highest.final_risk_score
            )
              ? item
              : highest;

          },
          null
        );


      const suspicious =
        cryptoResults.filter(
          item =>
            safeNumber(
              item.final_risk_score
            ) >= 50
        ).length;


      const anomalies =
        cryptoResults.filter(
          item =>
            isAnomaly(
              item.anomaly
            )
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


      const critical =
        cryptoResults.filter(
          item =>
            String(
              item.final_risk_level
            ).toUpperCase() === 'CRITICAL'
        ).length;


      const totalSignals =
        cryptoResults.reduce(
          (
            sum,
            item
          ) =>
            sum +
            (
              Array.isArray(
                item.signals
              )
                ? item.signals.length
                : 0
            ),
          0
        );


      const washSignals =
        cryptoResults.reduce(
          (
            sum,
            item
          ) =>
            sum +
            safeNumber(
              item.wash_signal_count
            ),
          0
        );


      return {
        averageRisk,
        highestRisk,
        suspicious,
        anomalies,
        low,
        medium,
        high,
        critical,
        totalSignals,
        washSignals,
      };

    }, [
      cryptoResults
    ]);


  // ==========================================================
  // AGENT AVERAGES
  // ==========================================================

  const agentAverages =
    useMemo(() => {

      const total =
        cryptoResults.length;


      if (!total) {

        return {
          volume: 0,
          price: 0,
          timing: 0,
          wash_trading: 0,
        };

      }


      return {

        volume:
          cryptoResults.reduce(
            (
              sum,
              item
            ) =>
              sum +
              safeNumber(
                item.agent_scores?.volume
              ),
            0
          ) / total,


        price:
          cryptoResults.reduce(
            (
              sum,
              item
            ) =>
              sum +
              safeNumber(
                item.agent_scores?.price
              ),
            0
          ) / total,


        timing:
          cryptoResults.reduce(
            (
              sum,
              item
            ) =>
              sum +
              safeNumber(
                item.agent_scores?.timing
              ),
            0
          ) / total,


        wash_trading:
          cryptoResults.reduce(
            (
              sum,
              item
            ) =>
              sum +
              safeNumber(
                item.agent_scores?.wash_trading
              ),
            0
          ) / total,

      };

    }, [
      cryptoResults
    ]);


  // ==========================================================
  // SIGNAL FREQUENCY
  // ==========================================================

  const signalFrequency =
    useMemo(() => {

      const frequency = {};


      cryptoResults.forEach(
        item => {

          const signals =
            Array.isArray(
              item.signals
            )
              ? item.signals
              : [];


          signals.forEach(
            signal => {

              frequency[signal] =
                (
                  frequency[signal] ||
                  0
                ) + 1;

            }
          );

        }
      );


      return Object.entries(
        frequency
      )
        .sort(
          (
            [, a],
            [, b]
          ) =>
            b - a
        )
        .slice(
          0,
          8
        );

    }, [
      cryptoResults
    ]);


  // ==========================================================
  // MAX AGENT SCORE
  // ==========================================================

  const maxAgentScore =
    Math.max(
      ...Object.values(
        agentAverages
      ),
      1
    );


  // ==========================================================
  // RISK DISTRIBUTION
  // ==========================================================

  const riskDistribution = [
    {
      label: 'LOW',
      count: marketStats.low,
      variable: 'var(--risk-low)',
    },
    {
      label: 'MEDIUM',
      count: marketStats.medium,
      variable: 'var(--risk-medium)',
    },
    {
      label: 'HIGH',
      count: marketStats.high,
      variable: 'var(--risk-high)',
    },
    {
      label: 'CRITICAL',
      count: marketStats.critical,
      variable: 'var(--risk-critical)',
    },
  ];


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    cryptoResults.length === 0
  ) {

    return (

      <div
        style={{
          minHeight: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        <NetworkPattern
          opacity={0.02}
        />


        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: 'var(--space-8)',
            maxWidth:
              'var(--content-max-width)',
          }}
        >

          <SectionHeader
            index="01"
            label="Analytics"
            title="Detection Analytics"
            subtitle="Analyzing live cryptocurrency surveillance data."
          />


          <div
            style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-12)',
              textAlign: 'center',
              background:
                'var(--surface-0)',
              border:
                '1px solid var(--border-subtle)',
              borderRadius:
                'var(--radius-xl)',
              color:
                'var(--text-muted)',
            }}
          >

            Connecting to live
            CryptoTradeGuard services...

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // MAIN
  // ==========================================================

  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
      }}
    >


      {/* ====================================================
          HERO
      ==================================================== */}

      <div
        style={{
          position: 'relative',
          padding: 'var(--space-8)',
          borderBottom:
            '1px solid var(--border-subtle)',
          background:
            'var(--bg-elevated)',
          overflow: 'hidden',
        }}
      >

        <NetworkPattern
          opacity={0.02}
        />


        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '700px',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px',
            }}
          >

            <StatusIndicator
              status={
                error
                  ? 'warning'
                  : 'operational'
              }
              label={
                error
                  ? 'API Warning'
                  : 'Live Analytics'
              }
            />


            <span
              style={{
                color:
                  'var(--text-faint)',
              }}
            >
              ·
            </span>


            <span
              style={{
                color:
                  'var(--text-muted)',
                fontSize: '11px',
                fontFamily:
                  'var(--font-mono)',
              }}
            >

              Auto-refresh 10s

            </span>

          </div>


          <h1
            style={{
              fontFamily:
                'var(--font-display)',
              fontSize:
                'var(--font-size-3xl)',
              fontWeight:
                'var(--font-weight-bold)',
              color:
                'var(--text-primary)',
              letterSpacing:
                'var(--letter-spacing-tight)',
              marginBottom:
                'var(--space-2)',
            }}
          >

            Detection Analytics

          </h1>


          <p
            style={{
              color:
                'var(--text-muted)',
              fontSize:
                'var(--font-size-sm)',
              lineHeight:
                'var(--line-height-relaxed)',
            }}
          >

            Real-time analysis of risk scores,
            machine-learning anomalies, agent
            intelligence, and suspicious trading
            signals across monitored Binance markets.

          </p>


          {error && (

            <p
              style={{
                marginTop: '12px',
                color:
                  'var(--red-500)',
                fontSize: '13px',
              }}
            >

              API: {error}

            </p>

          )}

        </div>

      </div>


      {/* ====================================================
          BODY
      ==================================================== */}

      <div
        style={{
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          maxWidth:
            'var(--content-max-width)',
        }}
      >


        {/* ==================================================
            01 / OVERVIEW
        ================================================== */}

        <section>

          <SectionHeader
            index="01"
            label="Analytics Overview"
            subtitle="Current intelligence generated by the live detection pipeline."
            tight
          />


          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4)',
              marginTop:
                'var(--space-4)',
            }}
          >

            <MetricCard
              label="Assets Analyzed"
              value={
                cryptoResults.length
              }
              meta="Live Binance markets"
            />


            <MetricCard
              label="Average Risk"
              value={
                marketStats.averageRisk.toFixed(
                  2
                )
              }
              meta="Across monitored assets"
              accent="amber"
            />


            <MetricCard
              label="Suspicious Assets"
              value={
                marketStats.suspicious
              }
              meta="Risk score ≥ 50"
              accent="red"
            />


            <MetricCard
              label="ML Anomalies"
              value={
                marketStats.anomalies
              }
              meta="Isolation Forest"
              accent="amber"
            />


            <MetricCard
              label="Detected Signals"
              value={
                marketStats.totalSignals
              }
              meta="Combined agent evidence"
            />


            <MetricCard
              label="Wash Signals"
              value={
                marketStats.washSignals
              }
              meta="Wash Trading Agent"
              accent="amber"
            />

          </div>

        </section>


        {/* ==================================================
            02 / MARKET RISK COMPARISON
        ================================================== */}

        <section>

          <SectionHeader
            index="02"
            label="Market Risk Comparison"
            subtitle="Compare final Risk Engine scores across monitored cryptocurrencies."
            tight
          />


          <div
            style={{
              marginTop:
                'var(--space-4)',
              background:
                'var(--surface-0)',
              border:
                '1px solid var(--border-default)',
              borderRadius:
                'var(--radius-xl)',
              padding:
                'var(--space-6)',
            }}
          >

            {SYMBOLS.map(
              symbol => {

                const item =
                  riskData[symbol];


                const score =
                  safeNumber(
                    item?.final_risk_score
                  );


                const level =
                  String(
                    item?.final_risk_level ||
                    'LOW'
                  ).toUpperCase();


                return (

                  <div
                    key={symbol}
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '100px 1fr 80px 90px',
                      alignItems:
                        'center',
                      gap: '16px',
                      padding:
                        '16px 0',
                      borderBottom:
                        symbol !== 'SOLUSDT'
                          ? '1px solid var(--border-subtle)'
                          : 'none',
                    }}
                  >

                    <div
                      style={{
                        fontFamily:
                          'var(--font-mono)',
                        fontWeight: 600,
                        color:
                          'var(--text-primary)',
                      }}
                    >

                      {symbol}

                    </div>


                    <div
                      style={{
                        height: '8px',
                        background:
                          'var(--surface-2)',
                        borderRadius:
                          '999px',
                        overflow: 'hidden',
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${Math.min(
                              score,
                              100
                            )}%`,
                          height: '100%',
                          background:
                            level === 'HIGH' ||
                            level === 'CRITICAL'
                              ? 'var(--risk-high)'
                              : level === 'MEDIUM'
                                ? 'var(--risk-medium)'
                                : 'var(--risk-low)',
                          borderRadius:
                            '999px',
                          transition:
                            'width 0.5s ease',
                        }}
                      />

                    </div>


                    <div
                      style={{
                        textAlign:
                          'right',
                        fontFamily:
                          'var(--font-mono)',
                        fontWeight: 600,
                        color:
                          'var(--text-primary)',
                      }}
                    >

                      {score.toFixed(2)}

                    </div>


                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'flex-end',
                      }}
                    >

                      <RiskBadge
                        risk={level}
                        score={score}
                      />

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </section>


        {/* ==================================================
            03 / AGENT INTELLIGENCE
        ================================================== */}

        <section>

          <SectionHeader
            index="03"
            label="Multi-Agent Intelligence"
            subtitle="Average scores produced by the four specialized detection agents."
            tight
          />


          <div
            style={{
              marginTop:
                'var(--space-4)',
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >

            {AGENTS.map(
              agent => {

                const score =
                  safeNumber(
                    agentAverages[
                      agent.key
                    ]
                  );


                const percentage =
                  (
                    score /
                    maxAgentScore
                  ) * 100;


                return (

                  <div
                    key={agent.key}
                    style={{
                      background:
                        'var(--surface-0)',
                      border:
                        '1px solid var(--border-default)',
                      borderRadius:
                        'var(--radius-lg)',
                      padding:
                        'var(--space-5)',
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems:
                          'flex-start',
                        gap: '12px',
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontSize:
                              'var(--font-size-sm)',
                            fontWeight:
                              'var(--font-weight-semi)',
                            color:
                              'var(--text-primary)',
                          }}
                        >

                          {agent.label}

                        </div>


                        <div
                          style={{
                            marginTop:
                              '4px',
                            fontSize:
                              'var(--font-size-xs)',
                            color:
                              'var(--text-muted)',
                          }}
                        >

                          Average live score

                        </div>

                      </div>


                      <div
                        style={{
                          fontFamily:
                            'var(--font-display)',
                          fontSize:
                            '28px',
                          fontWeight:
                            700,
                          color:
                            'var(--text-primary)',
                        }}
                      >

                        {score.toFixed(1)}

                      </div>

                    </div>


                    <div
                      style={{
                        marginTop:
                          '20px',
                        height: '7px',
                        background:
                          'var(--surface-2)',
                        borderRadius:
                          '999px',
                        overflow: 'hidden',
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${percentage}%`,
                          height: '100%',
                          background:
                            agent.key ===
                            'wash_trading'
                              ? 'var(--amber-500)'
                              : 'var(--text-secondary)',
                          borderRadius:
                            '999px',
                          transition:
                            'width 0.5s ease',
                        }}
                      />

                    </div>


                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        marginTop:
                          '8px',
                        fontSize:
                          '10px',
                        fontFamily:
                          'var(--font-mono)',
                        color:
                          'var(--text-muted)',
                      }}
                    >

                      <span>
                        0
                      </span>

                      <span>
                        100
                      </span>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </section>


        {/* ==================================================
            04 / RISK DISTRIBUTION
        ================================================== */}

        <section>

          <SectionHeader
            index="04"
            label="Risk Distribution"
            subtitle="Current classification of monitored cryptocurrency markets."
            tight
          />


          <div
            style={{
              marginTop:
                'var(--space-4)',
              background:
                'var(--surface-0)',
              border:
                '1px solid var(--border-default)',
              borderRadius:
                'var(--radius-xl)',
              padding:
                'var(--space-6)',
            }}
          >

            <div
              style={{
                display: 'flex',
                height: '14px',
                borderRadius:
                  '999px',
                overflow: 'hidden',
                background:
                  'var(--surface-2)',
              }}
            >

              {riskDistribution.map(
                item => {

                  const total =
                    cryptoResults.length ||
                    1;


                  const width =
                    (
                      item.count /
                      total
                    ) * 100;


                  return (

                    <div
                      key={item.label}
                      title={
                        `${item.label}: ${item.count}`
                      }
                      style={{
                        width:
                          `${width}%`,
                        background:
                          item.variable,
                        transition:
                          'width 0.5s ease',
                      }}
                    />

                  );

                }
              )}

            </div>


            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, 1fr)',
                gap: '16px',
                marginTop:
                  'var(--space-6)',
              }}
            >

              {riskDistribution.map(
                item => (

                  <div
                    key={item.label}
                  >

                    <div
                      style={{
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: '7px',
                        fontSize:
                          '11px',
                        color:
                          'var(--text-muted)',
                        fontFamily:
                          'var(--font-mono)',
                      }}
                    >

                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius:
                            '50%',
                          background:
                            item.variable,
                        }}
                      />

                      {item.label}

                    </div>


                    <div
                      style={{
                        marginTop:
                          '8px',
                        fontFamily:
                          'var(--font-display)',
                        fontSize:
                          '24px',
                        fontWeight:
                          700,
                        color:
                          'var(--text-primary)',
                      }}
                    >

                      {item.count}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>


        {/* ==================================================
            05 / SIGNAL FREQUENCY
        ================================================== */}

        <section>

          <SectionHeader
            index="05"
            label="Suspicious Signal Frequency"
            subtitle="Most frequently observed signals across the current monitoring window."
            tight
          />


          <div
            style={{
              marginTop:
                'var(--space-4)',
              background:
                'var(--surface-0)',
              border:
                '1px solid var(--border-default)',
              borderRadius:
                'var(--radius-xl)',
              padding:
                'var(--space-6)',
            }}
          >

            {signalFrequency.length === 0 ? (

              <div
                style={{
                  padding:
                    'var(--space-8)',
                  textAlign:
                    'center',
                  color:
                    'var(--text-muted)',
                }}
              >

                No suspicious signals
                detected in the current
                monitoring window.

              </div>

            ) : (

              signalFrequency.map(
                (
                  [signal, count],
                  index
                ) => {

                  const maxCount =
                    signalFrequency[0][1] ||
                    1;


                  const width =
                    (
                      count /
                      maxCount
                    ) * 100;


                  return (

                    <div
                      key={signal}
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          '32px 220px 1fr 50px',
                        alignItems:
                          'center',
                        gap: '14px',
                        padding:
                          '13px 0',
                        borderBottom:
                          index <
                          signalFrequency.length - 1
                            ? '1px solid var(--border-subtle)'
                            : 'none',
                      }}
                    >

                      <span
                        style={{
                          color:
                            'var(--text-faint)',
                          fontFamily:
                            'var(--font-mono)',
                          fontSize:
                            '11px',
                        }}
                      >

                        {String(
                          index + 1
                        ).padStart(
                          2,
                          '0'
                        )}

                      </span>


                      <span
                        style={{
                          fontSize:
                            '12px',
                          color:
                            'var(--text-secondary)',
                        }}
                      >

                        {formatSignal(
                          signal
                        )}

                      </span>


                      <div
                        style={{
                          height:
                            '6px',
                          background:
                            'var(--surface-2)',
                          borderRadius:
                            '999px',
                          overflow:
                            'hidden',
                        }}
                      >

                        <div
                          style={{
                            width:
                              `${width}%`,
                            height:
                              '100%',
                            background:
                              'var(--amber-500)',
                            borderRadius:
                              '999px',
                          }}
                        />

                      </div>


                      <span
                        style={{
                          textAlign:
                            'right',
                          fontFamily:
                            'var(--font-mono)',
                          fontSize:
                            '12px',
                          fontWeight:
                            600,
                          color:
                            'var(--text-primary)',
                        }}
                      >

                        {count}

                      </span>

                    </div>

                  );

                }
              )

            )}

          </div>

        </section>


        {/* ==================================================
            06 / ASSET INTELLIGENCE TABLE
        ================================================== */}

        <section>

          <SectionHeader
            index="06"
            label="Asset Intelligence"
            subtitle="Detailed comparison of ML, agent, fusion, and Risk Engine outputs."
            tight
          />


          <div
            style={{
              marginTop:
                'var(--space-4)',
              overflowX:
                'auto',
              background:
                'var(--surface-0)',
              border:
                '1px solid var(--border-default)',
              borderRadius:
                'var(--radius-xl)',
            }}
          >

            <table
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',
                minWidth:
                  '900px',
              }}
            >

              <thead>

                <tr>

                  {[
                    'Asset',
                    'Risk',
                    'ML Anomaly',
                    'Volume',
                    'Price',
                    'Timing',
                    'Wash',
                    'Fusion',
                    'Signals',
                  ].map(
                    heading => (

                      <th
                        key={heading}
                        style={{
                          textAlign:
                            'left',
                          padding:
                            '14px 16px',
                          fontSize:
                            '10px',
                          fontFamily:
                            'var(--font-mono)',
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.08em',
                          color:
                            'var(--text-muted)',
                          borderBottom:
                            '1px solid var(--border-subtle)',
                          whiteSpace:
                            'nowrap',
                        }}
                      >

                        {heading}

                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {SYMBOLS.map(
                  (
                    symbol
                  ) => {

                    const item =
                      riskData[symbol];


                    const score =
                      safeNumber(
                        item?.final_risk_score
                      );


                    const level =
                      String(
                        item?.final_risk_level ||
                        'LOW'
                      ).toUpperCase();


                    return (

                      <tr
                        key={symbol}
                      >

                        <td
                          style={{
                            padding:
                              '16px',
                            fontFamily:
                              'var(--font-mono)',
                            fontWeight:
                              600,
                            color:
                              'var(--text-primary)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {symbol}

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          <RiskBadge
                            risk={level}
                            score={score}
                          />

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            fontSize:
                              '12px',
                            color:
                              isAnomaly(
                                item?.anomaly
                              )
                                ? 'var(--risk-high)'
                                : 'var(--risk-low)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {isAnomaly(
                            item?.anomaly
                          )
                            ? 'Detected'
                            : 'Normal'
                          }

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            fontFamily:
                              'var(--font-mono)',
                            color:
                              'var(--text-secondary)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {safeNumber(
                            item?.agent_scores?.volume
                          ).toFixed(1)}

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            fontFamily:
                              'var(--font-mono)',
                            color:
                              'var(--text-secondary)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {safeNumber(
                            item?.agent_scores?.price
                          ).toFixed(1)}

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            fontFamily:
                              'var(--font-mono)',
                            color:
                              'var(--text-secondary)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {safeNumber(
                            item?.agent_scores?.timing
                          ).toFixed(1)}

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            fontFamily:
                              'var(--font-mono)',
                            color:
                              'var(--text-secondary)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {safeNumber(
                            item?.agent_scores?.wash_trading
                          ).toFixed(1)}

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            fontFamily:
                              'var(--font-mono)',
                            fontWeight:
                              600,
                            color:
                              'var(--text-primary)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {safeNumber(
                            item?.fusion_score
                          ).toFixed(2)}

                        </td>


                        <td
                          style={{
                            padding:
                              '16px',
                            fontFamily:
                              'var(--font-mono)',
                            color:
                              'var(--text-secondary)',
                            borderBottom:
                              '1px solid var(--border-subtle)',
                          }}
                        >

                          {Array.isArray(
                            item?.signals
                          )
                            ? item.signals.length
                            : 0
                          }

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ==================================================
            07 / HIGHEST RISK ASSET
        ================================================== */}

        <section>

          <SectionHeader
            index="07"
            label="Priority Assessment"
            subtitle="Asset currently requiring the most attention from the surveillance engine."
            tight
          />


          {marketStats.highestRisk ? (

            <div
              style={{
                marginTop:
                  'var(--space-4)',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                gap:
                  'var(--space-6)',
                padding:
                  'var(--space-6)',
                background:
                  'var(--surface-0)',
                border:
                  '1px solid var(--border-default)',
                borderRadius:
                  'var(--radius-xl)',
                position:
                  'relative',
                overflow:
                  'hidden',
              }}
            >

              <div
                style={{
                  position:
                    'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background:
                    'var(--amber-500)',
                }}
              />


              <div>

                <div
                  style={{
                    fontSize:
                      '10px',
                    fontFamily:
                      'var(--font-mono)',
                    textTransform:
                      'uppercase',
                    letterSpacing:
                      '0.08em',
                    color:
                      'var(--text-muted)',
                  }}
                >

                  Highest Current Risk

                </div>


                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'baseline',
                    gap: '12px',
                    marginTop:
                      '8px',
                  }}
                >

                  <span
                    style={{
                      fontFamily:
                        'var(--font-display)',
                      fontSize:
                        '34px',
                      fontWeight:
                        700,
                      color:
                        'var(--text-primary)',
                    }}
                  >

                    {
                      marketStats
                        .highestRisk
                        .symbol
                    }

                  </span>


                  <span
                    style={{
                      fontFamily:
                        'var(--font-mono)',
                      fontSize:
                        '14px',
                      color:
                        'var(--text-muted)',
                    }}
                  >

                    Risk Engine

                  </span>

                </div>

              </div>


              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: '20px',
                }}
              >

                <div
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize:
                      '42px',
                    fontWeight:
                      700,
                    color:
                      'var(--text-primary)',
                  }}
                >

                  {safeNumber(
                    marketStats
                      .highestRisk
                      .final_risk_score
                  ).toFixed(2)}

                </div>


                <RiskBadge
                  risk={
                    String(
                      marketStats
                        .highestRisk
                        .final_risk_level ||
                      'LOW'
                    ).toUpperCase()
                  }
                  score={
                    safeNumber(
                      marketStats
                        .highestRisk
                        .final_risk_score
                    )
                  }
                />

              </div>

            </div>

          ) : (

            <div
              style={{
                marginTop:
                  'var(--space-4)',
                padding:
                  'var(--space-8)',
                textAlign:
                  'center',
                color:
                  'var(--text-muted)',
                background:
                  'var(--surface-0)',
                border:
                  '1px solid var(--border-subtle)',
                borderRadius:
                  'var(--radius-lg)',
              }}
            >

              No market data available.

            </div>

          )}

        </section>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          style={{
            display:
              'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            padding:
              '12px 0 4px',
            color:
              'var(--text-faint)',
            fontSize:
              '10px',
            fontFamily:
              'var(--font-mono)',
          }}
        >

          <span>
            CryptoTradeGuard · Live Analytics
          </span>


          <span>

            Updated{' '}

            {formatTimestamp(
              lastUpdated
            )}

          </span>

        </div>

      </div>

    </div>

  );

};


export default Analytics;