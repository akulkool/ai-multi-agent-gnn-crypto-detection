import pandas as pd

FILES = [
    "data/processed/BTCUSDT_2026_07_enhanced.csv",
    "data/processed/ETHUSDT_2026_07_enhanced.csv",
    "data/processed/SOLUSDT_2026_07_enhanced.csv",
]

OUTPUT = "data/processed/multi_crypto_enhanced.csv"


def main():

    print("=" * 60)
    print("COMBINING MULTI-CRYPTO DATASETS")
    print("=" * 60)

    datasets = []

    for file in FILES:

        print(f"\nLoading: {file}")

        df = pd.read_csv(file)

        print(f"Rows: {len(df):,}")

        datasets.append(df)

    combined = pd.concat(
        datasets,
        ignore_index=True
    )

    # Sort chronologically within the combined dataset
    combined["timestamp"] = pd.to_datetime(
    combined["timestamp"],
    format="mixed",
    utc=True
)

    combined = combined.sort_values(
        ["timestamp", "symbol"]
    ).reset_index(drop=True)

    combined.to_csv(
        OUTPUT,
        index=False
    )

    print("\n" + "=" * 60)
    print("COMBINATION COMPLETE")
    print("=" * 60)

    print(f"\nTotal rows: {len(combined):,}")

    print("\nRows by symbol:")
    print(combined["symbol"].value_counts())

    print(f"\nOutput: {OUTPUT}")


if __name__ == "__main__":
    main()
