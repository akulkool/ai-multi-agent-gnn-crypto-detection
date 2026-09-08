from backend.agents.wash_trading_agent import WashTradingAgent


features = {
    "repeated_size_ratio": 0.95,
    "repeated_price_ratio": 0.999,
    "buy_sell_alternation": 0.25,
    "trade_rate": 120,
    "trade_size_cv": 8,
    "price_volume_divergence": 150000
}


agent = WashTradingAgent()

result = agent.analyze(features)

print("=" * 50)
print("WASH TRADING AGENT TEST")
print("=" * 50)

print()

print("Score:", result["score"])

print("Signals:", result["signals"])
