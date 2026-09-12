import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Radio,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import SectionHeader from '../components/shared/SectionHeader';
import RiskBadge from '../components/shared/RiskBadge';

import {
  getRiskSummary,
} from '../services/api';


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

  return String(value).toLowerCase() === 'true';
};


// ============================================================
// SIGNAL FORMATTER
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
      letter => letter.toUpperCase()
    );
};


// ============================================================
// TIME FORMATTER
// ============================================================

const formatTime = (
  timestamp
) => {

  if (!timestamp) {
    return '--:--:--';
  }

  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '--:--:--';
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  );
};


// ============================================================
// RISK CLASS
// ============================================================

const riskClass = (
  risk
) => {

  const score =
    safeNumber(risk);

  if (score >= 70) {
    return 'HIGH';
  }

  if (score >= 50) {
    return 'MEDIUM';
  }

  return 'LOW';
};


// ============================================================
// AGENT BAR
// ============================================================

const AgentBar = ({
  label,
  score,
}) => {

  const numericScore =
    safeNumber(score);

  return (

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 48px',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
      }}
    >

      <span
        style={{
          color:
            'var(--text-secondary)',
          fontSize: '11px',
        }}
      >
        {label}
      </span>


      <div
        style={{
          height: '5px',
          background:
            'var(--surface-2)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}
      >

        <div
          style={{
            width:
              `${Math.min(
                100,
                Math.max(
                  0,
                  numericScore
                )
              )}%`,
            height: '100%',
            background:
              numericScore >= 70
                ? 'var(--risk-high)'
                : numericScore >= 50
                  ? 'var(--amber-500)'
                  : 'var(--risk-low)',
            borderRadius: '99px',
            transition:
              'width .4s ease',
          }}
        />

      </div>


      <span
        className="mono"
        style={{
          color:
            'var(--text-primary)',
          fontSize: '11px',
          textAlign: 'right',
        }}
      >
        {numericScore.toFixed(0)}
      </span>

    </div>

  );
};


// ============================================================
// LIVE MONITORING
// ============================================================

