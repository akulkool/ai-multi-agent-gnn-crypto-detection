class TimingAgent:

    def analyze(self, features):

        score = 0
        signals = []

        trade_count = features.get("trade_count", 0)
        trade_rate = features.get("trade_rate", 0)

        repeated_size_ratio = features.get(
            "repeated_size_ratio", 0
        )

        repeated_price_ratio = features.get(
            "repeated_price_ratio", 0
        )

        # --------------------------------
        # Extremely high trading frequency
        # --------------------------------

        if trade_rate > 500:
            score += 30
            signals.append("extremely_high_trade_rate")

        elif trade_rate > 250:
            score += 20
            signals.append("high_trade_rate")

        # --------------------------------
        # Very high number of trades
        # --------------------------------

        if trade_count > 20000:
            score += 25
            signals.append("extremely_high_trade_count")

        elif trade_count > 10000:
            score += 15
            signals.append("high_trade_count")

        # --------------------------------
        # Repeated trade sizes
        # --------------------------------

        if repeated_size_ratio > 0.80:
            score += 25
            signals.append("high_repeated_trade_sizes")

        elif repeated_size_ratio > 0.60:
            score += 15
            signals.append("repeated_trade_sizes")

        # --------------------------------
        # Repeated prices
        # --------------------------------

        if repeated_price_ratio > 0.80:
            score += 20
            signals.append("high_repeated_prices")

        elif repeated_price_ratio > 0.60:
            score += 10
            signals.append("repeated_prices")

        # --------------------------------
        # Cap score
        # --------------------------------

        score = min(score, 100)

        return {
            "agent": "timing",
            "score": score,
            "signals": signals
        }
