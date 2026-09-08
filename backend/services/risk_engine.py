class RiskEngine:

    def __init__(self):
        pass

    def calculate_risk(
        self,
        ml_result,
        fusion_result
    ):
        ml_anomaly = ml_result.get("anomaly", False)
        anomaly_score = ml_result.get("anomaly_score", 0)

        fusion_score = fusion_result.get("final_score", 0)
        fusion_level = fusion_result.get("risk_level", "LOW")

        signals = fusion_result.get("signals", [])

        # Start with the fusion score
        risk_score = fusion_score

        # ML anomaly confirmation
        if ml_anomaly:
            risk_score += 15

        # Strong anomaly score adjustment
        if anomaly_score < 0:
            risk_score += 10

        # Wash-trading signals
        wash_signals = [
            "high_repeated_trade_sizes",
            "very_high_repeated_trade_sizes",
            "high_repeated_prices",
            "very_high_repeated_prices",
            "high_buy_sell_alternation",
            "extreme_price_volume_divergence",
        ]

        wash_signal_count = sum(
            1 for signal in signals
            if signal in wash_signals
        )

        risk_score += min(wash_signal_count * 3, 15)

        # Keep score between 0 and 100
        risk_score = min(max(risk_score, 0), 100)

        # Final risk classification
        if risk_score >= 80:
            risk_level = "HIGH"
        elif risk_score >= 50:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Generate explanation
        if risk_level == "HIGH":
            explanation = (
                "High-risk suspicious trading activity detected. "
                "Multiple behavioral and market signals indicate "
                "potential coordinated or abnormal trading."
            )

        elif risk_level == "MEDIUM":
            explanation = (
                "Moderate suspicious trading activity detected. "
                "Several abnormal trading patterns require monitoring."
            )

        else:
            explanation = (
                "No strong evidence of suspicious trading activity. "
                "Some abnormal signals may still be present."
            )

        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "ml_anomaly": ml_anomaly,
            "anomaly_score": float(anomaly_score),
            "fusion_score": fusion_score,
            "wash_signal_count": wash_signal_count,
            "signals": signals,
            "explanation": explanation,
        }