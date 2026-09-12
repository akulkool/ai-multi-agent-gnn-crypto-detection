from fastapi import APIRouter, HTTPException

from backend.cache.feature_cache import (
    get_latest_features,
    get_latest_risk,
)

router = APIRouter(
    prefix="/api",
    tags=["CryptoTradeGuard"]
)

SUPPORTED_SYMBOLS = {
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT",
}


@router.get("/latest")
def get_latest():
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


@router.get("/risk/{symbol}")
def get_risk(symbol: str):
    symbol = symbol.upper()

    if symbol not in SUPPORTED_SYMBOLS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported symbol. Use BTCUSDT, ETHUSDT or SOLUSDT."
        )

    risk = get_latest_risk(symbol)

    if risk is None:
        raise HTTPException(
            status_code=404,
            detail=f"No risk data available for {symbol}"
        )

    return {
        "status": "success",
        "symbol": symbol,
        "risk": risk
    }


@router.get("/summary")
def get_summary():
    results = {}

    for symbol in SUPPORTED_SYMBOLS:
        risk = get_latest_risk(symbol)

        results[symbol] = risk

    return {
        "status": "success",
        "data": results
    }


@router.get("/latest/{symbol}")
def get_latest_by_symbol(symbol: str):
    symbol = symbol.upper()

    if symbol not in SUPPORTED_SYMBOLS:
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
            detail=(
                f"The latest available window is for "
                f"{features.get('symbol')}, not {symbol}."
            )
        )

    return {
        "status": "success",
        "symbol": symbol,
        "features": features
    }