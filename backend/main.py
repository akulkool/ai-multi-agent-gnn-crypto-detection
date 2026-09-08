from fastapi import FastAPI
from backend.api.routes import router


app = FastAPI(
    title="CryptoTradeGuard API",
    description="Multi-agent cryptocurrency suspicious trading detection system",
    version="1.0.0",
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "project": "CryptoTradeGuard",
        "status": "running",
        "message": "CryptoTradeGuard API is online",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
