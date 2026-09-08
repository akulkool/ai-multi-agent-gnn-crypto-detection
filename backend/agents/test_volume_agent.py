from backend.agents.volume_agent import VolumeAgent


features = {
    "trade_count": 20000,
    "total_volume": 600,
    "trade_rate": 333,
    "volume_imbalance": 0.85
}


agent = VolumeAgent()

result = agent.analyze(features)

print("=" * 50)
print("VOLUME AGENT TEST")
print("=" * 50)

print("Score:", result["score"])
print("Signals:", result["signals"])
