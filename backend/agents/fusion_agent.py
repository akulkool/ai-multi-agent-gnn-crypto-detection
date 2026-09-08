class FusionAgent:

    def __init__(self):
        pass

    def analyze(
        self,
        volume_result,
        price_result,
        timing_result,
        wash_result
    ):

        volume_score = volume_result.get("score", 0)
        price_score = price_result.get("score", 0)
        timing_score = timing_result.get("score", 0)
        wash_score = wash_result.get("score", 0)

        # -------------------------------------------------
        # Weighted combination
        # -------------------------------------------------

        final_score = (
            volume_score * 0.30
            + price_score * 0.25
            + timing_score * 0.20
            + wash_score * 0.25
        )

        # -------------------------------------------------
        # Collect signals
        # -------------------------------------------------

        signals = []

        signals.extend(
            volume_result.get("signals", [])
        )

        signals.extend(
            price_result.get("signals", [])
        )

        signals.extend(
            timing_result.get("signals", [])
        )

        signals.extend(
            wash_result.get("signals", [])
        )

        # -------------------------------------------------
        # Remove duplicate signals
        # -------------------------------------------------

        signals = list(dict.fromkeys(signals))

        # -------------------------------------------------
        # Final classification
        # -------------------------------------------------

        if final_score >= 80:

            risk_level = "HIGH"

        elif final_score >= 50:

            risk_level = "MEDIUM"

        else:

            risk_level = "LOW"

        # -------------------------------------------------
        # Return result
        # -------------------------------------------------

        return {

            "final_score": round(final_score, 2),

            "risk_level": risk_level,

            "signals": signals,

            "agent_scores": {

                "volume": volume_score,

                "price": price_score,

                "timing": timing_score,

                "wash_trading": wash_score

            }

        }