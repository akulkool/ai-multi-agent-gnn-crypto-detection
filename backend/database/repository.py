from backend.database.database import SessionLocal
from backend.database.models import MarketFeature


def save_market_features(features):
    db = SessionLocal()

    try:
        record = MarketFeature(
            symbol=features["symbol"],
            timestamp=features["timestamp"],
            trade_count=features["trade_count"],
            total_volume=features["total_volume"],
            average_trade_size=features["average_trade_size"],
            first_price=features["first_price"],
            last_price=features["last_price"],
            price_change_percent=features["price_change_percent"],
            buy_volume=features["buy_volume"],
            sell_volume=features["sell_volume"],
            volume_imbalance=features["volume_imbalance"],
        )

        db.add(record)
        db.commit()

        print("✓ Features saved to PostgreSQL")

    except Exception as e:
        db.rollback()
        print(f"Database error: {e}")

    finally:
        db.close()
