import os

import joblib
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


DATA_PATH = "data/processed/multi_crypto_enhanced.csv"

MODEL_PATH = "models/isolation_forest_multi_crypto.pkl"
SCALER_PATH = "models/multi_crypto_scaler.pkl"


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


def main():

    print("=" * 60)
    print("MULTI-CRYPTO ISOLATION FOREST TRAINING")
    print("=" * 60)

    print("\nLoading multi-crypto dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"Rows loaded: {len(df):,}")

    print("\nRows by symbol:")
    print(df["symbol"].value_counts())

    # Keep only required features
    data = df[FEATURE_COLUMNS].copy()

    # Convert to numeric
    data = data.apply(
        pd.to_numeric,
        errors="coerce"
    )

    # Remove invalid rows
    valid_mask = data.notna().all(axis=1)

    data = data[valid_mask]
    df = df.loc[valid_mask].copy()

    print(f"\nRows after cleaning: {len(data):,}")

    print("\nScaling features...")

    scaler = StandardScaler()

    X = scaler.fit_transform(data)

    print("Training Isolation Forest...")

    model = IsolationForest(
        n_estimators=200,
        contamination=0.01,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X)

    predictions = model.predict(X)

    anomaly_count = (predictions == -1).sum()
    normal_count = (predictions == 1).sum()

    os.makedirs("models", exist_ok=True)

    joblib.dump(
        model,
        MODEL_PATH
    )

    joblib.dump(
        scaler,
        SCALER_PATH
    )

    print("\n" + "=" * 60)
    print("MULTI-CRYPTO MODEL TRAINING COMPLETE")
    print("=" * 60)

    print(f"\nTotal samples: {len(X):,}")
    print(f"Normal samples: {normal_count:,}")
    print(f"Anomalies detected: {anomaly_count:,}")

    print("\nCrypto distribution:")

    df["prediction"] = predictions

    for symbol in sorted(df["symbol"].unique()):

        symbol_df = df[df["symbol"] == symbol]

        anomalies = (
            symbol_df["prediction"] == -1
        ).sum()

        print(
            f"{symbol}: "
            f"{len(symbol_df):,} samples, "
            f"{anomalies:,} anomalies"
        )

    print(f"\nModel saved to: {MODEL_PATH}")
    print(f"Scaler saved to: {SCALER_PATH}")

    print("=" * 60)


if __name__ == "__main__":
    main()
