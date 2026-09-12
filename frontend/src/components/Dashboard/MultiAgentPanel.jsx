import React, { useEffect, useMemo, useState } from 'react';

import { getRiskSummary } from '../../services/api';

import './MultiAgentPanel.css';


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

const safeNumber = (value) => {

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};


// ============================================================
// GET SIGNALS
// ============================================================

const getSignals = (agent) => {

  if (!agent || !Array.isArray(agent.signals)) {
    return [];
  }

  return agent.signals;
};


// ============================================================
// AGENT MODULE
// ============================================================

const AgentModule = ({
  name,
  role,
  score,
  signals,
  type,
}) => {

  const numericScore = safeNumber(score);

  const status =
    numericScore >= 70
      ? 'active'
      : numericScore > 0
        ? 'completed'
        : 'idle';


  const statusColor =
    status === 'active'
      ? 'var(--amber-500)'
      : status === 'completed'
        ? 'var(--risk-low)'
        : 'var(--text-muted)';


  return (

    <div className={`agent-module agent-module--${type}`}>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="agent-module__header">

        <div className="agent-module__name">
          {name}
        </div>

        <div
          className="agent-module__status"
          style={{
            color: statusColor,
          }}
        >

          <span
            className="agent-module__status-dot"
            style={{
              background: statusColor,
            }}
          />

          {status}

        </div>

      </div>


      {/* ====================================================
          ROLE
      ==================================================== */}

      <div className="agent-module__role">
        {role}
      </div>


      {/* ====================================================
          SCORES
      ==================================================== */}

      <div className="agent-module__scores">

        <div className="agent-module__score-item">

          <span className="agent-module__score-label">
            Score
          </span>

          <span className="agent-module__score-value">
            {numericScore.toFixed(1)}
          </span>

        </div>


        <div className="agent-module__score-item">

          <span className="agent-module__score-label">
            Signals
          </span>

          <span className="agent-module__score-value">
            {signals.length}
          </span>

        </div>

      </div>


      {/* ====================================================
          FINDINGS
      ==================================================== */}

      <ul className="agent-module__findings">

        {signals.length > 0 ? (

          signals
            .slice(0, 2)
            .map((signal, index) => (

              <li
                key={index}
                className="agent-module__finding"
              >
                {signal.replaceAll('_', ' ')}
              </li>

            ))

        ) : (

          <li className="agent-module__finding">
            No abnormal signals
          </li>

        )}

      </ul>

    </div>
  );
};


// ============================================================
// MULTI AGENT PANEL
// ============================================================

