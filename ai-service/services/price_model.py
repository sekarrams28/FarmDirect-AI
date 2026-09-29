"""
Price intelligence service.

Baseline: derive a min-max band from recent historical prices for the
crop/location, nudged by the current demand trend. Swap for a trained
XGBoost regressor (see project plan section 11) once enough labelled data
(price actually realised vs features) is available.
"""
import os
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample_orders.csv")
_HISTORY = pd.read_csv(DATA_PATH, comment="#")


def predict(crop: str, location: str, current_price: float | None, quantity: float | None, demand_trend: str | None) -> dict:
    subset = _HISTORY[
        (_HISTORY["crop"].str.lower() == crop.lower()) & (_HISTORY["location"].str.lower() == location.lower())
    ]

    if subset.empty:
        base_price = current_price or 20.0
    else:
        base_price = float(subset["price_per_kg"].tail(3).mean())
        if current_price:
            base_price = (base_price + current_price) / 2

    trend_multiplier = {"HIGH": 1.10, "MEDIUM": 1.0, "LOW": 0.92}.get((demand_trend or "MEDIUM").upper(), 1.0)

    recommended_min = round(base_price * 0.95 * trend_multiplier, 1)
    recommended_max = round(base_price * 1.15 * trend_multiplier, 1)
    best_buyer_price = round(recommended_max * 0.98, 1)

    recommendation = "SELL_NOW" if trend_multiplier >= 1.0 else "WAIT"
    estimated_revenue = round(best_buyer_price * quantity, 2) if quantity else None

    return {
        "crop": crop,
        "location": location,
        "recommendedMin": recommended_min,
        "recommendedMax": recommended_max,
        "bestBuyerPrice": best_buyer_price,
        "recommendation": recommendation,
        "estimatedRevenue": estimated_revenue,
        "modelVersion": "price-baseline-v0-heuristic",
    }
