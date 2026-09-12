import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getRiskSummary,
} from '../../services/api';

import './RiskDistribution.css';


// ============================================================
// SUPPORTED SYMBOLS
// ============================================================

const SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
];


// ============================================================
// RISK CATEGORIES
// ============================================================

const RISK_LEVELS = [
  {
    label: 'Low',
    key: 'LOW',
    color: 'var(--risk-low)',
  },
  {
    label: 'Medium',
    key: 'MEDIUM',
    color: 'var(--risk-medium)',
  },
  {
    label: 'High',
    key: 'HIGH',
    color: 'var(--risk-high)',
  },
];


// ============================================================
// RISK DISTRIBUTION
// ============================================================

const RiskDistribution = () => {

  const [riskData, setRiskData] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // ==========================================================
  // FETCH DATA
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
        'Risk distribution API error:',
        err
      );

      setError(
        err.message ||
        'Unable to load risk distribution'
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // AUTO REFRESH
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
  // CURRENT RESULTS
  // ==========================================================

  const results = useMemo(() => {

    return SYMBOLS
      .map(
        symbol =>
          riskData[symbol]
      )
      .filter(Boolean);

  }, [riskData]);


  // ==========================================================
  // DISTRIBUTION
  // ==========================================================

  const distribution = useMemo(() => {

    const total =
      results.length;


    return RISK_LEVELS.map(
      level => {

        const count =
          results.filter(
            item =>
              String(
                item.final_risk_level ||
                'LOW'
              ).toUpperCase() ===
              level.key
          ).length;


        const percentage =
          total > 0
            ? (
                (count / total) *
                100
              )
            : 0;


        return {

          ...level,

          count,

          percentage,

        };

      }
    );

  }, [results]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    results.length === 0
  ) {

    return (

      <div
        className="risk-dist"
        style={{
          padding: '20px',
          color: 'var(--text-muted)',
        }}
      >
        Loading live risk distribution...
      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    results.length === 0
  ) {

    return (

      <div
        className="risk-dist"
        style={{
          padding: '20px',
          color: 'var(--risk-high)',
        }}
      >

        Unable to load risk data.

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
  // TOTAL
  // ==========================================================

  const total =
    results.length;


  // ==========================================================
  // MAIN
  // ==========================================================

  return (

    <div className="risk-dist">


      {/* ====================================================
          STACKED BAR
      ==================================================== */}

      <div className="risk-dist__bar">

        {distribution.map(
          item => (

            <div

              key={
                item.key
              }

              className="risk-dist__bar-segment"

              style={{
                width:
                  `${item.percentage}%`,

                background:
                  item.color,
              }}

              title={
                `${item.label}: ` +
                `${item.percentage.toFixed(1)}%`
              }

            />

          )
        )}

      </div>


      {/* ====================================================
          CATEGORIES
      ==================================================== */}

      <div className="risk-dist__categories">

        {distribution.map(
          item => (

            <div
              key={
                item.key
              }
              className="risk-dist__category"
            >


              <div className="risk-dist__cat-header">

                <span
                  className="risk-dist__cat-dot"

                  style={{
                    background:
                      item.color,
                  }}
                />

                <span className="risk-dist__cat-label">

                  {item.label}

                </span>

              </div>


              <div className="risk-dist__cat-count">

                {item.count.toLocaleString()}

              </div>


              <div className="risk-dist__cat-pct">

                {item.percentage.toFixed(1)}%

              </div>


            </div>

          )
        )}

      </div>


      {/* ====================================================
          TOTAL
      ==================================================== */}

      <div className="risk-dist__total">

        Total analyzed:{' '}

        <span>
          {total.toLocaleString()}
        </span>{' '}

        assets

      </div>


      {/* ====================================================
          LIVE ASSET DETAILS
      ==================================================== */}

      <div
        style={{
          marginTop: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >

        {results.map(
          item => (

            <div
              key={
                item.symbol
              }

              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                padding:
                  '8px 0',
                borderBottom:
                  '1px solid var(--border-subtle)',
                fontSize: '12px',
              }}
            >

              <span
                style={{
                  fontWeight: 600,
                }}
              >
                {item.symbol}
              </span>


              <span
                style={{
                  color:
                    item.final_risk_level === 'HIGH'
                      ? 'var(--risk-high)'
                      : item.final_risk_level === 'MEDIUM'
                        ? 'var(--risk-medium)'
                        : 'var(--risk-low)',
                }}
              >

                {Number(
                  item.final_risk_score || 0
                ).toFixed(2)}

                {' · '}

                {String(
                  item.final_risk_level ||
                  'LOW'
                ).toUpperCase()}

              </span>

            </div>

          )
        )}

      </div>


    </div>
  );
};


export default RiskDistribution;