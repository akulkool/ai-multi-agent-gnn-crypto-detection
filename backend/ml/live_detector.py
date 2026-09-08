import os
import joblib
import pandas as pd

from backend.agents.volume_agent import VolumeAgent
from backend.agents.price_agent import PriceAgent
from backend.agents.timing_agent import TimingAgent
from backend.agents.wash_trading_agent import WashTradingAgent
from backend.agents.fusion_agent import FusionAgent


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


class LiveDetector:

    def __init__(self):

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}"
            )

        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(
                f"Scaler not found: {SCALER_PATH}"
            )

        print("Loading ML model...")

        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)

        print("Multi-crypto ML model loaded successfully!")

        # Initialize agents
        self.volume_agent = VolumeAgent()
        self.price_agent = PriceAgent()
        self.timing_agent = TimingAgent()
        self.wash_trading_agent = WashTradingAgent()

        # Initialize fusion agent
        self.fusion_agent = FusionAgent()

        print("All anomaly detection agents loaded successfully!")


    def detect(self, features):

        symbol = features["symbol"]
        timestamp = features["timestamp"]

        # ---------------------------------------------------------
        # 1. PREPARE FEATURES FOR ML MODEL
        # ---------------------------------------------------------

        data = pd.DataFrame([features])

        X = data[FEATURE_COLUMNS].copy()

        X = X.apply(
            pd.to_numeric,
            errors="coerce"
        )

        if X.isna().any().any():
            raise ValueError(
                "Invalid feature values detected."
            )

        # ---------------------------------------------------------
        # 2. SCALE FEATURES
        # ---------------------------------------------------------

        X_scaled = self.scaler.transform(X)

        # ---------------------------------------------------------
        # 3. ISOLATION FOREST
        # ---------------------------------------------------------

        prediction = self.model.predict(
            X_scaled
        )[0]

        anomaly_score = self.model.decision_function(
            X_scaled
        )[0]

        ml_anomaly = prediction == -1

        # ---------------------------------------------------------
        # 4. VOLUME AGENT
        # ---------------------------------------------------------

        volume_result = self.volume_agent.analyze(
            features
        )

        # ---------------------------------------------------------
        # 5. PRICE AGENT
        # ---------------------------------------------------------

        price_result = self.price_agent.analyze(
            features
        )

        # ---------------------------------------------------------
        # 6. TIMING AGENT
        # ---------------------------------------------------------

        timing_result = self.timing_agent.analyze(
            features
        )

        # ---------------------------------------------------------
        # 7. WASH TRADING AGENT
        # ---------------------------------------------------------

        wash_result = self.wash_trading_agent.analyze(
            features
        )

        # ---------------------------------------------------------
        # 8. FUSION AGENT
        # ---------------------------------------------------------

        fusion_result = self.fusion_agent.analyze(
            volume_result,
            price_result,
            timing_result,
            wash_result
        )

        # ---------------------------------------------------------
        # 9. FINAL RESULT
        # ---------------------------------------------------------

        return {

            "symbol": symbol,

            "timestamp": timestamp,

            # ML result
            "anomaly": ml_anomaly,

            "anomaly_score": float(
                anomaly_score
            ),

            # Agent results
            "volume": volume_result,

            "price": price_result,

            "timing": timing_result,

            "wash_trading": wash_result,

            # Fusion result
            "fusion": fusion_result,

            "final_score": fusion_result[
                "final_score"
            ],

            "risk_level": fusion_result[
                "risk_level"
            ],

            "signals": fusion_result[
                "signals"
            ],

            "agent_scores": fusion_result[
                "agent_scores"
            ],
        }


if __name__ == "__main__":

    print("=" * 60)
    print("MULTI-CRYPTO LIVE DETECTOR")
    print("=" * 60)

    detector = LiveDetector()

    print("\nDetector initialized successfully.")
    print(
        "Ready for BTCUSDT / ETHUSDT / SOLUSDT live features."
    )