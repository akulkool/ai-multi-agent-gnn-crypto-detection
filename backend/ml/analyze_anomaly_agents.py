import pandas as pd

from backend.agents.volume_agent import VolumeAgent
from backend.agents.price_agent import PriceAgent
from backend.agents.timing_agent import TimingAgent
from backend.agents.fusion_agent import FusionAgent


# ============================================================
# CONFIGURATION
# ============================================================

INPUT_PATH = "data/processed/historical_anomaly_results.csv"

OUTPUT_PATH = "data/processed/historical_agent_analysis.csv"

TOP_N = 100


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("HISTORICAL ANOMALY AGENT ANALYSIS")
    print("=" * 60)

    # --------------------------------------------------------
    # Load historical anomaly results
    # --------------------------------------------------------

    print("\nLoading historical anomaly results...")

    df = pd.read_csv(INPUT_PATH)

    print(f"Rows loaded: {len(df):,}")

    # --------------------------------------------------------
    # Keep only ML anomalies
    # --------------------------------------------------------

    anomalies = df[df["anomaly"] == True].copy()

    print(f"ML anomalies available: {len(anomalies):,}")

    # Sort by most anomalous
    anomalies = anomalies.sort_values(
        by="anomaly_score",
        ascending=True
    )

    # Analyze top anomalies
    anomalies = anomalies.head(TOP_N).copy()

    print(f"Analyzing top {len(anomalies)} anomalies...")

    # --------------------------------------------------------
    # Initialize agents
    # --------------------------------------------------------

    volume_agent = VolumeAgent()

    price_agent = PriceAgent()

    timing_agent = TimingAgent()

    fusion_agent = FusionAgent()

    results = []

    # --------------------------------------------------------
    # Run agents
    # --------------------------------------------------------

    for index, row in anomalies.iterrows():

        features = row.to_dict()

        # Remove columns that are not actual features
        features.pop("prediction", None)
        features.pop("anomaly", None)
        features.pop("anomaly_score", None)

        # ----------------------------------------------------
        # Volume Agent
        # ----------------------------------------------------

        volume_result = volume_agent.analyze(features)

        # ----------------------------------------------------
        # Price Agent
        # ----------------------------------------------------

        price_result = price_agent.analyze(features)

        # ----------------------------------------------------
        # Timing Agent
        # ----------------------------------------------------

        timing_result = timing_agent.analyze(features)

        # ----------------------------------------------------
        # Fusion Agent
        # ----------------------------------------------------

        fusion_result = fusion_agent.analyze(
            volume_result,
            price_result,
            timing_result
        )

        # ----------------------------------------------------
        # Store result
        # ----------------------------------------------------

        results.append({

            "symbol": row["symbol"],

            "timestamp": row["timestamp"],

            "anomaly_score": row["anomaly_score"],

            "volume_score": volume_result["score"],

            "price_score": price_result["score"],

            "timing_score": timing_result["score"],

            "final_score": fusion_result["final_score"],

            "risk_level": fusion_result["risk_level"],

            "volume_signals": "|".join(
                volume_result["signals"]
            ),

            "price_signals": "|".join(
                price_result["signals"]
            ),

            "timing_signals": "|".join(
                timing_result["signals"]
            ),

            "all_signals": "|".join(
                fusion_result["signals"]
            ),

        })

    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    results_df = pd.DataFrame(results)

    # --------------------------------------------------------
    # Display summary
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("AGENT ANALYSIS SUMMARY")
    print("=" * 60)

    print("\nRisk distribution:")

    print(
        results_df["risk_level"]
        .value_counts()
    )

    print("\nCrypto distribution:")

    print(
        results_df["symbol"]
        .value_counts()
    )

    # --------------------------------------------------------
    # Top suspicious windows according to Fusion
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("TOP SUSPICIOUS WINDOWS AFTER AGENT FUSION")
    print("=" * 60)

    top_results = results_df.sort_values(
        by="final_score",
        ascending=False
    )

    display_columns = [
        "symbol",
        "timestamp",
        "anomaly_score",
        "volume_score",
        "price_score",
        "timing_score",
        "final_score",
        "risk_level",
    ]

    print(
        top_results[
            display_columns
        ].head(20).to_string(index=False)
    )

    # --------------------------------------------------------
    # Save results
    # --------------------------------------------------------

    results_df.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print("\n" + "=" * 60)
    print("AGENT ANALYSIS COMPLETE")
    print("=" * 60)

    print(f"\nResults saved to:")

    print(OUTPUT_PATH)

    print("\n" + "=" * 60)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
