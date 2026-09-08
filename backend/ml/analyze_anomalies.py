import os
import joblib
import pandas as pd


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = "data/processed/multi_crypto_enhanced.csv"

MODEL_PATH = "models/isolation_forest_multi_crypto.pkl"

SCALER_PATH = "models/multi_crypto_scaler.pkl"

TOP_N = 20


# Features used during multi-crypto model training
FEATURE_COLUMNS = [
    "trade_count",
    "total_volume",
    "average_trade_size",
    "price_change_percent",
    "buy_volume",
    "sell_volume",
    "volume_imbalance",
    "trade_size_std",
    "trade_size_cv",
    "repeated_size_ratio",
    "repeated_price_ratio",
    "trade_rate",
    "buy_sell_alternation",
    "price_volume_divergence",
]


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("HISTORICAL MULTI-CRYPTO ANOMALY ANALYSIS")
    print("=" * 60)

    # --------------------------------------------------------
    # Check files
    # --------------------------------------------------------

    if not os.path.exists(DATA_PATH):
        print(f"Dataset not found: {DATA_PATH}")
        return

    if not os.path.exists(MODEL_PATH):
        print(f"Model not found: {MODEL_PATH}")
        return

    if not os.path.exists(SCALER_PATH):
        print(f"Scaler not found: {SCALER_PATH}")
        return

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    print("\nLoading historical dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"Rows loaded: {len(df):,}")

    print("\nRows by symbol:")
    print(df["symbol"].value_counts())

    # --------------------------------------------------------
    # Clean data
    # --------------------------------------------------------

    df = df.dropna(subset=FEATURE_COLUMNS).copy()

    print(f"\nRows after cleaning: {len(df):,}")

    # --------------------------------------------------------
    # Load model and scaler
    # --------------------------------------------------------

    print("\nLoading Isolation Forest model...")

    model = joblib.load(MODEL_PATH)

    print("Model loaded successfully!")

    print("\nLoading scaler...")

    scaler = joblib.load(SCALER_PATH)

    print("Scaler loaded successfully!")

    # --------------------------------------------------------
    # Prepare features
    # --------------------------------------------------------

    print("\nPreparing features...")

    X = df[FEATURE_COLUMNS]

    X_scaled = scaler.transform(X)

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    print("Running anomaly detection...")

    predictions = model.predict(X_scaled)

    anomaly_scores = model.decision_function(X_scaled)

    # Isolation Forest:
    # -1 = anomaly
    #  1 = normal

    df["prediction"] = predictions

    df["anomaly_score"] = anomaly_scores

    df["anomaly"] = df["prediction"] == -1

    # --------------------------------------------------------
    # Overall statistics
    # --------------------------------------------------------

    total_rows = len(df)

    total_anomalies = int(df["anomaly"].sum())

    normal_rows = total_rows - total_anomalies

    anomaly_rate = (
        total_anomalies / total_rows * 100
        if total_rows > 0
        else 0
    )

    print("\n" + "=" * 60)
    print("OVERALL RESULTS")
    print("=" * 60)

    print(f"\nTotal windows: {total_rows:,}")

    print(f"Normal windows: {normal_rows:,}")

    print(f"Anomalous windows: {total_anomalies:,}")

    print(f"Overall anomaly rate: {anomaly_rate:.3f}%")

    # --------------------------------------------------------
    # Per crypto analysis
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("ANOMALY DISTRIBUTION BY CRYPTO")
    print("=" * 60)

    symbols = df["symbol"].unique()

    results = []

    for symbol in sorted(symbols):

        crypto_df = df[df["symbol"] == symbol]

        total = len(crypto_df)

        anomalies = int(crypto_df["anomaly"].sum())

        normal = total - anomalies

        rate = (
            anomalies / total * 100
            if total > 0
            else 0
        )

        results.append({
            "symbol": symbol,
            "total_windows": total,
            "normal_windows": normal,
            "anomalies": anomalies,
            "anomaly_rate_percent": rate,
        })

        print("\n" + "-" * 60)

        print(f"Symbol: {symbol}")

        print(f"Total windows: {total:,}")

        print(f"Normal windows: {normal:,}")

        print(f"Anomalies: {anomalies:,}")

        print(f"Anomaly rate: {rate:.3f}%")

    # --------------------------------------------------------
    # Top suspicious windows
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print(f"TOP {TOP_N} MOST SUSPICIOUS WINDOWS")
    print("=" * 60)

    anomalies_df = df[df["anomaly"]].copy()

    if len(anomalies_df) == 0:

        print("\nNo anomalies detected.")

    else:

        # Lower Isolation Forest score = more anomalous
        anomalies_df = anomalies_df.sort_values(
            by="anomaly_score",
            ascending=True
        )

        display_columns = [
            "symbol",
            "timestamp",
            "trade_count",
            "total_volume",
            "average_trade_size",
            "price_change_percent",
            "volume_imbalance",
            "trade_size_cv",
            "repeated_size_ratio",
            "repeated_price_ratio",
            "trade_rate",
            "buy_sell_alternation",
            "price_volume_divergence",
            "anomaly_score",
        ]

        print()

        print(
            anomalies_df[
                display_columns
            ].head(TOP_N).to_string(
                index=False
            )
        )

    # --------------------------------------------------------
    # Save results
    # --------------------------------------------------------

    output_path = "data/processed/historical_anomaly_results.csv"

    df.to_csv(
        output_path,
        index=False
    )

    print("\n" + "=" * 60)
    print("ANALYSIS COMPLETE")
    print("=" * 60)

    print(f"\nResults saved to:")
    print(output_path)

    # --------------------------------------------------------
    # Save only anomalies
    # --------------------------------------------------------

    anomaly_output = (
        "data/processed/historical_anomalies_only.csv"
    )

    anomalies_df.to_csv(
        anomaly_output,
        index=False
    )

    print("\nAnomalies-only dataset saved to:")
    print(anomaly_output)

    print("\n" + "=" * 60)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
