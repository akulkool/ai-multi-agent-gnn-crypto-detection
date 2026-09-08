import asyncio
import json

import websockets

from backend.features.feature_engine import FeatureEngine
from backend.database.repository import save_market_features
from backend.cache.feature_cache import (
    save_latest_features,
    save_latest_risk,
)
from backend.ml.live_detector import LiveDetector
from backend.services.risk_engine import RiskEngine


# ============================================================
# BINANCE COMBINED WEBSOCKET STREAM
# ============================================================

WS_URL = (
    "wss://stream.binance.com:9443/stream?"
    "streams=btcusdt@trade/"
    "ethusdt@trade/"
    "solusdt@trade"
)


# ============================================================
# SUPPORTED CRYPTOCURRENCIES
# ============================================================

SUPPORTED_SYMBOLS = {
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT",
}


# ============================================================
# MAIN BINANCE CONNECTION
# ============================================================

async def connect_to_binance():

    print("=" * 65)
    print("CRYPTOTRADEGUARD LIVE PIPELINE")
    print("=" * 65)

    print("Connecting to Binance...")

    # --------------------------------------------------------
    # Separate feature engine for each cryptocurrency
    # --------------------------------------------------------

    feature_engines = {
        "BTCUSDT": FeatureEngine(),
        "ETHUSDT": FeatureEngine(),
        "SOLUSDT": FeatureEngine(),
    }

    # --------------------------------------------------------
    # Load ML detector
    # --------------------------------------------------------

    detector = LiveDetector()

    # --------------------------------------------------------
    # Load risk engine
    # --------------------------------------------------------

    risk_engine = RiskEngine()

    print("ML detector initialized.")
    print("Risk engine initialized.")

    # --------------------------------------------------------
    # Connect to Binance WebSocket
    # --------------------------------------------------------

    async with websockets.connect(
        WS_URL,
        ping_interval=20,
        ping_timeout=60
    ) as websocket:

        print("Connected successfully!")
        print(
            "Receiving BTCUSDT, ETHUSDT and SOLUSDT trades...\n"
        )

        # ====================================================
        # CONTINUOUS TRADE STREAM
        # ====================================================

        while True:

            try:

                # ------------------------------------------------
                # Receive Binance message
                # ------------------------------------------------

                message = await websocket.recv()

                stream_data = json.loads(message)

                # ------------------------------------------------
                # Combined stream format
                #
                # {
                #     "stream": "btcusdt@trade",
                #     "data": {...}
                # }
                # ------------------------------------------------

                data = stream_data["data"]

                symbol = data["s"]

                # ------------------------------------------------
                # Safety check
                # ------------------------------------------------

                if symbol not in SUPPORTED_SYMBOLS:
                    continue

                # ------------------------------------------------
                # Convert Binance trade into standard format
                # ------------------------------------------------

                trade = {
                    "trade_id": data["t"],
                    "symbol": symbol,
                    "price": data["p"],
                    "quantity": float(data["q"]),
                    "time": data["T"],
                    "buyer_maker": data["m"],
                }

                # ------------------------------------------------
                # Send trade to correct feature engine
                # ------------------------------------------------

                features = feature_engines[symbol].add_trade(
                    trade
                )

                # ------------------------------------------------
                # If one-minute window is complete
                # ------------------------------------------------

                if features:

                    print("=" * 65)
                    print("1-MINUTE FEATURES")
                    print("=" * 65)

                    for key, value in features.items():
                        print(f"{key}: {value}")

                    print()

                    # =================================================
                    # 1. SAVE FEATURES TO POSTGRESQL
                    # =================================================

                    try:

                        save_market_features(features)

                        print(
                            "✓ Features saved to PostgreSQL"
                        )

                    except Exception as e:

                        print(
                            f"⚠ PostgreSQL save error: {e}"
                        )

                    # =================================================
                    # 2. SAVE LATEST FEATURES TO REDIS
                    # =================================================

                    try:

                        save_latest_features(features)

                        print(
                            "✓ Latest features saved to Redis"
                        )

                    except Exception as e:

                        print(
                            f"⚠ Redis feature save error: {e}"
                        )

                    # =================================================
                    # 3. LIVE ML + MULTI-AGENT DETECTION
                    # =================================================

                    try:

                        result = detector.detect(features)

                        # ------------------------------------------------
                        # Extract ML result
                        # ------------------------------------------------

                        ml_result = {
                            "anomaly": result["anomaly"],
                            "anomaly_score": result[
                                "anomaly_score"
                            ],
                        }

                        # ------------------------------------------------
                        # Extract Fusion Agent result
                        # ------------------------------------------------

                        fusion_result = result["fusion"]

                        # =================================================
                        # 4. FINAL RISK ENGINE
                        # =================================================

                        risk_result = risk_engine.calculate_risk(
                            ml_result,
                            fusion_result
                        )

                        # =================================================
                        # 5. BUILD COMPLETE RISK RESULT
                        # =================================================

                        risk_data = {
                            "symbol": result["symbol"],
                            "timestamp": result["timestamp"],

                            # -----------------------------------------
                            # ML
                            # -----------------------------------------

                            "anomaly": result["anomaly"],
                            "anomaly_score": result[
                                "anomaly_score"
                            ],

                            # -----------------------------------------
                            # Individual agents
                            # -----------------------------------------

                            "volume": result["volume"],
                            "price": result["price"],
                            "timing": result["timing"],
                            "wash_trading": result[
                                "wash_trading"
                            ],

                            # -----------------------------------------
                            # Fusion
                            # -----------------------------------------

                            "fusion": result["fusion"],

                            "fusion_score": result[
                                "final_score"
                            ],

                            "fusion_risk_level": result[
                                "risk_level"
                            ],

                            "signals": result["signals"],

                            "agent_scores": result[
                                "agent_scores"
                            ],

                            # -----------------------------------------
                            # FINAL RISK ENGINE
                            # -----------------------------------------

                            "risk_engine": risk_result,

                            "final_risk_score": risk_result[
                                "risk_score"
                            ],

                            "final_risk_level": risk_result[
                                "risk_level"
                            ],

                            "risk_explanation": risk_result[
                                "explanation"
                            ],

                            "wash_signal_count": risk_result[
                                "wash_signal_count"
                            ],
                        }

                        # =================================================
                        # 6. SAVE FINAL RISK DATA TO REDIS
                        # =================================================

                        save_latest_risk(risk_data)

                        print(
                            "✓ Latest risk saved to Redis: "
                            f"{symbol}"
                        )

                        # =================================================
                        # 7. PRINT LIVE DETECTION RESULT
                        # =================================================

                        print()

                        print("=" * 65)
                        print("LIVE ANOMALY DETECTION")
                        print("=" * 65)

                        print(
                            f"Symbol: "
                            f"{result['symbol']}"
                        )

                        print(
                            f"Timestamp: "
                            f"{result['timestamp']}"
                        )

                        # ------------------------------------------------
                        # ML RESULT
                        # ------------------------------------------------

                        print()

                        print("ML RESULT")
                        print("-" * 65)

                        print(
                            f"Anomaly: "
                            f"{result['anomaly']}"
                        )

                        print(
                            "Anomaly Score: "
                            f"{result['anomaly_score']:.6f}"
                        )

                        # ------------------------------------------------
                        # AGENT SCORES
                        # ------------------------------------------------

                        print()

                        print("AGENT SCORES")
                        print("-" * 65)

                        for agent, score in result[
                            "agent_scores"
                        ].items():

                            print(
                                f"{agent}: {score}"
                            )

                        # ------------------------------------------------
                        # FUSION RESULT
                        # ------------------------------------------------

                        print()

                        print("FUSION RESULT")
                        print("-" * 65)

                        print(
                            "Fusion Score: "
                            f"{result['final_score']}"
                        )

                        print(
                            "Fusion Risk Level: "
                            f"{result['risk_level']}"
                        )

                        # ------------------------------------------------
                        # FINAL RISK ENGINE RESULT
                        # ------------------------------------------------

                        print()

                        print("FINAL RISK ENGINE")
                        print("-" * 65)

                        print(
                            "Final Risk Score: "
                            f"{risk_result['risk_score']}"
                        )

                        print(
                            "Final Risk Level: "
                            f"{risk_result['risk_level']}"
                        )

                        print(
                            "ML Anomaly: "
                            f"{risk_result['ml_anomaly']}"
                        )

                        print(
                            "Wash Signal Count: "
                            f"{risk_result['wash_signal_count']}"
                        )

                        # ------------------------------------------------
                        # EXPLANATION
                        # ------------------------------------------------

                        print()

                        print("RISK EXPLANATION")
                        print("-" * 65)

                        print(
                            risk_result["explanation"]
                        )

                        # ------------------------------------------------
                        # SIGNALS
                        # ------------------------------------------------

                        print()

                        print("SIGNALS")
                        print("-" * 65)

                        if risk_result["signals"]:

                            for signal in risk_result[
                                "signals"
                            ]:

                                print(
                                    f"- {signal}"
                                )

                        else:

                            print("- None")

                        print("=" * 65)
                        print()

                    # =================================================
                    # DETECTION ERROR
                    # =================================================

                    except Exception as e:

                        print(
                            f"⚠ Detection error for "
                            f"{symbol}: {e}"
                        )

            # ========================================================
            # WEBSOCKET ERROR FOR ONE MESSAGE
            # ========================================================

            except json.JSONDecodeError as e:

                print(
                    f"⚠ Invalid Binance message: {e}"
                )

            except KeyError as e:

                print(
                    f"⚠ Unexpected Binance data format: {e}"
                )

            except Exception as e:

                print(
                    f"⚠ Stream processing error: {e}"
                )


# ============================================================
# PROGRAM ENTRY POINT
# ============================================================

if __name__ == "__main__":

    try:

        asyncio.run(
            connect_to_binance()
        )

    except KeyboardInterrupt:

        print(
            "\nWebSocket stopped."
        )

    except Exception as e:

        print(
            f"\nWebSocket error: {e}"
        )