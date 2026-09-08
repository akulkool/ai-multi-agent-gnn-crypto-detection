class VolumeAgent:

    def analyze(self, features):
        """
        Analyze trading volume related behavior.

        Returns:
            volume_score: 0-100
            signals: list of detected volume patterns
        """

        score = 0
        signals = []

        trade_count = features.get("trade_count", 0)
        total_volume = features.get("total_volume", 0)
        trade_rate = features.get("trade_rate", 0)
        volume_imbalance = features.get("volume_imbalance", 0)

        # -----------------------------
        # High trading activity
        # -----------------------------

        if trade_count > 15000:
            score += 30
            signals.append("extremely_high_trade_count")

        elif trade_count > 8000:
            score += 20
            signals.append("high_trade_count")

        elif trade_count > 4000:
            score += 10
            signals.append("elevated_trade_count")

        # -----------------------------
        # High volume
        # -----------------------------

        if total_volume > 500:
            score += 30
            signals.append("extremely_high_volume")

        elif total_volume > 250:
            score += 20
            signals.append("high_volume")

        elif total_volume > 100:
            score += 10
            signals.append("elevated_volume")

        # -----------------------------
        # High trade rate
        # -----------------------------

        if trade_rate > 200:
            score += 20
            signals.append("extremely_high_trade_rate")

        elif trade_rate > 100:
            score += 10
            signals.append("high_trade_rate")

        # -----------------------------
        # Strong buy/sell imbalance
        # -----------------------------

        if abs(volume_imbalance) > 0.8:
            score += 20
            signals.append("extreme_volume_imbalance")

        elif abs(volume_imbalance) > 0.6:
            score += 10
            signals.append("high_volume_imbalance")

        # -----------------------------
        # Limit score
        # -----------------------------

        score = min(score, 100)

        return {
            "agent": "volume",
            "score": score,
            "signals": signals
        }
