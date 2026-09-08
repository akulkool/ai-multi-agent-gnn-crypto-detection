from backend.agents.fusion_agent import FusionAgent


volume_result = {
    "agent": "volume",
    "score": 100,
    "signals": [
        "extremely_high_trade_count",
        "extremely_high_volume"
    ]
}


price_result = {
    "agent": "price",
    "score": 70,
    "signals": [
        "extreme_price_volume_divergence"
    ]
}


timing_result = {
    "agent": "timing",
    "score": 90,
    "signals": [
        "high_repeated_trade_sizes",
        "high_repeated_prices"
    ]
}


wash_result = {
    "agent": "wash_trading",
    "score": 100,
    "signals": [
        "very_high_repeated_trade_sizes",
        "very_high_repeated_prices",
        "high_buy_sell_alternation"
    ]
}


fusion = FusionAgent()


result = fusion.analyze(
    volume_result,
    price_result,
    timing_result,
    wash_result
)


print("=" * 60)
print("FUSION AGENT TEST")
print("=" * 60)

print()

print("Final Score:", result["final_score"])

print("Risk Level:", result["risk_level"])

print()

print("Agent Scores:")

for agent, score in result["agent_scores"].items():

    print(f"{agent}: {score}")

print()

print("Signals:")

for signal in result["signals"]:

    print("-", signal)