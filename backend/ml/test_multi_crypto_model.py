import joblib
import pandas as pd


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
    print("MULTI-CRYPTO MODEL TEST")
    print("=" * 60)

    print("\nLoading dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"Rows available: {len(df):,}")

    print("\nLoading model...")

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    print("Model loaded successfully!")

    print("\nTesting one window from each crypto...")

    for symbol in ["BTCUSDT", "ETHUSDT", "SOLUSDT"]:

        sample = df[
            df["symbol"] == symbol
        ].iloc[[0]].copy()

        X = sample[FEATURE_COLUMNS]

        X = X.apply(
            pd.to_numeric,
            errors="coerce"
        )

        X_scaled = scaler.transform(X)

        prediction = model.predict(X_scaled)[0]

        anomaly_score = model.decision_function(
            X_scaled
        )[0]

        print("\n" + "-" * 60)

        print(f"Symbol: {symbol}")

        print(
            f"Timestamp: "
            f"{sample.iloc[0]['timestamp']}"
        )

        print(
            f"Anomaly: "
            f"{prediction == -1}"
        )

        print(
            f"Anomaly Score: "
            f"{anomaly_score:.6f}"
        )

    print("\n" + "=" * 60)
    print("MULTI-CRYPTO MODEL TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
