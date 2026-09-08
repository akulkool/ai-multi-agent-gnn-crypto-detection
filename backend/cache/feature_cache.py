import json

from backend.cache.redis_client import redis_client


FEATURE_KEY = "cryptotradeguard:latest_features"
RISK_KEY_PREFIX = "cryptotradeguard:latest_risk:"


def save_latest_features(features):
    try:
        redis_client.set(
            FEATURE_KEY,
            json.dumps(features, default=str)
        )
        print("✓ Latest features saved to Redis")
    except Exception as e:
        print(f"Redis save error: {e}")


def get_latest_features():
    try:
        data = redis_client.get(FEATURE_KEY)

        if data:
            return json.loads(data)

        return None

    except Exception as e:
        print(f"Redis read error: {e}")
        return None


def save_latest_risk(result):
    """
    Save the latest risk analysis for a cryptocurrency.
    """

    try:
        symbol = result["symbol"]

        key = f"{RISK_KEY_PREFIX}{symbol}"

        redis_client.set(
            key,
            json.dumps(result, default=str)
        )

        print(f"✓ Latest risk saved to Redis: {symbol}")

    except Exception as e:
        print(f"Redis risk save error: {e}")


def get_latest_risk(symbol):
    """
    Get the latest risk analysis for a cryptocurrency.
    """

    try:
        symbol = symbol.upper()

        key = f"{RISK_KEY_PREFIX}{symbol}"

        data = redis_client.get(key)

        if data:
            return json.loads(data)

        return None

    except Exception as e:
        print(f"Redis risk read error: {e}")
        return None