import pandas as pd

from backend.ml.live_detector import LiveDetector


DATA_PATH = "data/processed/BTCUSDT_2026_07_enhanced.csv"


def main():

    print("=" * 60)
    print("LIVE DETECTOR TEST")
    print("=" * 60)

    print("\nLoading historical feature data...")

    df = pd.read_csv(DATA_PATH)

    print(f"Rows available: {len(df)}")

    # Take one real historical window
    row = df.iloc[0].to_dict()

    print("\nTesting window:")
    print(f"Symbol: {row['symbol']}")
    print(f"Timestamp: {row['timestamp']}")

    print("\nLoading detector...")

    detector = LiveDetector()

    print("\nRunning detection...")

    result = detector.detect(row)

    print("\n" + "=" * 60)
    print("DETECTION RESULT")
    print("=" * 60)

    print(f"Symbol: {result['symbol']}")
    print(f"Timestamp: {result['timestamp']}")

    print("\nML RESULT")
    print("-" * 60)
    print(f"Anomaly: {result['ml_anomaly']}")
    print(f"Anomaly Score: {result['anomaly_score']:.6f}")

    print("\nVOLUME AGENT")
    print("-" * 60)
    print(result["volume_agent"])

    print("\nPRICE AGENT")
    print("-" * 60)
    print(result["price_agent"])

    print("\nTIMING AGENT")
    print("-" * 60)
    print(result["timing_agent"])

    print("\nFUSION RESULT")
    print("-" * 60)
    print(result["fusion"])

    print("\n" + "=" * 60)
    print("LIVE DETECTOR TEST COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
