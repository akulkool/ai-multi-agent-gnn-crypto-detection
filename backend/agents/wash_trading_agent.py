class WashTradingAgent:

    def analyze(self, features):

        score = 0
        signals = []

        # Repeated trade sizes
        repeated_size_ratio = features.get(
            "repeated_size_ratio", 0
        )

        if repeated_size_ratio >= 0.90:
            score += 25
            signals.append("very_high_repeated_trade_sizes")

        elif repeated_size_ratio >= 0.75:
            score += 15
            signals.append("high_repeated_trade_sizes")

        # Repeated prices
        repeated_price_ratio = features.get(
            "repeated_price_ratio", 0
        )

        if repeated_price_ratio >= 0.99:
            score += 25
            signals.append("very_high_repeated_prices")

        elif repeated_price_ratio >= 0.95:
            score += 15
            signals.append("high_repeated_prices")

        # Buy/sell alternation
        alternation = features.get(
            "buy_sell_alternation", 0
        )

        if alternation >= 0.20:
            score += 20
            signals.append("high_buy_sell_alternation")

        elif alternation >= 0.10:
            score += 10
            signals.append("elevated_buy_sell_alternation")

        # High trade rate
        trade_rate = features.get(
            "trade_rate", 0
        )

        if trade_rate >= 100:
            score += 15
            signals.append("extremely_high_trade_rate")

        elif trade_rate >= 50:
            score += 10
            signals.append("high_trade_rate")

        # High trade-size variability
        trade_size_cv = features.get(
            "trade_size_cv", 0
        )

        if trade_size_cv >= 10:
            score += 10
            signals.append("extreme_trade_size_variability")

        elif trade_size_cv >= 5:
            score += 5
            signals.append("high_trade_size_variability")

        # Price-volume divergence
        divergence = features.get(
            "price_volume_divergence", 0
        )

        if divergence >= 100000:
            score += 10
            signals.append("extreme_price_volume_divergence")

        elif divergence >= 10000:
            score += 5
            signals.append("high_price_volume_divergence")

        # Cap score
        score = min(score, 100)

        return {
            "agent": "wash_trading",
            "score": score,
            "signals": signals
        }
