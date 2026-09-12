import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Search,
  Play,
  ChevronRight,
  X,
  RefreshCw,
} from 'lucide-react';

import SectionHeader from '../components/shared/SectionHeader';

import RiskBadge from '../components/shared/RiskBadge';

import NetworkPattern from '../assets/NetworkPattern';

import {
  getRisk,
} from '../services/api';

import './Detection.css';


// ============================================================
// SUPPORTED CRYPTOCURRENCIES
// ============================================================

const SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
];


// ============================================================
// PIPELINE STAGES
// ============================================================

const PIPELINE_STAGES = [

  {
    id: 'ingest',
    label: 'Data Ingestion',
    desc: 'Receiving live Binance trade data',
  },

  {
    id: 'features',
    label: 'Feature Engineering',
    desc: 'Building one-minute trading features',
  },

  {
    id: 'ml',
    label: 'ML Anomaly Detection',
    desc: 'Isolation Forest evaluating abnormal behavior',
  },

  {
    id: 'agents',
    label: 'Multi-Agent Analysis',
    desc: 'Volume, Price, Timing and Wash Trading agents',
  },

  {
    id: 'fusion',
    label: 'Fusion Layer',
    desc: 'Combining independent agent signals',
  },

  {
    id: 'risk',
    label: 'Risk Assessment',
    desc: 'Generating final risk score and explanation',
  },

];


// ============================================================
// SAFE NUMBER
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


// ============================================================
// BOOLEAN CONVERTER
// ============================================================

const toBoolean = (
  value
) => {

  if (
    value === true ||
    value === false
  ) {
    return value;
  }

  return (
    String(value)
      .toLowerCase() === 'true'
  );
};


// ============================================================
// FORMAT SIGNAL
// ============================================================

const formatSignal = (
  signal
) => {

  if (!signal) {
    return '';
  }

  return String(signal)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );
};


// ============================================================
// FORMAT TIMESTAMP
// ============================================================

const formatTimestamp = (
  timestamp
) => {

  if (!timestamp) {
    return 'Unknown';
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );
};


// ============================================================
// AGENT CARD
// ============================================================

const AgentCard = ({
  name,
  role,
  score,
  signals,
  fusion = false,
}) => {

  const numericScore =
    safeNumber(score);

  const safeSignals =
    Array.isArray(signals)
      ? signals
      : [];


  return (

    <div
      className={
        `detection__agent-card ${
          fusion
            ? 'detection__agent-card--fusion'
            : ''
        }`
      }
    >

      <div className="detection__agent-name">
        {name}
      </div>


      <div className="detection__agent-role">
        {role}
      </div>


      <div className="detection__agent-score">
        {numericScore.toFixed(1)}
      </div>


      <div className="detection__agent-conf">
        {safeSignals.length} signal
        {safeSignals.length === 1
          ? ''
          : 's'}
      </div>


      <ul className="detection__agent-findings">

        {safeSignals.length > 0 ? (

          safeSignals
            .slice(0, 4)
            .map(
              (
                signal,
                index
              ) => (

                <li
                  key={index}
                >
                  {formatSignal(
                    signal
                  )}
                </li>

              )
            )

        ) : (

          <li>
            No abnormal signals
          </li>

        )}

      </ul>

    </div>

  );
};


// ============================================================
// DETECTION COMPONENT
// ============================================================

