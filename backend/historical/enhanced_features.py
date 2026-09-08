import sys
import zipfile
import csv
import math
from datetime import datetime, timezone
from collections import Counter
from statistics import mean, stdev


def calculate_features(trades, symbol, minute_timestamp):

    if not trades:
        return None

    prices = [float(t["price"]) for t in trades]
    quantities = [float(t["quantity"]) for t in trades]

    trade_count = len(trades)
    total_volume = sum(quantities)

    average_trade_size = (
        total_volume / trade_count
        if trade_count > 0
        else 0
    )

    first_price = prices[0]
    last_price = prices[-1]

    price_change_percent = (
        ((last_price - first_price) / first_price) * 100
        if first_price != 0
        else 0
    )

    buy_volume = sum(
        t["quantity"]
        for t in trades
        if not t["buyer_maker"]
    )

    sell_volume = sum(
        t["quantity"]
        for t in trades
        if t["buyer_maker"]
    )

    volume_imbalance = (
        (buy_volume - sell_volume) / total_volume
        if total_volume > 0
        else 0
    )

    # Trade size statistics
    trade_size_std = (
        stdev(quantities)
        if len(quantities) > 1
        else 0
    )

    trade_size_cv = (
        trade_size_std / average_trade_size
        if average_trade_size > 0
        else 0
    )

    # Repeated trade sizes
    size_counts = Counter(quantities)

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

    # Repeated prices
    price_counts = Counter(prices)

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

    # Trade rate
    trade_rate = trade_count / 60

    # Buy/Sell alternation
    sides = [
        "buy" if not t["buyer_maker"] else "sell"
        for t in trades
    ]

    alternations = sum(
        1
        for i in range(1, len(sides))
        if sides[i] != sides[i - 1]
    )

    buy_sell_alternation = (
        alternations / (len(sides) - 1)
        if len(sides) > 1
        else 0
    )

    # Price-volume divergence
    price_range = abs(last_price - first_price)

    price_volume_divergence = (
        total_volume / price_range
        if price_range > 0
        else total_volume
    )

    return {
        "symbol": symbol,
        "timestamp": minute_timestamp,

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
        "price_volume_divergence": price_volume_divergence,
    }


def process_symbol(symbol):

    zip_path = (
        f"data/raw/{symbol}/{symbol}-trades-2026-07.zip"
    )

    output_path = (
        f"data/processed/{symbol}_2026_07_enhanced.csv"
    )

    print("=" * 60)
    print(f"ENHANCED {symbol} FEATURE ENGINEERING")
    print("=" * 60)

    print()
    print(f"Reading: {symbol}-trades-2026-07.csv")
    print("Processing real Binance trades...")

    features = []

    with zipfile.ZipFile(zip_path, "r") as z:

        csv_name = z.namelist()[0]

        with z.open(csv_name) as file:

            reader = csv.reader(
                (line.decode("utf-8")
                 for line in file)
            )

            current_minute = None
            current_trades = []

            processed_minutes = 0

            for row in reader:

                if len(row) < 7:
                    continue

                try:
                    trade_id = int(row[0])
                    price = float(row[1])
                    quantity = float(row[2])
                    timestamp_us = int(row[4])
                    buyer_maker = row[5].strip().lower() == "true"

                except (ValueError, IndexError):
                    continue

                # Binance timestamp is microseconds
                timestamp_ms = timestamp_us // 1000

                minute = timestamp_ms // 60000

                if current_minute is None:
                    current_minute = minute

                elif minute != current_minute:

                    timestamp = datetime.fromtimestamp(
                        current_minute * 60,
                        timezone.utc
                    ).isoformat()

                    result = calculate_features(
                        current_trades,
                        symbol,
                        timestamp
                    )

                    if result:
                        features.append(result)

                        processed_minutes += 1

                        if processed_minutes % 10000 == 0:
                            print(
                                f"Processed "
                                f"{processed_minutes:,} minutes..."
                            )

                    current_trades = []
                    current_minute = minute

                current_trades.append({
                    "trade_id": trade_id,
                    "price": price,
                    "quantity": quantity,
                    "time": timestamp_ms,
                    "buyer_maker": buyer_maker,
                })

            # Process final minute
            if current_trades:

                timestamp = datetime.fromtimestamp(
                    current_minute * 60,
                    timezone.utc
                ).isoformat()

                result = calculate_features(
                    current_trades,
                    symbol,
                    timestamp
                )

                if result:
                    features.append(result)

    # Write output
    fieldnames = [
        "symbol",
        "timestamp",
        "trade_count",
        "total_volume",
        "average_trade_size",
        "first_price",
        "last_price",
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

    with open(
        output_path,
        "w",
        newline=""
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(features)

    print("=" * 60)
    print(f"ENHANCED {symbol} FEATURE PROCESSING COMPLETE")
    print("=" * 60)

    print()
    print(f"Feature rows: {len(features):,}")
    print(f"Output: {output_path}")
    print()


if __name__ == "__main__":

    if len(sys.argv) != 2:

        print(
            "Usage: python -m "
            "backend.historical.enhanced_features SYMBOL"
        )

        print()
        print("Example:")
        print(
            "python -m "
            "backend.historical.enhanced_features ETHUSDT"
        )

        sys.exit(1)

    symbol = sys.argv[1].upper()

    allowed_symbols = [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
    ]

    if symbol not in allowed_symbols:

        print(
            f"Unsupported symbol: {symbol}"
        )

        print(
            f"Allowed symbols: "
            f"{', '.join(allowed_symbols)}"
        )

        sys.exit(1)

    process_symbol(symbol)