const LiveMonitoring = () => {


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    assets,
    setAssets,
  ] = useState({});


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState(null);


  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);


  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState('BTCUSDT');


  // ==========================================================
  // FETCH LIVE DATA
  // ==========================================================

  const fetchLiveData = async () => {

    try {

      setLoading(true);

      setError(null);

      const response =
        await getRiskSummary();

      if (
        response &&
        response.data
      ) {

        setAssets(
          response.data
        );

        setLastUpdated(
          new Date()
        );

      }

    } catch (err) {

      console.error(
        'Live monitoring API error:',
        err
      );

      setError(
        err.message ||
        'Unable to connect to the live detection engine.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD + REFRESH
  // ==========================================================

  useEffect(() => {

    fetchLiveData();

    const interval =
      setInterval(
        fetchLiveData,
        5000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  // ==========================================================
  // SELECTED ASSET
  // ==========================================================

  const selected =
    assets[selectedSymbol] || null;


  // ==========================================================
  // DERIVED LIVE METRICS
  // ==========================================================

  const monitoredAssets =
    SYMBOLS.filter(
      symbol =>
        Boolean(
          assets[symbol]
        )
    );


  const suspiciousAssets =
    monitoredAssets.filter(
      symbol => {

        const data =
          assets[symbol];

        const score =
          safeNumber(
            data?.final_risk_score
          );

        return (
          score >= 50 ||
          toBoolean(
            data?.anomaly
          )
        );

      }
    );


  const highRiskAssets =
    monitoredAssets.filter(
      symbol =>
        safeNumber(
          assets[symbol]?.final_risk_score
        ) >= 70
    );


  const mlAnomalies =
    monitoredAssets.filter(
      symbol =>
        toBoolean(
          assets[symbol]?.anomaly
        )
    );


  const averageRisk =
    monitoredAssets.length
      ? monitoredAssets.reduce(
          (
            sum,
            symbol
          ) =>
            sum +
            safeNumber(
              assets[symbol]
                ?.final_risk_score
            ),
          0
        ) /
        monitoredAssets.length
      : 0;


  const totalSignals =
    monitoredAssets.reduce(
      (
        sum,
        symbol
      ) =>
        sum +
        (
          Array.isArray(
            assets[symbol]?.signals
          )
            ? assets[symbol].signals.length
            : 0
        ),
      0
    );


  // ==========================================================
  // SIGNAL FEED
  // ==========================================================

  const signalFeed =
    useMemo(() => {

      const feed = [];

      SYMBOLS.forEach(
        symbol => {

          const data =
            assets[symbol];

          if (!data) {
            return;
          }

          const signals =
            Array.isArray(
              data.signals
            )
              ? data.signals
              : [];

          signals
            .slice(0, 5)
            .forEach(
              signal => {

                feed.push({
                  symbol,
                  signal,
                  timestamp:
                    data.timestamp,
                  risk:
                    safeNumber(
                      data.final_risk_score
                    ),
                  level:
                    String(
                      data.final_risk_level ||
                      riskClass(
                        data.final_risk_score
                      )
                    ).toUpperCase(),
                });

              }
            );

        }
      );

      return feed
        .sort(
          (a, b) =>
            new Date(b.timestamp) -
            new Date(a.timestamp)
        )
        .slice(0, 10);

    }, [
      assets,
    ]);


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      style={{
        padding:
          'var(--space-8)',
        display:
          'flex',
        flexDirection:
          'column',
        gap:
          'var(--space-6)',
        maxWidth:
          'var(--content-max-width)',
      }}
    >


      {/* ====================================================
          HEADER
      ==================================================== */}

      <SectionHeader

        index="01"

        label="Live Monitoring"

        title="Real-Time Market Surveillance"

        subtitle="Continuous monitoring of live Binance market behavior through the CryptoTradeGuard AI detection pipeline."

      />


      {/* ====================================================
          CONNECTION STATUS
      ==================================================== */}

      <div
        style={{
          display:
            'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          padding:
            '12px 15px',
          background:
            'var(--surface-0)',
          border:
            '1px solid var(--border-subtle)',
          borderRadius:
            'var(--radius-md)',
          gap:
            '16px',
          flexWrap:
            'wrap',
        }}
      >

        <div
          style={{
            display:
              'flex',
            alignItems:
              'center',
            gap:
              '9px',
          }}
        >

          <span
            style={{
              width:
                '8px',
              height:
                '8px',
              borderRadius:
                '50%',
              background:
                error
                  ? 'var(--risk-high)'
                  : 'var(--risk-low)',
              boxShadow:
                error
                  ? 'none'
                  : '0 0 10px var(--risk-low)',
            }}
          />


          <span
            style={{
              color:
                error
                  ? 'var(--risk-high)'
                  : 'var(--risk-low)',
              fontSize:
                '12px',
              fontWeight:
                'var(--font-weight-semibold)',
            }}
          >

            {error
              ? 'ENGINE DISCONNECTED'
              : 'LIVE ENGINE OPERATIONAL'}

          </span>


          <span
            style={{
              color:
                'var(--text-muted)',
              fontSize:
                '11px',
            }}
          >
            · 5s refresh
          </span>

        </div>


        <div
          style={{
            display:
              'flex',
            alignItems:
              'center',
            gap:
              '14px',
          }}
        >

          {lastUpdated && (

            <span
              className="mono"
              style={{
                color:
                  'var(--text-muted)',
                fontSize:
                  '11px',
              }}
            >

              Last update{' '}

              {lastUpdated.toLocaleTimeString(
                [],
                {
                  hour:
                    '2-digit',
                  minute:
                    '2-digit',
                  second:
                    '2-digit',
                }
              )}

            </span>

          )}


          <button

            onClick={
              fetchLiveData
            }

            disabled={
              loading
            }

            style={{
              display:
                'inline-flex',
              alignItems:
                'center',
              gap:
                '6px',
              padding:
                '6px 10px',
              background:
                'var(--surface-1)',
              border:
                '1px solid var(--border-default)',
              borderRadius:
                'var(--radius-md)',
              color:
                'var(--text-secondary)',
              fontSize:
                '11px',
              cursor:
                loading
                  ? 'default'
                  : 'pointer',
            }}
          >

            <RefreshCw
              size={12}
              className={
                loading
                  ? 'spin'
                  : ''
              }
            />

            Refresh

          </button>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div
          style={{
            padding:
              '12px 14px',
            background:
              'rgba(239,68,68,.06)',
            border:
              '1px solid rgba(239,68,68,.2)',
            borderRadius:
              'var(--radius-md)',
            color:
              'var(--risk-high)',
            fontSize:
              '12px',
          }}
        >

          {error}

        </div>

      )}


      {/* ====================================================
          TOP METRICS
      ==================================================== */}

      <div
        style={{
          display:
            'grid',
          gridTemplateColumns:
            'repeat(4, minmax(0, 1fr))',
          gap:
            'var(--space-4)',
        }}
      >

        {[
          [
            'Assets Monitored',
            monitoredAssets.length,
            Activity,
          ],
          [
            'Suspicious Assets',
            suspiciousAssets.length,
            AlertTriangle,
          ],
          [
            'High-Risk Assets',
            highRiskAssets.length,
            ShieldCheck,
          ],
          [
            'ML Anomalies',
            mlAnomalies.length,
            Zap,
          ],
        ].map(
          (
            item
          ) => {

            const [
              label,
              value,
              Icon,
            ] = item;

            return (

              <div
                key={label}
                style={{
                  background:
                    'var(--surface-0)',
                  border:
                    '1px solid var(--border-subtle)',
                  borderRadius:
                    'var(--radius-lg)',
                  padding:
                    'var(--space-5)',
                }}
              >

                <div
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                  }}
                >

                  <span
                    style={{
                      color:
                        'var(--text-muted)',
                      fontSize:
                        '10px',
                      textTransform:
                        'uppercase',
                      letterSpacing:
                        '.08em',
                    }}
                  >
                    {label}
                  </span>


                  <Icon
                    size={14}
                    style={{
                      color:
                        'var(--text-muted)',
                    }}
                  />

                </div>


                <div
                  style={{
                    marginTop:
                      '9px',
                    fontFamily:
                      'var(--font-display)',
                    fontSize:
                      '28px',
                    fontWeight:
                      'var(--font-weight-bold)',
                  }}
                >

                  {value}

                </div>

              </div>

            );

          }
        )}

      </div>


      {/* ====================================================
          ASSET MONITOR
      ==================================================== */}

      <SectionHeader

        index="02"

        label="Asset Monitor"

        title="Live Risk Overview"

        subtitle="Current surveillance state across monitored cryptocurrency markets."

        tight

      />


      <div
        style={{
          display:
            'grid',
          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
          gap:
            'var(--space-4)',
        }}
      >

        {SYMBOLS.map(
          symbol => {

            const data =
              assets[symbol];

            const score =
              safeNumber(
                data?.final_risk_score
              );

            const level =
              String(
                data?.final_risk_level ||
                riskClass(score)
              ).toUpperCase();

            const anomaly =
              toBoolean(
                data?.anomaly
              );

            const active =
              selectedSymbol === symbol;

            return (

              <button

                key={symbol}

                onClick={() =>
                  setSelectedSymbol(
                    symbol
                  )
                }

                style={{
                  textAlign:
                    'left',
                  padding:
                    'var(--space-5)',
                  background:
                    active
                      ? 'var(--surface-1)'
                      : 'var(--surface-0)',
                  border:
                    active
                      ? '1px solid var(--amber-500)'
                      : '1px solid var(--border-subtle)',
                  borderRadius:
                    'var(--radius-lg)',
                  color:
                    'var(--text-primary)',
                  cursor:
                    'pointer',
                  transition:
                    'border-color .2s ease',
                }}

              >

                <div
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                  }}
                >

                  <span
                    className="mono"
                    style={{
                      fontSize:
                        '13px',
                      fontWeight:
                        'var(--font-weight-semibold)',
                    }}
                  >
                    {symbol}
                  </span>


                  <RiskBadge
                    risk={level}
                    score={score}
                    size="sm"
                  />

                </div>


                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'baseline',
                    gap:
                      '6px',
                    marginTop:
                      '20px',
                  }}
                >

                  <span
                    style={{
                      fontFamily:
                        'var(--font-display)',
                      fontSize:
                        '34px',
                      fontWeight:
                        'var(--font-weight-bold)',
                    }}
                  >
                    {score.toFixed(2)}
                  </span>

                  <span
                    style={{
                      color:
                        'var(--text-muted)',
                      fontSize:
                        '11px',
                    }}
                  >
                    / 100
                  </span>

                </div>


                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap:
                      '8px',
                    marginTop:
                      '12px',
                    color:
                      anomaly
                        ? 'var(--risk-high)'
                        : 'var(--text-muted)',
                    fontSize:
                      '11px',
                  }}
                >

                  <span
                    style={{
                      width:
                        '6px',
                      height:
                        '6px',
                      borderRadius:
                        '50%',
                      background:
                        anomaly
                          ? 'var(--risk-high)'
                          : 'var(--risk-low)',
                    }}
                  />

                  {anomaly
                    ? 'Isolation Forest anomaly detected'
                    : 'ML behavior within normal range'}

                </div>


                <div
                  style={{
                    marginTop:
                      '14px',
                    color:
                      'var(--text-muted)',
                    fontSize:
                      '10px',
                  }}
                >

                  Updated{' '}

                  {formatTime(
                    data?.timestamp
                  )}

                </div>

              </button>

            );

          }
        )}

      </div>


      {/* ====================================================
          SELECTED ASSET DETAILS
      ==================================================== */}

      {selected && (

        <>

          <SectionHeader

            index="03"

            label="Agent Intelligence"

            title={`${selectedSymbol} Detection State`}

            subtitle="Independent agent assessments and fusion output from the live detection engine."

            tight

          />


          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                '1.2fr .8fr',
              gap:
                'var(--space-5)',
            }}
          >


            {/* AGENTS */}

            <div
              style={{
                background:
                  'var(--surface-0)',
                border:
                  '1px solid var(--border-subtle)',
                borderRadius:
                  'var(--radius-lg)',
                padding:
                  'var(--space-5)',
              }}
            >

              <div
                style={{
                  color:
                    'var(--text-muted)',
                  fontSize:
                    '10px',
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '.08em',
                  marginBottom:
                    '18px',
                }}
              >
                Agent Scores
              </div>


              <AgentBar
                label="Volume Agent"
                score={
                  selected.agent_scores?.volume
                }
              />


              <AgentBar
                label="Price Agent"
                score={
                  selected.agent_scores?.price
                }
              />


              <AgentBar
                label="Timing Agent"
                score={
                  selected.agent_scores?.timing
                }
              />


              <AgentBar
                label="Wash Trading"
                score={
                  selected.agent_scores?.wash_trading
                }
              />


              <div
                style={{
                  borderTop:
                    '1px solid var(--border-subtle)',
                  marginTop:
                    '18px',
                  paddingTop:
                    '18px',
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                }}
              >

                <span
                  style={{
                    color:
                      'var(--text-secondary)',
                    fontSize:
                      '11px',
                  }}
                >
                  Fusion Score
                </span>


                <span
                  className="mono"
                  style={{
                    fontSize:
                      '18px',
                    fontWeight:
                      'var(--font-weight-semibold)',
                  }}
                >
                  {safeNumber(
                    selected.fusion_score
                  ).toFixed(2)}
                </span>

              </div>

            </div>


            {/* RISK */}

            <div
              style={{
                background:
                  'var(--surface-0)',
                border:
                  '1px solid var(--border-subtle)',
                borderRadius:
                  'var(--radius-lg)',
                padding:
                  'var(--space-5)',
                display:
                  'flex',
                flexDirection:
                  'column',
                justifyContent:
                  'space-between',
              }}
            >

              <div>

                <div
                  style={{
                    color:
                      'var(--text-muted)',
                    fontSize:
                      '10px',
                    textTransform:
                      'uppercase',
                    letterSpacing:
                      '.08em',
                  }}
                >
                  Final Risk Assessment
                </div>


                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'baseline',
                    gap:
                      '7px',
                    marginTop:
                      '10px',
                  }}
                >

                  <span
                    style={{
                      fontFamily:
                        'var(--font-display)',
                      fontSize:
                        '46px',
                      fontWeight:
                        'var(--font-weight-bold)',
                    }}
                  >

                    {safeNumber(
                      selected.final_risk_score
                    ).toFixed(2)}

                  </span>


                  <span
                    style={{
                      color:
                        'var(--text-muted)',
                      fontSize:
                        '11px',
                    }}
                  >
                    /100
                  </span>

                </div>


                <div
                  style={{
                    marginTop:
                      '8px',
                  }}
                >

                  <RiskBadge

                    risk={
                      String(
                        selected.final_risk_level ||
                        riskClass(
                          selected.final_risk_score
                        )
                      ).toUpperCase()
                    }

                    score={
                      safeNumber(
                        selected.final_risk_score
                      )
                    }

                  />

                </div>

              </div>


              <div
                style={{
                  marginTop:
                    '24px',
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap:
                    '12px',
                }}
              >

                <div>

                  <div
                    style={{
                      color:
                        'var(--text-muted)',
                      fontSize:
                        '10px',
                    }}
                  >
                    ML Anomaly
                  </div>

                  <div
                    style={{
                      marginTop:
                        '4px',
                      color:
                        toBoolean(
                          selected.anomaly
                        )
                          ? 'var(--risk-high)'
                          : 'var(--risk-low)',
                      fontSize:
                        '12px',
                    }}
                  >
                    {toBoolean(
                      selected.anomaly
                    )
                      ? 'Detected'
                      : 'Normal'}
                  </div>

                </div>


                <div>

                  <div
                    style={{
                      color:
                        'var(--text-muted)',
                      fontSize:
                        '10px',
                    }}
                  >
                    Wash Signals
                  </div>

                  <div
                    className="mono"
                    style={{
                      marginTop:
                        '4px',
                      fontSize:
                        '12px',
                    }}
                  >
                    {safeNumber(
                      selected.wash_signal_count
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              SIGNALS
          ================================================== */}

          <SectionHeader

            index="04"

            label="Live Signal Feed"

            title="Detected Market Signals"

            subtitle="Signals currently emitted by the multi-agent surveillance system."

            tight

          />


          <div
            style={{
              background:
                'var(--surface-0)',
              border:
                '1px solid var(--border-subtle)',
              borderRadius:
                'var(--radius-lg)',
              overflow:
                'hidden',
            }}
          >

            {signalFeed.length > 0 ? (

              signalFeed.map(
                (
                  item,
                  index
                ) => (

                  <div

                    key={
                      `${item.symbol}-${item.signal}-${index}`
                    }

                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        '110px 1fr 90px 80px',
                      alignItems:
                        'center',
                      gap:
                        '16px',
                      padding:
                        '13px 16px',
                      borderBottom:
                        index <
                        signalFeed.length - 1
                          ? '1px solid var(--border-subtle)'
                          : 'none',
                    }}
                  >

                    <span
                      className="mono"
                      style={{
                        color:
                          'var(--amber-500)',
                        fontSize:
                          '11px',
                      }}
                    >
                      {item.symbol}
                    </span>


                    <span
                      style={{
                        color:
                          'var(--text-secondary)',
                        fontSize:
                          '12px',
                      }}
                    >
                      {formatSignal(
                        item.signal
                      )}
                    </span>


                    <RiskBadge

                      risk={
                        item.level
                      }

                      score={
                        item.risk
                      }

                      size="sm"

                    />


                    <span
                      className="mono"
                      style={{
                        color:
                          'var(--text-muted)',
                        fontSize:
                          '10px',
                        textAlign:
                          'right',
                      }}
                    >
                      {formatTime(
                        item.timestamp
                      )}
                    </span>

                  </div>

                )

              )

            ) : (

              <div
                style={{
                  padding:
                    '30px',
                  textAlign:
                    'center',
                  color:
                    'var(--text-muted)',
                  fontSize:
                    '12px',
                }}
              >

                No live signals currently available.

              </div>

            )}

          </div>


          {/* ==================================================
              ENGINE EXPLANATION
          ================================================== */}

          <div
            style={{
              background:
                'var(--surface-0)',
              border:
                '1px solid var(--border-subtle)',
              borderRadius:
                'var(--radius-lg)',
              padding:
                'var(--space-5)',
            }}
          >

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap:
                  '8px',
                color:
                  'var(--text-muted)',
                fontSize:
                  '10px',
                textTransform:
                  'uppercase',
                letterSpacing:
                  '.08em',
              }}
            >

              <Radio
                size={13}
              />

              Risk Engine Explanation

            </div>


            <p
              style={{
                margin:
                  '12px 0 0',
                color:
                  'var(--text-secondary)',
                fontSize:
                  '12px',
                lineHeight:
                  1.7,
              }}
            >

              {selected.risk_explanation ||
                selected.risk_engine?.explanation ||
                'No explanation available.'}

            </p>

          </div>

        </>

      )}


      {/* ====================================================
          FOOTER STATUS
      ==================================================== */}

      <div
        style={{
          display:
            'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          color:
            'var(--text-muted)',
          fontSize:
            '10px',
          borderTop:
            '1px solid var(--border-subtle)',
          paddingTop:
            'var(--space-4)',
        }}
      >

        <span>
          CryptoTradeGuard · Live Market Surveillance
        </span>

        <span className="mono">
          {totalSignals} active signals · avg risk{' '}
          {averageRisk.toFixed(2)}
        </span>

      </div>

    </div>

  );

};


export default LiveMonitoring;