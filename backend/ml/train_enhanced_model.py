import pandas as pd
import joblib

from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


DATA_FILE = Path(
    "data/processed/BTCUSDT_2026_07_enhanced.csv"
)

MODEL_DIR = Path("models")

MODEL_FILE = MODEL_DIR / "isolation_forest_enhanced_btcusdt.pkl"
SCALER_FILE = MODEL_DIR / "enhanced_scaler_btcusdt.pkl"


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
    print("ENHANCED BTCUSDT ANOMALY MODEL")
    print("=" * 60)

    print("\nLoading enhanced dataset...")

    df = pd.read_csv(DATA_FILE)

    print(f"Rows loaded: {len(df):,}")

    X = df[FEATURE_COLUMNS].copy()

    X = X.replace(
        [float("inf"), float("-inf")],
        pd.NA
    )

    X = X.dropna()

    print(f"Rows after cleaning: {len(X):,}")

    print("\nScaling features...")

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    print("Training Isolation Forest...")

    model = IsolationForest(
        n_estimators=300,
        contamination=0.01,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_scaled)

    predictions = model.predict(X_scaled)

    anomaly_scores = model.decision_function(
        X_scaled
    )

    anomaly_count = (
        predictions == -1
    ).sum()

    normal_count = (
        predictions == 1
    ).sum()

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        model,
        MODEL_FILE
    )

    joblib.dump(
        scaler,
        SCALER_FILE
    )

    print("\n" + "=" * 60)
    print("ENHANCED MODEL TRAINING COMPLETE")
    print("=" * 60)

    print(f"Total samples:      {len(X):,}")
    print(f"Normal samples:     {normal_count:,}")
    print(f"Anomalies detected: {anomaly_count:,}")

    print(f"\nModel:  {MODEL_FILE}")
    print(f"Scaler: {SCALER_FILE}")

    print("=" * 60)


if __name__ == "__main__":
    main()