const MultiAgentPanel = () => {

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [riskData, setRiskData] = useState({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  // ==========================================================
  // FETCH LIVE DATA
  // ==========================================================

  const fetchData = async () => {

    try {

      const response =
        await getRiskSummary();

      if (
        !response ||
        !response.data
      ) {

        throw new Error(
          'Invalid API response'
        );
      }

      setRiskData(
        response.data
      );

      setError(null);

    } catch (err) {

      console.error(
        'Multi-agent API error:',
        err
      );

      setError(
        err.message ||
        'Unable to load agent data'
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL FETCH + AUTO REFRESH
  // ==========================================================

  useEffect(() => {

    fetchData();

    const interval =
      setInterval(
        fetchData,
        10000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  // ==========================================================
  // COMBINE LIVE DATA
  // ==========================================================

  const cryptoResults = useMemo(() => {

    return SYMBOLS
      .map(
        symbol =>
          riskData[symbol]
      )
      .filter(Boolean);

  }, [riskData]);


  // ==========================================================
  // AVERAGE AGENT SCORES
  // ==========================================================

  const agents = useMemo(() => {

    const total =
      cryptoResults.length;

    if (total === 0) {

      return {
        volume: {
          score: 0,
          signals: [],
        },

        price: {
          score: 0,
          signals: [],
        },

        timing: {
          score: 0,
          signals: [],
        },

        washTrading: {
          score: 0,
          signals: [],
        },
      };
    }


    const buildAgent = (
      agentKey
    ) => {

      const score =
        cryptoResults.reduce(
          (sum, item) =>
            sum +
            safeNumber(
              item.agent_scores?.[
                agentKey
              ]
            ),
          0
        ) / total;


      const signals = [
        ...new Set(
          cryptoResults.flatMap(
            item =>
              getSignals(
                item[
                  agentKey === 'wash_trading'
                    ? 'wash_trading'
                    : agentKey
                ]
              )
          )
        ),
      ];


      return {
        score,
        signals,
      };
    };


    return {

      volume:
        buildAgent(
          'volume'
        ),

      price:
        buildAgent(
          'price'
        ),

      timing:
        buildAgent(
          'timing'
        ),

      washTrading:
        buildAgent(
          'wash_trading'
        ),
    };

  }, [cryptoResults]);


  // ==========================================================
  // FUSION SCORE
  // ==========================================================

  const fusionScore = useMemo(() => {

    if (
      cryptoResults.length === 0
    ) {
      return 0;
    }


    return (
      cryptoResults.reduce(
        (sum, item) =>
          sum +
          safeNumber(
            item.fusion_score
          ),
        0
      ) /
      cryptoResults.length
    );

  }, [cryptoResults]);


  // ==========================================================
  // FINAL RISK SCORE
  // ==========================================================

  const finalRiskScore = useMemo(() => {

    if (
      cryptoResults.length === 0
    ) {
      return 0;
    }


    return (
      cryptoResults.reduce(
        (sum, item) =>
          sum +
          safeNumber(
            item.final_risk_score
          ),
        0
      ) /
      cryptoResults.length
    );

  }, [cryptoResults]);


  // ==========================================================
  // FINAL RISK LEVEL
  // ==========================================================

  const finalRiskLevel = useMemo(() => {

    if (
      cryptoResults.length === 0
    ) {
      return 'LOW';
    }


    const levels =
      cryptoResults.map(
        item =>
          String(
            item.final_risk_level ||
            'LOW'
          ).toUpperCase()
      );


    if (
      levels.includes('HIGH')
    ) {
      return 'HIGH';
    }


    if (
      levels.includes('MEDIUM')
    ) {
      return 'MEDIUM';
    }


    return 'LOW';

  }, [cryptoResults]);


  // ==========================================================
  // ALL SIGNALS
  // ==========================================================

  const fusionSignals = useMemo(() => {

    return [
      ...new Set(
        cryptoResults.flatMap(
          item =>
            Array.isArray(
              item.signals
            )
              ? item.signals
              : []
        )
      ),
    ];

  }, [cryptoResults]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    cryptoResults.length === 0
  ) {

    return (

      <div
        className="multi-agent-panel"
        style={{
          padding: '24px',
          color: 'var(--text-muted)',
        }}
      >
        Loading live agent analysis...
      </div>

    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    cryptoResults.length === 0
  ) {

    return (

      <div
        className="multi-agent-panel"
        style={{
          padding: '24px',
          color: 'var(--risk-high)',
        }}
      >

        Unable to load live agent analysis.

        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          {error}
        </div>

      </div>

    );
  }


  // ==========================================================
  // MAIN PANEL
  // ==========================================================

  return (

    <div className="multi-agent-panel">

      <div className="multi-agent-panel__flow">


        {/* ==================================================
            INPUT
        ================================================== */}

        <div className="multi-agent-panel__flow-input">

          <span>
            Live Binance Market Features
          </span>

        </div>


        <div className="multi-agent-panel__flow-arrow" />


        {/* ==================================================
            FOUR AI AGENTS
        ================================================== */}

        <div
          className="multi-agent-panel__agents"
          style={{
            flexWrap: 'wrap',
          }}
        >

          <AgentModule
            name="Volume Agent"
            role="Analyzes trading volume and imbalance patterns."
            score={agents.volume.score}
            signals={agents.volume.signals}
            type="volume"
          />


          <AgentModule
            name="Price Agent"
            role="Analyzes price movement and volume divergence."
            score={agents.price.score}
            signals={agents.price.signals}
            type="price"
          />


          <AgentModule
            name="Timing Agent"
            role="Analyzes repeated timing and trading patterns."
            score={agents.timing.score}
            signals={agents.timing.signals}
            type="timing"
          />


          <AgentModule
            name="Wash Trading Agent"
            role="Analyzes repeated trades and coordinated behavior."
            score={agents.washTrading.score}
            signals={agents.washTrading.signals}
            type="wash"
          />

        </div>


        <div className="multi-agent-panel__flow-arrow" />


        {/* ==================================================
            FUSION AGENT
        ================================================== */}

        <AgentModule
          name="Fusion Agent"
          role="Combines independent agent signals into a unified risk score."
          score={fusionScore}
          signals={fusionSignals}
          type="fusion"
        />


        <div className="multi-agent-panel__flow-arrow" />


        {/* ==================================================
            FINAL RISK
        ================================================== */}

        <div className="multi-agent-panel__flow-result">

          <span className="multi-agent-panel__result-label">
            Final Risk Assessment
          </span>


          <span className="multi-agent-panel__result-score">
            {finalRiskScore.toFixed(2)} / 100
          </span>


          <span className="multi-agent-panel__result-class">

            {finalRiskLevel}

            {finalRiskLevel === 'HIGH'
              ? ' — High Suspicious Activity'
              : finalRiskLevel === 'MEDIUM'
                ? ' — Moderate Suspicious Activity'
                : ' — Low Suspicious Activity'
            }

          </span>

        </div>


        {/* ==================================================
            MARKET SUMMARY
        ================================================== */}

        <div
          style={{
            marginTop: '18px',
            display: 'flex',
            gap: '18px',
            flexWrap: 'wrap',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >

          <span>
            Markets analyzed: {cryptoResults.length}
          </span>

          <span>
            Fusion score: {fusionScore.toFixed(2)}
          </span>

          <span>
            Final risk: {finalRiskScore.toFixed(2)}
          </span>

        </div>


      </div>

    </div>
  );
};


export default MultiAgentPanel;