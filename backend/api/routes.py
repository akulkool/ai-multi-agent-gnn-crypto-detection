from fastapi import APIRouter, HTTPException
from backend.cache.feature_cache import get_latest_features


router = APIRouter(
    prefix="/api",
    tags=["CryptoTradeGuard"]
)


@router.get("/latest")
def get_latest():
    """
    Get the latest market features received from Binance.
    """

    features = get_latest_features()

    if features is None:
        raise HTTPException(
            status_code=404,
            detail="No latest market features available"
        )

    return {
        "status": "success",
        "features": features
    }


@router.get("/latest/{symbol}")
def get_latest_by_symbol(symbol: str):
    """
    Get latest features only if the latest Redis window
    belongs to the requested cryptocurrency.
    """

    symbol = symbol.upper()

    if symbol not in ["BTCUSDT", "ETHUSDT", "SOLUSDT"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported symbol. Use BTCUSDT, ETHUSDT or SOLUSDT."
        )

    features = get_latest_features()

    if features is None:
        raise HTTPException(
            status_code=404,
            detail="No latest market features available"
        )

    if features.get("symbol") != symbol:
        raise HTTPException(
            status_code=404,
            detail=f"The latest available window is for {features.get('symbol')}, not {symbol}."
        )

    return {
        "status": "success",
        "symbol": symbol,
        "features": features
    }