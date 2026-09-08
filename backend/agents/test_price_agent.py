from backend.agents.price_agent import PriceAgent


features = {
    "price_change_percent": 0.02,
    "price_volume_divergence": 1200,
    "total_volume": 600
}


agent = PriceAgent()

result = agent.analyze(features)

print("=" * 50)
print("PRICE AGENT TEST")
print("=" * 50)

print("Score:", result["score"])
print("Signals:", result["signals"])
