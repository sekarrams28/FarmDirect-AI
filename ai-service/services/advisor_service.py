"""
Farm decision advisor.

This is the "one recommendation" endpoint described in the project plan
(the Farm Decision Assistant, section 14): it calls the demand and price
services internally and combines them into a single sell/wait recommendation
with an estimated transport cost, without the caller needing to orchestrate
three separate requests.
"""
from services import demand_model, price_model


TRANSPORT_COST_PER_KM_PER_KG = 0.004  # illustrative flat rate, tune with real logistics data


def advise(crop: str, quantity: float, location: str) -> dict:
    demand = demand_model.predict(crop, location, forecast_days=7)
    price = price_model.predict(
        crop=crop,
        location=location,
        current_price=None,
        quantity=quantity,
        demand_trend=demand["trend"],
    )

    # Illustrative transport cost assuming an average 15 km collection radius.
    avg_distance_km = 15
    transport_cost_per_kg = round(avg_distance_km * TRANSPORT_COST_PER_KM_PER_KG, 2)

    net_price = price["bestBuyerPrice"] - transport_cost_per_kg
    recommendation = (
        f"SELL NOW at an estimated ₹{price['bestBuyerPrice']}/kg "
        f"(net ≈ ₹{net_price:.2f}/kg after transport) — demand is {demand['trend']} this week."
        if price["recommendation"] == "SELL_NOW"
        else f"Consider waiting — demand is {demand['trend']} and prices may improve."
    )

    return {
        "crop": crop,
        "quantity": quantity,
        "currentPrice": price["recommendedMin"],
        "expectedPrice": price["bestBuyerPrice"],
        "demand": demand["trend"],
        "bestBuyer": "Top-ranked buyer (see /recommend/buyer for the full list)",
        "bestBuyerOffer": price["bestBuyerPrice"],
        "transportCostPerKg": transport_cost_per_kg,
        "recommendation": recommendation,
    }
