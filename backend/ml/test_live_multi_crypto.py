import pandas as pd

from backend.ml.live_detector import LiveDetector


DATA_PATH = (
    "data/processed/"
    "multi_crypto_enhanced.csv"
)


def main():

    print("=" * 60)
    print("LIVE MULTI-CRYPTO DETECTOR TEST")
    print("=" * 60)

    df = pd.read_csv(
        DATA_PATH
    )

    detector = LiveDetector()

    for symbol in [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
    ]:

        sample = df[
            df["symbol"] == symbol
        ].iloc[0].to_dict()

        result = detector.detect(
            sample
        )

        print("\n" + "-" * 60)

        print(
            f"Symbol: "
            f"{result['symbol']}"
        )

        print(
            f"Timestamp: "
            f"{result['timestamp']}"
        )

        print(
            f"Anomaly: "
            f"{result['anomaly']}"
        )

        print(
            f"Anomaly Score: "
            f"{result['anomaly_score']:.6f}"
        )

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
