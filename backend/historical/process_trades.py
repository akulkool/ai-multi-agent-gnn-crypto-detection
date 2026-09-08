import csv
import io
import zipfile
from collections import defaultdict
from pathlib import Path


ZIP_FILE = Path(
    "data/raw/BTCUSDT/BTCUSDT-trades-2026-07.zip"
)

OUTPUT_FILE = Path(
    "data/processed/BTCUSDT_2026_07_features.csv"
)


def process_trades():

    print("Opening Binance historical dataset...")
    print(f"File: {ZIP_FILE}")

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # Store only the current minute
    current_minute = None
    trades = []

    feature_count = 0

    with zipfile.ZipFile(ZIP_FILE, "r") as archive:

        csv_name = archive.namelist()[0]

        print(f"Reading: {csv_name}")
        print("Processing real Binance trades...")
        print()

        with archive.open(csv_name) as file:

            text_file = io.TextIOWrapper(
                file,
                encoding="utf-8"
            )

            reader = csv.reader(text_file)

            with open(
                OUTPUT_FILE,
                "w",
                newline=""
            ) as output:

                writer = csv.writer(output)

                writer.writerow([
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
                    "volume_imbalance"
                ])

                for row in reader:

                    if len(row) < 6:
                        continue

                    trade_id = int(row[0])
                    price = float(row[1])
                    quantity = float(row[2])
                    timestamp_us = int(row[4])
                    is_buyer_maker = row[5].lower() == "true"

                    # Binance historical data uses microseconds
                    timestamp_ms = timestamp_us // 1000

                    # Convert timestamp into 1-minute bucket
                    minute = timestamp_ms // 60000

                    # First trade
                    if current_minute is None:
                        current_minute = minute

                    # New minute
                    if minute != current_minute:

                        features = calculate_features(
                            trades
                        )

                        writer.writerow(features)

                        feature_count += 1

                        if feature_count % 10000 == 0:
                            print(
                                f"Processed {feature_count:,} minutes..."
                            )

                        trades = []
                        current_minute = minute

                    trades.append({
                        "trade_id": trade_id,
                        "price": price,
                        "quantity": quantity,
                        "timestamp": timestamp_ms,
                        "buyer_maker": is_buyer_maker
                    })

                # Process final minute
                if trades:

                    features = calculate_features(
                        trades
                    )

                    writer.writerow(features)

                    feature_count += 1

    print()
    print("=" * 60)
    print("PROCESSING COMPLETE")
    print("=" * 60)
    print(f"1-minute feature rows: {feature_count:,}")
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 60)


def calculate_features(trades):

    prices = [
        trade["price"]
        for trade in trades
    ]

    quantities = [
        trade["quantity"]
        for trade in trades
    ]

    trade_count = len(trades)

    total_volume = sum(
        quantities
    )

    average_trade_size = (
        total_volume / trade_count
        if trade_count > 0
        else 0
    )

    first_price = prices[0]

    last_price = prices[-1]

    price_change_percent = (
        (last_price - first_price)
        / first_price
        * 100
        if first_price != 0
        else 0
    )

    buy_volume = sum(
        trade["quantity"]
        for trade in trades
        if not trade["buyer_maker"]
    )

    sell_volume = sum(
        trade["quantity"]
        for trade in trades
        if trade["buyer_maker"]
    )

    volume_imbalance = (
        (buy_volume - sell_volume)
        / total_volume
        if total_volume > 0
        else 0
    )

    # Use the actual Binance trade timestamp
    timestamp_ms = trades[0]["timestamp"]

    from datetime import datetime, timezone

    timestamp = datetime.fromtimestamp(
        timestamp_ms / 1000,
        tz=timezone.utc
    ).isoformat()

    return [
        "BTCUSDT",
        timestamp,
        trade_count,
        total_volume,
        average_trade_size,
        first_price,
        last_price,
        price_change_percent,
        buy_volume,
        sell_volume,
        volume_imbalance
    ]


if __name__ == "__main__":
    process_trades()
