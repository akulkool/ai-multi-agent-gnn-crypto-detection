from datetime import datetime, timezone
from collections import Counter
import statistics


class FeatureEngine:

    def __init__(self):
        self.trades = []
        self.current_minute = None

    def add_trade(self, trade):

        trade_time = trade["time"]
        minute = trade_time // 60000

        completed_features = None

        # First trade
        if self.current_minute is None:
            self.current_minute = minute

        # New minute detected
        elif minute != self.current_minute:

            completed_features = self.calculate_features()

            # Start new window
            self.trades = []
            self.current_minute = minute

        self.trades.append(trade)

        return completed_features

    def calculate_features(self):

        if not self.trades:
            return None

        prices = [
            float(trade["price"])
            for trade in self.trades
        ]

        quantities = [
            float(trade["quantity"])
            for trade in self.trades
        ]

        trade_count = len(self.trades)

        # --------------------------------
        # Basic statistics
        # --------------------------------

        total_volume = sum(quantities)

        average_trade_size = (
            total_volume / trade_count
            if trade_count > 0
            else 0
        )

        # --------------------------------
        # Price features
        # --------------------------------

        first_price = prices[0]
        last_price = prices[-1]

        price_change_percent = (
            ((last_price - first_price) / first_price) * 100
            if first_price != 0
            else 0
        )

        # --------------------------------
        # Buy / Sell volume
        # --------------------------------

        buy_volume = sum(
            float(trade["quantity"])
            for trade in self.trades
            if not trade["buyer_maker"]
        )

        sell_volume = sum(
            float(trade["quantity"])
            for trade in self.trades
            if trade["buyer_maker"]
        )

        # --------------------------------
        # Volume imbalance
        # --------------------------------

        volume_imbalance = (
            (buy_volume - sell_volume) / total_volume
            if total_volume > 0
            else 0
        )

        # --------------------------------
        # Trade size standard deviation
        # --------------------------------

        trade_size_std = (
            statistics.pstdev(quantities)
            if len(quantities) > 1
            else 0
        )

        # --------------------------------
        # Trade size coefficient variation
        # --------------------------------

        trade_size_cv = (
            trade_size_std / average_trade_size
            if average_trade_size > 0
            else 0
        )

        # --------------------------------
        # Repeated trade size ratio
        # --------------------------------

        rounded_sizes = [
            round(q, 8)
            for q in quantities
        ]

        size_counts = Counter(rounded_sizes)

        repeated_size_count = sum(
            count
            for count in size_counts.values()
            if count > 1
        )

        repeated_size_ratio = (
            repeated_size_count / trade_count
            if trade_count > 0
            else 0
        )

        # --------------------------------
        # Repeated price ratio
        # --------------------------------

        rounded_prices = [
            round(p, 2)
            for p in prices
        ]

        price_counts = Counter(rounded_prices)

        repeated_price_count = sum(
            count
            for count in price_counts.values()
            if count > 1
        )

        repeated_price_ratio = (
            repeated_price_count / trade_count
            if trade_count > 0
            else 0
        )

        # --------------------------------
        # Trade rate
        # --------------------------------

        # One-minute window
        trade_rate = trade_count / 60

        # --------------------------------
        # Buy / Sell alternation
        # --------------------------------

        sides = [
            "buy" if not trade["buyer_maker"] else "sell"
            for trade in self.trades
        ]

        alternations = 0

        for i in range(1, len(sides)):
            if sides[i] != sides[i - 1]:
                alternations += 1

        buy_sell_alternation = (
            alternations / (trade_count - 1)
            if trade_count > 1
            else 0
        )

        # --------------------------------
        # Price-volume divergence
        # --------------------------------

        # Measures high trading volume combined
        # with relatively small price movement.

        price_volume_divergence = (
            total_volume / abs(price_change_percent)
            if abs(price_change_percent) > 0.000001
            else total_volume
        )

        # --------------------------------
        # Timestamp
        # --------------------------------

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        return {

            "symbol": self.trades[0]["symbol"],

            "timestamp": timestamp,

            "trade_count": trade_count,

            "total_volume": total_volume,

            "average_trade_size": average_trade_size,

            "first_price": first_price,

            "last_price": last_price,

            "price_change_percent": price_change_percent,

            "buy_volume": buy_volume,

            "sell_volume": sell_volume,

            "volume_imbalance": volume_imbalance,

            "trade_size_std": trade_size_std,

            "trade_size_cv": trade_size_cv,

            "repeated_size_ratio": repeated_size_ratio,

            "repeated_price_ratio": repeated_price_ratio,

            "trade_rate": trade_rate,

            "buy_sell_alternation": buy_sell_alternation,

            "price_volume_divergence":
                price_volume_divergence,
        }