import pandas as pd


INPUT_FILE = "data/processed/historical_agent_analysis.csv"
OUTPUT_FILE = "data/processed/suspicious_trading_report.csv"


def main():

    print("=" * 60)
    print("SUSPICIOUS TRADING REPORT")
    print("=" * 60)

    print("\nLoading agent analysis...")

    df = pd.read_csv(INPUT_FILE)

    print(f"Rows loaded: {len(df):,}")

    # Sort by final fused risk score
    df = df.sort_values(
        by=["final_score", "anomaly_score"],
        ascending=[False, True]
    )

    # Select useful columns if they exist
    columns = [
        "symbol",
        "timestamp",
        "anomaly_score",
        "volume_score",
        "price_score",
        "timing_score",
        "final_score",
        "risk_level",
        "trade_count",
        "total_volume",
        "volume_imbalance",
        "trade_size_cv",
        "repeated_size_ratio",
        "repeated_price_ratio",
        "trade_rate",
        "buy_sell_alternation",
        "price_volume_divergence",
    ]

    available_columns = [
        col for col in columns
        if col in df.columns
    ]

    report = df[available_columns].copy()

    # Highest-risk events first
    report = report.sort_values(
        by="final_score",
        ascending=False
    )

    report.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\n" + "=" * 60)
    print("REPORT GENERATED")
    print("=" * 60)

    print(f"\nTotal suspicious windows: {len(report):,}")

    if "risk_level" in report.columns:
        print("\nRisk distribution:")
        print(report["risk_level"].value_counts())

    if "symbol" in report.columns:
        print("\nCrypto distribution:")
        print(report["symbol"].value_counts())

    print("\nTop 20 suspicious windows:")
    print("-" * 60)

    print(
        report.head(20).to_string(index=False)
    )

    print("\n" + "=" * 60)
    print("REPORT COMPLETE")
    print("=" * 60)

    print(f"\nSaved to:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
