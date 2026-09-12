from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router


# ============================================================
# CRYPTOTRADEGUARD FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CryptoTradeGuard API",
    description=(
        "Multi-agent cryptocurrency suspicious "
        "trading detection system"
    ),
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================
#
# React frontend:
#     http://localhost:3000
#
# FastAPI backend:
#     http://127.0.0.1:8000
#
# The browser requires CORS permission for the
# frontend to communicate with the backend.
#
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ============================================================
# INCLUDE API ROUTES
# ============================================================

app.include_router(router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "project": "CryptoTradeGuard",

        "status": "running",

        "message": "CryptoTradeGuard API is online",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# APPLICATION INFO
# ============================================================

@app.get("/info")
def info():

    return {

        "project": "CryptoTradeGuard",

        "version": "1.0.0",

        "frontend": "http://localhost:3000",

        "backend": "http://127.0.0.1:8000",

        "supported_symbols": [
            "BTCUSDT",
            "ETHUSDT",
            "SOLUSDT",
        ],

        "components": [
            "Binance WebSocket",
            "Feature Engineering",
            "Isolation Forest",
            "Volume Agent",
            "Price Agent",
            "Timing Agent",
            "Wash Trading Agent",
            "Fusion Agent",
            "Risk Engine",
            "PostgreSQL",
            "Redis",
            "FastAPI",
        ],
    }