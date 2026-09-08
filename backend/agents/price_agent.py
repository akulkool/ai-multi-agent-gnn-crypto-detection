class PriceAgent:

    def analyze(self, features):
        """
        Analyze price and price-volume behavior.

        Returns:
            price_score: 0-100
            signals: detected price patterns
        """

        score = 0
        signals = []

        price_change = abs(
            features.get("price_change_percent", 0)
        )

        divergence = abs(
            features.get("price_volume_divergence", 0)
        )

        total_volume = features.get(
            "total_volume", 0
        )

        # -----------------------------
        # Large price movement
        # -----------------------------

        if price_change > 1.0:
            score += 30
            signals.append("extreme_price_movement")

        elif price_change > 0.5:
            score += 20
            signals.append("high_price_movement")

        elif price_change > 0.2:
            score += 10
            signals.append("elevated_price_movement")

        # -----------------------------
        # Price-volume divergence
        # -----------------------------

        if divergence > 1000:
            score += 40
            signals.append("extreme_price_volume_divergence")

        elif divergence > 500:
            score += 25
            signals.append("high_price_volume_divergence")

        elif divergence > 200:
            score += 15
            signals.append("price_volume_divergence")

        # -----------------------------
        # High volume with low price movement
        # -----------------------------

        if total_volume > 100 and price_change < 0.05:
            score += 30
            signals.append(
                "high_volume_low_price_movement"
            )

        # -----------------------------
        # Limit score
        # -----------------------------

        score = min(score, 100)

        return {
            "agent": "price",
            "score": score,
            "signals": signals
        }