const Detection = () => {


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState(
    'BTCUSDT'
  );


  const [
    query,
    setQuery,
  ] = useState(
    'BTCUSDT'
  );


  const [
    stage,
    setStage,
  ] = useState(
    null
  );


  const [
    result,
    setResult,
  ] = useState(
    null
  );


  const [
    running,
    setRunning,
  ] = useState(
    false
  );


  const [
    loading,
    setLoading,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    null
  );


  // ==========================================================
  // FETCH RISK DATA
  // ==========================================================

  const fetchRiskData = async (
    symbol
  ) => {

    try {

      setLoading(
        true
      );

      setError(
        null
      );


      const response =
        await getRisk(
          symbol
        );


      if (
        !response ||
        !response.risk
      ) {

        throw new Error(
          `No risk data available for ${symbol}`
        );

      }


      setResult(
        response.risk
      );


      return response.risk;

    } catch (
      err
    ) {

      console.error(
        'Detection API error:',
        err
      );


      setError(
        err.message ||
        'Unable to load detection data'
      );


      return null;

    } finally {

      setLoading(
        false
      );

    }

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    fetchRiskData(
      selectedSymbol
    );

  }, [
    selectedSymbol
  ]);


  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {

    const interval =
      setInterval(
        () => {

          fetchRiskData(
            selectedSymbol
          );

        },
        10000
      );


    return () => {

      clearInterval(
        interval
      );

    };

  }, [
    selectedSymbol
  ]);


  // ==========================================================
  // RUN DETECTION
  // ==========================================================

  const handleRun = async () => {

    if (
      running
    ) {
      return;
    }


    const normalizedSymbol =
      query
        .trim()
        .toUpperCase();


    if (
      !SYMBOLS.includes(
        normalizedSymbol
      )
    ) {

      setError(
        'Select BTCUSDT, ETHUSDT or SOLUSDT.'
      );

      return;

    }


    setSelectedSymbol(
      normalizedSymbol
    );


    setRunning(
      true
    );

    setResult(
      null
    );

    setError(
      null
    );

    setStage(
      0
    );


    // --------------------------------------------------------
    // Animate analysis pipeline
    // --------------------------------------------------------

    for (
      let i = 0;
      i < PIPELINE_STAGES.length;
      i += 1
    ) {

      setStage(
        i
      );


      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            650
          )
      );

    }


    // --------------------------------------------------------
    // Get actual backend result
    // --------------------------------------------------------

    const risk =
      await fetchRiskData(
        normalizedSymbol
      );


    if (
      risk
    ) {

      setStage(
        'done'
      );

    } else {

      setStage(
        null
      );

    }


    setRunning(
      false
    );

  };


  // ==========================================================
  // CLEAR
  // ==========================================================

  const handleClear = () => {

    setQuery(
      ''
    );

    setStage(
      null
    );

    setResult(
      null
    );

    setError(
      null
    );

  };


  // ==========================================================
  // SELECT SYMBOL
  // ==========================================================

  const handleSymbolSelect = (
    symbol
  ) => {

    setQuery(
      symbol
    );

    setSelectedSymbol(
      symbol
    );

    setStage(
      null
    );

    setError(
      null
    );

  };


  // ==========================================================
  // DERIVED VALUES
  // ==========================================================

  const anomaly =
    toBoolean(
      result?.anomaly
    );


  const anomalyScore =
    safeNumber(
      result?.anomaly_score
    );


  const finalRiskScore =
    safeNumber(
      result?.final_risk_score
    );


  const finalRiskLevel =
    String(
      result?.final_risk_level ||
      'LOW'
    ).toUpperCase();


  const fusionScore =
    safeNumber(
      result?.fusion_score
    );


  const washSignalCount =
    safeNumber(
      result?.wash_signal_count
    );


  const allSignals =
    useMemo(() => {

      if (
        !result ||
        !Array.isArray(
          result.signals
        )
      ) {

        return [];

      }

      return [
        ...new Set(
          result.signals
        ),
      ];

    }, [
      result
    ]);


  // ==========================================================
  // IDLE STATE
  // ==========================================================

  const isIdle =
    !result &&
    stage === null;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="detection">


      {/* ====================================================
          HERO
      ==================================================== */}

      <div className="detection__hero">

        <NetworkPattern
          opacity={0.02}
        />


        <div className="detection__hero-content">

          <p className="detection__hero-eyebrow">

            01 / AI Detection Center

          </p>


          <h1 className="detection__hero-title">

            Investigate Suspicious Activity

          </h1>


          <p className="detection__hero-sub">

            Multi-agent AI analysis of live
            cryptocurrency trading behavior using
            Binance market data, machine learning,
            and wash-trading indicators.

          </p>

        </div>

      </div>


      <div className="detection__body">


        {/* ==================================================
            SEARCH + RUN
        ================================================== */}

        <div className="detection__search-panel">


          <div className="detection__search-row">


            <div
              className="detection__search-input-wrap"
            >

              <Search
                size={15}
                className="detection__search-icon"
              />


              <input

                className="detection__search-input"

                type="text"

                placeholder="Enter BTCUSDT, ETHUSDT or SOLUSDT…"

                value={query}

                onChange={
                  e =>
                    setQuery(
                      e.target.value
                    )
                }

                onKeyDown={
                  e =>
                    e.key === 'Enter' &&
                    handleRun()
                }

              />


              {query && (

                <button

                  className="detection__search-clear"

                  onClick={
                    handleClear
                  }

                >

                  <X
                    size={13}
                  />

                </button>

              )}

            </div>


            <button

              className={
                `detection__run-btn ${
                  running
                    ? 'detection__run-btn--running'
                    : ''
                }`
              }

              onClick={
                handleRun
              }

              disabled={
                running ||
                loading
              }

            >

              {running ? (

                <RefreshCw
                  size={14}
                  className="spin"
                />

              ) : (

                <Play
                  size={14}
                  fill="currentColor"
                />

              )}


              {running
                ? 'Analyzing…'
                : 'Run Detection'
              }

            </button>


          </div>


          {/* ==================================================
              SYMBOL BUTTONS
          ================================================== */}

          <div
            className="detection__search-hint"
          >

            Live markets:{' '}


            {SYMBOLS.map(
              (
                symbol,
                index
              ) => (

                <React.Fragment
                  key={symbol}
                >

                  {index > 0 && (
                    <>
                      &nbsp;·&nbsp;
                    </>
                  )}


                  <button

                    className="detection__hint-btn"

                    onClick={() =>
                      handleSymbolSelect(
                        symbol
                      )
                    }

                  >

                    {symbol}

                  </button>

                </React.Fragment>

              )
            )}

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div
              style={{
                marginTop: '10px',
                color: 'var(--risk-high)',
                fontSize: '12px',
              }}
            >

              {error}

            </div>

          )}

        </div>


        {/* ==================================================
            PIPELINE
        ================================================== */}

        {stage !== null && (

          <div
            className="detection__pipeline-section"
          >

            <SectionHeader
              index="02"
              label="Analysis Pipeline"
              tight
            />


            <div
              className="detection__pipeline"
            >

              {PIPELINE_STAGES.map(
                (
                  pipelineStage,
                  index
                ) => {

                  const isDone =
                    stage === 'done' ||
                    (
                      typeof stage === 'number' &&
                      index < stage
                    );


                  const isActive =
                    typeof stage === 'number' &&
                    index === stage;


                  const isPending =
                    typeof stage === 'number' &&
                    index > stage;


                  return (

                    <div

                      key={
                        pipelineStage.id
                      }

                      className={
                        `pipeline-stage ${
                          isActive
                            ? 'pipeline-stage--active'
                            : ''
                        } ${
                          isDone
                            ? 'pipeline-stage--done'
                            : ''
                        } ${
                          isPending
                            ? 'pipeline-stage--pending'
                            : ''
                        }`
                      }

                    >

                      <div
                        className="pipeline-stage__number"
                      >

                        {isDone
                          ? '✓'
                          : String(
                              index + 1
                            ).padStart(
                              2,
                              '0'
                            )
                        }

                      </div>


                      <div
                        className="pipeline-stage__info"
                      >

                        <div
                          className="pipeline-stage__label"
                        >

                          {
                            pipelineStage.label
                          }

                        </div>


                        {isActive && (

                          <div
                            className="pipeline-stage__desc"
                          >

                            {
                              pipelineStage.desc
                            }

                          </div>

                        )}

                      </div>


                      {index <
                        PIPELINE_STAGES.length - 1 && (

                        <ChevronRight
                          size={14}
                          className="pipeline-stage__arrow"
                        />

                      )}

                    </div>

                  );

                }
              )}

            </div>

          </div>

        )}


        {/* ==================================================
            RESULT
        ================================================== */}

        {result && stage === 'done' && (

          <div
            className="detection__result-section"
          >


            <SectionHeader
              index="03"
              label="Detection Result"
              tight
            />


            {/* ==================================================
                RISK SCORE CARD
            ================================================== */}

            <div
              className="detection__result-card"
            >


              <div
                className="detection__result-score-col"
              >

                <div
                  className="detection__result-score-label"
                >

                  Final Risk Score

                </div>


                <div
                  className={
                    `detection__result-score detection__result-score--${
                      finalRiskLevel.toLowerCase()
                    }`
                  }
                >

                  {finalRiskScore.toFixed(2)}

                  <span
                    className="detection__result-score-denom"
                  >
                    /100
                  </span>

                </div>


                <RiskBadge
                  risk={
                    finalRiskLevel
                  }
                  score={
                    finalRiskScore
                  }
                />

              </div>


              {/* ==================================================
                  RESULT META
              ================================================== */}

              <div
                className="detection__result-meta-col"
              >


                <div
                  className="detection__result-meta-item"
                >

                  <span
                    className="detection__result-meta-label"
                  >
                    Monitored Asset
                  </span>

                  <span
                    className="detection__result-meta-value mono"
                  >

                    {result.symbol}

                  </span>

                </div>


                <div
                  className="detection__result-meta-item"
                >

                  <span
                    className="detection__result-meta-label"
                  >
                    Classification
                  </span>

                  <span
                    className="detection__result-meta-value"
                  >

                    {finalRiskLevel === 'HIGH'
                      ? 'High Suspicious Activity'
                      : finalRiskLevel === 'MEDIUM'
                        ? 'Moderate Suspicious Activity'
                        : 'Low Suspicious Activity'
                    }

                  </span>

                </div>


                <div
                  className="detection__result-meta-item"
                >

                  <span
                    className="detection__result-meta-label"
                  >
                    ML Anomaly
                  </span>

                  <span
                    className="detection__result-meta-value"
                  >

                    {anomaly
                      ? 'Detected'
                      : 'Not Detected'
                    }

                  </span>

                </div>


                <div
                  className="detection__result-meta-item"
                >

                  <span
                    className="detection__result-meta-label"
                  >
                    Isolation Forest Score
                  </span>

                  <span
                    className="detection__result-meta-value mono"
                  >

                    {anomalyScore.toFixed(
                      6
                    )}

                  </span>

                </div>


                <div
                  className="detection__result-meta-item"
                >

                  <span
                    className="detection__result-meta-label"
                  >
                    Analysis Timestamp
                  </span>

                  <span
                    className="detection__result-meta-value mono"
                  >

                    {
                      formatTimestamp(
                        result.timestamp
                      )
                    }

                  </span>

                </div>


              </div>

            </div>


            {/* ==================================================
                AGENT SCORES
            ================================================== */}

            <SectionHeader
              index="04"
              label="Multi-Agent Analysis"
              tight
            />


            <div
              className="detection__agents-row"
              style={{
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(190px, 1fr))',
              }}
            >


              <AgentCard

                name="Volume Agent"

                role="Volume and imbalance analysis"

                score={
                  result.agent_scores?.volume
                }

                signals={
                  result.volume?.signals
                }

              />


              <AgentCard

                name="Price Agent"

                role="Price-volume relationship analysis"

                score={
                  result.agent_scores?.price
                }

                signals={
                  result.price?.signals
                }

              />


              <AgentCard

                name="Timing Agent"

                role="Repeated timing and trade pattern analysis"

                score={
                  result.agent_scores?.timing
                }

                signals={
                  result.timing?.signals
                }

              />


              <AgentCard

                name="Wash Trading Agent"

                role="Wash-trading pattern analysis"

                score={
                  result.agent_scores?.wash_trading
                }

                signals={
                  result.wash_trading?.signals
                }

              />


              <AgentCard

                name="Fusion Agent"

                role="Combines all agent signals"

                score={
                  fusionScore
                }

                signals={
                  allSignals
                }

                fusion

              />


            </div>


            {/* ==================================================
                RISK ENGINE SUMMARY
            ================================================== */}

            <SectionHeader
              index="05"
              label="Risk Engine"
              tight
            />


            <div
              className="detection__result-card"
              style={{
                padding: 'var(--space-5)',
                gap: 'var(--space-6)',
              }}
            >

              <div
                style={{
                  flex: 1,
                }}
              >

                <div
                  className="detection__result-meta-label"
                >
                  Final Risk Score
                </div>

                <div
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize: '36px',
                    fontWeight:
                      'var(--font-weight-bold)',
                    marginTop: '6px',
                  }}
                >

                  {finalRiskScore.toFixed(
                    2
                  )}

                </div>

              </div>


              <div
                style={{
                  flex: 1,
                }}
              >

                <div
                  className="detection__result-meta-label"
                >
                  Fusion Score
                </div>

                <div
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize: '36px',
                    fontWeight:
                      'var(--font-weight-bold)',
                    marginTop: '6px',
                  }}
                >

                  {fusionScore.toFixed(
                    2
                  )}

                </div>

              </div>


              <div
                style={{
                  flex: 1,
                }}
              >

                <div
                  className="detection__result-meta-label"
                >
                  Wash Signals
                </div>

                <div
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize: '36px',
                    fontWeight:
                      'var(--font-weight-bold)',
                    marginTop: '6px',
                  }}
                >

                  {washSignalCount}

                </div>

              </div>


              <div
                style={{
                  flex: 1,
                }}
              >

                <div
                  className="detection__result-meta-label"
                >
                  Risk Level
                </div>

                <div
                  style={{
                    marginTop: '10px',
                  }}
                >

                  <RiskBadge
                    risk={
                      finalRiskLevel
                    }
                    score={
                      finalRiskScore
                    }
                  />

                </div>

              </div>

            </div>


            {/* ==================================================
                SUSPICIOUS SIGNALS
            ================================================== */}

            <SectionHeader
              index="06"
              label="Detection Evidence"
              tight
            />


            <div
              className="detection__evidence"
            >

              {allSignals.length > 0 ? (

                allSignals.map(
                  (
                    signal,
                    index
                  ) => {

                    const severity =
                      finalRiskLevel === 'HIGH'
                        ? 'high'
                        : finalRiskLevel === 'MEDIUM'
                          ? 'medium'
                          : 'medium';


                    const severityColor =
                      finalRiskLevel === 'HIGH'
                        ? 'var(--risk-high)'
                        : 'var(--amber-500)';


                    const severityBackground =
                      finalRiskLevel === 'HIGH'
                        ? 'rgba(249,115,22,.08)'
                        : 'var(--amber-subtle)';


                    const severityBorder =
                      finalRiskLevel === 'HIGH'
                        ? 'rgba(249,115,22,.2)'
                        : 'var(--amber-subtle-border)';


                    return (

                      <div

                        key={
                          `${signal}-${index}`
                        }

                        className="detection__evidence-item"

                        style={{
                          borderLeft:
                            `3px solid ${severityColor}`,

                          background:
                            severityBackground,

                          border:
                            `1px solid ${severityBorder}`,

                          borderLeftColor:
                            severityColor,
                        }}

                      >

                        <div
                          className="detection__evidence-header"
                        >

                          <span

                            className="detection__evidence-type"

                            style={{
                              color:
                                severityColor,
                            }}

                          >

                            {formatSignal(
                              signal
                            )}

                          </span>


                          <span

                            className="detection__evidence-severity"

                            style={{
                              color:
                                severityColor,

                              borderColor:
                                severityBorder,

                              background:
                                severityBackground,
                            }}

                          >

                            {severity}

                          </span>

                        </div>


                        <p
                          className="detection__evidence-desc"
                        >

                          This signal was identified
                          by the live multi-agent
                          surveillance system for{' '}

                          <strong>
                            {result.symbol}
                          </strong>.

                        </p>


                        <div
                          className="detection__evidence-metric mono"
                        >

                          Agent-detected signal ·{' '}

                          {formatSignal(
                            signal
                          )}

                        </div>

                      </div>

                    );

                  }
                )

              ) : (

                <div
                  className="detection__evidence-item"
                  style={{
                    borderLeft:
                      '3px solid var(--risk-low)',
                    background:
                      'var(--surface-0)',
                  }}
                >

                  <div
                    className="detection__evidence-header"
                  >

                    <span
                      className="detection__evidence-type"
                      style={{
                        color:
                          'var(--risk-low)',
                      }}
                    >
                      No Suspicious Signals
                    </span>

                  </div>


                  <p
                    className="detection__evidence-desc"
                  >

                    The current analysis window
                    did not produce suspicious
                    trading signals.

                  </p>

                </div>

              )}

            </div>


            {/* ==================================================
                EXPLANATION
            ================================================== */}

            <SectionHeader
              index="07"
              label="Risk Explanation"
              tight
            />


            <div
              className="detection__result-card"
              style={{
                padding: 'var(--space-5)',
              }}
            >

              <div
                className="detection__result-meta-col"
              >

                <div
                  className="detection__result-meta-label"
                >
                  Risk Engine Assessment
                </div>


                <div
                  className="detection__result-meta-value"
                  style={{
                    lineHeight: 1.7,
                    marginTop: '4px',
                  }}
                >

                  {
                    result.risk_explanation ||
                    result.risk_engine?.explanation ||
                    'No explanation available.'
                  }

                </div>

              </div>

            </div>


          </div>

        )}


        {/* ==================================================
            IDLE STATE
        ================================================== */}

        {isIdle && (

          <div
            className="detection__idle"
          >

            <div
              className="detection__idle-graphic"
            >

              <svg

                viewBox="0 0 120 80"

                fill="none"

                xmlns="http://www.w3.org/2000/svg"

                width="120"

                height="80"

              >

                <circle
                  cx="60"
                  cy="40"
                  r="12"
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                />


                <circle
                  cx="20"
                  cy="20"
                  r="6"
                  stroke="var(--border-default)"
                  strokeWidth="1"
                />


                <circle
                  cx="100"
                  cy="20"
                  r="6"
                  stroke="var(--border-default)"
                  strokeWidth="1"
                />


                <circle
                  cx="20"
                  cy="60"
                  r="6"
                  stroke="var(--border-default)"
                  strokeWidth="1"
                />


                <circle
                  cx="100"
                  cy="60"
                  r="6"
                  stroke="var(--border-default)"
                  strokeWidth="1"
                />


                <line
                  x1="26"
                  y1="23"
                  x2="50"
                  y2="35"
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                />


                <line
                  x1="94"
                  y1="23"
                  x2="70"
                  y2="35"
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                />


                <line
                  x1="26"
                  y1="57"
                  x2="50"
                  y2="45"
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                />


                <line
                  x1="94"
                  y1="57"
                  x2="70"
                  y2="45"
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                />

              </svg>

            </div>


            <div
              className="detection__idle-title"
            >
              Ready for Analysis
            </div>


            <p
              className="detection__idle-desc"
            >

              Select a live cryptocurrency market
              and run detection to investigate its
              current trading behavior using the
              CryptoTradeGuard multi-agent AI system.

            </p>

          </div>

        )}

      </div>

    </div>

  );

};


export default Detection;