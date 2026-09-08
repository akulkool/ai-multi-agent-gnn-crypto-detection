from backend.agents.timing_agent import TimingAgent


agent = TimingAgent()

test_features = {
    "trade_count": 30000,
    "trade_rate": 500,
    "repeated_size_ratio": 0.85,
    "repeated_price_ratio": 0.82
}

result = agent.analyze(test_features)

print("=" * 50)
print("TIMING AGENT TEST")
print("=" * 50)

print("Score:", result["score"])
print("Signals:", result["signals"])
