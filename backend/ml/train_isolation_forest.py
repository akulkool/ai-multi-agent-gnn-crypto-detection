import pandas as pd
import joblib

from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# --------------------------------------------------
# Paths
# --------------------------------------------------

DATA_FILE = Path(
    "data/processed/BTCUSDT_2026_07_features.csv"
)

MODEL_DIR = Path("models")

MODEL_FILE = MODEL_DIR / "isolation_forest_btcusdt.pkl"
SCALER_FILE = MODEL_DIR / "feature_scaler_btcusdt.pkl"


# --------------------------------------------------
# Features used by the ML model
# --------------------------------------------------

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
    print("BTCUSDT ISOLATION FOREST TRAINING")
    print("=" * 60)

    # --------------------------------------------------
    # Load dataset
    # --------------------------------------------------

    print("\nLoading historical dataset...")

    df = pd.read_csv(DATA_FILE)

    print(f"Rows loaded: {len(df):,}")

    # --------------------------------------------------
    # Select ML features
    # --------------------------------------------------

    X = df[FEATURE_COLUMNS].copy()

    # Remove invalid values
    X = X.replace(
        [float("inf"), float("-inf")],
        pd.NA
    )

    X = X.dropna()

    print(f"Rows after cleaning: {len(X):,}")

    # --------------------------------------------------
    # Scale features
    # --------------------------------------------------

    print("\nScaling features...")

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    # --------------------------------------------------
    # Train Isolation Forest
    # --------------------------------------------------

    print("Training Isolation Forest...")

    model = IsolationForest(
        n_estimators=200,
        contamination=0.01,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_scaled)

    # --------------------------------------------------
    # Generate anomaly predictions
    # --------------------------------------------------

    predictions = model.predict(X_scaled)

    anomaly_scores = model.decision_function(
        X_scaled
    )

    # Isolation Forest:
    #  1  = normal
    # -1  = anomaly

    anomaly_count = (
        predictions == -1
    ).sum()

    normal_count = (
        predictions == 1
    ).sum()

    # --------------------------------------------------
    # Save model and scaler
    # --------------------------------------------------

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

    # --------------------------------------------------
    # Results
    # --------------------------------------------------

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)

    print(f"Total samples:       {len(X):,}")
    print(f"Normal samples:      {normal_count:,}")
    print(f"Anomalies detected:  {anomaly_count:,}")

    print(
        f"\nModel saved to:  {MODEL_FILE}"
    )

    print(
        f"Scaler saved to: {SCALER_FILE}"
    )

    print("=" * 60)


if __name__ == "__main__":
    main()
