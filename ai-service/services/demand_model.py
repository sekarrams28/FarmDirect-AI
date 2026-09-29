"""
Demand forecasting service.

Starts as a transparent heuristic baseline built on the sample dataset so the
end-to-end flow works on day one. Swap `predict()` for a trained
RandomForestRegressor / XGBRegressor once real historical order data is
available -- keep the same function signature so the route doesn't change.

Per the project plan: do not claim high accuracy without testing the model
on held-out data (MAE/RMSE) first.
"""
import os
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample_orders.csv")


def _load_history() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH, comment="#")
    df["date"] = pd.to_datetime(df["date"])
    return df


_HISTORY = _load_history()


def predict(crop: str, location: str, forecast_days: int = 7) -> dict:
    subset = _HISTORY[
        (_HISTORY["crop"].str.lower() == crop.lower()) & (_HISTORY["location"].str.lower() == location.lower())
    ]

    if subset.empty:
        # No history for this crop/location yet -- fall back to a
        # conservative, clearly-labelled estimate rather than guessing wildly.
        base = 2000.0
        trend = "MEDIUM"
    else:
        subset = subset.sort_values("date")
        recent = subset.tail(3)["quantity_ordered_kg"].mean()
        older = subset.head(max(1, len(subset) - 3))["quantity_ordered_kg"].mean()
        base = float(recent)
        growth = (recent - older) / older if older else 0
        if growth > 0.08:
            trend = "HIGH"
        elif growth < -0.05:
            trend = "LOW"
        else:
            trend = "MEDIUM"

    predicted = round(base * (forecast_days / 7.0), -1)  # round to nearest 10 kg

    return {
        "crop": crop,
        "location": location,
        "predictedDemandKg": predicted,
        "trend": trend,
        "forecastDays": forecast_days,
        "modelVersion": "demand-baseline-v0-heuristic",
    }
