from app.services.valuation_engine import ValuationEngine

# Test the condition mapping
engine = ValuationEngine()

print("Testing condition mapping:")
print("=" * 50)

# Test different user conditions
test_conditions = ["mint", "excellent", "good", "used", "heavy_wear"]

for user_cond in test_conditions:
    mapped = engine.map_user_condition_to_data(user_cond)
    print(f"{user_cond:15} -> {mapped}")

print("\n" + "=" * 50)
print("Testing valuation with different conditions:")
print("=" * 50)

# Get a reference number to test with
ref = "116613"  # Rolex Submariner from the CSV

for user_cond in ["mint", "excellent", "good", "heavy_wear"]:
    result = engine.value_model(
        reference_number=ref,
        condition=user_cond,
        has_box=1,
        has_papers=1
    )
    if result:
        print(f"\nCondition: {user_cond}")
        print(f"  Mapped to: {result['filters_applied']['condition_mapped']}")
        print(f"  Condition applied: {result['filters_applied']['condition_applied']}")
        print(f"  Valuation: {result['currency']} {result['valuation']:,.2f}")
        print(f"  Num comparables: {result['num_comparables']}")
        print(f"  Confidence: {result['confidence']:.2%}")
