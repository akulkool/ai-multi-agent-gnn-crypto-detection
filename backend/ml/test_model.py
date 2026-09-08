import pandas as pd
import joblib

from pathlib import Path


DATA_FILE = Path(
    "data/processed/BTCUSDT_2026_07_features.csv"
)

MODEL_FILE = Path(
    "models/isolation_forest_btcusdt.pkl"
)

SCALER_FILE = Path(
    "models/feature_scaler_btcusdt.pkl"
)


FEATURE_COLUMNS = [
    "trade_count",
    "total_volume",
    "average_trade_size",
    "price_change_percent",
    "buy_volume",
    "sell_volume",
    "volume_imbalance",
]


def main():

    print("=" * 60)
    print("TESTING ISOLATION FOREST")
    print("=" * 60)

    df = pd.read_csv(DATA_FILE)

    model = joblib.load(MODEL_FILE)
    scaler = joblib.load(SCALER_FILE)

    X = df[FEATURE_COLUMNS]

    X_scaled = scaler.transform(X)

    predictions = model.predict(X_scaled)
    scores = model.decision_function(X_scaled)

    df["prediction"] = predictions
    df["anomaly_score"] = scores

    suspicious = df[
        df["prediction"] == -1
    ].copy()

    suspicious = suspicious.sort_values(
        "anomaly_score"
    )

    print(
        f"\nTotal windows: {len(df):,}"
    )

    print(
        f"Suspicious windows: {len(suspicious):,}"
    )

    print("\nTop 10 most anomalous windows:")
    print("-" * 60)

    print(
        suspicious[
            [
                "timestamp",
                "trade_count",
                "total_volume",
                "average_trade_size",
                "price_change_percent",
                "volume_imbalance",
                "anomaly_score",
            ]
        ].head(10).to_string(index=False)
    )


if __name__ == "__main__":
    main()
